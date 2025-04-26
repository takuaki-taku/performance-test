// @ts-nocheck
"use client";

import axios from 'axios';
import { ListGroup, Button } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';



interface User {
    id: number;
    name: string;
    grade: string;
}

interface UserListProps {
    onUserSelect: (userId: number) => void;
}

const UserList: React.FC<UserListProps> = ({ onUserSelect }) => {
    const [users, setUsers] = useState<User[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
                const response = await axios.get(`${apiBase}/users/`);
                setUsers(response.data);
            } catch (error: unknown) {
                console.error(error);
            }
        };
        fetchUsers();
    }, []);

    const handleUserClick = (userId: number) => {
        onUserSelect(userId);
    };

    return (
        <ListGroup>
            {users.map(user => (
                <ListGroup.Item
                    key={user.id}
                    onClick={() => handleUserClick(user.id)}
                    style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                    <div>{user.name} (Grade: {user.grade})</div>
                    <Button variant="primary" style={{ marginLeft: '10px' }} onClick={(e) => {
                        e.stopPropagation(); // イベント伝播を停止
                        router.push(`/physical-test-results/${user.id}`);
                    }}>
                        詳細
                    </Button>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default UserList;