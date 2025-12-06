'use client';

import { useEffect, useState, useMemo } from 'react';
import Container from '@/components/common/Container';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useUserTrainingSummary } from '@/hooks/useUserTrainingSummary';
import { useUserTrainingResults, UserTrainingResultWithTraining } from '@/hooks/useUserTrainingResults';
import { TrainingType } from '@/types/flexibility';

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuth();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  // ユーザーIDを取得
  useEffect(() => {
    if (isAuthenticated) {
      try {
        const raw = localStorage.getItem('userId');
        if (raw && !isNaN(Number(raw)) && raw.length < 10) {
          localStorage.removeItem('userId');
          return;
        }
        if (raw) {
          setUserId(raw);
        }
      } catch {
        // ignore
      }
    }
  }, [isAuthenticated]);

  // ユーザー名を取得
  useEffect(() => {
    if (!userId) return;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    fetch(`${apiBase}/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.name) setUserName(data.name);
      })
      .catch(() => {});
  }, [userId]);

  // トレーニングサマリーを取得
  const { summary, loading: summaryLoading } = useUserTrainingSummary(userId || '');

  // 最近のトレーニング結果を取得（最新5件）
  const { results: recentResults, loading: recentLoading } = useUserTrainingResults(
    userId || '',
    undefined
  );

  // 最近のトレーニング（最新5件、日付順）
  const recentTrainings = useMemo(() => {
    if (!recentResults) return [];
    const sorted = [...recentResults].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    return sorted.slice(0, 5);
  }, [recentResults]);

  // 進行中のトレーニング（評価なしで開始したもの）
  const inProgressTrainings = useMemo(() => {
    if (!recentResults) return [];
    return recentResults
      .filter((r) => r.achievement_level === 4) // STARTED_NO_EVAL
      .slice(0, 3);
  }, [recentResults]);

  const handleMyPageClick = () => {
    if (isAuthenticated && userId) {
      router.push(`/mypage/${userId}`);
    } else if (isAuthenticated === false) {
      router.push('/login');
    }
  };

  return (
    <Container className="p-0">
      <div className="container mx-auto px-4 py-8">
        {/* ウェルカムメッセージ */}
        {isAuthenticated && userName && (
          <section className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
              ようこそ、{userName}さん
            </h1>
            <p className="text-gray-600">今日もトレーニングを頑張りましょう！</p>
          </section>
        )}

        {/* クイックアクセス */}
        {isAuthenticated && userId && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">クイックアクセス</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 続きから始める */}
              {inProgressTrainings.length > 0 && (
                <Link
                  href={inProgressTrainings[0].training.training_type === TrainingType.FLEXIBILITY
                    ? `/training/flexibility/${inProgressTrainings[0].training.id}`
                    : inProgressTrainings[0].training.training_type === TrainingType.CORE
                    ? `/training/core/${inProgressTrainings[0].training.id}`
                    : inProgressTrainings[0].training.training_type === TrainingType.WARMUP
                    ? `/training/warmup/${inProgressTrainings[0].training.id}`
                    : `/training/cooldown/${inProgressTrainings[0].training.id}`}
                  className="block p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg hover:shadow-xl transition"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-bold">続きから始める</h3>
                  </div>
                  <p className="text-blue-100">
                    {inProgressTrainings[0].training.title}
                  </p>
                </Link>
              )}

              {/* マイページへ */}
              <button
                onClick={handleMyPageClick}
                className="block w-full p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <h3 className="text-xl font-bold text-gray-900">マイページ</h3>
                </div>
                <p className="text-gray-600 text-sm">進捗状況を確認</p>
              </button>
            </div>
          </section>
        )}

        {/* トレーニングカテゴリ */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6">トレーニングカテゴリ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* ウォームアップ */}
            <Link
              href="/training/warmup"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-6 relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4 group-hover:scale-110 transition-transform">
                  <div className="text-white">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5" />
                      <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">ウォームアップ</h3>
                <p className="text-sm text-white/90 mb-4">練習前の準備運動</p>
                <div className="flex items-center text-sm font-semibold text-white group-hover:text-white/90">
                  <span>トレーニングを始める</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
            </Link>

            {/* 体幹トレーニング */}
            <Link
              href="/training/core"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-6 relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4 group-hover:scale-110 transition-transform">
                  <div className="text-white">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 2v4" />
                      <path d="M12 18v4" />
                      <path d="M2 12h4" />
                      <path d="M18 12h4" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">体幹トレーニング</h3>
                <p className="text-sm text-white/90 mb-4">基礎体力を鍛える</p>
                <div className="flex items-center text-sm font-semibold text-white group-hover:text-white/90">
                  <span>トレーニングを始める</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
            </Link>

            {/* 柔軟性チェック */}
            <Link
              href="/training/flexibility"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-6 relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4 group-hover:scale-110 transition-transform">
                  <div className="text-white">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">柔軟性チェック</h3>
                <p className="text-sm text-white/90 mb-4">ケガ予防のためのストレッチ</p>
                <div className="flex items-center text-sm font-semibold text-white group-hover:text-white/90">
                  <span>トレーニングを始める</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
            </Link>

            {/* クールダウン */}
            <Link
              href="/training/cooldown"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-6 relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4 group-hover:scale-110 transition-transform">
                  <div className="text-white">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5" />
                      <path d="M12 1v6m0 6v6M18.36 5.64l-4.24 4.24m-4.24 4.24l-4.24 4.24M23 12h-6m-6 0H1M18.36 18.36l-4.24-4.24m-4.24-4.24L5.64 5.64" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">クールダウン</h3>
                <p className="text-sm text-white/90 mb-4">練習後の整理運動</p>
                <div className="flex items-center text-sm font-semibold text-white group-hover:text-white/90">
                  <span>トレーニングを始める</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
            </Link>
          </div>
        </section>

        {/* 進捗サマリー */}
        {isAuthenticated && userId && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">進捗サマリー</h2>
            {summaryLoading ? (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <p className="text-gray-500">読み込み中...</p>
              </div>
            ) : summary ? (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{summary.total_trainings_with_status}</p>
                    <p className="text-sm text-gray-600 mt-1">評価済み</p>
                  </div>
                  {summary.categories.map((cat) => {
                    const total = cat.needs_improvement + cat.achieved + cat.excellent;
                    if (total === 0) return null;
                    return (
                      <div key={cat.training_type} className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{total}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {cat.training_type_label === 'FLEXIBILITY' ? '柔軟性' :
                           cat.training_type_label === 'CORE' ? '体幹' :
                           cat.training_type_label === 'WARMUP' ? 'ウォームアップ' :
                           cat.training_type_label === 'COOLDOWN' ? 'クールダウン' :
                           cat.training_type_label}
                        </p>
                        <div className="flex justify-center gap-1 mt-1 text-xs">
                          <span className="text-red-500">A: {cat.needs_improvement}</span>
                          <span className="text-yellow-500">B: {cat.achieved}</span>
                          <span className="text-green-500">C: {cat.excellent}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <p className="text-gray-500">まだトレーニングを開始していません</p>
              </div>
            )}
          </section>
        )}

        {/* 最近の活動 */}
        {isAuthenticated && userId && recentTrainings.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">最近の活動</h2>
            <div className="space-y-3">
              {recentTrainings.map((result) => {
                const training = result.training;
                let href = '';
                if (training.training_type === TrainingType.FLEXIBILITY) {
                  href = `/training/flexibility/${training.id}`;
                } else if (training.training_type === TrainingType.CORE) {
                  href = `/training/core/${training.id}`;
                } else if (training.training_type === TrainingType.WARMUP) {
                  href = `/training/warmup/${training.id}`;
                } else if (training.training_type === TrainingType.COOLDOWN) {
                  href = `/training/cooldown/${training.id}`;
                }

                const achievementLabels: Record<number, string> = {
                  1: '要改善',
                  2: '達成',
                  3: '優秀',
                  4: '開始済み',
                };

                return (
                  <Link
                    key={result.id}
                    href={href}
                    className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{training.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(result.date).toLocaleDateString('ja-JP')} - {achievementLabels[result.achievement_level] || '未評価'}
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 未認証ユーザー向け */}
        {!isAuthenticated && (
          <section className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              PerfDB
            </h2>
            <p className="text-gray-600 mb-6">
              トレーニングの記録と進捗を管理しましょう
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                ログイン
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition"
              >
                新規登録
              </Link>
            </div>
          </section>
        )}
      </div>
    </Container>
  );
}
