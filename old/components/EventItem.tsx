'use client'
import React, { useState, useEffect } from 'react';
import { Event } from '../interfaces/Event';
import TargetEvent from './TargetEvent';
import StillHere from './StillHere'

export default function EventItem({event, map, updateSeen, selectedEventId, setSelectedEventId, setIsOpen}: {event: Event, map: google.maps.Map | null, updateSeen: (event: Event, active: Boolean) => void, selectedEventId: string, setSelectedEventId: (id: string) => void, setIsOpen: (state: boolean) => void }) {
    const eventTypeIcons: { [key: string]: string } = {
        "drinks": '☕️',
        'food': '🍽',
        'merchandise': '👕',
        'other': '🎁',
    }
    const [showLastSeen, setShowLastSeen] = useState(false)
    const recentlySeen = (new Date().getTime() - new Date(event.lastSeen).getTime()) < 1000 * 60 * 60 * 2 // 2 hours
    const [nearby, setNearby] = useState(false);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const distance = Math.sqrt(Math.pow(event.lat - position.coords.latitude, 2) + Math.pow(event.lng - position.coords.longitude, 2));
                setNearby(distance < 0.0001);
            });
        }
    }, [event.lat, event.lng]);

    useEffect(() => {
        setShowLastSeen(!recentlySeen && true);
    }, [recentlySeen, nearby]);

    return (
        <div key={event.id} className={`info-block border border-${selectedEventId == event.id ? "danger" : "secondary"} p-2 bg-${selectedEventId == event.id ? "white" : ""}`} onClick={() => {setSelectedEventId(event.id)}}>
            <h5>{eventTypeIcons[event.type] || '❓'} {event.title}</h5>
            <p>{event.description}</p>
            
            <div className="d-flex w-100 justify-content-between">
                {showLastSeen ?   
                <div className="d-flex justify-content-front">
                    <StillHere event={event} updateSeen={updateSeen}/>
                </div>
                : null}
                <div className="justify-content-end">
                    <TargetEvent location={{lat: event.lat, lng: event.lng}} map={map} setIsOpen={setIsOpen}/>
                </div>
            </div>
        </div>
    )
}