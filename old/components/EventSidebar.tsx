'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Event } from '../interfaces/Event';
import EventItem from './EventItem';
import "../css/sidebar.css";

export default function EventSidebar({ isOpen, setIsOpen, events, map, updateSeen, selectedEventId, setSelectedEventId }: {isOpen: boolean, setIsOpen: (state: boolean) => void, events: Event[], map: google.maps.Map | null, updateSeen: (event: Event, active: Boolean) => void, selectedEventId: string, setSelectedEventId: (id: string) => void}) {
    
    const eventRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    
    useEffect(() => {
        if (selectedEventId && eventRefs.current[selectedEventId]) {
            eventRefs.current[selectedEventId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [selectedEventId]);
    
    return (
        <div className={`sidebar ${isOpen ? "active" : ""}`}>
            <h4>NU Events!</h4>
            {events.length === 0 ? <p>empty</p> : events.map((event) => (
                <div key={event.id} ref={(el) => { eventRefs.current[event.id] = el; }}>
                    <EventItem  
                        event={event} 
                        map={map} 
                        updateSeen={updateSeen}
                        selectedEventId={selectedEventId}
                        setSelectedEventId={setSelectedEventId}
                        setIsOpen={setIsOpen}
                    />
                </div>
            ))}
        </div>
    );
}
