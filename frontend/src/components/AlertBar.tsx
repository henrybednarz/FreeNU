import React from 'react'
import { Alert as AlertComp } from 'react-bootstrap'
import { Alert } from '../interfaces/Alert.tsx'


export default function AlertBar({alerts, setAlerts}: { alerts: Alert[], setAlerts: (alerts: Alert[]) => void }) {
    const removeFromQueue = ((id: string) => {
        setAlerts(alerts.filter((a) => a.id !== id))
    })

    return (
        <div>
            {alerts.slice(0, Math.min(alerts.length, 2)).map((alert) => (
                <AlertComp id={alert.id.toString() + "a"} variant={alert.type} onClose={() => (removeFromQueue(alert.id))} dismissible>
                    {alert.text}
                </AlertComp>
            ))}
        </div>)
}