'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/common/Container';
import { signInWithEmailAndPassword, getIdToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import api from '@/lib/api';
import { showToast } from '@/components/common/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 古い数値形式のuserIdを削除（UUID移行対応）
      const oldUserId = localStorage.getItem('userId');
      if (oldUserId && !isNaN(Number(oldUserId))) {
        localStorage.removeItem('userId');
      }
      
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (cred.user) {
        try {
          const token = await getIdToken(cred.user);
          // /me で userId を解決
          const res = await api.get('/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const id = res?.data?.id;
          if (typeof id === 'string') { // UUIDは文字列型
            try { localStorage.setItem('userId', id); } catch {}
            router.push(`/mypage/${id}`);
          } else {
            router.push('/');
          }
        } catch (e) {
          console.error('Failed to resolve user via /me:', e);
          router.push('/');
        }
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      const errorMessage = error?.message || 'ログインに失敗しました';
      showToast(errorMessage, 'error');
    }
  };

  return (
    <Container>
      <div className="max-w-md mx-auto mt-10">
        <h1 className="text-3xl font-bold text-center mb-8">Sign in</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign in
          </button>
          <p className="text-sm text-center text-gray-600">No account? <Link href="/signup" className="text-blue-600 hover:underline">Create one</Link></p>
        </form>
      </div>
    </Container>
  );
} 