import React, {useEffect, useState, useRef} from 'react';
import { Container, Typography, Paper } from '@material-ui/core';

// Custom Hooks
import useAppStore from '../hooks/useAppStore';
import useRPC from '../hooks/useRPC';
import useSSE from '../hooks/useSSE';

// Constants
import * as ct from '../context/constants';
import TaskCreator from './TaskCreator';
import SpanTable from './SpanTable';


const Dispatcher = () => {
    const { listenToSSE, getSSE, updateNotifications, listening } = useSSE()
    const { driver, week, username, role, resetNotificationNumber } = useAppStore()
    const { getSchedule } = useRPC()
    const [SSEURL, setSSEURL] = useState("")
    const sseRef = useRef(null);
/*
    // Server Sent Events connection

    useEffect(() => {
        resetNotificationNumber()
    },[])

    useEffect(() => {
        if (role === ct.DISPATCHER_ROLE) {
            setSSEURL(`${process.env.REACT_APP_SSE_HOST}/stream?username=${username}&role=${role}`)
        }
    }, [username, role])

    useEffect(() => {
        if (listening) { return }
        if (SSEURL === "") { return }
        if (sseRef.current) { return }

        console.log(SSEURL)

        const ev = new EventSource(SSEURL)
        sseRef.current = ev
        ev.onopen = () => {
            console.log("opened connection")
            listenToSSE(true)
        }
        ev.onmessage = (e) => {
            getSSE(e)
            updateNotifications()
        }

        ev.onerror = (e) => {
            if (ev.readyState === 0) {
                console.log("please refresh")
            }
            //getSSE(e)
        }
        return () => {
            listenToSSE(false)
            console.log("Cleanup")
            sseRef.current = null
            ev.close()
        }
    }, [SSEURL])
*/

    useEffect(() => {
        getSchedule(driver, week)
    }, [driver, week])

    return (
        <>
        <Container>
            <TaskCreator />
        <Container>
            <SpanTable />
        </Container>
        </Container>
        </>
    );
}

export default Dispatcher

