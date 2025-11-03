"use client";

import { useState } from 'react';
import Container from '@/components/Container';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (cred.user && displayName) {
        await updateProfile(cred.user, { displayName });
      }
      router.push('/mypage');
    } catch (err) {
      console.error('Sign up failed:', err);
      alert('Sign up failed');
    }
  };

  return (
    <Container>
      <div className="max-w-md mx-auto mt-10">
        <h1 className="text-3xl font-bold text-center mb-8">Create account</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">Display name (optional)</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Taro Yamada"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
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
            Sign up
          </button>
          <p className="text-sm text-center text-gray-600">Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link></p>
        </form>
      </div>
    </Container>
  );
}
