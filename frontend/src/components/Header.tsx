'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const goMyPage = () => {
    try {
      const raw = localStorage.getItem('userId');
      if (raw) {
        // 古い数値形式のuserIdを削除（UUID移行対応）
        if (!isNaN(Number(raw)) && raw.length < 10) {
          localStorage.removeItem('userId');
          router.push('/login');
          return;
        }
        // UUID文字列として扱う
        router.push(`/mypage/${raw}`);
        return;
      }
    } catch {}
    router.push('/login');
  };

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo/logo.png"
              alt="サイトロゴ"
              width={120}
              height={40}
              className="object-contain"
            />
            <span className="ml-2 text-2xl font-bold text-gray-800">
              パフォーマンスDB | Performance Records
            </span>
          </Link>
          
          {/* デスクトップメニュー（英語＋理解しやすいアイコン） */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l9-9 9 9"/><path d="M9 21V9h6v12"/></svg>
              <span>Home</span>
            </Link>
            <Link href="/karte" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              <span>Karte</span>
            </Link>
            <button onClick={goMyPage} type="button" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline bg-transparent p-0 focus:outline-none">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>MyPage</span>
            </button>
            <Link href="/flexibility" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <span>Stretch</span>
            </Link>
            <Link href="/about" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              <span>About</span>
            </Link>
            <Link href="/contact" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10v6a2 2 0 0 1-2 2H7l-4 4V6a2 2 0 0 1 2-2h7"/><path d="M21 4h-6"/><path d="M15 8l-2-2 2-2"/></svg>
              <span>Contact</span>
            </Link>
          </div>

          {/* モバイルメニューボタン */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="md:hidden mt-4">
            <div className="flex flex-col gap-4">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l9-9 9 9"/><path d="M9 21V9h6v12"/></svg>
                <span>Home</span>
              </Link>
              <Link href="/karte" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                <span>Karte</span>
              </Link>
                <button onClick={goMyPage} type="button" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline text-left bg-transparent p-0 focus:outline-none">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span>MyPage</span>
                </button>
                <Link href="/flexibility" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  <span>Stretch</span>
                </Link>
              <Link href="/about" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                <span>About</span>
              </Link>
              <Link href="/contact" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10v6a2 2 0 0 1-2 2H7l-4 4V6a2 2 0 0 1 2-2h7"/><path d="M21 4h-6"/><path d="M15 8l-2-2 2-2"/></svg>
                <span>Contact</span>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header; 