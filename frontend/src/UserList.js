import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ListGroup } from 'react-bootstrap';

const UserList = ({ onUserSelect }) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8000/users/');
            setUsers(response.data);
        } catch (error) {
            console.error(error);
        }
        };
        fetchUsers();
    }, []);

    return (
        <ListGroup>
        {users.map(user => (
            <ListGroup.Item
            key={user.id}
            onClick={() => onUserSelect(user.id)}
            style={{ cursor: 'pointer' }}
            >
            {user.name} (Grade: {user.grade})
            </ListGroup.Item>
        ))}
        </ListGroup>
    );
};

export default UserList;