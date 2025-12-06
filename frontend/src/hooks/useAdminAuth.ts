import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

/**
 * 管理者認証フック
 * 現在は通常の認証と同じですが、将来的に管理者フラグをチェックできます
 */
export const useAdminAuth = () => {
  const isAuthenticated = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (isAuthenticated === null) {
      setIsAdmin(null);
      return;
    }

    if (!isAuthenticated) {
      setIsAdmin(false);
      return;
    }

    // TODO: 管理者フラグをチェック
    // 現在は認証済みユーザーを管理者として扱う
    // 将来的にはFirebaseのカスタムクレームやDBの管理者フラグをチェック
    setIsAdmin(true);
  }, [isAuthenticated]);

  return isAdmin;
};

