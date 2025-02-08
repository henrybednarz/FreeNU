'use client'

import React from 'react';
import "bootstrap-icons/font/bootstrap-icons.css";

export default function TargetEvent({ location, map, setIsOpen }: {location: {lat: number, lng: number}, map: google.maps.Map | null, setIsOpen: (state: boolean) => void}) {
    
    const recenter = (location: {lat: number, lng: number}) => {
        if (map) {
            map.setCenter({lat: location.lat, lng: location.lng})
            map.setZoom(18)
            setIsOpen(false)
        }
    }

    return (
        <button
            className="btn border-0"
            onClick={() => recenter(location)}
            type="button">
            <i className="bi bi-crosshair"></i>
        </button>
    )
}