import { useState, useEffect } from 'react';
import axios from 'axios';
import { FlexibilityCheck } from '@/types/flexibility';

export const useFlexibilityChecks = () => {
  const [checks, setChecks] = useState<FlexibilityCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChecks = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const response = await axios.get<FlexibilityCheck[]>(`${apiBase}/flexibility-checks/`);
        setChecks(response.data);
        setLoading(false);
      } catch (err) {
        setError('柔軟性チェックのデータの取得に失敗しました');
        setLoading(false);
      }
    };

    fetchChecks();
  }, []);
  return { checks, loading, error };
}; 

export const useFlexibilityCheck = (id: string) => {
  const [check, setCheck] = useState<FlexibilityCheck>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCheck = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const response = await axios.get<FlexibilityCheck>(`${apiBase}/flexibility-check/${id}`);
        setCheck(response.data);
        setLoading(false);
      } catch (err) {
        setError('柔軟性チェックのデータの取得に失敗しました');
        setLoading(false);
      }
    };

    fetchCheck();
  }, [id]);
  return { check, loading, error };
}; 