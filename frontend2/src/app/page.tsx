'use client';

import Container from '@/components/Container';
import { useState, useEffect } from 'react';
import UserForm from './UserForm';
import UserList from './UserList';
import ResultForm from './ResultForm';
import ResultList from './ResultList';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';

interface Result {
  id: number;
  date: string;
  long_jump: number;
  fifty_meter_run: number;
  spider: number;
  eight_shape_run: number;
  ball_throw: number;
}

export default function Home() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
  const [userResults, setUserResults] = useState<Result[] | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId) {
      setSelectedUserId(Number(userId));
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchUserResults = async () => {
      if (selectedUserId) {
        try {
          const response = await axios.get(`http://localhost:8000/users/${selectedUserId}`);
          console.log("API Response:", response.data);
          setUserResults(response.data.results);
          setSelectedUserName(response.data.name);
        } catch (error: unknown) {
          console.error(error);
          alert('Failed to fetch user results.');
        }
      } else {
        setUserResults([]);
        setSelectedUserName(null);
      }
    };
    fetchUserResults();
  }, [selectedUserId]);

  const handleUserSelect = (userId: number) => {
    setSelectedUserId(userId);
    router.push(`/?userId=${userId}`);
  };

  const handleResultDeleted = (deletedResultId: number) => {
    setUserResults(prevResults => prevResults!.filter(result => result.id !== deletedResultId));
  };

  return (
    <Container>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Physical Test Management
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 左カラム - ユーザー管理 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              User Management
            </h2>
            <UserForm />
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                User List
              </h3>
              <UserList onUserSelect={handleUserSelect} />
            </div>
          </div>

          {/* 右カラム - テスト結果 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Test Results
            </h2>
            {selectedUserId && (
              <>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Add Result for {selectedUserName}
                  </h3>
                  <ResultForm userId={selectedUserId} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Results for {selectedUserName}
                  </h3>
                  <ResultList
                    results={userResults}
                    userId={selectedUserId}
                    onResultDeleted={handleResultDeleted}
                  />
                </div>
              </>
            )}
            {!selectedUserId && (
              <p className="text-gray-600">
                Please select a user to view and manage their test results.
              </p>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}