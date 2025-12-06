'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAdmin === false) {
      router.push('/login?error=unauthorized');
    }
  }, [isAdmin, router]);

  if (isAdmin === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        読み込み中...
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-grow p-6">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}

