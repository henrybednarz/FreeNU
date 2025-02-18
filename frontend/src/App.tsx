import React, { useEffect, useState } from 'react'
// Components
import BigMap from './components/BigMap.tsx'
import EventSidebar from './components/EventSidebar.tsx'
import AddEventSidebar from './components/AddEventSidebar.tsx'
// Interfaces
import { Event } from './interfaces/Event.tsx'
import { Alert } from './interfaces/Alert.tsx'

// CSS
import './App.css'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import AlertBar from './components/AlertBar.tsx'


export default function Home() {
    const [events, setEvents] = useState<Event[]>([])
    const eventTypes = ['food', 'drinks', 'merchandise', 'other']
    const [map, setMap] = useState<google.maps.Map | null>(null)
    const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)

    const [showEventList, setShowEventList] = useState<boolean>(false)
    const [showAddEvent, setShowAddEvent] = useState<boolean>(false)

    const [selectedEventId, setSelectedEventId] = useState<string>("0")
    const [alerts, setAlerts] = useState<Alert[]>([])


    // API Calls
    const fetchEvents = async() => {
        const response = await fetch(process.env.REACT_APP_API_ADDR + '/api/events')
        if (response.ok) {
          const data = await response.json()
          setEvents(data)
        }
    }

    const updateEventLastSeen = async(event: Event, active: boolean) => {
        const response = await fetch(process.env.REACT_APP_API_ADDR + '/api/sighting/'+ event.id, {
        method: 'POST',
        body: JSON.stringify({
            lastSeen: new Date().toISOString(),
            remove: active ? true : false,
        }),
        headers: { 'Content-Type': 'application/json' }})
        
        if (response.ok) {
            fetchEvents()
        }
    }

    // button commands
    const handleAddEventClick = () => {
        setShowAddEvent(!showAddEvent)
        setShowEventList(false)
    }

    const handleEventListClick = () => {
        setShowEventList(!showEventList)
        setShowAddEvent(false)
    }

    // Map Commands
    const handleSelectEvent = (id : string) => {
        handleEventListClick()
        setSelectedEventId(id)
    }

    const updateUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              })
            })
          }
        else {
            setUserLocation(null)
        }
    }

    // on Load
    useEffect(() => {
        fetchEvents()
        updateUserLocation()
    }, [])

    return (
        <div className="relative h-screen">
            <BigMap
                events={events}
                handleSelectEvent={handleSelectEvent}
                setMap={setMap}
                userLocation={userLocation}
            />
            <div style={{position: 'absolute', left: "50%", transform: "translate(-50%, -50%)", top: '8%', alignItems: 'start'}}>
                <AlertBar
                    alerts={alerts}
                    setAlerts={setAlerts}
                />
            </div>
            <button
                className="btn border-0 showEventListButton"
                style={{position: 'absolute', top: '3%', right: '1%', fontWeight: "2000", fontSize: "1.8rem" }}
                onClick={handleEventListClick}>
                <i className="bi bi-list me-2"></i>
            </button>
            <button
                className="btn border-0 addEventButton"
                style={{position: 'absolute', bottom: '3%', right: '1%', fontWeight: "2000", fontSize: "1.8rem" }}>
                <i className="bi bi-plus-circle" onClick={handleAddEventClick}></i>
            </button>
            <EventSidebar
                events={events}
                isOpen={showEventList}
                setIsOpen={setShowEventList}
                map={map}
                updateSeen={updateEventLastSeen}
                selectedEventId={selectedEventId}
                setSelectedEventId={setSelectedEventId}
                addAlert={(alert: Alert) => setAlerts([...alerts, alert])}
            />
            <AddEventSidebar
                isOpen={showAddEvent}
                setIsOpen={setShowAddEvent}
                map={map}
                eventTypes={eventTypes}
                selectedLocation={null}
                onSelectLocation={() => console.log('hi')}
                addAlert={(alert: Alert) => setAlerts([...alerts, alert])}
            />
            
        </div>
    )
}