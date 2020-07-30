import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { Container, Button } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Chip from '@material-ui/core/Chip';

// utils
import { getTaskDuration, validateTask } from './utils';

// Constants
import * as ct from '../context/constants'
import useAppStore from '../hooks/useAppStore';
import useRPC from '../hooks/useRPC';


const useStyles = makeStyles((theme) => ({
    container: {
        marginBottom: theme.spacing(3),
        display: 'flex',
        width: '100%'
    },
    formControlContainer: {
        display: 'flex',
        padding: 0,
        width: '100%'
    },
    mainForm: {
        display: 'flex',
        flexWrap: 'no-wrap',
        flexDirection: 'column',
        alignItems: 'flex-end',
        width: '100%'
    },
    updateTaskForm: {

    },
    formControl: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        marginTop: theme.spacing(3),
        width: '100%',
    },
    textField: {
        width: '100%',
    },
    submitButtonContainer: {
        padding: 0,
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: theme.spacing(3),
        alignItems: 'flex-end',
    },
    submitButton: {
        width: '15%',
        marginLeft: theme.spacing(3),
    },
    chipCreate: {
        color: '#388e3c',
    },
    chipError: {
        color: '#dc004e',
    }
}));


const TaskCreator = () => {
    const { driverSchedule, createTask } = useRPC()
    const { driver, task, week, weekDay, startHr, endHr, appErrMessage, appErrMessageType,
        changeDriver,
        changeTask,
        changeWeek,
        changeWeekDay,
        changeStartHr,
        changeEndHr } = useAppStore()
    const classes = useStyles();
    const [timeConflict, setTimeConflict] = React.useState(false);
    const [taskOverTime, setTaskOverTime] = React.useState(false);


    // Submits the new task to backend
    const handleTaskSubmit = (e) => {
        e.preventDefault();
        createTask(driver, task, week, weekDay, startHr, endHr)
    }

    // validates that the new task doesnt conflict with existing task
    useEffect(() => {
        const overlapPeriods = validateTask(weekDay, startHr, endHr, driverSchedule)
        if (overlapPeriods.length !== 0) {
            setTimeConflict(true)
        } else {
            setTimeConflict(false)
        }
    }, [driverSchedule, driver, task, week, weekDay, startHr, endHr])

    // validates the new task is less than 24 hours in duration
    useEffect(() => {
        if (getTaskDuration(startHr, endHr) > 0) {
            setTaskOverTime(false)
        } else {
            setTaskOverTime(true)
        }
    }, [startHr, endHr])


    return (
        <Container className={classes.container}>
            <form className={classes.mainForm}
                onSubmit={handleTaskSubmit} >
                <Container className={classes.formControlContainer}>
                    <FormControl required className={classes.formControl}>
                        <InputLabel id="driver-id-label">Driver</InputLabel>
                        <Select
                            labelId="driver-id-label"
                            id="driver-id-helper"
                            value={driver}
                            onChange={(event) => changeDriver(event.target.value)}
                        >
                            <MenuItem value={ct.FIERCE_BOB_NAME}>Fierce Bob</MenuItem>
                            <MenuItem value={ct.ELEGANT_TESLA_NAME}>Elegant Tesla</MenuItem>
                            <MenuItem value={ct.HOPEFUL_HAMILTON_NAME}>Hopeful Hamilton</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl required className={classes.formControl}>
                        <InputLabel id="task-id-label">Task</InputLabel>
                        <Select
                            labelId="task-id-label"
                            id="task-id-helper"
                            value={task}
                            onChange={(event) => changeTask(event.target.value)}
                        >
                            <MenuItem value={ct.TASK_PICK_UP}>{ct.TASK_PICK_UP}</MenuItem>
                            <MenuItem value={ct.TASK_DROP_OFF}>{ct.TASK_DROP_OFF}</MenuItem>
                            <MenuItem value={ct.TASK_OTHER}>{ct.TASK_OTHER}</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl required className={classes.formControl}>
                        <InputLabel id="week-id-label">Week</InputLabel>
                        <Select
                            labelId="week-id-label"
                            id="week-helper"
                            value={week}
                            onChange={(event) => changeWeek(event.target.value)}
                        >
                            {ct.YEAR_WEEKS.map((w, i) =>
                                <MenuItem key={i} value={i + 1}>{`Week ${i + 1}`}</MenuItem>
                            )}
                        </Select>
                    </FormControl>

                    <FormControl required className={classes.formControl}>
                        <InputLabel id="weekday-id-label">Weekday</InputLabel>
                        <Select
                            labelId="weekday-id-label"
                            id="weekday-helper"
                            value={weekDay}
                            onChange={(event) => changeWeekDay(event.target.value)}
                        >
                            {ct.WEEK_DAYS.map((d, i) =>
                                <MenuItem key={i} value={i + 1}>{d}</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                    <FormControl required className={classes.formControl}>
                        <TextField
                            required
                            id="start-time"
                            label="Start Time"
                            type="time"
                            value={startHr}
                            onChange={(event) => changeStartHr(event.target.value, endHr)}
                            className={classes.textField}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                step: 3600,
                            }}
                        />
                    </FormControl>
                    <FormControl required className={classes.formControl}>
                        <TextField
                            required
                            id="end-time"
                            label="End Time"
                            type="time"
                            value={endHr}
                            onChange={(event) => changeEndHr(startHr, event.target.value)}
                            className={classes.textField}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                step: 3600,
                            }}
                        />
                    </FormControl>
                </Container>
                <Container className={classes.submitButtonContainer}>
                    {timeConflict || taskOverTime ?
                        <Chip
                            className={classes.chipError}
                            label={(timeConflict ? "To create a new task, change time to an empty slot. You can also delete or update the one occupying the current slot." : "Tasks should be less than 24 hours. Start time should precede end time")}
                            variant="outlined" />
                    :
                        <Chip
                            className={classes.chipCreate}
                            label={`Assign ${ct.DRIVERS[driver]} a new task`}
                            variant="outlined" /> 
                    }
                    <Button
                        disabled={timeConflict || taskOverTime}
                        variant="contained"
                        color="primary"
                        type="submit"
                        className={classes.submitButton}>
                        Create
                    </Button>
                </Container>
            </form>
        </Container>
    );
}

export default TaskCreator;