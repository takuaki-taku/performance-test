
"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { Form, Alert } from 'react-bootstrap';

const UserForm = () => {
    const [name, setName] = useState<string>('');
    const [grade, setGrade] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !grade) {
            setError('Name and Grade are required.');
            return;
        }

        setError('');

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
            await axios.post(`${apiBase}/users/`, { name, grade });
            setName('');
            setGrade('');
            alert('User created successfully!');
        } catch (error: unknown) {
            console.error(error);
            alert('Failed to create user.');
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3">
                <Form.Label>Name:</Form.Label>
                <Form.Control
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Grade:</Form.Label>
                <Form.Control
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                />
            </Form.Group>
            <button className="btn btn-primary" type="submit">
                Create User
            </button>
        </Form>
    );
};

export default UserForm;