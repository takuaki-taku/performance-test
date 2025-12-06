import { useState, useEffect } from 'react';
import { apiClient } from '@/utils/apiClient';
import { Training, TrainingType } from '@/types/flexibility';

/**
 * ストレッチ（柔軟性）トレーニング一覧を取得
 * training_type=1 (FLEXIBILITY) でフィルタリング
 */
export const useFlexibilityChecks = () => {
  const [checks, setChecks] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChecks = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        // 新しいtrainings APIを使用（training_type=1でフィルタリング）
        const response = await apiClient.get<Training[]>(
          `${apiBase}/trainings/?training_type=${TrainingType.FLEXIBILITY}`
        );
        setChecks(response.data || []);
        setLoading(false);
      } catch (err: any) {
        setError(`柔軟性チェックのデータの取得に失敗しました: ${err.message || '不明なエラー'}`);
        setLoading(false);
      }
    };

    fetchChecks();
  }, []);
  return { checks, loading, error };
};

/**
 * 特定のトレーニングを取得
 */
export const useFlexibilityCheck = (id: string) => {
  const [check, setCheck] = useState<Training>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCheck = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const response = await apiClient.get<Training>(`${apiBase}/trainings/${id}`);
        setCheck(response.data);
        setLoading(false);
      } catch (err: any) {
        setError(`トレーニングデータの取得に失敗しました: ${err.message || '不明なエラー'}`);
        setLoading(false);
      }
    };

    fetchCheck();
  }, [id]);
  return { check, loading, error };
};

/**
 * コアトレーニング一覧を取得
 * training_type=2 (CORE) でフィルタリング
 */
export const useCoreTrainings = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrainings = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const response = await apiClient.get<Training[]>(
          `${apiBase}/trainings/?training_type=${TrainingType.CORE}`
        );
        setTrainings(response.data || []);
        setLoading(false);
      } catch (err: any) {
        setError(`体幹トレーニングのデータの取得に失敗しました: ${err.message || '不明なエラー'}`);
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  return { trainings, loading, error };
};

/**
 * ウォームアップトレーニング一覧を取得
 * training_type=5 (WARMUP) でフィルタリング
 */
export const useWarmupTrainings = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrainings = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const response = await apiClient.get<Training[]>(
          `${apiBase}/trainings/?training_type=${TrainingType.WARMUP}`
        );
        
        if (!response.data || response.data.length === 0) {
          setTrainings([]);
          setLoading(false);
          return;
        }
        
        // シリーズ番号とページ番号でソート
        const sorted = response.data.sort((a, b) => {
          if (a.series_number !== b.series_number) {
            return (a.series_number || 0) - (b.series_number || 0);
          }
          return (a.page_number || 0) - (b.page_number || 0);
        });
        setTrainings(sorted);
        setLoading(false);
      } catch (err: any) {
        setError(`ウォームアップトレーニングのデータの取得に失敗しました: ${err.message || '不明なエラー'}`);
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  return { trainings, loading, error };
};

/**
 * クールダウントレーニング一覧を取得
 * training_type=6 (COOLDOWN) でフィルタリング
 */
export const useCooldownTrainings = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrainings = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const response = await apiClient.get<Training[]>(
          `${apiBase}/trainings/?training_type=${TrainingType.COOLDOWN}`
        );
        
        if (!response.data || response.data.length === 0) {
          setTrainings([]);
          setLoading(false);
          return;
        }
        
        // シリーズ番号とページ番号でソート
        const sorted = response.data.sort((a, b) => {
          if (a.series_number !== b.series_number) {
            return (a.series_number || 0) - (b.series_number || 0);
          }
          return (a.page_number || 0) - (b.page_number || 0);
        });
        setTrainings(sorted);
        setLoading(false);
      } catch (err: any) {
        setError(`クールダウントレーニングのデータの取得に失敗しました: ${err.message || '不明なエラー'}`);
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  return { trainings, loading, error };
};