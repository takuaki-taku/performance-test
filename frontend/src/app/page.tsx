 'use client';

import dynamic from 'next/dynamic';
import Container from '@/components/Container';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// サーバーサイドは無視してクライアントのみでロード
const RotatingGlobe = dynamic(
  () => import('@/components/RotatingGlobe'),
  { ssr: false }
);

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuth();

  const handleMyPageClick = () => {
    if (isAuthenticated) {
      try {
        const raw = localStorage.getItem('userId');
        if (raw) { // UUID文字列として扱う（Number()変換を削除）
          router.push(`/mypage/${raw}`);
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      }
    } else if (isAuthenticated === false) {
      router.push('/login');
    }
    // isAuthenticated === null の間は無操作
  };
  return (
    <Container className="p-0">
      {/* ① ヒーロー：左テキスト／右ビジュアル（回転画像は控えめ） */}
      <section className="py-10 md:py-14 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* 左：コピーとCTA（英語＋アイコン） */}
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                Performance Training Database
              </h1>
              <p className="text-base md:text-lg text-gray-700 mb-6">
                Measure, analyze, and improve — all in one.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleMyPageClick}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full
                             text-white bg-gradient-to-r from-blue-600 to-indigo-600
                             hover:from-blue-700 hover:to-indigo-700
                             shadow-lg hover:shadow-xl transition-all group"
                  aria-label="Go to My Page"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/></svg>
                  <span>My Page</span>
                  <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                </button>
                <Link
                  href="/flexibility"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-900 rounded-full hover:bg-gray-300 transition text-center"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20c2-4 5-6 8-6s6 2 8 6"/><circle cx="12" cy="7" r="3"/></svg>
                  <span>See Stretch</span>
                </Link>
              </div>
            </div>
            {/* 右：回転画像（主張を小さく／md以上で表示） */}
            <div className="hidden md:block">
              <div className="w-full max-w-md ml-auto">
                <div className="w-full h-[300px]">{/* 高さを抑える */}
                  <RotatingGlobe />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ② クリックできるカード：Stretch 導線（英語＋アイコン） */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/flexibility"
              className="group block rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition"
              aria-label="Stretch 機能へ移動"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20c2-4 5-6 8-6s6 2 8 6"/><circle cx="12" cy="7" r="3"/></svg>
                  <h3 className="text-xl font-bold">Stretch</h3>
                </div>
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100">→</span>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Check the sample and steps for flexibility measurement. Start now.
              </p>
            </Link>
          </div>
        </div>
      </section>

    </Container>
  );
}