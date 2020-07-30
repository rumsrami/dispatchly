package data

import (
	"context"
	"fmt"
	"strconv"
	"strings"

	"github.com/rumsrami/task-manager/internal/proto"
)

//  ************************************* Read Tasks ****************************************
type read struct{}

var Read read

func (read) Schedule(ctx context.Context, req *proto.GetScheduleRequest, db *Database) (*proto.GetScheduleResponse, error) {
	partitionKey := NewPartitionKey(req.DriverName, req.Week)
	taskSortKeyMap, err := db.ReadSchedule(ctx, partitionKey)
	if err != nil {
		return nil, proto.WrapError(proto.ErrNotFound, err, "Schedule not found")
	}
	viewSchedule := generateViewSchedule(taskSortKeyMap)
	return viewSchedule, nil
}

func generateViewSchedule(taskSortKeyMap map[SortKey]Task) *proto.GetScheduleResponse {
	res := &proto.GetScheduleResponse{
		Schedule: make(map[int][]*proto.Slot),
	}
	// create an empty response schedule
	var workingDaysList []int
	// loop through the taskSortKeyMap and get the days out
	// days will be the int keys in the empty schedule
	for sortKey, _ := range taskSortKeyMap {
		workingDaysList = append(workingDaysList, sortKey.Day)
	}
	// get a list with the unique working days
	uniqueWorkingDays := uniqueDays(workingDaysList)
	// create taskSlots, each working say will get one task slot

	// generate the view schedule
	for _, day := range uniqueWorkingDays {
		var taskSlots []*proto.Slot
		for sortKey, task := range taskSortKeyMap {
			if day == sortKey.Day {
				newSlot := &proto.Slot{
					StartHour: startHrString(task.StartHour),
					TaskSlot:  []string{task.Ops, fmt.Sprintf("%d", task.Duration)},
				}
				taskSlots = append(taskSlots, newSlot)
			}
		}
		res.Schedule[day] = taskSlots
	}
	return res
}

func uniqueDays(intSlice []int) []int {

	keys := make(map[int]bool)
	var list []int
	for _, entry := range intSlice {
		if _, value := keys[entry]; !value {
			keys[entry] = true
			list = append(list, entry)
		}
	}
	return list
}

func startHrString(hr int) string {
	if hr <= 9 {
		return fmt.Sprintf("0%d:00", hr)
	}
	return fmt.Sprintf("%d:00", hr)
}

//  ************************************* Create Tasks ****************************************
type create struct{}

var Create create

func (create) Task(ctx context.Context, req *proto.CreateTaskRequest, db *Database) error {
	partitionKey := NewPartitionKey(req.DriverName, req.Week)
	startHrInt, err := parseHourString(req.StartHour)
	if err != nil {
		return err
	}
	sortKey := NewSortKey(req.Day, startHrInt)
	task := NewTask(req.Operation, startHrInt, req.Duration)

	err = db.CreateTask(ctx, task, partitionKey, sortKey)
	if err != nil {
		return err
	}
	return nil
}

func parseHourString(hr string) (int, error) {
	timeSlice := strings.Split(hr, "")
	hrInt, err := strconv.Atoi(fmt.Sprintf("%s%s", timeSlice[0], timeSlice[1]))
	if err != nil {
		return 0, err
	}
	return hrInt, nil
}

//  ************************************* Delete Task ****************************************
type del struct{}

var Delete del

func (del) Task(ctx context.Context, req *proto.DeleteTaskRequest, db *Database) error {
	partitionKey := NewPartitionKey(req.DriverName, req.Week)
	startHrInt, err := parseHourString(req.StartHour)
	if err != nil {
		return err
	}
	sortKey := NewSortKey(req.Day, startHrInt)
	err = db.DeleteTask(ctx, partitionKey, sortKey)
	if err != nil {
		return err
	}
	return nil
}

//  ************************************* Update Task ****************************************
type update struct{}

var Update update

func (update) Task(ctx context.Context, req *proto.UpdateTaskRequest, db *Database) error {
	// Get the old taks and delete it
	fmt.Println(req.StartHour)
	partitionKey := NewPartitionKey(req.DriverName, req.Week)
	for _, startHr := range req.StartHour {
		startHrInt, err := parseHourString(startHr)
		if err != nil {
			return err
		}
		sortKey := NewSortKey(req.Day, startHrInt)
		err = db.DeleteTask(ctx, partitionKey, sortKey)
		if err != nil {
			return err
		}
	}
	// create a new sort key for the updated task
	newStartHrInt, err := parseHourString(req.NewStartHour)
	if err != nil {
		return err
	}
	newSortKey := NewSortKey(req.Day, newStartHrInt)

	// create the updated task
	updatedTask := NewTask(req.NewOperation, newStartHrInt, req.NewDuration)
	err = db.CreateTask(ctx, updatedTask, partitionKey, newSortKey)
	if err != nil {
		return err
	}
	return nil
}
