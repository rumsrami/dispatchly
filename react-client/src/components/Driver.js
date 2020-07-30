import React, { useEffect, useState, useRef } from 'react';
import { Container, Typography, Paper } from '@material-ui/core';

// Custom Hooks
import useAppStore from '../hooks/useAppStore';
import useRPC from '../hooks/useRPC';
import useSSE from '../hooks/useSSE';

// Constants
import * as ct from '../context/constants';

const Driver = () => {
    const { listenToSSE, getSSE, updateNotifications, listening } = useSSE()
    const { username, role, resetNotificationNumber } = useAppStore()
    const [SSEURL, setSSEURL] = useState("")
    const sseRef = useRef(null);

    useEffect(() => {
        resetNotificationNumber()
    },[])

    useEffect(() => {
        if (role === ct.FIERCE_BOB_ROLE) {
            setSSEURL(`${process.env.REACT_APP_SSE_HOST}/stream?username=${username}&role=${role}`)
        }
    }, [username, role])

    useEffect(() => {
        if (listening) { return }
        if (SSEURL === "") { return }
        if (sseRef.current) { return }

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
        }
        return () => {
            listenToSSE(false)
            console.log("Cleanup")
            sseRef.current = null
            ev.close()
        }
    }, [SSEURL])

    return (
            <Container>
                <Typography>New Task Feed Should have been here</Typography>
                <Typography>This Component connects to /stream on mount</Typography>
                <Typography>Once connected, launches a separate go routine hooked up to NATS</Typography>
                <Typography>Should get the driver's updated schedule whenever the dispatcher changes it</Typography>
            </Container>
    );
}

export default Driver


