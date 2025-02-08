'use client'

import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import TargetEvent from './TargetEvent.tsx';
import { Alert } from '../interfaces/Alert.tsx'
import "../App.css";

interface FormData {
    name: string
    description: string
    eventType: string
    lat: number
    lng: number
}

interface FormErrors {
    name?: string
    description?: string
    eventType?: string
    location?: string
}

export default function AddEventSidebar({ isOpen, setIsOpen, map, eventTypes, selectedLocation, onSelectLocation, addAlert }: {isOpen: boolean, setIsOpen: (isOpen: boolean) => void, map: google.maps.Map | null, eventTypes: string[], selectedLocation: { lat: number, lng: number } | null, onSelectLocation: () => void, addAlert: (alert: Alert) => void }) {
    const eventTypeIcons: { [key: string]: string } = {
        "drinks": '🍹',
        'food': '🍔',
        'merchandise': '👕',
        'other': '🎉',
    }

    const [formData, setFormData] = useState<FormData>({
        name: "",
        description: "",
        eventType: "",
        lat: 0,
        lng: 0,
    })
    const [errors, setErrors] = useState<FormErrors>({})
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
        ...prevData,
        [name]: value,
    }))
    }

    useEffect(() => {
        if (selectedLocation) {
          setFormData((prevData) => ({
            ...prevData,
            lat: selectedLocation.lat,
            lng: selectedLocation.lng,
          }))
        }
      }, [selectedLocation])

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = "Name is required"
        }

        if (!formData.description.trim()) {
            newErrors.description = "Description is required"
        }

        if (!formData.eventType) {
            newErrors.eventType = "Event type is required"
        }

        if (formData.lat === 0 || formData.lng === 0) {
            newErrors.location = "Location is required"
        } else if (formData.lat > 42.3500 || formData.lat < 42.3300 || formData.lng > -71.0800 || formData.lng < -71.100) {
            newErrors.location = "Location is not at Northeastern!"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        setErrors({})
        e.preventDefault()

        if (validateForm()) {
            // Form is valid, you can submit the data here
            const ok = await postEvent(formData)
            if (ok) {
                addAlert({
                    id: "1",
                    text: "event added successfully!",
                    type: "success"
                })
                setFormData({
                    name: "",
                    description: "",
                    eventType: "",
                    lat: 0,
                    lng: 0,
                })
                setIsOpen(false)
            } else {
                addAlert({
                    id: "1",
                    text: "problem adding your event, please try again",
                    type: "danger"
                })
                // Create a failure alert
            }
            
            
        }
    }

    const postEvent = async(form: FormData) => {
        const response = await fetch(process.env.NEXT_PUBLIC_API_ADDR + '/api/submit', {
            method: 'POST',
            body: JSON.stringify({
                title: form.name,
                description: form.description,
                type: form.eventType,
                lat: form.lat,
                lng: form.lng,
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        return response.ok
    }
    return (
        <div className={`addSidebar ${isOpen ? "active" : ""}`}>
            <h4>Add Event</h4>
            <div className="container mt-5">
        <h2 className="mb-4">Create New Event</h2>
        <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="eventName">
            <Form.Label>Event Name</Form.Label>
            <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="eventDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
            as="textarea"
            rows={3}
            name="description"
            value={formData.description}
            onChange={handleChange}
            isInvalid={!!errors.description}
            />
            <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="eventType">
            <Form.Label>Event Type</Form.Label>
            <Form.Select
            name="eventType"
            value={formData.eventType}
            onChange={handleChange}
            isInvalid={!!errors.eventType}
            >
            <option value="">Select an event type</option>
            {eventTypes.map((type) => (
                <option key={type} value={type}>
                {eventTypeIcons[type]}{type}
                </option>
            ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.eventType}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="eventLocation">
            <Form.Label>Location</Form.Label>
            <Form.Control
            type="text"
            name="location"
            value={selectedLocation ? `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}` : ""}
            isInvalid={!!errors.location}
            plaintext
            readOnly />
            <Form.Control.Feedback type="invalid">{errors.location}</Form.Control.Feedback>
            <div className='d-flex justify-content-between mt-2'>
                <button className="btn border" type="button" onClick={onSelectLocation}>{selectedLocation ? "Change Location": "Select Location"}</button>
                {selectedLocation && (<TargetEvent setIsOpen={setIsOpen} location={selectedLocation} map={map}/>)}
            </div>
        </Form.Group>

        <Button variant="primary" type="submit">
            Submit
        </Button>
        </Form>
    </div>

        </div>
    )
}