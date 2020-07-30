package handlers

import (
	"os"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"

	"github.com/rumsrami/task-manager/internal/data"
	"github.com/rumsrami/task-manager/internal/platform/logger"
	"github.com/rumsrami/task-manager/internal/platform/nats"
	"github.com/rumsrami/task-manager/internal/platform/web"
	"github.com/rumsrami/task-manager/internal/proto"
	"github.com/rumsrami/task-manager/internal/rpc"
)

// API is the main application mux ...
func API(build string, appShutdown chan os.Signal, appLogger *logger.AppLogger, mb nats.MessageBroker, db *data.Database) *web.App {
	// Overwrite the middleware logger to use the app logger
	middleware.DefaultLogger = middleware.RequestLogger(&middleware.DefaultLogFormatter{Logger: appLogger.Info, NoColor: false})

	// Create a new app
	app := web.NewApp(appShutdown)

	// Create new RPC Handler
	dispatch := rpc.NewDispatch(app, build, mb, db)

	// Add middleware running before every request
	app.Mux.Use(middleware.RequestID)
	app.Mux.Use(middleware.Recoverer)
	app.Mux.Use(middleware.Logger)

	// Profiler mounts the expvar endpoint on the deployed api
	// When running on localhost expvar runs on port 4000
	app.Mux.Mount("/_ah/debug", middleware.Profiler())
	app.Mux.Get("/_ah/health", getHealth(build))

	app.Mux.Group(func(r chi.Router) {
		cors := cors.New(cors.Options{
			AllowedOrigins:   []string{"*"}, // "allowOriginFunc" defined in handlers.go
			AllowedMethods:   []string{"GET", "OPTIONS", "POST"},
			AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "User-Agent"},
			ExposedHeaders:   []string{"Link"},
			AllowCredentials: true,
			MaxAge:           600,
		})
		r.Use(cors.Handler)
		r.Get("/stream", Stream(mb))
		webrpcHandler := proto.NewDispatchServer(dispatch)
		r.Handle("/rpc/*", webrpcHandler)
	})

	return app
}
