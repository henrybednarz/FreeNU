import React, { useEffect, useRef, useState } from 'react';
import { Event } from '../interfaces/Event.tsx';
import { Alert } from '../interfaces/Alert.tsx';
import EventItem from './EventItem.tsx';
import EmailSubmission from './EmailSubmission.tsx';
import "bootstrap-icons/font/bootstrap-icons.css";
import "../App.css";

export default function EventSidebar({ isOpen, setIsOpen, events, map, updateSeen, selectedEventId, setSelectedEventId, addAlert }: { 
    isOpen: boolean, 
    setIsOpen: (state: boolean) => void, 
    events: Event[], map: google.maps.Map | null, 
    updateSeen: (event: Event, active: boolean) => void, 
    selectedEventId: string, setSelectedEventId: (id: string) => void 
    addAlert: (alert: Alert) => void
}) {
    const [emailOpen, setEmailOpen] = useState(false);
    const eventRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    
    useEffect(() => {
        if (selectedEventId && eventRefs.current[selectedEventId]) {
            eventRefs.current[selectedEventId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [selectedEventId]);
    
    return (
        <div className={`sidebar ${isOpen ? "active" : ""}`}>
            <div className="d-flex justify-content-between p-1">
                <h3>NU Events!</h3>
                <div>
                    <button className="btn" onClick={() => setEmailOpen(!emailOpen)}>
                        notify me {emailOpen? (<i className="bi bi-chevron-up"></i>) : (<i className="bi bi-chevron-down"></i>)}
                    </button>
                </div>
            </div>
            {emailOpen && (
                <div>
                    <EmailSubmission 
                        setEmailOpen={setEmailOpen}
                        addAlert={addAlert}/>
                </div>  
            )}
            <hr/>
            <div className="sidebar-content">
                <div>
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
            </div>
        </div>
    );
}
