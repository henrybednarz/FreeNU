'use client'

import React, { useState } from 'react';
import { Event } from '../interfaces/Event';
import '../App.css'

export default function StillHere({event, updateSeen}: {event: Event, updateSeen: (event: Event, active: boolean) => void}) {
    const [receivedFeedback, setReceivedFeedback] = useState(false)
    const handleClick = ((event: Event, active: boolean) => {
        updateSeen(event, active)
        setReceivedFeedback(true)
    })

    return (
        <div>
            {!receivedFeedback ?
                <div className="fade-out flex-row">
                    <button className="btn btn-sm border m-1" onClick={() => handleClick(event, true)}>active</button>
                    <button className="btn btn-sm border" onClick={() => handleClick(event, false)}>ended</button>
                </div>
                : <p className="fade-in text-secondary text-sm-secondary m-1" style={{fontSize: "0.875em"}}>thank you!</p>
            }
        </div>)
}