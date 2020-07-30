import { useContext } from 'react';
import { AppStoreContext } from '../context/appStore';

const useAppStore = () => {
  const [state, setState] = useContext(AppStoreContext);

  // Update current tab
  const updateCurrentTab = (newTab) => {
    setState(state => ({
      ...state,
      currentTab: newTab
    }))
  }

  // Update current username
  const updateCurrentUsername = (newUsername) => {
    setState(state => ({
      ...state,
      username: newUsername
    }))
  }

  // Update current user role
  const updateCurrentUserRole = (newRole) => {
    setState(state => ({
      ...state,
      role: newRole
    }))
  }

  // reset notifications
  const resetNotificationNumber = () => {
    setState(state => ({
      ...state,
      unreadNotifications: 0
    }))
  }

  const changeDriver = (newDriver) => {
    setState(state => ({
      ...state,
      driver: newDriver
    }))
  }

  const changeTask = (newTask) => {
    setState(state => ({
      ...state,
      task: newTask
    }))
  }

  const changeWeek = (newWeek) => {
    setState(state => ({
      ...state,
      week: newWeek
    }))
  }

  const changeWeekDay = (newWeekDay) => {
    setState(state => ({
      ...state,
      weekDay: newWeekDay
    }))
  }

  const changeStartHr = (newStartHr, newEndHr) => {
    setState(state => ({
      ...state,
      startHr: newStartHr
    }))
  }

  const changeEndHr = (newStartHr, newEndHr) => {
    setState(state => ({
      ...state,
      endHr: newEndHr
    }))
  }

  const openUpdateModal = () => {
    setState(state => ({
      ...state,
      updateModalOpen: true
    }))
  }

  const closeUpdateModal = () => {
    setState(state => ({
      ...state,
      updateModalOpen: false
    }))
  }

  const changeToUpdateTask = (newTask) => {
    setState(state => ({
      ...state,
      taskToUpdate: newTask
    }))
  }

  const changeToUpdateStartHr = (newStartHr) => {
    setState(state => ({
      ...state,
      startHrToUpdate: newStartHr
    }))
  }

  const changeToUpdateEndHr = (newEndHr) => {
    setState(state => ({
      ...state,
      endHrToUpdate: newEndHr
    }))
  }

  const changeToUpdateDuration = (newDuration) => {
    setState(state => ({
      ...state,
      durationToUpdate: newDuration
    }))
  }

  const changeToUpdateDriver = (newDriver) => {
    setState(state => ({
      ...state,
      driverToUpdate: newDriver
    }))
  }
  const changeToUpdateWeek = (newWeek) => {
    setState(state => ({
      ...state,
      weekToUpdate: newWeek
    }))
  }

  const changeToUpdateDay = (newDay) => {
    setState(state => ({
      ...state,
      dayToUpdate: newDay
    }))
  }

  const updateAppErrMessage = (newMessage) => {
    setState(state => ({
      ...state,
      appErrMessage: newMessage
    }))
  }

  const updateAppErrMessageType = (newMessageType) => {
    setState(state => ({
      ...state,
      appErrMessageType: newMessageType
    }))
  }


  return {
    updateCurrentTab,
    updateCurrentUsername,
    updateCurrentUserRole,
    resetNotificationNumber,
    changeDriver,
    changeTask,
    changeWeek,
    changeWeekDay,
    changeStartHr,
    changeToUpdateDuration,
    changeEndHr,
    openUpdateModal,
    closeUpdateModal,
    changeToUpdateTask,
    changeToUpdateStartHr,
    changeToUpdateEndHr,
    changeToUpdateDriver,
    changeToUpdateWeek,
    changeToUpdateDay,
    updateAppErrMessage,
    updateAppErrMessageType,
    appErrMessage: state.appErrMessage,
    appErrMessageType: state.appErrMessageType,
    driverToUpdate: state.driverToUpdate,
    weekToUpdate: state.weekToUpdate,
    dayToUpdate: state.dayToUpdate,
    taskToUpdate: state.taskToUpdate,
    startHrToUpdate: state.startHrToUpdate,
    durationToUpdate: state.durationToUpdate,
    endHrToUpdate: state.endHrToUpdate,
    updateModalOpen: state.updateModalOpen,
    columnHeader: state.columnHeader,
    driver: state.driver,
    task: state.task,
    week: state.week,
    weekDay: state.weekDay,
    startHr: state.startHr,
    endHr: state.endHr,
    page: state.page,
    unreadNotifications: state.unreadNotifications,
    currentTab: state.currentTab,
    username: state.username,
    role: state.role,
  }
}

export default useAppStore;