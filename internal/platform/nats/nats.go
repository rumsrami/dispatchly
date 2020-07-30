package nats

import (
	"log"
	"time"

	"github.com/nats-io/nats-server/v2/server"
)

// Server is an embedded messaging server
type Server struct {
	quitCh chan chan struct{}
	NS     *server.Server
}

// NewServer returns a new embedded nats server
func NewServer(stopCh chan chan struct{}) (*Server, error) {
	opts := &server.Options{
		Host:                  "127.0.0.1",
		Port:                  4222,
		NoLog:                 false,
		NoSigs:                false,
		Debug:                 true,
		MaxControlLine:        4096,
		DisableShortFirstPing: true,
	}
	newServer, err := server.NewServer(opts)

	if err != nil {
		return nil, err
	}
	return &Server{
		NS:     newServer,
		quitCh: stopCh,
	}, nil
}

func (n *Server) Run(ok chan struct{}) {
	go n.NS.Start()

	if !n.NS.ReadyForConnections(10 * time.Second) {
		log.Fatal("Cannot connect to Nats server")
		return
	}

	ok <- struct{}{}

	for {
		select {
		case q := <-n.quitCh:
			close(q)
			return
		}
	}
}

func (n *Server) Quit() {
	q := make(chan struct{})
	n.quitCh <- q
	<-q
	log.Println("Closed Nats server")
	n.NS.Shutdown()
}
