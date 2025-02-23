import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert } from 'react-bootstrap';


const UserForm = () => {
    const [name, setName] = useState('');
    const [grade, setGrade] = useState('');
    const [error, setError] = useState('');


    const handleSubmit = async (e) => {
    e.preventDefault();


    if (!name || !grade) {
        setError('Name and Grade are required.');
    return;
    }


    setError('');


    try {
        await axios.post('http://localhost:8000/users/', { name, grade });
        setName('');
        setGrade('');
        alert('User created successfully!');
        } catch (error) {
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
            <Button variant="primary" type="submit">
            Create User
            </Button>
        </Form>
    );
};


export default UserForm;
