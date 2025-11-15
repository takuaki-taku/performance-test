"use client";

import Container from '@/components/Container';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { mockInProgressTrainings, mockRecentTrainings, seedMyPageMocksToLocalStorage } from './mock';

type UserResult = {
  id: number;
  user_id: string; // UUID型に変更
  date: string;
  long_jump_cm: number;
  fifty_meter_run_ms: number;
  spider_ms: number;
  eight_shape_run_count: number;
  ball_throw_cm: number;
};

type InProgressTraining = {
  id: string | number;
  title: string;
  description?: string;
  startedAt?: string;
  progress?: number; // 0-100
};

type RecentTraining = {
  id: string | number;
  title: string;
  href: string;
  accessedAt?: string;
};

interface MyPageContentProps {
  userId: string; // UUID型に変更
}

export default function MyPageContent({ userId }: MyPageContentProps) {
  const isAuthenticated = useAuth();
  const [userName, setUserName] = useState<string>('User');
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [inProgressCount, setInProgressCount] = useState<number>(0);
  const [inProgressOpen, setInProgressOpen] = useState<boolean>(false);
  const [inProgressList, setInProgressList] = useState<InProgressTraining[]>([]);
  const [recentTrainings, setRecentTrainings] = useState<RecentTraining[]>([]);

  const apiBase = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    []
  );

  // 初期の表示用データ（モック）とローカルの名前
  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const storedInProgress = localStorage.getItem('inProgressTrainings');
    const storedRecent = localStorage.getItem('recentTrainings');
    if (storedName) {
      setUserName(storedName);
    }

    try {
      if (storedInProgress) {
        const parsed: InProgressTraining[] = JSON.parse(storedInProgress);
        setInProgressList(Array.isArray(parsed) ? parsed : []);
        setInProgressCount(Array.isArray(parsed) ? parsed.length : 0);
      } else {
        setInProgressList(mockInProgressTrainings);
        setInProgressCount(mockInProgressTrainings.length);
        seedMyPageMocksToLocalStorage();
      }
    } catch {
      setInProgressList(mockInProgressTrainings);
      setInProgressCount(mockInProgressTrainings.length);
    }

    try {
      if (storedRecent) {
        const parsed: RecentTraining[] = JSON.parse(storedRecent);
        if (Array.isArray(parsed)) {
          const sorted = [...parsed].sort((a, b) => {
            const ta = a.accessedAt ? Date.parse(a.accessedAt) : 0;
            const tb = b.accessedAt ? Date.parse(b.accessedAt) : 0;
            return tb - ta;
          });
          setRecentTrainings(sorted.slice(0, 3));
        } else {
          setRecentTrainings(mockRecentTrainings.slice(0, 3));
          seedMyPageMocksToLocalStorage();
        }
      } else {
        setRecentTrainings(mockRecentTrainings.slice(0, 3));
        seedMyPageMocksToLocalStorage();
      }
    } catch {
      setRecentTrainings(mockRecentTrainings.slice(0, 3));
    }
  }, []);

  // API からユーザー名と完了件数を取得
  useEffect(() => {
    if (!userId) return;
    axios
      .get(`${apiBase}/users/${userId}`)
      .then((res) => {
        if (res?.data?.name) setUserName(res.data.name);
      })
      .catch(() => {/* noop */});
    axios
      .get<UserResult[]>(`${apiBase}/user_results/${userId}`)
      .then((res) => {
        setCompletedCount(res.data.length || 0);
      })
      .catch(() => {
        setCompletedCount(0);
      });
  }, [apiBase, userId]);

  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">Loading...</div>
    );
  }

  if (!isAuthenticated) {
    return null; // redirecting is handled by higher-level page
  }

  return (
    <Container>
      <div className="max-w-5xl mx-auto">
        {/* Title Section */}
        <section className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold">Welcome, {userName}</h1>
          <p className="text-gray-600 mt-2">Your personal training dashboard</p>
        </section>

        {/* Stats Section */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-50 text-green-600">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  </span>
                  <div>
                    <p className="text-sm text-gray-500">Completed trainings</p>
                    <p className="text-2xl font-bold">{completedCount}</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setInProgressOpen((v) => !v)}
              aria-expanded={inProgressOpen}
              className="w-full text-left rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 block hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-50 text-amber-600">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6v6l4 2"/></svg>
                  </span>
                  <div>
                    <p className="text-sm text-gray-500">In progress</p>
                    <p className="text-2xl font-bold">{inProgressCount}</p>
                  </div>
                </div>
                <span className={`transition-transform ${inProgressOpen ? 'rotate-90' : ''}`}>›</span>
              </div>
            </button>

            {inProgressOpen && (
              <div className="mt-4 space-y-3">
                {inProgressList.length === 0 ? (
                  <p className="text-sm text-gray-500">No in-progress trainings.</p>
                ) : (
                  inProgressList.map((t) => (
                    <div key={t.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{t.title}</h4>
                          {t.description && (
                            <p className="text-sm text-gray-600 mt-1">{t.description}</p>
                          )}
                          {t.startedAt && (
                            <p className="text-xs text-gray-400 mt-1">Started: {t.startedAt}</p>
                          )}
                        </div>
                        {typeof t.progress === 'number' && (
                          <span className="text-sm font-medium text-gray-700">{t.progress}%</span>
                        )}
                      </div>
                      {typeof t.progress === 'number' && (
                        <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                          <div className="h-2 rounded-full bg-amber-400" style={{ width: `${Math.min(Math.max(t.progress, 0), 100)}%` }} />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>

        {/* Recently Accessed Section */}
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4">Recently accessed</h2>
          {recentTrainings.length === 0 ? (
            <p className="text-sm text-gray-500">No recent items.</p>
          ) : (
            <ul className="space-y-3">
              {recentTrainings.map((t) => (
                <li key={t.id}>
                  <Link
                    href={t.href}
                    className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{t.title}</p>
                      {t.accessedAt && (
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(t.accessedAt).toLocaleString()}</p>
                      )}
                    </div>
                    <span className="text-gray-400">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* その他の情報 */}
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4">その他の情報</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {completedCount > 0 && (
              <Link
                href={`/physical-test-results/${userId}`}
                className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition block"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="7" width="3" height="11"/><rect x="17" y="10" width="3" height="8"/></svg>
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">パフォーマンステストの結果</p>
                    <p className="text-sm text-gray-600 mt-1">直近 {completedCount} 件の記録を表示</p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </section>
      </div>
    </Container>
  );
}


