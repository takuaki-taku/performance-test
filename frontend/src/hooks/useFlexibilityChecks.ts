import { useState, useEffect } from 'react';
import axios from 'axios';
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
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        // 新しいtrainings APIを使用（training_type=1でフィルタリング）
        const response = await axios.get<Training[]>(
          `${apiBase}/trainings/?training_type=${TrainingType.FLEXIBILITY}`
        );
        setChecks(response.data);
        setLoading(false);
      } catch {
        setError('柔軟性チェックのデータの取得に失敗しました');
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
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        // 新しいtrainings APIを使用
        const response = await axios.get<Training>(`${apiBase}/trainings/${id}`);
        setCheck(response.data);
        setLoading(false);
      } catch {
        setError('柔軟性チェックのデータの取得に失敗しました');
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
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const response = await axios.get<Training[]>(
          `${apiBase}/trainings/?training_type=${TrainingType.CORE}`
        );
        setTrainings(response.data);
        setLoading(false);
      } catch {
        setError('体幹トレーニングのデータの取得に失敗しました');
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  return { trainings, loading, error };
};