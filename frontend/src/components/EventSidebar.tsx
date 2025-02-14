import React, { useEffect, useRef } from 'react';
import { Event } from '../interfaces/Event.tsx';
import EventItem from './EventItem.tsx';
import "../App.css";

export default function EventSidebar({ isOpen, setIsOpen, events, map, updateSeen, selectedEventId, setSelectedEventId }: { isOpen: boolean, setIsOpen: (state: boolean) => void, events: Event[], map: google.maps.Map | null, updateSeen: (event: Event, active: boolean) => void, selectedEventId: string, setSelectedEventId: (id: string) => void }) {
    
    const eventRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    
    useEffect(() => {
        if (selectedEventId && eventRefs.current[selectedEventId]) {
            eventRefs.current[selectedEventId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [selectedEventId]);
    
    return (
        <div className={`sidebar ${isOpen ? "active" : ""}`}>
            <h4>NU Events!</h4>
            {/* Flex container to push the email section down */}
            <div className="sidebar-content">
                <div className="events-list">
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
                {/* Sticks to bottom */}
                <div className="info-box">
                    email add
                </div>
            </div>
        </div>
    );
}
