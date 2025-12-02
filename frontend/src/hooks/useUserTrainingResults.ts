"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { TrainingType, Training } from '@/types/flexibility';

type TrainingWithMeta = Training & {
  created_at: string;
  updated_at: string;
};

export type UserTrainingResultWithTraining = {
  id: number;
  user_id: string;
  training_id: number;
  date: string;
  achievement_level: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  training: TrainingWithMeta;
};

export type User = {
  id: string;
  name: string;
  grade: string;
  birthday: string | null;
};

export const useUserTrainingResults = (
  userId: string,
  trainingType?: TrainingType
) => {
  const [results, setResults] = useState<UserTrainingResultWithTraining[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchResults = async () => {
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const params = trainingType ? { training_type: trainingType } : {};
        const response = await axios.get<UserTrainingResultWithTraining[]>(
          `${apiBase}/user-training-results/${userId}`,
          { params }
        );
        setResults(response.data);
        setLoading(false);
      } catch {
        setError('トレーニング結果の取得に失敗しました');
        setLoading(false);
      }
    };

    fetchResults();
  }, [userId, trainingType]);

  return { results, loading, error };
};

export const useUserInfo = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const response = await axios.get<User>(`${apiBase}/users/${userId}`);
        setUser(response.data);
        setLoading(false);
      } catch {
        setError('ユーザー情報の取得に失敗しました');
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, loading, error };
};


