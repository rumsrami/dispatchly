package handlers

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-contrib/sse"
	"github.com/pkg/errors"
	"gopkg.in/matryer/respond.v1"

	"github.com/rumsrami/task-manager/internal/platform/nats"
)

// getHealth validates the service is healthy and ready to accept requests.
func getHealth(build string) http.HandlerFunc {
	fn := func(w http.ResponseWriter, r *http.Request) {

		health := struct {
			Version string `json:"version"`
			Status  string `json:"status"`
		}{
			Version: build,
		}

		health.Status = "ok"
		respond.With(w, r, http.StatusOK, health)
	}
	return fn
}

// allowOriginFunc allows origin
func allowOriginFunc(r *http.Request, origin string) bool {
	if origin == "https://rr-dispatcher.netlify.app" || origin == "http://localhost:3000" {
		return true
	}
	return false
}

// Stream handles server streams
func Stream(broker nats.MessageBroker) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		// get request context and wait for it to be cancelled
		ctx := r.Context()

		// extract username and role from url
		username := r.URL.Query().Get("username")
		role := r.URL.Query().Get("role")

		log.Printf("stream handler called by: %s, with the role of: %s\n", username, role)

		f, ok := w.(http.Flusher)
		if !ok {
			http.Error(w, "streaming unsupported!", http.StatusInternalServerError)
			log.Println(errors.New("browser does not support SSE"))
			return
		}

		// add response headers
		w.Header().Set("Connection", "keep-alive")
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("X-Accel-Buffering", "no")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		// create a new channel to receive messages from the broker
		// this channel will be passed on to the streamer which in turn
		// will pass it to the broker
		brokerMessageChan := make(chan []byte)
		// create an error channel to receive errors from broker
		// this channel will also be passed along from streamer to broker
		brokerErrCh := make(chan error)

		// create a new streamer and bind the message channel
		// message channel will get messages from the broker
		// then messages with be received here in the handler
		// messages are then sent to the browser
		newStreamer := newStreamer(broker)

		// try to connect the created streamer to NATS
		go newStreamer.connect(username, role, brokerMessageChan, brokerErrCh)

		// run the streamer
		go newStreamer.run()

		// run when the handler returns
		defer func() {
			// Done.
			log.Println("Connection to stream ended: ")
			return
		}()

		// wait for messages to come from the broker
		for {
			select {
			// error connecting to the broker
			case err := <-brokerErrCh:
				// streamer or broker should close this channel
				// depending on which one of them had the error
				<-brokerMessageChan
				log.Println("cannot connect to broker: ", err)
				return
				// client closed the connection
			case <-ctx.Done():
				// close the streamer
				// streamer will send a close signal to broker
				// broker will close the sending message
				newStreamer.disconnect()
				// wait for the broker to unsubscribe
				// broker will close this channel
				<-brokerMessageChan
				log.Println("client closed connection")
				return
				// this listens for messages from broker
				// if messageChan closes unexpectedly for any reason
				// return from the handler and close connection
			case brokerMessage, open := <-brokerMessageChan:
				if !open {
					// If our messageChan was closed, this means that the client has
					// disconnected.
					log.Println("streamer broker channel closed")
					return
				}
				// send the messages to client
				fmt.Println("SSE", string(brokerMessage))
				_ = sse.Encode(w, sse.Event{
					Event: "message",
					Data:  string(brokerMessage),
				})

				// flush the response.
				f.Flush()
			}
		}

	}
}
