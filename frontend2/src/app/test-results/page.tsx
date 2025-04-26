'use client'

export const dynamic = 'force-dynamic'

import Container from '@/components/Container'
import { useState, useEffect } from 'react'
import UserForm from '../UserForm'
import UserList from '../UserList'
import ResultForm from '../ResultForm'
import ResultList from '../ResultList'
import axios from 'axios'
import { useRouter } from 'next/navigation'

interface Result {
    id: number;
    date: string;
    long_jump: number;
    fifty_meter_run: number;
    spider: number;
    eight_shape_run: number;
    ball_throw: number;
  }

export default function TestResultsPage(props: any) {
  const searchParams = props.searchParams as { userId?: string }
  const userIdParam = searchParams.userId
  const userId = userIdParam ? Number(userIdParam) : null
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null)
  const [userResults, setUserResults] = useState<Result[] | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUserResults = async () => {
      if (!userId) {
        setUserResults([])
        setSelectedUserName(null)
        return
      }
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
        const res = await axios.get(`${apiBase}/users/${userId}`)
        setUserResults(res.data.results)
        setSelectedUserName(res.data.name)
      } catch {
        alert('データ取得に失敗しました')
      }
    }
    fetchUserResults()
  }, [userId])

  const handleUserSelect = (userId: number) => {
    router.push(`/test-results?userId=${userId}`)
  }

  const handleResultDeleted = (deletedId: number) => {
    setUserResults(prev => prev!.filter(r => r.id !== deletedId))
  }

  return (
    <Container>
      <div className="max-w-4xl mx-auto">
        <h1 className="mt-10 text-4xl font-bold text-gray-900 mb-8">
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
            {userId ? (
              <>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Add Result for {selectedUserName}
                  </h3>
                  <ResultForm userId={userId} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Results for {selectedUserName}
                  </h3>
                  <ResultList
                    results={userResults}
                    userId={userId}
                    onResultDeleted={handleResultDeleted}
                  />
                </div>
              </>
            ) : (
              <p className="text-gray-600">
                Please select a user to view and manage their test results.
              </p>
            )}
          </div>
        </div>
      </div>
    </Container>
  )
} 