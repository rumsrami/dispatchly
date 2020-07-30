package handlers

import (
	"fmt"
	"log"

	"github.com/pkg/errors"

	"github.com/rumsrami/task-manager/internal/platform/nats"
)

const (
	errInvalidCredentials = "invalid username or role"
)

// a new streamer is created for each ServerSentEvents /stream request
// it connects the embedded nats server with the http handler through
// the nats client (broker) interface
// each request to /stream endpoint spawns a streamer go routine
type streamer struct {
	broker              nats.MessageBroker
	quitCh              chan chan struct{}
	brokerUnsubscribeCh chan chan struct{}
}

func newStreamer(broker nats.MessageBroker) streamer {
	return streamer{
		broker:              broker,
		quitCh:              make(chan chan struct{}),
		brokerUnsubscribeCh: make(chan chan struct{}),
	}
}

// this could be improved by passing request context to run()
// Then selecting on context.Done then returning
func (s streamer) run() {
	for {
		select {
		case q := <-s.quitCh:
			close(q)
			return
		}
	}
}

// disconnect is called from the http stream handler
// in response to frontend client closing connection, triggering
// http request context to get cancelled
// ---
// it sends a chan struct{} to the streamer's quit chan chan struct{}
// then disconnect blocks until the streamer's run() closes it
// this makes sure that the run() go routine has returned
func (s streamer) disconnect() {
	q := make(chan struct{})
	s.quitCh <- q
	// This blocks until run() closes q and returns
	<-q
	// same pattern to close the broker subscription
	// endBrokerSubscriptionCh channel is sent to the broker and blocks here
	// until the broker closes it that signals
	// that the broker subscription go routine has returned
	endBrokerSubscriptionCh := make(chan struct{})
	s.brokerUnsubscribeCh <- endBrokerSubscriptionCh
	<-endBrokerSubscriptionCh
	log.Println("streamer received confirmation that subscription go routine has returned")
}

// connect the handler to the broker through the brokerMessageCh and brokerErrCh
func (s streamer) connect(user string, role string, brokerMessageCh chan []byte, brokerErrCh chan error) {
	var channelTopic string
	switch role {
	case "dispatcher":
		channelTopic = "dispatchers.common.>"
		log.Printf("user: %s, role: %s, attempting to subscribe to channel topic: %s\n", user, role, channelTopic)
	case "driver":
		channelTopic = fmt.Sprintf("drivers.private.%s", user)
		log.Printf("user: %s, role: %s, attempting to subscribe to channel topic: %s\n", user, role, channelTopic)
	default:
		brokerErrCh <- errors.New("cannot connect to message broker")
		log.Printf("error subscribing user: %s, role: %s: return err to stream handler\n", user, role)
		// here the streamer rather than the broker will close this channel
		// as it has not been passed on to the broker yet
		close(brokerMessageCh)
		return
	}

	go func() {
		// passing on the message output channel to the broker
		// attempting to start subscription to the topic
		// brokerErrCh and s.brokerUnsubscribeCh channel will also be passed along
		// s.brokerUnsubscribeCh channel will signal the broker to close when the streamer closes
		// the streamer is signaled to closed from the http stream handler when the frontend client disconnects
		// this will be signaled by request context cancellation from the handler
		s.broker.Sub(channelTopic, brokerMessageCh, s.brokerUnsubscribeCh, brokerErrCh)
	}()
}
