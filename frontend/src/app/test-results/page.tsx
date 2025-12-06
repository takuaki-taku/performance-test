'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestResultsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/test-results');
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      リダイレクト中...
    </div>
  );
}

