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
        const response = await axios.get<FlexibilityCheck[]>('http://localhost:8000/flexibility-checks/');
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