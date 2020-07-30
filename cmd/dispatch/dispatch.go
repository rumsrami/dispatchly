package main

import (
	"context"
	"expvar"
	"fmt"
	"log"
	"net/http"
	_ "net/http/pprof"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/ardanlabs/conf"
	goNats "github.com/nats-io/nats.go"
	"github.com/pkg/errors"

	"github.com/rumsrami/task-manager/cmd/dispatch/internal/handlers"
	"github.com/rumsrami/task-manager/internal/data"
	"github.com/rumsrami/task-manager/internal/platform/logger"
	"github.com/rumsrami/task-manager/internal/platform/nats"
)

const (
	// environment variables
	serviceName = "DISPATCH"
	portENV     = "PORT"
	// environment variables values
	productionEnvironment = "production"
	stagingEnvironment    = "staging"
	localEnvironment      = "local"
	expvarAppBuildKey     = "build"
	// initialization errors
	errGeneratingConfigUsage   = "generating config usage"
	errGeneratingConfigVersion = "generating config version"
	errParsingConfiguration    = "parsing config"
	errGeneratingConfig        = "generating config for output"
	errInternalServer          = "internal server error"
	errNatsServer              = "nats server error"
	errNatsBroker              = "nats broker error"
	errShutdown                = "integrity issue caused shutdown"
	errGracefulShutdown        = "could not stop server gracefully"
)

func run() error {
	// =========================================================================
	// Logging

	infolog := log.New(os.Stdout, fmt.Sprintf("%v Version: %v - ", serviceName, build), log.LstdFlags|log.Lmicroseconds|log.Lshortfile)
	errlog := log.New(os.Stdout, fmt.Sprintf("%v Version: %v ERROR: - ", serviceName, build), log.LstdFlags|log.Lmicroseconds|log.Lshortfile)

	// Create the logger and pass it to API
	serviceLogger := logger.NewAppLogger(infolog, errlog)

	// =========================================================================
	// Configuration
	var cfg struct {
		conf.Version
		Web struct {
			APIHost         string        `conf:"default:0.0.0.0:9000"`
			DebugHost       string        `conf:"default:0.0.0.0:4000"`
			ShutdownTimeout time.Duration `conf:"default:5s,noprint"`
		}
	}
	cfg.Version.SVN = build
	cfg.Version.Desc = "copyright"

	if err := conf.Parse(os.Args[1:], serviceName, &cfg); err != nil {
		switch err {
		case conf.ErrHelpWanted:
			usage, err := conf.Usage(serviceName, &cfg)
			if err != nil {
				return errors.Wrap(err, errGeneratingConfigUsage)
			}
			fmt.Println(usage)
			return nil
		case conf.ErrVersionWanted:
			version, err := conf.VersionString(serviceName, &cfg)
			if err != nil {
				return errors.Wrap(err, errGeneratingConfigVersion)
			}
			fmt.Println(version)
			return nil
		}
		return errors.Wrap(err, errParsingConfiguration)
	}

	// Update the port if running in Heroku
	if port := os.Getenv(portENV); port != "" {
		cfg.Web.APIHost = "0.0.0.0:" + port
		if port != "9000" {
			environment = productionEnvironment
		}
	}

	// =========================================================================
	// App Starting

	// Print the build version for our logs. Also expose it under /debug/vars.
	expvar.NewString(expvarAppBuildKey).Set(build)
	serviceLogger.Info.Printf("main : Started : Application initializing : version %q\n", build)
	defer serviceLogger.Info.Println("main : Completed")

	out, err := conf.String(&cfg)
	if err != nil {
		return errors.Wrap(err, errGeneratingConfig)
	}
	serviceLogger.Info.Printf("main : Config :\n%v\n", out)

	// =========================================================================
	// Start Debug Service
	//
	// /debug/pprof - Added to the default mux by importing the net/http/pprof package.
	// /debug/vars - Added to the default mux by importing the expvar package.
	//
	// Not concerned with shutting this down when the application is shutdown.

	if environment == localEnvironment {
		serviceLogger.Info.Println("main : Initializing debugging support")

		go func() {
			serviceLogger.Info.Printf("main: Debug Listening %s", cfg.Web.DebugHost)
			if err := http.ListenAndServe(cfg.Web.DebugHost, http.DefaultServeMux); err != nil {
				serviceLogger.Info.Printf("main: Debug Listener closed : %v", err)
			}
		}()
	}

	// =========================================================================
	// Start Nats Server
	serviceLogger.Info.Println("main : Initializing NATS Server support")

	// Make a channel to listen for close signals
	quitNatsServer := make(chan chan struct{}, 1)

	// Make a signaling channel to show that the server started
	ok := make(chan struct{})

	// create embedded nats server
	natsProcess, err := nats.NewServer(quitNatsServer)
	if err != nil {
		return errors.Wrap(err, errNatsServer)
	}

	// start the server
	go natsProcess.Run(ok)
	<-ok

	serviceLogger.Info.Println("main : Started : Initializing NATS Server support")

	// create the message broker running on nats
	serviceLogger.Info.Println("main : Initializing NATS Broker support")
	natsBroker, err := nats.NewBroker(goNats.DefaultURL)
	if err != nil {
		return errors.Wrap(err, errNatsBroker)
	}
	serviceLogger.Info.Println("main : Started : Initializing NATS Broker support")

	//=========================================================================
	// Start In-memory Database
	serviceLogger.Info.Println("main : Initializing in-memory db support")

	// Create a new in-memory database
	db := data.NewDatabase()

	go db.Run()
	serviceLogger.Info.Println("main : Started : Initializing in-memory db support")

	//=========================================================================
	// Start API Service

	serviceLogger.Info.Println("main : Started : Initializing API support")

	// listen for termination signals
	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, syscall.SIGTERM, syscall.SIGHUP, syscall.SIGINT, syscall.SIGQUIT)

	api := http.Server{
		Addr:    cfg.Web.APIHost,
		Handler: handlers.API(build, shutdown, serviceLogger, natsBroker, db),
	}

	// channel to listen for server errors to trigger shutdown
	serverErrors := make(chan error, 1)

	// Start the service listening for requests.
	go func() {
		serviceLogger.Info.Printf("main : API listening on %s", api.Addr)
		serverErrors <- api.ListenAndServe()
	}()

	// =========================================================================
	// Shutdown

	// Blocking main and waiting for shutdown.
	select {
	case err := <-serverErrors:
		return errors.Wrap(err, errInternalServer)

	case sig := <-shutdown:
		serviceLogger.Info.Printf("main : %v : Start shutdown", sig)

		// Give outstanding requests a deadline for completion.
		ctx, cancel := context.WithTimeout(context.Background(), cfg.Web.ShutdownTimeout)
		defer cancel()

		// close the nats process
		defer natsProcess.Quit()
		defer natsBroker.Close()
		defer db.Stop()

		// Asking listener to shutdown and load shed.
		err := api.Shutdown(ctx)
		if err != nil {
			serviceLogger.Info.Printf("main : Graceful shutdown did not complete in %v : %v", cfg.Web.ShutdownTimeout, err)
			err = api.Close()
		}

		// Log the status of this shutdown.
		switch {
		case sig == syscall.SIGSTOP:
			return errors.New(errShutdown)
		case err != nil:
			return errors.Wrap(err, errGracefulShutdown)
		}
	}

	return nil
}
