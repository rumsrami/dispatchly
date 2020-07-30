import React, { useEffect } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import Container from '@material-ui/core/Container';

// Custom Components
import DashTabs from './Tabs';
import Dispatcher from './Dispatcher';
import Driver from './Driver';

// Custom Hooks
import useAppStore from '../hooks/useAppStore';
import useRPC from '../hooks/useRPC';
import useSSE from '../hooks/useSSE';

// Custom CSS object
import { useDashStyles } from '../styles/dash';

// Icons
import { IoIosNotifications } from "react-icons/io";
import { IoMdRefreshCircle } from "react-icons/io";

// Constants
import * as ct from '../context/constants';

const Dashboard = () => {
  // Styling
  const classes = useDashStyles();

  // Hooks
  const { currentTab, unreadNotifications, role } = useAppStore()
  const { listenToSSE, listening } = useSSE()

  return (

    <div className={classes.root}>
      <CssBaseline />
      <AppBar className={classes.appBar}>
        <Toolbar>
          <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
            Disptachly
          </Typography>
          {/* Notifications */}
          <IconButton color='inherit'>
            <IoMdRefreshCircle />
          </IconButton>
          {/* Sync */}
          <IconButton color="inherit">
          <Badge badgeContent={unreadNotifications} color='error'>
            <IoIosNotifications />
            </Badge>
          </IconButton>
        </Toolbar>
        <DashTabs />
      </AppBar>
      <Container className={classes.boardContainer}>
          {currentTab === ct.DISPATCHER ? <Dispatcher /> : <Driver />}
      </Container>
    </div>
  );
}

export default Dashboard