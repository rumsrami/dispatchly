import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import { Button } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';

// Hooks
import useRPC from '../hooks/useRPC';
import useAppStore from '../hooks/useAppStore';

// Constants
import * as ct from '../context/constants';

// utils
import { getTaskDuration, validateTask } from './utils';


const getModalStyle = () => {
    const top = 50
    const left = 50

    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
    };
}

const useStyles = makeStyles((theme) => ({
    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'absolute',
        width: 400,
        backgroundColor: '#FAFAFA',
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
    updateContainer: {
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 0,
        width: '100%'
    },
    formControl: {
        display: 'flex',
        marginTop: theme.spacing(3),
        width: '100%',
    },
    currentTaskMessage: {
        marginTop: theme.spacing(1),
    },
    textField: {
        width: '100%',
    },
    submitButton: {
        width: '100%',
        marginTop: theme.spacing(3),
    },
    fromContainer: {
        marginTop: theme.spacing(2),
        display: 'flex',
        width: '80%'
    },
}));

const UpdateModal = () => {
    const { updateModalOpen,
        closeUpdateModal,
        driverToUpdate,
        weekToUpdate,
        dayToUpdate,
        taskToUpdate,
        startHrToUpdate,
        durationToUpdate } = useAppStore()
    const { driverSchedule, serverUpdateMessage, updateTask } = useRPC()
    const classes = useStyles();
    const [modalStyle] = useState(getModalStyle);
    const [newTask, setNewTask] = useState(ct.TASK_PICK_UP);
    const [newTaskStart, setNewTaskStart] = useState(ct.DEFAULT_START_HR);
    const [newTaskEnd, setNewTaskEnd] = useState(ct.DEFAULT_END_HR);
    const [timeConflict, setTimeConflict] = useState(false);
    const [taskOverTime, setTaskOverTime] = React.useState(false);
    const [overlapStartHrPeriods, setOverlapStartHrPeriods] = React.useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    // handles updating the current
    const handleUpdateTask = (e) => {
        e.preventDefault()
        // check if the current task starting hour is in the overlaping list
        let conflictingHoursList = [startHrToUpdate].concat(overlapStartHrPeriods)
        const uniqConflicts = [...new Set(conflictingHoursList)];
        updateTask(driverToUpdate, weekToUpdate, dayToUpdate, uniqConflicts, newTaskStart, newTaskEnd, newTask)
        closeUpdateModal()
    }

    // validates that the new task start and end times dont conflict with existing tasks
    useEffect(() => {
        
        const overlapPeriods = validateTask(dayToUpdate, newTaskStart, newTaskEnd, driverSchedule)
        setOverlapStartHrPeriods(overlapPeriods)

    }, [updateModalOpen])

    // updated time conflicts view when overlap exists
    useEffect(() => {
        if (overlapStartHrPeriods.length !== 0) {
            setTimeConflict(true)
        } else {
            setTimeConflict(false)
        }
    }, [overlapStartHrPeriods])


    // validates the new task is less than 24 hours in duration
    useEffect(() => {
        if (getTaskDuration(newTaskStart, newTaskEnd) > 0) {
            setTaskOverTime(false)
            setErrorMessage("")
        } else {
            setTaskOverTime(true)
            setErrorMessage("Start time should precede end time")
        }
    }, [newTaskStart, newTaskEnd])


    const body = (
        <Container style={modalStyle} className={classes.paper}>
            <Typography variant="h6" component="h3" id="simple-modal-title">Update task</Typography>
                <Typography className={classes.fromContainer} variant="subtitle2" component="p" id="simple-modal-description">
                    {`${ct.DRIVERS[driverToUpdate]}, ${taskToUpdate}, week ${weekToUpdate}, ${ct.DAY_INT[dayToUpdate]}, start ${startHrToUpdate}, duration ${durationToUpdate} Hours.`}
                </Typography>
            <Typography color="error" className={classes.currentTaskMessage} variant="subtitle2" component="p" id="simple-modal-description">
                {serverUpdateMessage}
            </Typography>
            <Typography color="error" className={classes.currentTaskMessage} variant="subtitle2" component="p" id="simple-modal-description">
                {errorMessage}
            </Typography>
            <Container className={classes.updateContainer}>
                <Container className={classes.formControlContainer}>
                    <FormControl required className={classes.formControl}>
                        <InputLabel id="task-id-label">New Task</InputLabel>
                        <Select
                            abelId="task-id-label"
                            id="task-id-helper"
                            value={newTask}
                            onChange={(event) => setNewTask(event.target.value)}
                        >
                            <MenuItem value={ct.TASK_PICK_UP}>{ct.TASK_PICK_UP}</MenuItem>
                            <MenuItem value={ct.TASK_DROP_OFF}>{ct.TASK_DROP_OFF}</MenuItem>
                            <MenuItem value={ct.TASK_OTHER}>{ct.TASK_OTHER}</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl required className={classes.formControl}>
                        <TextField
                            required
                            id="start-time"
                            label="New Start Time"
                            type="time"
                            value={newTaskStart}
                            onChange={(event) => setNewTaskStart(event.target.value)}
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
                            label="New End Time"
                            type="time"
                            value={newTaskEnd}
                            onChange={(event) => setNewTaskEnd(event.target.value)}
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
                {timeConflict ?
                    <Button
                        disabled={taskOverTime}
                        variant="contained"
                        color="primary"
                        type="submit"
                        onClick={(e) => handleUpdateTask(e)}
                        className={classes.submitButton}>
                        Delete Conflicting Task(s) and Update
                    </Button>
                    :
                    <Button
                        disabled={taskOverTime}
                        variant="contained"
                        color="primary"
                        type="submit"
                        onClick={(e) => handleUpdateTask(e)}
                        className={classes.submitButton}>
                        Update
                    </Button>
                }
            </Container>
        </Container>
    );

    return (
        <div>
            <Modal
                open={updateModalOpen}
                onClose={closeUpdateModal}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                {body}
            </Modal>
        </div>
    );
}

export default UpdateModal;
