/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
'use client';

import dynamic from 'next/dynamic';
import Container from '@/components/Container';
import Link from 'next/link';

// サーバーサイドは無視してクライアントのみでロード
const RotatingGlobe = dynamic(
  () => import('@/components/RotatingGlobe'),
  { ssr: false }
);

export default function Home() {
  const slides = [
    { img: '/images/hero1.jpg', caption: '科学的トレーニング' },
    { img: '/images/hero2.jpg', caption: '柔軟性チェック' },
    { img: '/images/hero3.jpg', caption: 'リアルタイム分析' },
  ];

  return (
    <Container className="p-0">
      {/* ① 回転地球儀 */}
      <div>
          {/* ↓ 高さを地球儀に合わせる */}
          <div className="relative w-full h-[50vh]"> {/* h-auto から変更 */}
          <RotatingGlobe />
            {/* ↓ bottomの値を増やして上に表示 */}
            <div className="absolute bottom-80 left-1/2 transform -translate-x-1/2 text-center z-10"> {/* bottom-4 から bottom-16 (4rem) に変更 */}
            <p className="text-black text-lg font-bold mb-2"> {/* 色を黒に変更 (背景に応じて調整) */}
              柔軟性ページにいくにはアイコンをクリック
            </p>
            <div className="animate-bounce">
              <svg
                className="w-6 h-6 mx-auto text-black" // 色を黒に変更 (背景に応じて調整)
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      {/* ② キャッチコピー */}
      <section className="text-center py-12 bg-gray-100">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Elevate Your Performance
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          データ駆動型トレーニングで、新しい自分に出会う。
        </p>
        <Link
          href="/test-results"
          className="inline-block px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
        >
          今すぐ始める
        </Link>
      </section>

    </Container>
  );
}