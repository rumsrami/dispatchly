package rpc

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/rumsrami/task-manager/internal/data"
	"github.com/rumsrami/task-manager/internal/platform/nats"
	"github.com/rumsrami/task-manager/internal/proto"
)

// Shutdowner ....
type Shutdowner interface {
	SignalShutdown()
}

// Dispatch represents an RPC server
type Dispatch struct {
	app   Shutdowner
	build string
	mB    nats.MessageBroker
	db    *data.Database
}

// NewDispatch ...
func NewDispatch(app Shutdowner, build string, mb nats.MessageBroker, db *data.Database) *Dispatch {
	return &Dispatch{
		app:   app,
		build: build,
		mB:    mb,
		db:    db,
	}
}

//  ***************** Admin functions ********************

// Ping is a health check that returns an empty message.
func (d *Dispatch) Ping(ctx context.Context) (bool, error) {

	go func() {
		for i := 0; i < 10; i++ {
			fmt.Println("Sent", i)
			time.Sleep(5 * time.Second)

			messageToSend1 := map[string]interface{}{
				"Name": "Fierce Bob",
				"Job":  "Driver",
				"date": time.Now().Unix(),
			}

			msg, _ := json.Marshal(messageToSend1)
			_ = d.mB.Pub("drivers.private.fierce-bob", msg)

		}
	}()

	return true, nil
}

// Version returns service version details
func (d *Dispatch) Version(ctx context.Context) (*proto.Version, error) {
	return &proto.Version{
		WebrpcVersion: proto.WebRPCVersion(),
		SchemaVersion: proto.WebRPCSchemaVersion(),
		SchemaHash:    proto.WebRPCSchemaHash(),
		AppVersion:    d.build,
	}, nil
}

//  ***************** Dispatch functions ********************
func (d *Dispatch) ReadSchedule(ctx context.Context, req *proto.GetScheduleRequest) (*proto.GetScheduleResponse, error) {

	driverSchedule, err := data.Read.Schedule(ctx, req, d.db)
	if err != nil {
		return nil, err
	}
	return driverSchedule, nil
}

func (d *Dispatch) CreateTask(ctx context.Context, req *proto.CreateTaskRequest) (bool, error) {

	log.Println(req)

	err := data.Create.Task(ctx, req, d.db)
	if err != nil {
		return false, err
	}
	return true, nil
}

func (d *Dispatch) DeleteTask(ctx context.Context, req *proto.DeleteTaskRequest) (bool, error) {

	err := data.Delete.Task(ctx, req, d.db)
	if err != nil {
		return false, err
	}
	return true, nil
}

func (d *Dispatch) UpdateTask(ctx context.Context, req *proto.UpdateTaskRequest) (bool, error) {
	err := data.Update.Task(ctx, req, d.db)
	if err != nil {
		return false, err
	}
	return true, nil
}
