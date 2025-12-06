import { useState, useEffect } from 'react';
import { apiClient } from '@/utils/apiClient';

export interface TrainingFeedbackMessage {
  id: number;
  user_training_result_id: number;
  sender_type: 'user' | 'coach';
  sender_id: string;
  message: string;
  message_type: 'text' | 'question' | 'feedback' | 'progress' | 'answer';
  created_at: string;
  updated_at: string;
  read_at: string | null;
  read_by: string | null;
}

export const useTrainingFeedback = (resultId: number | null) => {
  const [messages, setMessages] = useState<TrainingFeedbackMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resultId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const url = `${apiBase}/user-training-results/${resultId}/feedback-messages`;
        console.log('[useTrainingFeedback] メッセージ取得開始:', { resultId, url });
        const response = await apiClient.get<TrainingFeedbackMessage[]>(url);
        console.log('[useTrainingFeedback] メッセージ取得成功:', {
          resultId,
          messageCount: response.data?.length || 0,
          messages: response.data
        });
        setMessages(response.data || []);
      } catch (err: any) {
        console.error('[useTrainingFeedback] メッセージ取得エラー:', {
          resultId,
          error: err,
          message: err.message,
          response: err.response?.data
        });
        setError(`メッセージの取得に失敗しました: ${err.message || '不明なエラー'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [resultId]);

  const sendMessage = async (
    resultId: number,
    senderId: string,
    senderType: 'user' | 'coach',
    message: string,
    messageType: string = 'text'
  ): Promise<TrainingFeedbackMessage | null> => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const payload = {
        user_training_result_id: resultId,
        sender_id: senderId,
        sender_type: senderType,
        message,
        message_type: messageType,
      };
      console.log('[useTrainingFeedback] メッセージ送信開始:', { resultId, payload });
      const response = await apiClient.post<TrainingFeedbackMessage>(
        `${apiBase}/training-feedback-messages/`,
        payload
      );
      console.log('[useTrainingFeedback] メッセージ送信成功:', {
        resultId,
        sentMessage: response.data
      });
      
      // メッセージリストを更新
      setMessages((prev) => {
        const updated = [...prev, response.data];
        console.log('[useTrainingFeedback] メッセージリスト更新:', {
          previousCount: prev.length,
          newCount: updated.length,
          allMessages: updated
        });
        return updated;
      });
      return response.data;
    } catch (err: any) {
      console.error('[useTrainingFeedback] メッセージ送信エラー:', {
        resultId,
        error: err,
        message: err.message,
        response: err.response?.data
      });
      setError(`メッセージの送信に失敗しました: ${err.message || '不明なエラー'}`);
      return null;
    }
  };

  const markAsRead = async (messageId: number, userId: string) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      await apiClient.put(
        `${apiBase}/training-feedback-messages/${messageId}/read`,
        {
          read_at: new Date().toISOString(),
          read_by: userId,
        }
      );
      
      // メッセージリストを更新
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, read_at: new Date().toISOString(), read_by: userId }
            : msg
        )
      );
    } catch (err: any) {
      console.error('既読マークに失敗しました:', err);
    }
  };

  return { messages, loading, error, sendMessage, markAsRead };
};

export const useUnreadFeedbackCount = (userId: string | null) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setCount(0);
      return;
    }

    const fetchCount = async () => {
      setLoading(true);
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const response = await apiClient.get<{ count: number }>(
          `${apiBase}/users/${userId}/unread-feedback-count`
        );
        setCount(response.data.count || 0);
      } catch (err: any) {
        console.error('未読数取得に失敗しました:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
    // 定期的に更新（30秒ごと）
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  return { count, loading };
};

