import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import type { Alert } from '../interfaces/Alert.tsx';

export default function EmailSubmission({ setEmailOpen, addAlert }: { 
    setEmailOpen: ((state: boolean) => void),
    addAlert: (alert: Alert) => void }) {
    const [invalidEmailError, setInvalidEmailError] = useState<boolean>(false);
    const [emailField, setEmailField] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateEmail(emailField)) {
            setInvalidEmailError(true);
            return;
        }
        setInvalidEmailError(false);
        await submitEmail(emailField);
    };

    const submitEmail = async (email: string) => {
        try {
            const response = await fetch(process.env.REACT_APP_API_ADDR + '/api/subscribe/', {
                method: 'POST',
                body: JSON.stringify({ email }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                setEmailOpen(false)
                addAlert({
                    text: "email added",
                    type: "success",
                    id: Date.now.toString(),
                })
            }
        } catch (error) {
            console.error("Request failed:", error);
        }
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    return (
        <div className="d-flex flex-column align-items-center border rounded pb-4 pt-2">
            <h6 className="mb-2">Get notified when new events are found</h6>
            <Form onSubmit={handleSubmit} className="d-flex gap-2 align-items-top">
                <div className="position-relative w-100 flex-grow-1">
                    <Form.Control
                        placeholder="Enter your email"
                        value={emailField}
                        onChange={(e) => setEmailField(e.target.value)}
                        isInvalid={invalidEmailError}
                    />
                    <Form.Control.Feedback
                        type="invalid"
                        className="small text-danger position-absolute"
                        style={{ top: "100%", whiteSpace: "nowrap" }}
                    >
                        Please enter a valid email.
                    </Form.Control.Feedback>
                </div>
                <Button type="submit" variant="primary">
                    Submit
                </Button>
            </Form>
        </div>
    );
}
