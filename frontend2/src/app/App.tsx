"use client";

import React, { useState, useEffect } from 'react';
import UserForm from './UserForm';
import UserList from './UserList';
import ResultForm from './ResultForm';
import ResultList from './ResultList';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Result {
    id: number;
    date: string;
    long_jump: number;
    fifty_meter_run: number;
    spider: number;
    eight_shape_run: number;
    ball_throw: number;
}

function App() {
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [selectedUserName, setSelectedUserName] = useState<string | null>(null); // 名前を保持する新しいstate
    const [userResults, setUserResults] = useState<Result[] | null>(null); // 初期値を null に変更
    const router = useRouter();


    useEffect(() => {
        const fetchUserResults = async () => {
            if (selectedUserId) {
                try {
                    const response = await axios.get(`http://localhost:8000/users/${selectedUserId}`);
                    console.log("API Response:", response.data); // データの確認
                    setUserResults(response.data.results);
                    setSelectedUserName(response.data.name); // ユーザー名を設定
                    } catch (error: unknown) { // <= any を unknown に変更
                        console.error(error);
                        alert('Failed to create user.');
                    }
            } else {
                setUserResults([]); // selectedUserId が null の場合も null を設定
                setSelectedUserName(null); // selectedUserId が null の場合も null を設定
            }
        };
        fetchUserResults();
    }, [selectedUserId]);

    const handleUserSelect = (userId: number) => {
        setSelectedUserId(userId);
        router.push(`/?userId=${userId}`); // ユーザー選択時にURLを更新
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
                    {selectedUserId && ( // selectedUserId が null でない場合に ResultList をレンダリング
                        <ResultList results={userResults}
                            userId={selectedUserId}
                            onResultDeleted={handleResultDeleted} />
                    )}
                </div>
            )}
        </div>
    );
}

export default App;