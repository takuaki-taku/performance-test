'use client';

import React, { useEffect, useState, useMemo, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Container from '@/components/common/Container';
import { useUserTrainingResults, UserTrainingResultWithTraining } from '@/hooks/useUserTrainingResults';
import { useCoreTrainings, useFlexibilityChecks, useWarmupTrainings, useCooldownTrainings } from '@/hooks/useFlexibilityChecks';
import { Training, TrainingType } from '@/types/flexibility';
import axios from 'axios';
import { useTrainingFeedback, TrainingFeedbackMessage } from '@/hooks/useTrainingFeedback';
import { showToast } from '@/components/common/Toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';

type TrainingEvaluationRow = {
  trainingId: number;
  trainingTitle: string;
  trainingType: number;
  trainingTypeLabel: string;
  currentStatus: number | null; // 1-4 or null
  currentStatusLabel: string;
  resultId: number | null; // 最新の result_id（更新時に使う）
  currentComment: string | null;
};

function TrainingEvaluationsContent() {
  const isAuthenticated = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userIdParam = searchParams.get('userId');
  const userId = userIdParam || null;
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
  const [users, setUsers] = useState<Array<{ id: string; name: string; grade: string }>>([]);
  const [editingGrades, setEditingGrades] = useState<Record<number, number>>({}); // trainingId -> achievement_level
  const [savingTrainingId, setSavingTrainingId] = useState<number | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // フィードバック関連の状態
  const [expandedFeedbackRows, setExpandedFeedbackRows] = useState<Set<number>>(new Set()); // resultId -> expanded
  const [coachMessages, setCoachMessages] = useState<Record<number, string>>({}); // resultId -> message
  const [sendingMessages, setSendingMessages] = useState<Set<number>>(new Set()); // resultId -> sending
  const [coachId, setCoachId] = useState<string | null>(null);
  
  // コーチIDを取得（暫定的にlocalStorageから、または最初のユーザーをコーチとして使用）
  useEffect(() => {
    // コーチIDを取得（暫定的に最初のユーザーIDを使用）
    // 将来的には認証から取得する
    const fetchCoachId = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const response = await axios.get(`${apiBase}/users/`);
        if (response.data && response.data.length > 0) {
          // 暫定的に最初のユーザーをコーチとして使用
          setCoachId(response.data[0].id);
        }
      } catch (error) {
        console.error('コーチIDの取得に失敗しました:', error);
      }
    };
    fetchCoachId();
  }, []);

  // データ取得
  const { results, loading: resultsLoading } = useUserTrainingResults(userId || '');
  const { checks: flexibilityTrainings } = useFlexibilityChecks();
  const { trainings: coreTrainings } = useCoreTrainings();
  const { trainings: warmupTrainings } = useWarmupTrainings();
  const { trainings: cooldownTrainings } = useCooldownTrainings();

  // ユーザー一覧を取得
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const response = await axios.get(`${apiBase}/users/`);
        setUsers(response.data);
      } catch (error) {
        console.error('ユーザー一覧の取得に失敗しました:', error);
      }
    };
    fetchUsers();
  }, []);

  // 選択ユーザーの情報を取得
  useEffect(() => {
    if (!userId) {
      setSelectedUserName(null);
      return;
    }
    const fetchUser = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const response = await axios.get(`${apiBase}/users/${userId}`);
        setSelectedUserName(response.data.name);
      } catch (error) {
        console.error('ユーザー情報の取得に失敗しました:', error);
      }
    };
    fetchUser();
  }, [userId]);

  // トレーニング評価一覧を構築（最新1件だけ採用）
  const evaluationRows: TrainingEvaluationRow[] = useMemo(() => {
    if (!userId || resultsLoading) return [];

    const allTrainings: Training[] = [
      ...(flexibilityTrainings || []),
      ...(coreTrainings || []),
      ...(warmupTrainings || []),
      ...(cooldownTrainings || []),
    ];

    // トレーニングごとに最新の結果を抽出
    const latestByTraining = new Map<number, UserTrainingResultWithTraining>();
    for (const r of results) {
      const existing = latestByTraining.get(r.training.id);
      if (!existing || new Date(r.date) > new Date(existing.date)) {
        latestByTraining.set(r.training.id, r);
      }
    }

    // 全トレーニングをループして、評価行を作成
    return allTrainings.map((training) => {
      const latestResult = latestByTraining.get(training.id);
      const currentStatus = latestResult ? latestResult.achievement_level : null;

      let statusLabel = 'Not started';
      if (currentStatus === 1) statusLabel = 'Needs improvement';
      else if (currentStatus === 2) statusLabel = 'Achieved';
      else if (currentStatus === 3) statusLabel = 'Excellent';
      else if (currentStatus === 4) statusLabel = 'Started (no evaluation)';

      let typeLabel = 'Unknown';
      if (training.training_type === TrainingType.FLEXIBILITY) typeLabel = 'Stretch';
      else if (training.training_type === TrainingType.CORE) typeLabel = 'Core';
      else if (training.training_type === TrainingType.STRENGTH) typeLabel = 'Strength';
      else if (training.training_type === TrainingType.LADDER) typeLabel = 'Ladder';
      else if (training.training_type === TrainingType.WARMUP) typeLabel = 'Warmup';
      else if (training.training_type === TrainingType.COOLDOWN) typeLabel = 'Cooldown';

      return {
        trainingId: training.id,
        trainingTitle: training.title,
        trainingType: training.training_type,
        trainingTypeLabel: typeLabel,
        currentStatus,
        currentStatusLabel: statusLabel,
        resultId: latestResult?.id || null,
        currentComment: latestResult?.comment || null,
      };
    });
  }, [userId, results, resultsLoading, flexibilityTrainings, coreTrainings, warmupTrainings, cooldownTrainings]);

  const handleUserSelect = (selectedUserId: string) => {
    try {
      localStorage.setItem('userId', selectedUserId);
    } catch {}
    router.push(`/admin/training-evaluations?userId=${selectedUserId}`);
    setEditingGrades({}); // 編集状態をリセット
    setSaveMessage(null);
  };

  const handleGradeChange = (trainingId: number, newGrade: number | null) => {
    if (newGrade === null) {
      const newEditing = { ...editingGrades };
      delete newEditing[trainingId];
      setEditingGrades(newEditing);
    } else {
      setEditingGrades({ ...editingGrades, [trainingId]: newGrade });
    }
  };

  const handleSave = async (row: TrainingEvaluationRow) => {
    if (!userId || !row.resultId) {
      // まだ結果がない場合は新規作成
      const newGrade = editingGrades[row.trainingId];
      if (!newGrade || newGrade < 1 || newGrade > 3) {
        setSaveMessage({ type: 'error', text: 'Please select a valid grade (1-3)' });
        return;
      }

      setSavingTrainingId(row.trainingId);
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        await axios.post(`${apiBase}/user-training-results/`, {
          user_id: userId,
          training_id: row.trainingId,
          date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          achievement_level: newGrade,
          comment: null,
        });
        setSaveMessage({ type: 'success', text: 'Grade saved successfully!' });
        // 編集状態をクリア
        const newEditing = { ...editingGrades };
        delete newEditing[row.trainingId];
        setEditingGrades(newEditing);
        // データを再取得
        window.location.reload(); // 簡単な方法としてリロード
      } catch (error) {
        console.error('保存に失敗しました:', error);
        setSaveMessage({ type: 'error', text: 'Failed to save grade' });
      } finally {
        setSavingTrainingId(null);
      }
      return;
    }

    // 既存の結果を更新
    const newGrade = editingGrades[row.trainingId];
    if (newGrade === undefined || newGrade < 1 || newGrade > 3) {
      setSaveMessage({ type: 'error', text: 'Please select a valid grade (1-3)' });
      return;
    }

    setSavingTrainingId(row.trainingId);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const existingResult = results.find((r) => r.id === row.resultId);
      if (!existingResult) {
        throw new Error('Result not found');
      }

      await axios.put(`${apiBase}/user-training-results/${row.resultId}`, {
        user_id: userId,
        training_id: row.trainingId,
        date: existingResult.date,
        achievement_level: newGrade,
        comment: existingResult.comment,
      });
      setSaveMessage({ type: 'success', text: 'Grade updated successfully!' });
      // 編集状態をクリア
      const newEditing = { ...editingGrades };
      delete newEditing[row.trainingId];
      setEditingGrades(newEditing);
      // データを再取得
      window.location.reload(); // 簡単な方法としてリロード
    } catch (error) {
      console.error('更新に失敗しました:', error);
      setSaveMessage({ type: 'error', text: 'Failed to update grade' });
    } finally {
      setSavingTrainingId(null);
    }
  };

  // カテゴリごとにグループ化（フックは条件分岐の前に配置）
  const groupedByCategory = useMemo(() => {
    const map: Record<string, TrainingEvaluationRow[]> = {};
    for (const row of evaluationRows) {
      const key = row.trainingTypeLabel || 'Unknown';
      if (!map[key]) map[key] = [];
      map[key].push(row);
    }
    return map;
  }, [evaluationRows]);

  const categoryOrder = ['Stretch', 'Core', 'Strength', 'Ladder', 'Warmup', 'Cooldown'];
  const orderedCategoryKeys = useMemo(() => {
    const keys = Object.keys(groupedByCategory);
    const ordered: string[] = [];
    for (const k of categoryOrder) {
      if (keys.includes(k)) ordered.push(k);
    }
    for (const k of keys) {
      if (!ordered.includes(k)) ordered.push(k);
    }
    return ordered;
  }, [groupedByCategory]);

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated === null) {
    return <div className="flex justify-center items-center min-h-screen">読み込み中...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const toggleCategory = (label: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [label]: !(prev[label] ?? true),
    }));
  };
  
  const toggleFeedbackRow = (resultId: number) => {
    setExpandedFeedbackRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(resultId)) {
        newSet.delete(resultId);
      } else {
        newSet.add(resultId);
      }
      return newSet;
    });
  };
  
  const handleSendCoachFeedback = async (resultId: number) => {
    if (!coachId || !coachMessages[resultId]?.trim()) {
      showToast('メッセージを入力してください', 'error');
      return;
    }
    
    setSendingMessages((prev) => new Set(prev).add(resultId));
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      await axios.post(`${apiBase}/training-feedback-messages/`, {
        user_training_result_id: resultId,
        sender_id: coachId,
        sender_type: 'coach',
        message: coachMessages[resultId].trim(),
        message_type: 'feedback',
      });
      
      setCoachMessages((prev) => {
        const newMessages = { ...prev };
        delete newMessages[resultId];
        return newMessages;
      });
      showToast('フィードバックを送信しました', 'success');
      
      // メッセージリストを更新するためにページをリロード（暫定的）
      // 将来的には状態管理で更新
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      console.error('フィードバック送信に失敗しました:', error);
      showToast('フィードバックの送信に失敗しました', 'error');
    } finally {
      setSendingMessages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(resultId);
        return newSet;
      });
    }
  };

  return (
    <Container>
      <div className="max-w-6xl mx-auto">
        <h1 className="mt-10 text-4xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          Training Evaluation Management
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 左カラム - ユーザー管理 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              User Management
            </h2>
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                User List
              </h3>
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserSelect(user.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition ${
                      userId === user.id
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Grade: {user.grade}
                          </p>
                        </div>
                      </div>
                      {userId === user.id && (
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右カラム - トレーニング評価 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Training Evaluations
            </h2>
            {userId ? (
              <>
                {saveMessage && (
                  <div
                    className={`mb-4 p-3 rounded ${
                      saveMessage.type === 'success'
                        ? 'bg-green-50 text-green-800'
                        : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {saveMessage.text}
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Evaluations for {selectedUserName || '...'}
                  </h3>
                </div>
                {resultsLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner text="Loading..." />
                  </div>
                ) : evaluationRows.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  <p className="text-gray-600">No trainings found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orderedCategoryKeys.map((label) => {
                      const rows = groupedByCategory[label] || [];
                      const isOpen = openCategories[label] ?? true;
                      return (
                        <div key={label} className="border border-gray-200 rounded-2xl">
                          <button
                            type="button"
                            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-gray-800 bg-gray-50 rounded-2xl"
                            onClick={() => toggleCategory(label)}
                          >
                            <span className="flex items-center gap-2">
                              {label === 'Stretch' && (
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              )}
                              {label === 'Core' && (
                                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              )}
                              {label === 'Strength' && (
                                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                              )}
                              {label === 'Ladder' && (
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                              )}
                              {label === 'Warmup' && (
                                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                              )}
                              {label === 'Cooldown' && (
                                <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                              )}
                              {label}
                              <span className="text-xs text-gray-500">
                                ({rows.length})
                              </span>
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              {isOpen ? (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                  Hide
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                  Show
                                </>
                              )}
                            </span>
                          </button>
                          {isOpen && (
                            <div className="overflow-x-auto px-1 pb-3">
                              <table className="min-w-full border-collapse mt-2">
                                <thead>
                                  <tr className="bg-gray-50">
                                    <th className="border px-3 py-2 text-left text-sm font-medium text-gray-700">
                                      <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                      Training
                                      </div>
                                    </th>
                                    <th className="border px-3 py-2 text-left text-sm font-medium text-gray-700">
                                      <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Status
                                      </div>
                                    </th>
                                    <th className="border px-3 py-2 text-left text-sm font-medium text-gray-700">
                                      <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                        </svg>
                                        Grade
                                      </div>
                                    </th>
                                    <th className="border px-3 py-2 text-left text-sm font-medium text-gray-700">
                                      <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                      Action
                                      </div>
                                    </th>
                                    <th className="border px-3 py-2 text-left text-sm font-medium text-gray-700">
                                      <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        Feedback
                                      </div>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {rows.map((row) => {
                                    const editingGrade = editingGrades[row.trainingId];
                                    const displayGrade =
                                      editingGrade !== undefined
                                        ? editingGrade
                                        : row.currentStatus;
                                    const hasChanges =
                                      editingGrade !== undefined &&
                                      editingGrade !== row.currentStatus;
                                    const isFeedbackExpanded = row.resultId ? expandedFeedbackRows.has(row.resultId) : false;

                                    return (
                                      <React.Fragment key={row.trainingId}>
                                      <tr
                                        className="hover:bg-gray-50"
                                      >
                                        <td className="border px-3 py-2 text-sm text-gray-900">
                                            <div className="flex items-center gap-2">
                                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                              </svg>
                                          {row.trainingTitle}
                                            </div>
                                        </td>
                                        <td className="border px-3 py-2 text-sm text-gray-700">
                                            <div className="flex items-center gap-2">
                                              {row.currentStatus === 1 && (
                                                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                              )}
                                              {row.currentStatus === 2 && (
                                                <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                              )}
                                              {row.currentStatus === 3 && (
                                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                </svg>
                                              )}
                                              {row.currentStatus === 4 && (
                                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                              )}
                                              {!row.currentStatus && (
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                                                </svg>
                                              )}
                                          {row.currentStatusLabel}
                                            </div>
                                        </td>
                                        <td className="border px-3 py-2">
                                          <select
                                            value={displayGrade || ''}
                                            onChange={(e) => {
                                              const val =
                                                e.target.value === ''
                                                  ? null
                                                  : Number(e.target.value);
                                              handleGradeChange(row.trainingId, val);
                                            }}
                                            className="w-full px-2 py-1 text-sm border rounded"
                                            disabled={
                                              savingTrainingId === row.trainingId
                                            }
                                          >
                                            <option value="">-- Select --</option>
                                            <option value="1">
                                              Needs improvement (1)
                                            </option>
                                            <option value="2">Achieved (2)</option>
                                            <option value="3">Excellent (3)</option>
                                          </select>
                                        </td>
                                        <td className="border px-3 py-2">
                                          {hasChanges && (
                                            <button
                                              onClick={() => handleSave(row)}
                                              disabled={
                                                savingTrainingId === row.trainingId
                                              }
                                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                            >
                                              {savingTrainingId === row.trainingId ? (
                                                <>
                                                  <svg className="w-4 h-4 animate-spin inline mr-1" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                  </svg>
                                                  Saving...
                                                </>
                                              ) : (
                                                <>
                                                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                  </svg>
                                                  Save
                                                </>
                                              )}
                                            </button>
                                          )}
                                          </td>
                                          <td className="border px-3 py-2">
                                            {row.resultId ? (
                                              <button
                                                onClick={() => toggleFeedbackRow(row.resultId!)}
                                                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                                              >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                {isFeedbackExpanded ? 'Hide' : 'Show'} Feedback
                                              </button>
                                            ) : (
                                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                                                </svg>
                                                No result
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                        {row.resultId && isFeedbackExpanded && (
                                          <tr>
                                            <td colSpan={5} className="border px-3 py-4 bg-gray-50">
                                              <FeedbackSection resultId={row.resultId} coachId={coachId} />
                                        </td>
                                      </tr>
                                        )}
                                      </React.Fragment>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              <p className="text-gray-600">
                Please select a user to view and manage their training evaluations.
              </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}

// フィードバックセクションコンポーネント
function FeedbackSection({ resultId, coachId }: { resultId: number; coachId: string | null }) {
  const { messages, loading: messagesLoading, sendMessage, error: messagesError } = useTrainingFeedback(resultId);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!coachId || !newMessage.trim()) {
      showToast('Please enter a message', 'error');
      return;
    }

    setSending(true);
    try {
      const sentMessage = await sendMessage(resultId, coachId, 'coach', newMessage.trim(), 'feedback');
      if (sentMessage) {
        setNewMessage('');
        showToast('Feedback sent successfully', 'success');
      }
    } catch (error: any) {
      console.error('Feedback send error:', error);
      showToast('Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Feedback
        </h3>
        {messages.length > 0 && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            {messages.length}
          </span>
        )}
      </div>
      
      {/* メッセージ一覧 */}
      <div className="space-y-2 max-h-64 overflow-y-auto bg-white p-3 rounded border border-gray-200">
        {messagesLoading ? (
          <div className="text-center py-4">
            <LoadingSpinner size="sm" text="Loading messages..." />
          </div>
        ) : messagesError ? (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 text-red-500 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Error: {messagesError}
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-4">
            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-500 text-sm">No messages yet</p>
          </div>
        ) : (
          messages.map((msg: TrainingFeedbackMessage) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_type === 'coach' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs rounded-lg p-2 text-sm ${
                  msg.sender_type === 'coach'
                    ? 'bg-green-100 text-gray-900 border border-green-300'
                    : 'bg-blue-50 text-gray-900 border border-blue-200'
                }`}
              >
                <p className="text-xs font-semibold mb-1 flex items-center gap-1">
                  {msg.sender_type === 'coach' ? (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Coach
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      User
                    </>
                  )}
                </p>
                <p className="whitespace-pre-line text-sm">{msg.message}</p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {new Date(msg.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* メッセージ送信フォーム */}
      {coachId ? (
        <div className="border-t border-gray-300 pt-3">
          <textarea
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm mb-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            rows={3}
            placeholder="Send feedback to user..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            type="button"
            className="w-full rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
          >
            {sending ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Feedback (Cmd/Ctrl + Enter)
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="border-t border-gray-300 pt-3">
          <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded flex items-center gap-2">
            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Coach ID not configured
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrainingEvaluationsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">読み込み中...</div>}>
      <TrainingEvaluationsContent />
    </Suspense>
  );
}

