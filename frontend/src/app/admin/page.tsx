'use client';

import Container from '@/components/common/Container';
import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <Container>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">管理画面ダッシュボード</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/training-evaluations"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              トレーニング評価管理
            </h2>
            <p className="text-gray-600">
              ユーザーのトレーニング評価を管理します
            </p>
          </Link>

          <Link
            href="/admin/test-results"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              テスト結果管理
            </h2>
            <p className="text-gray-600">
              ユーザーとテスト結果を管理します
            </p>
          </Link>

          <Link
            href="/admin/physical-test-results"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              テスト結果表示
            </h2>
            <p className="text-gray-600">
              ユーザーのテスト結果を表示します
            </p>
          </Link>
        </div>
      </div>
    </Container>
  );
}

