import React from 'react'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { Event } from './interfaces/Event.tsx'
import { Location } from './interfaces/Location.tsx'
import { Alert } from './interfaces/Alert.tsx'
import EventSidebar from './components/EventSidebar.tsx'
import AddEventSidebar from './components/AddEventSidebar.tsx'
import './App.css'
import AlertBar from "./components/AlertBar.tsx";

/*
  TODO-----
  1. notifs
   -> email input page
   -> unsubscribe
  3. Celery tasking
  4. use schema to validate data inputs
  5. make sure it looks good on mobile
  6. Like features to determine notifs
  ...
  could try expo conversion
*/

// Making sure the map takes up full screen
const mapContainerStyle = {
  width: '100%',
  height: '100vh',
};

// Google maps API Options, hides unnecessary controls and labels
const mapOptions = {
  streetViewControl: false,
  fullscreenControl: false,
  zoomControl: false,
  mapTypeControl: false,
};

const eventIcons: {[key: string]: string } = {
  'drinks': '🍹',
  'food': '🍔',
  'merchandise': '👕',
  'other': '🎉',
}

export default function Home() {
  const [events, setEvents] = useState([])
  const [eventTypes, setEventTypes] = useState([])
  const [centerLocation, setCenterLocation] = useState<Location>({lat: 42.3398, lng: -71.0892}) // default to NU center
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [isSelectingLocation, setIsSelectingLocation] = useState(false)
  const [showList, setShowList] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [AdvancedMarkerElement, setAdvancedMarkerElement] = useState<google.maps.MarkerLibrary["AdvancedMarkerElement"] | null>(null);
  const [PinElement, setPinElement] = useState<google.maps.MarkerLibrary["PinElement"] | null>(null)
  const [pinIcons, setPinIcons] = useState<{ [key: string]: Element}>({})
  const [librariesLoaded, setLibrariesLoaded] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string>("0")

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_API_KEY as string,
  });

  // updates event list
  const fetchEvents = async() => {
    const response = await fetch(process.env.REACT_APP_API_ADDR + '/api/events')
    if (response.ok) {
      const data = await response.json()
      setEvents(data)
    }
  }

  const recenter = (lat: number, lng: number) => {
    if (map) {
        map.setCenter({lat: lat, lng: lng})
        map.setZoom(18)
    }
}

  // updates event types
  const fetchEventTypes = async() => {
    const response = await fetch(process.env.REACT_APP_API_ADDR + '/api/event-types',
      {
        method: "GET",
        headers: {
          'Access-Control-Allow-Origin': 'https://localhost:3000'
        }
      }
    )

    if (response.ok) {
      const data = await response.json()
      setEventTypes(data)
    }
  }

  const updateEventLastSeen = async(event: Event, active: Boolean) => {
    if (active) {
      const response = await fetch(process.env.REACT_APP_API_ADDR + '/api/sighting/'+ event.id, {
        method: 'POST',
        body: JSON.stringify({
          lastSeen: new Date().toISOString(),
          remove: false,
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
    } else {
      const response = await fetch(process.env.REACT_APP_API_ADDR + '/api/sighting/' + event.id, {
        method: 'POST',
        body: JSON.stringify({
          remove: true,
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }
    fetchEvents()
    loadMarkers()
  }

  // updates center location
  const updateUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCenterLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      })
    } else {
      console.log("Geolocation is not supported by this browser.")
    }
  }

  const loadMarkers = (() => {
    if (window.google && map) {
      // remove old
      map.data.forEach((feature) => {
        map.data.remove(feature)
      })
      // Draw all markers
      events.forEach((event: Event) => {
        if (!PinElement || !AdvancedMarkerElement) {
          return
        }
        const markerOptions = {
          map,
          position: { lat: event.lat, lng: event.lng },
          content: getPinIcon(event.type)?.element || null,
          gmpClickable: true,
        }
        const marker = new AdvancedMarkerElement(markerOptions)
        marker.addListener('click', () => {
          setSelectedEventId(event.id)
          handleEventListClick()
        })
      })
    }
  })

  const onMapLoad = useCallback((map: google.maps.Map) => {
    map.setOptions({ mapId: 'aa178dd973fe1339' })
    setMap(map)
  }, [])

  // When map is clicked, if in select location mode, set the selected location.
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (isSelectingLocation && e.latLng) {
      handleLocationSelected({ lat: e.latLng.lat(), lng: e.latLng.lng() })
    }
  }, [isSelectingLocation])

  const handleAddEventClick = () => {
    if (showList) { setShowList(!showList) }
    setShowForm(!showForm)
    setSelectedLocation(null)
  }
  
  const handleEventListClick = () => {
    if (showForm) { 
      setShowForm(!showForm) 
      setIsSelectingLocation(false)
    }
    setShowList(!showList)
  }

  const handleSelectLocation = () => {
    setShowForm(false)
    setIsSelectingLocation(true)
  }

  const handleLocationSelected = (location: Location) => {
    setSelectedLocation(location)
    setIsSelectingLocation(false)
    setShowForm(true)
  }

  const addAlert = (alert: Alert) => {
    setAlerts(prevAlerts => [...prevAlerts, alert]); 
  };

  const loadLibraries = useCallback(async () => {
    // console.log("window.google:", window.google, "window.google.maps:", window.google.maps)
    if (window.google && window.google.maps) {
      const { AdvancedMarkerElement, PinElement } = (await window.google.maps.importLibrary("marker")) as google.maps.MarkerLibrary
      // console.log("recieved response", AdvancedMarkerElement, PinElement)
      setAdvancedMarkerElement(() => AdvancedMarkerElement)
      setPinElement(() => PinElement)
      setLibrariesLoaded(true)
    }
  }, [])

  const getPinIcon = ((type: string) => {
    if (!PinElement) {
      return
    }
    switch (type) {
      case ("drinks"): 
        const drinkIcon = document.createElement('img');
        drinkIcon.src = "/icons/drinkIcon.svg"
        drinkIcon.style.width="5vh"
        drinkIcon.style.height="5vh"
        return new PinElement({
          glyph: drinkIcon,
          background: '#052DA9',
          borderColor: "#052DA9",
          scale: 1.5,
        })
      case ("food"): 
        const foodIcon = document.createElement('img');
        foodIcon.src = "/icons/foodIcon.svg"
        foodIcon.style.width="5vh"
        foodIcon.style.height="5vh"
        return new PinElement({
          glyph: foodIcon,
          background: '#AC2215',
          borderColor: "#AC2215",
          scale: 1.5,
        })
      case ("merchandise"): 
        const swagIcon = document.createElement('img');
        swagIcon.src = "/icons/merchandiseIcon.svg"
        swagIcon.style.width="5vh"
        swagIcon.style.height="5vh"
        return new PinElement({
          glyph: swagIcon,
          background: '#7C3B87',
          borderColor: "#7C3B87",
          scale: 1.5,
        })
      case ("other"): 
        const otherIcon = document.createElement('img');
        otherIcon.src = "/icons/otherIcon.svg"
        otherIcon.style.width="5vh"
        otherIcon.style.height="5vh"
        return new PinElement({
          glyph: otherIcon,
          background: '#CDC02D',
          borderColor: "#CDC02D",
          scale: 1.5,
        })
      }
    return new PinElement({})
  })

  // Ran on components mounting
  useEffect(() => {
    fetchEvents()
    fetchEventTypes()
    updateUserLocation()
    loadLibraries()
  }, [])

  // 
  useEffect(() => {
    // console.log(isLoaded, map, events.length, AdvancedMarkerElement, PinElement)
    if (isLoaded && map && events.length > 0 && AdvancedMarkerElement && PinElement) {
      loadMarkers()
    }
  }, [map, AdvancedMarkerElement, PinElement, events])

  if (loadError) return <div>Error loading maps</div>
  if (!isLoaded) return <div>Loading...</div>

  return (
      <div className="relative h-screen">
        {!isLoaded ? <div>loading...</div> :
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={centerLocation}
            zoom={17}
            onClick={handleMapClick}
            onLoad={onMapLoad}
            options={mapOptions}
            />
        }
        <div style={{position: 'absolute', left: "50%", transform: "translate(-50%, -50%)", top: '8%', alignItems: 'start'}}>
          <AlertBar alerts={alerts} setAlerts={setAlerts}/>
        </div>
        <button
          className="btn border-0"
          style={{position: 'absolute', top: '3%', right: '1%', fontWeight: "2000", fontSize: "1.8rem" }}
          onClick={handleEventListClick}>
          <i className="bi bi-list me-2"></i>
        </button>
        <button
          className="btn border-0"
          style={{position: 'absolute', bottom: '3%', right: '1%', fontWeight: "2000", fontSize: "1.8rem" }}>
          <i className="bi bi-plus-circle" onClick={handleAddEventClick}></i>
        </button>
        {isSelectingLocation && (
          <div className="alert alert-warning fade show popup" style={{position: 'absolute', left:'50%', top:'5%', transform: 'translate(-50%, -50%)'}}role="alert">
            Click on the map to select a location.
          </div>)}
        <AddEventSidebar 
          isOpen={showForm}
          setIsOpen={setShowForm}
          eventTypes={eventTypes}
          map={map}
          selectedLocation={selectedLocation}
          onSelectLocation={handleSelectLocation}
          addAlert={addAlert}/>
        <EventSidebar 
          isOpen={showList} 
          events={events}
          map={map}
          updateSeen={updateEventLastSeen}
          setSelectedEventId={setSelectedEventId}
          selectedEventId={selectedEventId}
          setIsOpen={setShowList}/>
      </div>
  )
}
