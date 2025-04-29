import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // ローカルストレージから認証状態を確認
        const token = localStorage.getItem('authToken');
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error('認証チェックに失敗しました:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  return isAuthenticated;
} 