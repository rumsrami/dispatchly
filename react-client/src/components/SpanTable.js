import React, {useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

// Components
import UpdateModal from './UpdateModal';

// Constants
import * as ct from '../context/constants';

// Hooks
import useAppStore from '../hooks/useAppStore';
import useRPC from '../hooks/useRPC';
import { Container } from '@material-ui/core';


const useStyles = makeStyles({
    root: {
        width: '100%',
        height: '60vh',
    },
    container: {
        padding: 0,
        height: '90%'
    },
    cell: {
        border: '0.1px solid',
        borderRadius: '9px',
        background: '#ecf0f1',
        fontSize: '1.3em',
    },
    deleteButton: {
        color: '#e74c3c',
    },
    updateButton: {
        color: '#2ecc71',
    },
    buttonContainer: {
        display: 'flex'
    }
});


const SpanTable = () => {

    const { driverSchedule, deleteTask } = useRPC()
    const { columnHeader, driver, week, startHrToUpdate,
        openUpdateModal, 
        changeToUpdateTask,
        changeToUpdateStartHr,
        changeToUpdateDuration,
        changeToUpdateDriver,
        changeToUpdateWeek,
        changeToUpdateDay } = useAppStore()
    const classes = useStyles()

    const deleteTaskClosure = (day, time) => {
        const currentDriver = driver
        const currentWeek = week
        const taskDay = parseInt(day)
        const taskTime = time
        const deleteFunc = deleteTask

        const delTask = () => {
            deleteFunc(currentDriver, currentWeek, taskDay, taskTime)
        }

        return delTask
    }

    const updateTaskClosure = (day, time, task) => {
        const currentDriver = driver
        const currentWeek = week
        const taskDay = parseInt(day)
        const taskTime = time
        const currentTask = task[0]
        const taskDuration = task[1]

        const upTask = () => {
            changeToUpdateTask(currentTask)
            changeToUpdateStartHr(taskTime)
            changeToUpdateDuration(taskDuration)
            changeToUpdateDriver(currentDriver)
            changeToUpdateWeek(currentWeek)
            changeToUpdateDay(taskDay)
            openUpdateModal()
        }

        return upTask
    }

    const getCell = (weekData, day, time) => {
        if (weekData.hasOwnProperty(day)) {
            if (weekData[day].hasOwnProperty(time)) {
                if (weekData[day][time][1] !== 0) {
                    return (
                        <TableCell
                            className={classes.cell}
                            rowSpan={weekData[day][time][1]}
                            key={day}
                            align="center">
                            {weekData[day][time][0]}
                            <Container className={classes.buttonContainer}>
                                <IconButton
                                    onClick={deleteTaskClosure(day, time)}
                                    aria-label="delete"
                                    className={classes.deleteButton}>
                                    <DeleteIcon />
                                </IconButton>
                                <IconButton
                                    onClick={updateTaskClosure(day, time, weekData[day][time])}
                                    aria-label="edit"
                                    className={classes.updateButton}>
                                    <EditIcon />
                                </IconButton>
                            </Container>
                        </TableCell>
                        )
                }
            } else {
                return (
                    <TableCell key={day} align="center"></TableCell>
                )
            }
        } else {
            return (
                <TableCell key={day} align="center"></TableCell>
            )
        }
    }


    return (
        <Paper className={classes.root}>
            <Container>
                <UpdateModal />
            </Container>
            <TableContainer className={classes.container}>
                <Table stickyHeader className={classes.table} aria-label="spanning table">
                    <TableHead>
                        <TableRow>
                            {columnHeader.map((column, i) => (
                                <TableCell
                                    key={i}
                                    align='center'
                                    style={{ minWidth: 120 }}
                                >
                                    {column}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {ct.TIME_SLOTS.map((time, timeIndex) => (
                            <TableRow key={timeIndex}>
                                <TableCell align="top">{time[1]}</TableCell>
                                {ct.INT_WEEK_DAYS.map((day) => {
                                    return getCell(driverSchedule, day, time[0])
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}

export default SpanTable;
