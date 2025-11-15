"use client";

import React, { useState, useEffect } from 'react';
import UserForm from '../components/UserForm';
import UserList from '../components/UserList';
import ResultForm from '../components/ResultForm';
import ResultList from '../components/ResultList';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Result } from '@/types/Result';

function App() {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
    const [userResults, setUserResults] = useState<Result[] | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUserResults = async () => {
            if (selectedUserId) {
                try {
                    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
                    const response = await axios.get(`${apiBase}/users/${selectedUserId}`);
                    console.log("API Response:", response.data);
                    // APIレスポンスのresultsにuser_idが含まれていることを確認
                    const results: Result[] = (response.data.results || []).map((result: any) => ({
                        ...result,
                        user_id: result.user_id || selectedUserId
                    }))
                    setUserResults(results);
                    setSelectedUserName(response.data.name);
                } catch (error: unknown) {
                    console.error(error);
                    alert('Failed to create user.');
                }
            } else {
                setUserResults([]);
                setSelectedUserName(null);
            }
        };
        fetchUserResults();
    }, [selectedUserId]);

    const handleUserSelect = (userId: string) => {
        setSelectedUserId(userId);
        router.push(`/?userId=${userId}`);
    };

    const handleResultDeleted = (deletedResultId: number) => {
        setUserResults(prevResults => prevResults!.filter(result => result.id !== deletedResultId));
    };

    return (
        <div className="App" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1>Create User</h1>
            <UserForm />
            <h1>User List</h1>
            <UserList onUserSelect={handleUserSelect} />
            {selectedUserId && (
                <div>
                    <h2>Add Result for User {selectedUserName}</h2>
                    <ResultForm userId={selectedUserId} />

                    <h2>Results: {selectedUserName}</h2>
                    {selectedUserId && (
                        <ResultList
                            results={userResults}
                            userId={selectedUserId}
                            onResultDeleted={handleResultDeleted}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

export default App;