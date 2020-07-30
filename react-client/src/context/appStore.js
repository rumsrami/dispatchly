import React, { useState, createContext } from 'react';
import * as ct from '../context/constants';

// App State context 
export const AppStoreContext = createContext([{
  listeningSSE: false,
  updateModalOpen: false,
  appErrMessage: "",
  appErrMessageType: "",
  taskToUpdate: "",
  startHrToUpdate: "",
  durationToUpdate: "",
  endHrToUpdate: "",
  driverToUpdate: "",
  weekToUpdate: "",
  dayToUpdate: "",
  serverUpdateMessage:"",
  unreadNotifications: 0,
  currentTab: 0,
  notificationItems: [],
  username: "",
  role: "",
  driver: "",
  task: "",
  week: "",
  weekDay: "",
  startHr: "",
  endHr: "",
  columnHeader: [],
  driverSchedule: []

}, ()=>{}]);

// App Store provider - Initial App State
export const AppStoreProvider = (props) => {
  const [state, setState] = useState({
    listeningSSE: false,
    updateModalOpen: false,
    appErrMessage: "",
    appErrMessageType: "",
    taskToUpdate: "",
    startHrToUpdate: "",
    durationToUpdate: "",
    endHrToUpdate: "",
    driverToUpdate: "",
    weekToUpdate: "",
    dayToUpdate: "",
    serverUpdateMessage:"",
    unreadNotifications: 1,
    currentTab: 0,
    notificationItems: ["hello", "hello2"],
    username: ct.DISPATCHER_NAME,
    role: ct.DISPATCHER_ROLE,
    driver: ct.FIERCE_BOB_NAME,
    task: ct.TASK_PICK_UP,
    week: 1,
    weekDay: 1,
    startHr: ct.DEFAULT_START_HR,
    endHr: ct.DEFAULT_END_HR,
    columnHeader: ct.TABLE_ROWS_HEADER,
    driverSchedule: {}

  })

  return (
    <AppStoreContext.Provider value={[state, setState]}>
      {props.children}
    </AppStoreContext.Provider>
  )
}