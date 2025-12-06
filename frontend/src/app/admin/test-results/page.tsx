'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Container from '@/components/common/Container'
import UserForm from '@/components/admin/UserForm'
import UserList from '@/components/admin/UserList'
import ResultForm from '@/components/admin/ResultForm'
import ResultList from '@/components/admin/ResultList'
import { Result } from '@/types/Result'
import axios from 'axios'
import { useState } from 'react'
import { showToast } from '@/components/common/Toast'

function TestResultsContent() {
  const isAuthenticated = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const userIdParam = searchParams.get('userId')
  const userId = userIdParam || null // UUID文字列として扱う（Number()変換を削除）
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null)
  const [userResults, setUserResults] = useState<Result[] | null>(null)

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    const fetchUserResults = async () => {
      if (!userId) {
        setUserResults([])
        setSelectedUserName(null)
        return
      }
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
        const [userResponse, resultsResponse] = await Promise.all([
          axios.get(`${apiBase}/users/${userId}`),
          axios.get(`${apiBase}/user_results/${userId}`)
        ])
        // APIレスポンスにuser_idが含まれていることを確認し、型を明示的に指定
        const results: Result[] = resultsResponse.data.map((result: any) => ({
          ...result,
          user_id: result.user_id || userId // user_idが欠けている場合はuserIdを使用
        }))
        setUserResults(results)
        setSelectedUserName(userResponse.data.name)
      } catch (error) {
        console.error('データ取得に失敗しました:', error)
        showToast('データ取得に失敗しました', 'error')
      }
    }
    fetchUserResults()
  }, [userId])

  const handleUserSelect = (userId: string) => {
    try {
      localStorage.setItem('userId', userId)
    } catch {}
    router.push(`/test-results?userId=${userId}`)
  }

  const handleResultDeleted = (deletedId: number) => {
    setUserResults(prev => prev!.filter(r => r.id !== deletedId))
  }

  if (isAuthenticated === null) {
    return <div className="flex justify-center items-center min-h-screen">読み込み中...</div>
  }

  if (!isAuthenticated) {
    return null // リダイレクト中は何も表示しない
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

export default function TestResultsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">読み込み中...</div>}>
      <TestResultsContent />
    </Suspense>
  )
} 