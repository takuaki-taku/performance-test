'use client';

import { useEffect, useState, useRef } from 'react';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
  useFlexibilityCheck,
  useFlexibilityChecks,
} from '@/hooks/useFlexibilityChecks';
import { useTrainingFeedback, TrainingFeedbackMessage } from '@/hooks/useTrainingFeedback';
import { showToast } from '@/components/common/Toast';

export default function FlexibilityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // 柔軟性トレーニングの一覧を取得して、分母・前後の種目を計算する
  const {
    checks,
    loading: checksLoading,
    error: checksError,
  } = useFlexibilityChecks();

  // 詳細データ（1件分）を取得
  const {
    check,
    loading: checkLoading,
    error: checkError,
  } = useFlexibilityCheck(id);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [statusComment, setStatusComment] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  
  // 今日のトレーニング結果ID（フィードバック用）
  const [todayResultId, setTodayResultId] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  // フィードバックメッセージ
  const { messages, loading: messagesLoading, sendMessage, markAsRead, error: messagesError } = useTrainingFeedback(todayResultId);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // デバッグログ
  useEffect(() => {
    console.log('[FlexibilityDetailPage] フィードバック状態:', {
      todayResultId,
      messagesCount: messages.length,
      messages,
      messagesLoading,
      messagesError
    });
  }, [todayResultId, messages, messagesLoading, messagesError]);
  
  // ユーザーIDを取得
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('userId');
      if (raw) {
        setUserId(raw);
      }
    } catch {
      // ignore
    }
  }, []);
  
  // 今日のトレーニング結果を取得
  useEffect(() => {
    if (!check || !userId) {
      console.log('[FlexibilityDetailPage] トレーニング結果取得スキップ:', { check: !!check, userId });
      return;
    }
    
    const fetchTodayResult = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const today = new Date().toISOString().slice(0, 10);
        const url = `${apiBase}/user-training-results/${userId}/${check.id}`;
        console.log('[FlexibilityDetailPage] トレーニング結果取得開始:', { userId, trainingId: check.id, today, url });
        const response = await axios.get(url);
        console.log('[FlexibilityDetailPage] トレーニング結果取得成功:', {
          userId,
          trainingId: check.id,
          results: response.data,
          resultCount: response.data?.length || 0
        });
        
        // 今日の結果を探す
        const todayResult = response.data.find((r: any) => r.date === today);
        console.log('[FlexibilityDetailPage] 今日の結果検索:', { today, todayResult });
        if (todayResult) {
          console.log('[FlexibilityDetailPage] 今日の結果IDを設定:', todayResult.id);
          setTodayResultId(todayResult.id);
        } else if (response.data && response.data.length > 0) {
          // 今日の結果がない場合、最新の結果IDを使用（フィードバック表示のため）
          const latestResult = response.data[0]; // APIは日付降順で返すはず
          console.log('[FlexibilityDetailPage] 今日の結果なし、最新の結果IDを使用:', latestResult.id, latestResult.date);
          setTodayResultId(latestResult.id);
        } else {
          console.log('[FlexibilityDetailPage] 結果が見つかりませんでした');
          setTodayResultId(null);
        }
      } catch (err: any) {
        console.error('[FlexibilityDetailPage] トレーニング結果取得エラー:', {
          userId,
          trainingId: check.id,
          error: err,
          message: err.message,
          response: err.response?.data
        });
        setTodayResultId(null);
      }
    };
    
    fetchTodayResult();
  }, [check, userId]);
  
  // メッセージが更新されたらスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // 未読メッセージを既読にする
  useEffect(() => {
    if (!userId || !messages.length) return;
    
    const unreadMessages = messages.filter(
      (msg) => msg.sender_type === 'coach' && !msg.read_at && msg.sender_id !== userId
    );
    
    unreadMessages.forEach((msg) => {
      markAsRead(msg.id, userId);
    });
  }, [messages, userId, markAsRead]);


  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (
    e: React.TouchEvent<HTMLDivElement>,
    prevId: number | null,
    nextId: number | null
  ) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const threshold = 50; // スワイプ判定のしきい値(px)

    if (deltaX > threshold && prevId !== null) {
      router.push(`/training/flexibility/${prevId}`);
    } else if (deltaX < -threshold && nextId !== null) {
      router.push(`/training/flexibility/${nextId}`);
    }

    setTouchStartX(null);
  };


  const handleSaveStartedStatus = async () => {
    if (!check || !userId) {
      setStatusMessage('ログインしていないため、ステータスを保存できません。');
      return;
    }

    setSavingStatus(true);
    setStatusMessage(null);
    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const response = await axios.post(`${apiBase}/user-training-results/`, {
        user_id: userId,
        training_id: check.id,
        date: today,
        achievement_level: 4, // STARTED_NO_EVAL
        comment: statusComment || null,
      });
      
      // 作成された結果IDを保存
      setTodayResultId(response.data.id);
      
      // メッセージがある場合は送信
      if (statusComment.trim()) {
        await sendMessage(
          response.data.id,
          userId,
          'user',
          statusComment,
          'progress'
        );
      }
      
      setStatusMessage('今日のトレーニング開始を記録しました。');
      setStatusComment('');
      showToast('トレーニングを記録しました', 'success');
    } catch (err: any) {
      setStatusMessage('ステータスの保存に失敗しました。少し時間をおいて再度お試しください。');
      showToast('保存に失敗しました', 'error');
    } finally {
      setSavingStatus(false);
    }
  };
  
  const handleSendMessage = async () => {
    if (!todayResultId || !userId || !newMessage.trim()) return;
    
    setSendingMessage(true);
    try {
      await sendMessage(todayResultId, userId, 'user', newMessage.trim(), 'text');
      setNewMessage('');
      showToast('メッセージを送信しました', 'success');
    } catch (err: any) {
      showToast('メッセージの送信に失敗しました', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const loading = checksLoading || checkLoading;
  const error = checksError || checkError;

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <LoadingSpinner text="データを読み込み中..." fullScreen={false} />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-red-500 font-bold mb-2">エラーが発生しました</div>
        <div className="text-red-600">{error}</div>
        <p className="text-sm text-gray-600 mt-2">
          APIサーバーが起動しているか確認してください。リトライ中です...
        </p>
      </div>
    );
  }

  if (!check) {
    return (
      <div className="p-4">
        項目が見つかりません。
        <button
          className="ml-2 text-blue-600 underline"
          onClick={() => router.push('/training/flexibility')}
        >
          一覧に戻る
        </button>
      </div>
    );
  }

  // 一覧から現在の種目の位置と前後のIDを計算
  const total = checks.length;
  const currentIndex = checks.findIndex((c) => c.id === check.id);
  const currentNumber = currentIndex >= 0 ? currentIndex + 1 : null;
  const prevId =
    currentIndex > 0 && currentIndex < total ? checks[currentIndex - 1].id : null;
  const nextId =
    currentIndex >= 0 && currentIndex < total - 1
      ? checks[currentIndex + 1].id
      : null;

  return (
    <div className="container mx-auto p-4">
      <button
        className="mb-4 text-blue-600 underline"
        onClick={() => router.push('/training/flexibility')}
      >
        ← 柔軟性チェック一覧に戻る
      </button>

      <div className="flex items-baseline justify-between mb-4">
        <h1 className="text-2xl md:text-3xl font-bold">{check.title}</h1>
        {currentNumber !== null && (
          <span className="text-sm text-gray-500">
            {currentNumber} / {total}
          </span>
        )}
      </div>

      <div
        className="rounded-lg bg-white"
        onTouchStart={handleTouchStart}
        onTouchEnd={(e) => handleTouchEnd(e, prevId, nextId)}
      >
        <ImageWithFallback
          src={check.image_path}
          alt={check.title}
          fill
          containerClassName="w-full h-64 mb-4"
          className="object-contain"
        />

        <section className="mb-6">
          <h2 className="font-bold mb-2">トレーニングの説明</h2>
          <p className="whitespace-pre-line">{check.description}</p>
        </section>

        {check.instructions && (
          <section className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h2 className="font-bold mb-2">実施方法</h2>
            <p className="whitespace-pre-line">{check.instructions}</p>
          </section>
        )}

        {/* 今日の進捗記録（評価なし） */}
        {!todayResultId && (
          <section className="mt-4 p-4 bg-white rounded-lg border border-gray-100">
            <h2 className="font-bold mb-2 text-sm">今日の進捗</h2>
            <p className="mb-2 text-xs text-gray-600">
              このストレッチに取り組んだことを記録します（評価は後でコーチがつけます）。
            </p>
            <textarea
              className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm mb-2"
              rows={2}
              placeholder="メモ（任意）: 何セットできたか、きつかった点など"
              value={statusComment}
              onChange={(e) => setStatusComment(e.target.value)}
            />
            <button
              type="button"
              className="mt-1 rounded bg-emerald-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
              onClick={handleSaveStartedStatus}
              disabled={savingStatus}
            >
              {savingStatus ? '保存中…' : '今日このストレッチを行ったことを記録する'}
            </button>
            {statusMessage && (
              <p className="mt-2 text-xs text-gray-700">{statusMessage}</p>
            )}
          </section>
        )}

        {/* コーチとのやり取り（フィードバック） */}
        {todayResultId ? (
          <section className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="font-bold mb-4 text-sm">コーチとのやり取り</h2>
            <div className="mb-2 text-xs text-gray-500 bg-white p-2 rounded">
              <div>結果ID: {todayResultId}</div>
              <div>メッセージ数: {messages.length}</div>
              <div>ローディング: {messagesLoading ? 'Yes' : 'No'}</div>
              {messagesError && <div className="text-red-500">エラー: {messagesError}</div>}
            </div>
            
            {/* メッセージ一覧 */}
            <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
              {messagesLoading ? (
                <div className="text-center py-4">
                  <LoadingSpinner size="sm" text="メッセージを読み込み中..." />
                </div>
              ) : messagesError ? (
                <div className="text-center py-4">
                  <p className="text-red-500 text-sm">エラー: {messagesError}</p>
                </div>
              ) : messages.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-4">
                  まだメッセージはありません
                </p>
              ) : (
                messages.map((msg: TrainingFeedbackMessage, index: number) => {
                  const prevMsg = index > 0 ? messages[index - 1] : null;
                  const isSameSender = prevMsg?.sender_type === msg.sender_type;
                  const showSenderName = !isSameSender || index === 0;
                  const timeDiff = prevMsg 
                    ? new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime()
                    : Infinity;
                  const showTimeSeparator = timeDiff > 5 * 60 * 1000; // 5分以上離れている場合
                  
                  return (
                    <div key={msg.id}>
                      {showTimeSeparator && index > 0 && (
                        <div className="flex items-center justify-center my-2">
                          <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                            {new Date(msg.created_at).toLocaleDateString('ja-JP', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </div>
                      )}
                      <div
                        className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'} ${!isSameSender ? 'mt-3' : 'mt-1'}`}
                      >
                        <div
                          className={`max-w-xs rounded-lg p-3 ${
                            msg.sender_type === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-white border border-gray-200'
                          }`}
                        >
                          {showSenderName && (
                            <p className={`text-xs font-semibold mb-1 ${msg.sender_type === 'user' ? 'text-blue-100' : 'text-gray-600'}`}>
                              {msg.sender_type === 'user' ? 'あなた' : 'コーチ'}
                            </p>
                          )}
                          <p className="text-sm whitespace-pre-line">{msg.message}</p>
                          <p className={`text-xs mt-1 ${msg.sender_type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                            {new Date(msg.created_at).toLocaleString('ja-JP', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* メッセージ送信フォーム */}
            <div className="border-t border-gray-300 pt-4">
              <textarea
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm mb-2"
                rows={3}
                placeholder="コーチにメッセージを送信..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSendMessage();
                  }
                }}
              />
              <button
                type="button"
                className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                onClick={handleSendMessage}
                disabled={sendingMessage || !newMessage.trim()}
              >
                {sendingMessage ? '送信中…' : '送信 (Cmd/Ctrl + Enter)'}
              </button>
            </div>
          </section>
        ) : (
          <div className="mt-4 p-2 bg-yellow-50 rounded text-xs text-gray-600">
            トレーニングを記録すると、ここにフィードバックセクションが表示されます
          </div>
        )}
      </div>

      {/* 前後ナビゲーション */}
      <div className="mt-6 flex items-center justify-between">
        <button
          className="rounded border border-gray-300 px-3 py-2 text-sm disabled:opacity-40"
          onClick={() => prevId !== null && router.push(`/training/flexibility/${prevId}`)}
          disabled={prevId === null}
        >
          ← 前の種目
        </button>
        {currentNumber !== null && (
          <span className="text-sm text-gray-500">
            {currentNumber} / {total}
          </span>
        )}
        <button
          className="rounded border border-gray-300 px-3 py-2 text-sm disabled:opacity-40"
          onClick={() => nextId !== null && router.push(`/training/flexibility/${nextId}`)}
          disabled={nextId === null}
        >
          次の種目 →
        </button>
      </div>
    </div>
  );
}

