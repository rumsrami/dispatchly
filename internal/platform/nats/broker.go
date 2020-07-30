package nats

import (
	"log"

	"github.com/nats-io/nats.go"
	"github.com/pkg/errors"
)

// MessageBroker is a pub/sub broker
type MessageBroker interface {
	// Publish to a certain topic
	Pub(topic string, message interface{}) error

	// Subscribe to a topic, provide a channel to recieve
	// Provide a channel to signal unsubscription
	Sub(topic string, receive chan []byte, unsubscribe chan chan struct{}, errCh chan error)

	// Close shuts down nats connection to the chatd service
	Close()
}

const (
	// Errors
	errBroker = "Broker error"
)

// Broker implements the Broker interface
type Broker struct {
	Conn *nats.EncodedConn
}

// NewBroker creates a new broker connection
func NewBroker(url string) (*Broker, error) {
	// Set options timeout and others
	// Use tokens for authentication
	nc, err := nats.Connect(url,
		nats.DisconnectErrHandler(func(nc *nats.Conn, err error) {
			// handle disconnect event
		}),
		nats.ReconnectHandler(func(nc *nats.Conn) {
			// handle reconnect event
		}))
	if err != nil {
		return nil, errors.Wrapf(err, "%v: Connection Error, Cannot create new message broker", errBroker)
	}
	// Nats takes care of marshalling and unmarshalling
	ec, err := nats.NewEncodedConn(nc, nats.DEFAULT_ENCODER)
	if err != nil {
		return nil, errors.Wrapf(err, "%v: Encoder Error, Cannot create new message broker", errBroker)
	}

	return &Broker{
		Conn: ec,
	}, nil
}

// Pub Publishes to a topic
func (b *Broker) Pub(topic string, message interface{}) error {
	err := b.Conn.Publish(topic, message)
	if err != nil {
		log.Printf("cannot publish to topic: %s\n", topic)
		return errors.Wrapf(err, "cannot publish to topic: %s", topic)
	}
	return nil
}

// Sub subscribes the called to the broker through a channel that receives
// the messages and passes them to the caller
func (b *Broker) Sub(topic string, outputCh chan []byte, unsubscribe chan chan struct{}, errCh chan error) {
	// defer closing the Subscription and close the output channel
	defer func() {
		log.Printf("Successfully unsubscribed from topic: %s\n", topic)
		close(outputCh)
	}()

	// Subscribe to nats by binding the channel from the caller to nats server
	sub, err := b.Conn.Subscribe(topic, func(m *nats.Msg) {
		// Forward the message to the caller
		outputCh <- m.Data
	})
	if err != nil {
		log.Printf("cannot subscribe to topic: %s\n", topic)
		// pass the error back to the caller
		errCh <- errors.Wrapf(err, "cannot subscribe to topic: %s", topic)
		return
	}

	select {
	case q := <-unsubscribe:
		_ = sub.Unsubscribe()
		close(q)
		log.Printf("streamer signaled unsubscription from topic: %s\n", topic)
		return
	}
}

// Close closes the broker connection
func (b *Broker) Close() {
	// Close connection - Called by the  service
	log.Println("Closing Nats broker")
	b.Conn.Close()
}
