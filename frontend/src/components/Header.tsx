'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l9-9 9 9"/><path d="M9 21V9h6v12"/></svg>
              <span>Home</span>
            </Link>
            <Link href="/test-results" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="7" width="3" height="11"/><rect x="17" y="10" width="3" height="8"/></svg>
              <span>Results</span>
            </Link>
            <Link href="/flexibility" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20c2-4 5-6 8-6s6 2 8 6"/><circle cx="12" cy="7" r="3"/></svg>
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
            <div className="flex flex-col space-y-4">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l9-9 9 9"/><path d="M9 21V9h6v12"/></svg>
                <span>Home</span>
              </Link>
              <Link href="/test-results" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="7" width="3" height="11"/><rect x="17" y="10" width="3" height="8"/></svg>
                <span>Results</span>
              </Link>
              <Link href="/flexibility" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20c2-4 5-6 8-6s6 2 8 6"/><circle cx="12" cy="7" r="3"/></svg>
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