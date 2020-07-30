import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';

import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

// Constants
import * as ct from '../context/constants';

// Custom Hooks
import useAppStore from '../hooks/useAppStore';
import useRPC from '../hooks/useRPC';
import useSSE from '../hooks/useSSE';


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    maxWidth: '100wv',
  },
  tabs: {
    position: 'sticky',
  },
  tabIcon: {
    fontSize: 'small',
    fontWeight: 'bold'
  },
}));

const DashTabs = () => {
  // Styling
  const { currentTab, updateCurrentTab, updateCurrentUsername, updateCurrentUserRole } = useAppStore()
  const classes = useStyles();
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    updateCurrentUserRole(newValue === 0 ? ct.DISPATCHER_ROLE : ct.FIERCE_BOB_ROLE)
    updateCurrentUsername(newValue === 0 ? ct.DISPATCHER_NAME : ct.FIERCE_BOB_NAME)
  };

  useEffect(() => {
    updateCurrentTab(value)
  }, [value])


  return (
      <Paper square className={classes.root}>
        <Tabs
          className={classes.tabs}
          value={value}
          onChange={handleChange}
          variant="fullWidth"
          indicatorColor="secondary"
          textColor="secondary"
          aria-label="icon label tabs example"
          centered
        >
          <Tab className={classes.tabIcon} label="Dispatcher" />
          <Tab className={classes.tabIcon} label="Fierce Bob" />
        </Tabs>
      </Paper>

  );
}

export default DashTabs;