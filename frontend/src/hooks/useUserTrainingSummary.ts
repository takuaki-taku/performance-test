"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';

export type UserTrainingCategorySummary = {
  training_type: number;
  training_type_label: string;
  needs_improvement: number;
  achieved: number;
  excellent: number;
};

export type UserTrainingSummaryResponse = {
  user_id: string;
  total_trainings_with_status: number;
  categories: UserTrainingCategorySummary[];
};

export const useUserTrainingSummary = (userId: string) => {
  const [summary, setSummary] = useState<UserTrainingSummaryResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchSummary = async () => {
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const res = await axios.get<UserTrainingSummaryResponse>(
          `${apiBase}/user-training-summary/${userId}`
        );
        setSummary(res.data);
        setLoading(false);
      } catch {
        setError('トレーニングサマリの取得に失敗しました');
        setLoading(false);
      }
    };

    fetchSummary();
  }, [userId]);

  return { summary, loading, error };
};


