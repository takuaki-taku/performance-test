"use client";

import Container from '@/components/Container';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyPage() {
  const isAuthenticated = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">Loading...</div>
    );
  }

  if (!isAuthenticated) {
    return null; // redirecting
  }

  return (
    <Container>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">My Page</h1>
        <p className="text-gray-700 mb-6">Welcome back. This is your personal dashboard.</p>
        {/* Add your widgets/links here */}
      </div>
    </Container>
  );
}
