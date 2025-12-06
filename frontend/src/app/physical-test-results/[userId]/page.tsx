'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function PhysicalTestResultsRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  useEffect(() => {
    if (userId) {
      router.replace(`/admin/physical-test-results/${userId}`);
    }
  }, [router, userId]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      リダイレクト中...
    </div>
  );
}

