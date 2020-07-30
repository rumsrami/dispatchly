import React, { useContext } from 'react';
import { AppStoreContext } from '../context/appStore';

// dependencies should be an array
const useSSE = () => {
  const [state, setState] = useContext(AppStoreContext);

  const listenToSSE = (value) => {
    setState(state => ({
      ...state, listeningSSE: value,
    }))
  }

  const updateNotifications = () => {
    setState(state => ({
      ...state, unreadNotifications: state.unreadNotifications + 1
    }))
  }
  
  const getSSE = (event) => {
    // setState(state => ({ 
    //   ...state, unreadMail: state.unreadMail+1
    // }))
  }

  return {
    listenToSSE,
    listening: state.listeningSSE,
    getSSE,
    updateNotifications,
  }
}

export default useSSE;