'use client';

import Container from '@/components/Container';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export default function QuickStartPage() {
  const router = useRouter();
  const isAuthenticated = useAuth();

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        読み込み中...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleStartTour = () => {
    try {
      const raw = localStorage.getItem('userId');
      if (raw) {
        // ツアーを再表示するためにフラグをリセット
        localStorage.removeItem('hasSeenMyPageTour');
        router.push(`/mypage/${raw}`);
      } else {
        router.push('/login');
      }
    } catch {
      router.push('/login');
    }
  };

  return (
    <Container>
      <div className="max-w-4xl mx-auto">
        {/* ヒーローセクション */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            クイックスタートガイド
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            アプリケーションの使い方を簡単に学びましょう
          </p>
          <button
            onClick={handleStartTour}
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-lg font-semibold shadow-lg"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            インタラクティブツアーを開始
          </button>
        </section>

        {/* ステップバイステップガイド */}
        <section className="space-y-8 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                1
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  あなたの名前を確認
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  マイページの上部に、あなたの名前が表示されます。ここから個人のダッシュボードにアクセスできます。
                </p>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>場所:</strong> マイページのトップセクション
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-lg">
                2
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  トレーニング統計を確認
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  トレーニングの進捗状況や記録を確認できます。完了したトレーニング数や評価状況が一目でわかります。
                </p>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>確認できる情報:</strong>
                  </p>
                  <ul className="list-disc list-inside mt-2 text-sm text-gray-600 space-y-1">
                    <li>パフォーマンステストの記録数</li>
                    <li>評価済みトレーニング数</li>
                    <li>カテゴリ別の評価状況</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-lg">
                3
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  トレーニングカードを確認
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  評価済みのトレーニングを3つのカテゴリで確認できます：
                </p>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <strong>Needs improvement:</strong> 改善が必要なトレーニング
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      <strong>Achieved:</strong> 達成したトレーニング
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <strong>Excellent:</strong> 優秀な評価のトレーニング
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg">
                4
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  トレーニングを始める
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  ヘッダーメニューから、以下のトレーニングにアクセスできます：
                </p>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                      href="/flexibility"
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition"
                    >
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">Stretch</p>
                        <p className="text-xs text-gray-600">
                          柔軟性トレーニング
                        </p>
                      </div>
                    </Link>
                    <Link
                      href="/core"
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition"
                    >
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 2v4" />
                        <path d="M12 18v4" />
                        <path d="M2 12h4" />
                        <path d="M18 12h4" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">Core</p>
                        <p className="text-xs text-gray-600">
                          コアトレーニング
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                5
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  パフォーマンステスト結果を確認
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  過去のパフォーマンステストの結果を確認できます。記録されたテスト結果の詳細を閲覧し、進捗を追跡できます。
                </p>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>場所:</strong> マイページの「その他の情報」セクション
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 次のステップ */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            次のステップ
          </h2>
          <p className="text-gray-700 mb-6">
            基本的な使い方を理解したら、実際にアプリを使ってみましょう！
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleStartTour}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              インタラクティブツアーを開始
            </button>
            <Link
              href="/mypage"
              className="flex-1 px-6 py-3 bg-white text-blue-600 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition font-semibold text-center"
            >
              マイページへ移動
            </Link>
          </div>
        </section>

        {/* よくある質問 */}
        <section className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            よくある質問
          </h2>
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ツアーを再度表示したい場合は？
              </h3>
              <p className="text-gray-700">
                このページの「インタラクティブツアーを開始」ボタンをクリックすると、マイページでツアーを再度表示できます。
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                トレーニングの評価はどこで確認できますか？
              </h3>
              <p className="text-gray-700">
                マイページの「Training Karte」セクションで、すべての評価済みトレーニングを確認できます。カテゴリ別に整理されているので、簡単に見つけられます。
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                新しいトレーニングを始めるには？
              </h3>
              <p className="text-gray-700">
                ヘッダーメニューから「Stretch」または「Core」を選択して、利用可能なトレーニングの一覧を表示します。トレーニングを選択して開始できます。
              </p>
            </div>
          </div>
        </section>
      </div>
    </Container>
  );
}
