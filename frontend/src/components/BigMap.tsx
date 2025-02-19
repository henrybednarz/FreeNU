import React, { useRef, useEffect, useMemo, useState } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { Event } from '../interfaces/Event.tsx';
import { Location } from '../interfaces/Location.tsx'

const libraries: ("places" | "geometry" | "drawing" | "visualization" | "marker")[] = ["marker"];
const mapOptions = {
    streetViewControl: false,
    fullscreenControl: false,
    zoomControl: false,
    gestureHandling: "greedy",
    mapTypeControl: false,
    mapId: 'aa178dd973fe1339'
};

const userIcon = document.createElement("img")
userIcon.src = "/icons/person-circle.svg";
userIcon.style.height = "3vh"
userIcon.style.width = "3vh"

const MapComponent = ({ events, handleSelectEvent, setMap, userLocation, handleAfterSelectLocation, isSelectingLocation, selectedLocation } : { 
    events: Event[], 
    handleSelectEvent: (id: string) => void, 
    setMap: (map: google.maps.Map) => void, 
    userLocation: null | Location,
    handleAfterSelectLocation: (location: Location) => void,
    isSelectingLocation: boolean,
    selectedLocation: Location | null
}) => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_API_KEY as string,
        libraries
    });

    const mapRef = useRef<google.maps.Map | null>(null);
    const center = useMemo(() => ({ lat: 42.33666532, lng: -71.08749965 }), []);
    const [userMarker, setUserMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
    const [eventMarkers, setEventMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
    const [selectedLocationMarker, setSelectedLocationMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (isSelectingLocation && e.latLng) {
            handleAfterSelectLocation({lat: e.latLng.lat(), lng: e.latLng.lng()})
        }
    }

    const getPinIcon = (type: string, PinElement) => {
        if (!PinElement) return null;
      
        let iconSrc = "";
        let background = "";
        let borderColor = "";

        switch (type) {
          case "drinks":
            iconSrc = "/icons/drinkIcon.svg";
            background = "#052DA9";
            borderColor = "#052DA9";
            break;
          case "food":
            iconSrc = "/icons/foodIcon.svg";
            background = "#AC2215";
            borderColor = "#AC2215";
            break;
          case "merchandise":
            iconSrc = "/icons/merchandiseIcon.svg";
            background = "#7C3B87";
            borderColor = "#7C3B87";
            break;
          case "other":
            iconSrc = "/icons/otherIcon.svg";
            background = "#CDC02D";
            borderColor = "#CDC02D";
            break;
          default:
            return null;
        }

        const iconElement = document.createElement("img");
        iconElement.src = iconSrc;
        iconElement.style.width = "5vh";
        iconElement.style.height = "5vh";

        return new PinElement({
          glyph: iconElement,
          background,
          borderColor,
          scale: 1.5,
        });
    };

    useEffect(() => {
        if (isLoaded && mapRef.current) {
            const { AdvancedMarkerElement, PinElement } = google.maps.marker;

            if (userLocation) {
                if (userMarker) {
                    userMarker.position = userLocation;
                } else {
                    setUserMarker(new AdvancedMarkerElement({
                        map: mapRef.current,
                        position: userLocation,
                        content: userIcon,
                    }))
                }
                mapRef.current.setCenter(userLocation)
            }
            
            if (selectedLocation) {
                if (selectedLocationMarker) {
                    selectedLocationMarker.position = selectedLocation
                } else {
                    setSelectedLocationMarker(new AdvancedMarkerElement({
                        map: mapRef.current,
                        position: selectedLocation,
                    }));
                }
            }

            eventMarkers.forEach((marker) => {
                marker.map = null
            })
            setEventMarkers([])
            if (events.length > 0) {
                events.forEach((event: Event) => {
                    const pin = getPinIcon(event.type, PinElement);
                    if (!pin) return;

                    const marker = new AdvancedMarkerElement({
                        map: mapRef.current,
                        position: { lat: event.lat, lng: event.lng },
                        content: pin.element,
                        gmpClickable: true,
                    });

                    marker.addListener('click', () => {
                        handleSelectEvent(event.id);
                    });
                    setEventMarkers([...eventMarkers, marker])
                });
            }
        }
    }, [isLoaded, events, userLocation, selectedLocation]);

    if (loadError) return <div>Error loading maps</div>;
    if (!isLoaded) return <div>Loading...</div>;

    return (
        <div style={{overflow: 'hidden'}}>
            <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100vh" }}
                center={center}
                zoom={18}
                onClick={handleMapClick}
                onLoad={(map) => { 
                    mapRef.current = map; 
                    mapRef.current.setOptions(mapOptions); 
                    setMap(map);
                }}
            />
        </div>
    );
};

export default MapComponent;
