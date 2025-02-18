import React from 'react'
import { Alert as AlertComp } from 'react-bootstrap'
import { Alert } from '../interfaces/Alert.tsx'


export default function AlertBar({alerts, setAlerts}: { alerts: Alert[], setAlerts: (alerts: Alert[]) => void }) {

    return (
        <div className="d-flex flex-column">
            {alerts.slice(0, Math.min(alerts.length, 2)).map((alert) => (
                <AlertComp id={alert.id} variant={alert.type} dismissible>
                    {alert.text}
                </AlertComp>
            ))}
        </div>)
}