'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/Container';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // ここで実際の認証APIを呼び出す
      // 仮の認証処理として、ユーザー名とパスワードが一致する場合に認証成功とする
      if (username === 'admin' && password === 'password') {
        localStorage.setItem('authToken', 'dummy-token');
        router.push('/test-results');
      } else {
        alert('ユーザー名またはパスワードが正しくありません');
      }
    } catch (error) {
      console.error('ログインに失敗しました:', error);
      alert('ログインに失敗しました');
    }
  };

  return (
    <Container>
      <div className="max-w-md mx-auto mt-10">
        <h1 className="text-3xl font-bold text-center mb-8">ログイン</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              ユーザー名
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              パスワード
            </label>
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
            ログイン
          </button>
        </form>
      </div>
    </Container>
  );
} 