import React, { useContext } from 'react';
import { Dispatch } from '../rpc/dispatch.gen'
import { AppStoreContext } from '../context/appStore';
import { getTaskDuration, createViewSchedule } from '../components/utils';

// dependencies should be an array
const useRPC = () => {
  const [state, setState] = useContext(AppStoreContext);
  const svcFetch = window.fetch.bind(window)
  const svc = new Dispatch(process.env.REACT_APP_RPC_HOST, svcFetch)

  const getSchedule = async (driver, week) => {
    try {
      const resp = await svc.readSchedule({
        req: {
          driverName: driver,
          week: week
        }
      })
      if (resp.res.hasOwnProperty('schedule') && Object.entries(resp.res['schedule']).length !== 0) {
        setState(state => ({
          ...state,
          driverSchedule: createViewSchedule(resp.res.schedule)
        }))
      } else {
        setState(state => ({
          ...state,
          driverSchedule: {},
        }))
      }
    } catch (err) {
      setState(state => ({
        ...state,
        driverSchedule: {},
      }))
    }
  }

  const createTask = async (driver, task, week, weekDay, startHr, endHr) => {
    const duration = getTaskDuration(startHr, endHr)
    try {
      const resp = await svc.createTask({
        req: {
          driverName: driver,
          operation: task,
          week: week,
          day: weekDay,
          startHour: startHr,
          endHour: endHr,
          duration: duration
        }
      })
      if (resp.res) {
        getSchedule(driver, week)
      }
    } catch (err) {
      setState(state => ({
        ...state,
        driverSchedule: {},
      }))
    }
  }

  const deleteTask = async (driver, week, day, startTime) => {
    try {
      const resp = await svc.deleteTask({
        req: {
          driverName: driver,
          week: week,
          day: day,
          startHour: startTime
        }
      })
      if (resp.res) {
        getSchedule(driver, week)
      }
    } catch (err) {
      setState(state => ({
        ...state,
        driverSchedule: {},
      }))
    }
  }


  const updateTask = async (driverName, week, day, overlapHrs, newStartHr, newEndHr, newOperation) => {
    const duration = getTaskDuration(newStartHr, newEndHr)
    try {
      const resp = await svc.updateTask({
        req: {
          driverName: driverName,
          week: week,
          day: day,
          startHour: overlapHrs,
          newStartHour: newStartHr,
          newEndHour: newEndHr,
          newDuration: duration,
          newOperation: newOperation,
        }
      })
      if (resp.res) {
        getSchedule(driverName, week)
      }
    } catch(err){
      setState(state => ({
        ...state,
        driverSchedule: {},
      }))
    }
  }

  return {
    getSchedule,
    createTask,
    deleteTask,
    updateTask,
    serverUpdateMessage: state.serverUpdateMessage,
    driverSchedule: state.driverSchedule
  }
}


export default useRPC;
