'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      // 少し遅延を入れてからフェードイン
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname]);

  // childrenが変更されたときも更新
  useEffect(() => {
    if (!isTransitioning) {
      setDisplayChildren(children);
    }
  }, [children, isTransitioning]);

  return (
    <>
      <Header />
      <main className={`flex-grow transition-opacity duration-300 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {displayChildren}
      </main>
      <Footer />
    </>
  );
}

