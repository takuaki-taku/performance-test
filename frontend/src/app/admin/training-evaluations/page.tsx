'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Container from '@/components/Container';
import { useUserTrainingResults, UserTrainingResultWithTraining } from '@/hooks/useUserTrainingResults';
import { useCoreTrainings, useFlexibilityChecks } from '@/hooks/useFlexibilityChecks';
import { Training, TrainingType } from '@/types/flexibility';
import axios from 'axios';

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

  // データ取得
  const { results, loading: resultsLoading } = useUserTrainingResults(userId || '');
  const { checks: flexibilityTrainings } = useFlexibilityChecks();
  const { trainings: coreTrainings } = useCoreTrainings();

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
  }, [userId, results, resultsLoading, flexibilityTrainings, coreTrainings]);

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

  const categoryOrder = ['Stretch', 'Core', 'Strength', 'Ladder'];
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

  return (
    <Container>
      <div className="max-w-6xl mx-auto">
        <h1 className="mt-10 text-4xl font-bold text-gray-900 mb-8">
          Training Evaluation Management
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 左カラム - ユーザー管理 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              User Management
            </h2>
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
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
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">Grade: {user.grade}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右カラム - トレーニング評価 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
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
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Evaluations for {selectedUserName || '...'}
                  </h3>
                </div>
                {resultsLoading ? (
                  <p className="text-gray-600">Loading...</p>
                ) : evaluationRows.length === 0 ? (
                  <p className="text-gray-600">No trainings found.</p>
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
                            <span>
                              {label}{' '}
                              <span className="text-xs text-gray-500">
                                ({rows.length} trainings)
                              </span>
                            </span>
                            <span className="text-xs text-gray-500">
                              {isOpen ? 'Hide ▲' : 'Show ▼'}
                            </span>
                          </button>
                          {isOpen && (
                            <div className="overflow-x-auto px-1 pb-3">
                              <table className="min-w-full border-collapse mt-2">
                                <thead>
                                  <tr className="bg-gray-50">
                                    <th className="border px-3 py-2 text-left text-sm font-medium text-gray-700">
                                      Training
                                    </th>
                                    <th className="border px-3 py-2 text-left text-sm font-medium text-gray-700">
                                      Current Status
                                    </th>
                                    <th className="border px-3 py-2 text-left text-sm font-medium text-gray-700">
                                      Grade (Admin)
                                    </th>
                                    <th className="border px-3 py-2 text-left text-sm font-medium text-gray-700">
                                      Action
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

                                    return (
                                      <tr
                                        key={row.trainingId}
                                        className="hover:bg-gray-50"
                                      >
                                        <td className="border px-3 py-2 text-sm text-gray-900">
                                          {row.trainingTitle}
                                        </td>
                                        <td className="border px-3 py-2 text-sm text-gray-700">
                                          {row.currentStatusLabel}
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
                                              {savingTrainingId === row.trainingId
                                                ? 'Saving...'
                                                : 'Save'}
                                            </button>
                                          )}
                                        </td>
                                      </tr>
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
              <p className="text-gray-600">
                Please select a user to view and manage their training evaluations.
              </p>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}

export default function TrainingEvaluationsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">読み込み中...</div>}>
      <TrainingEvaluationsContent />
    </Suspense>
  );
}

