 "use client";

import Container from '@/components/common/Container';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useMemo, useState, useMemo as useReactMemo } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { mockInProgressTrainings, mockRecentTrainings, seedMyPageMocksToLocalStorage } from './mock';
import { useUserTrainingResults, UserTrainingResultWithTraining } from '@/hooks/useUserTrainingResults';
import { useCoreTrainings, useFlexibilityChecks } from '@/hooks/useFlexibilityChecks';
import { Training, TrainingType } from '@/types/flexibility';
import { useUserTrainingSummary } from '@/hooks/useUserTrainingSummary';
import TutorialTour, { TourStep } from '@/components/TutorialTour';
import { Button } from '@/components/ui/button';

type UserResult = {
  id: number;
  user_id: string; // UUID型に変更
  date: string;
  long_jump_cm: number;
  fifty_meter_run_ms: number;
  spider_ms: number;
  eight_shape_run_count: number;
  ball_throw_cm: number;
};

type InProgressTraining = {
  id: string | number;
  title: string;
  description?: string;
  startedAt?: string;
  progress?: number; // 0-100
};

type RecentTraining = {
  id: string | number;
  title: string;
  href: string;
  accessedAt?: string;
};

type KarteRow = {
  name: string;
  description: string;
  grade: "A" | "B" | "C" | "-";
  linkHref?: string;
  progressText?: string;
  achievementLevel?: number | null;
  trainingId: number;
  trainingType: number;
};

interface MyPageContentProps {
  userId: string; // UUID型に変更
}

export default function MyPageContent({ userId }: MyPageContentProps) {
  const isAuthenticated = useAuth();
  const [userName, setUserName] = useState<string>('User');
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [inProgressCount, setInProgressCount] = useState<number>(0);
  const [inProgressOpen, setInProgressOpen] = useState<boolean>(false);
  const [inProgressList, setInProgressList] = useState<InProgressTraining[]>([]);
  const [recentTrainings, setRecentTrainings] = useState<RecentTraining[]>([]);
  const [openKarteSection, setOpenKarteSection] = useState<"needsImprovement" | "achieved" | "excellent" | null>("needsImprovement");
  const [tourRunning, setTourRunning] = useState<boolean>(false);

  const apiBase = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    []
  );

  // チュートリアルツアーのステップ定義
  const tourSteps: TourStep[] = useMemo(() => [
    {
      target: '[data-tour="user-name"]',
      title: 'あなたの名前',
      content: 'ここにあなたの名前が表示されます。プロフィール情報はこのセクションで確認できます。',
      position: 'bottom',
    },
    {
      target: '[data-tour="training-stats"]',
      title: 'トレーニング統計',
      content: 'ここでは、あなたのトレーニングの進捗状況や記録を確認できます。完了したトレーニング数や評価状況が表示されます。',
      position: 'bottom',
    },
    {
      target: '[data-tour="training-karte"]',
      title: 'トレーニングカード',
      content: 'ここでは、評価済みのトレーニングを確認できます。「Needs improvement」「Achieved」「Excellent」の3つのカテゴリで整理されています。',
      position: 'top',
    },
    {
      target: '[data-tour="physical-test-results"]',
      title: 'パフォーマンステスト結果',
      content: 'ここから、過去のパフォーマンステストの結果を確認できます。記録されたテスト結果の詳細を閲覧できます。',
      position: 'top',
    },
  ], []);

  // 初回訪問時にツアーを開始するかチェック
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenMyPageTour');
    if (!hasSeenTour && isAuthenticated) {
      // 少し遅延させてからツアーを開始（ページが完全に読み込まれた後）
      const timer = setTimeout(() => {
        setTourRunning(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const handleTourComplete = () => {
    localStorage.setItem('hasSeenMyPageTour', 'true');
    setTourRunning(false);
  };

  const handleTourSkip = () => {
    localStorage.setItem('hasSeenMyPageTour', 'true');
    setTourRunning(false);
  };

  const handleStartTour = () => {
    localStorage.removeItem('hasSeenMyPageTour');
    setTourRunning(true);
  };

  // ---- Karte data hooks ----
  const { results, loading: resultsLoading, error: resultsError } = useUserTrainingResults(userId);
  const { checks: flexibilityTrainings } = useFlexibilityChecks();
  const { trainings: coreTrainings } = useCoreTrainings();
  const { summary, loading: summaryLoading, error: summaryError } = useUserTrainingSummary(userId);

  // 初期の表示用データ（モック）とローカルの名前
  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const storedInProgress = localStorage.getItem('inProgressTrainings');
    const storedRecent = localStorage.getItem('recentTrainings');
    if (storedName) {
      setUserName(storedName);
    }

    try {
      if (storedInProgress) {
        const parsed: InProgressTraining[] = JSON.parse(storedInProgress);
        setInProgressList(Array.isArray(parsed) ? parsed : []);
        setInProgressCount(Array.isArray(parsed) ? parsed.length : 0);
      } else {
        setInProgressList(mockInProgressTrainings);
        setInProgressCount(mockInProgressTrainings.length);
        seedMyPageMocksToLocalStorage();
      }
    } catch {
      setInProgressList(mockInProgressTrainings);
      setInProgressCount(mockInProgressTrainings.length);
    }

    try {
      if (storedRecent) {
        const parsed: RecentTraining[] = JSON.parse(storedRecent);
        if (Array.isArray(parsed)) {
          const sorted = [...parsed].sort((a, b) => {
            const ta = a.accessedAt ? Date.parse(a.accessedAt) : 0;
            const tb = b.accessedAt ? Date.parse(b.accessedAt) : 0;
            return tb - ta;
          });
          setRecentTrainings(sorted.slice(0, 3));
        } else {
          setRecentTrainings(mockRecentTrainings.slice(0, 3));
          seedMyPageMocksToLocalStorage();
        }
      } else {
        setRecentTrainings(mockRecentTrainings.slice(0, 3));
        seedMyPageMocksToLocalStorage();
      }
    } catch {
      setRecentTrainings(mockRecentTrainings.slice(0, 3));
    }
  }, []);

  // API からユーザー名と完了件数を取得
  useEffect(() => {
    if (!userId) return;
    axios
      .get(`${apiBase}/users/${userId}`)
      .then((res) => {
        if (res?.data?.name) setUserName(res.data.name);
      })
      .catch(() => {/* noop */});
    axios
      .get<UserResult[]>(`${apiBase}/user_results/${userId}`)
      .then((res) => {
        setCompletedCount(res.data.length || 0);
      })
      .catch(() => {
        setCompletedCount(0);
      });
  }, [apiBase, userId]);

  const loadingKarte = resultsLoading;
  const errorKarte = resultsError;
  const loadingSummary = summaryLoading;
  const errorSummary = summaryError;

  const mapAchievementToGrade = (achievementLevel: number | null | undefined) => {
    if (achievementLevel === 1) return "A";
    if (achievementLevel === 2) return "B";
    if (achievementLevel === 3) return "C";
    return "-";
  };

  const buildRowsFromResults = (res: UserTrainingResultWithTraining[]): KarteRow[] => {
    const latestByTraining = new Map<number, UserTrainingResultWithTraining>();
    for (const r of res) {
      const existing = latestByTraining.get(r.training.id);
      if (!existing || new Date(r.date) > new Date(existing.date)) {
        latestByTraining.set(r.training.id, r);
      }
    }
    return Array.from(latestByTraining.values()).map((r) => {
      let linkHref: string | undefined;
      if (r.training.training_type === TrainingType.FLEXIBILITY) {
        linkHref = `/training/flexibility/${r.training.id}`;
      } else if (r.training.training_type === TrainingType.CORE) {
        linkHref = `/training/core/${r.training.id}`;
      }
      const grade = mapAchievementToGrade(r.achievement_level);
      const description = r.comment || r.training.description || "";
      return {
        name: r.training.title,
        description,
        grade,
        linkHref,
        progressText: r.date,
        achievementLevel: r.achievement_level,
        trainingId: r.training.id,
        trainingType: r.training.training_type,
      };
    });
  };

  const buildRowFromTraining = (training: Training): KarteRow => {
    let linkHref: string | undefined;
    if (training.training_type === TrainingType.FLEXIBILITY) {
      linkHref = `/training/flexibility/${training.id}`;
    } else if (training.training_type === TrainingType.CORE) {
      linkHref = `/training/core/${training.id}`;
    }
    return {
      name: training.title,
      description: training.description,
      grade: "-",
      linkHref,
      progressText: undefined,
      achievementLevel: undefined,
      trainingId: training.id,
      trainingType: training.training_type,
    };
  };

  const allTrainings: Training[] = useReactMemo(
    () => [...(flexibilityTrainings || []), ...(coreTrainings || [])],
    [flexibilityTrainings, coreTrainings]
  );

  const rowsFromResults: KarteRow[] = useReactMemo(
    () => (results ? buildRowsFromResults(results) : []),
    [results]
  );

  const {
    needsImprovementRows,
    achievedRows,
    excellentRows,
  }: {
    needsImprovementRows: KarteRow[];
    achievedRows: KarteRow[];
    excellentRows: KarteRow[];
  } = useReactMemo(() => {
    return {
      needsImprovementRows: rowsFromResults.filter(
        (r) => r.achievementLevel === 1
      ),
      achievedRows: rowsFromResults.filter(
        (r) => r.achievementLevel === 2
      ),
      excellentRows: rowsFromResults.filter(
        (r) => r.achievementLevel === 3
      ),
    };
  }, [rowsFromResults]);

  const totalWithStatus = rowsFromResults.length;

  const KarteSectionTable = ({ rows }: { rows: KarteRow[] }) => (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      <table className="min-w-[720px] w-full table-fixed border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-700">
            <th className="w-[18%] border-b px-4 py-3 text-left text-sm font-medium">
              Training
            </th>
            <th className="w-[36%] border-b px-4 py-3 text-left text-sm font-medium hidden md:table-cell">
              Description / Comment
            </th>
            <th className="w-[14%] border-b px-4 py-3 text-left text-sm font-medium">
              Grade (A/B/C)
            </th>
            <th className="w-[16%] border-b px-4 py-3 text-left text-sm font-medium">
              How to
            </th>
            <th className="w-[16%] border-b px-4 py-3 text-left text-sm font-medium hidden md:table-cell">
              Progress
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-6 text-center text-sm text-gray-500"
              >
                No trainings in this category.
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={`${r.trainingType}-${r.trainingId}`} className="hover:bg-gray-50">
                <td className="border-b px-4 py-3 align-top text-sm text-gray-900">
                  {r.name}
                </td>
                <td className="border-b px-4 py-3 align-top text-sm text-gray-800 hidden md:table-cell">
                  {r.description || <span className="text-gray-400">—</span>}
                </td>
                <td className="border-b px-4 py-3 align-top text-sm font-medium text-gray-900">
                  {r.grade}
                </td>
                <td className="border-b px-4 py-3 align-top text-sm">
                  {r.linkHref ? (
                    <Link
                      href={r.linkHref}
                      className="text-blue-600 underline underline-offset-4 hover:text-blue-700"
                    >
                      View
                    </Link>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="border-b px-4 py-3 align-top text-sm hidden md:table-cell">
                  {r.progressText ? (
                    <span className="text-gray-800">{r.progressText}</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">Loading...</div>
    );
  }

  if (!isAuthenticated) {
    return null; // redirecting is handled by higher-level page
  }

  return (
    <Container>
      <TutorialTour
        steps={tourSteps}
        isActive={isAuthenticated === true}
        onComplete={handleTourComplete}
        onSkip={handleTourSkip}
        run={tourRunning}
      />
      <div className="max-w-5xl mx-auto">
        {/* Title Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold" data-tour="user-name">
                Welcome, {userName}
              </h1>
              <p className="text-gray-600 mt-2">Your personal training dashboard</p>
            </div>
            <Button
              onClick={handleStartTour}
              variant="primary"
              size="md"
              title="チュートリアルツアーを開始"
              className="flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              ツアーを開始
            </Button>
          </div>
        </section>

        {/* Stats Section */}
        <section data-tour="training-stats">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-50 text-green-600">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  </span>
                  <div>
                    <p className="text-sm text-gray-500">Physical test records</p>
                    <p className="text-2xl font-bold">{completedCount}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-50 text-amber-600">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6v6l4 2"/></svg>
                    </span>
                    <div>
                      <p className="text-sm text-gray-500">Trainings with status</p>
                      <p className="text-2xl font-bold">
                        {loadingSummary ? '...' : summary?.total_trainings_with_status ?? 0}
                      </p>
                    </div>
                  </div>
                  {!loadingSummary && !errorSummary && summary && (
                    <div className="mt-3 space-y-1 text-xs text-gray-600">
                      {summary.categories.map((c) => {
                        let label = c.training_type_label;
                        if (c.training_type_label === 'FLEXIBILITY') label = 'Stretch';
                        if (c.training_type_label === 'CORE') label = 'Core';
                        return (
                          <p key={c.training_type}>
                            <span className="font-semibold">{label}</span>
                            <span className="ml-1">
                              NI {c.needs_improvement} / A {c.achieved} / EX {c.excellent}
                            </span>
                          </p>
                        );
                      })}
                    </div>
                  )}
                  {!loadingSummary && errorSummary && (
                    <p className="mt-2 text-xs text-red-500">
                      Failed to load training summary.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {inProgressOpen && (
              <div className="mt-4 space-y-3">
                {inProgressList.length === 0 ? (
                  <p className="text-sm text-gray-500">No in-progress trainings.</p>
                ) : (
                  inProgressList.map((t) => (
                    <div key={t.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{t.title}</h4>
                          {t.description && (
                            <p className="text-sm text-gray-600 mt-1">{t.description}</p>
                          )}
                          {t.startedAt && (
                            <p className="text-xs text-gray-400 mt-1">Started: {t.startedAt}</p>
                          )}
                        </div>
                        {typeof t.progress === 'number' && (
                          <span className="text-sm font-medium text-gray-700">{t.progress}%</span>
                        )}
                      </div>
                      {typeof t.progress === 'number' && (
                        <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                          <div className="h-2 rounded-full bg-amber-400" style={{ width: `${Math.min(Math.max(t.progress, 0), 100)}%` }} />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>

        {/* Training Karte Section (from Karte page) */}
        <section className="mt-10" data-tour="training-karte">
          <h2 className="text-xl font-bold mb-4">Training Karte</h2>
          <p className="mb-2 text-sm text-gray-600">
            Trainings with recorded status: <span className="font-semibold">{totalWithStatus}</span>
          </p>
          {loadingKarte ? (
            <p className="text-sm text-gray-500">Loading training karte...</p>
          ) : errorKarte ? (
            <p className="text-sm text-red-500">{errorKarte}</p>
          ) : (
            <div className="space-y-4">
              {/* Needs improvement */}
              <div className="space-y-2">
                <Button
                  type="button"
                  onClick={() =>
                    setOpenKarteSection((prev) =>
                      prev === "needsImprovement" ? null : "needsImprovement"
                    )
                  }
                  variant="muted"
                  size="md"
                  className="w-full"
                >
                  <span>
                    Needs improvement
                    <span className="ml-2 text-xs text-gray-500">
                      ({needsImprovementRows.length})
                    </span>
                  </span>
                  <span className="text-xs text-gray-500">
                    {openKarteSection === "needsImprovement" ? "Hide ▲" : "Show ▼"}
                  </span>
                </Button>
                {openKarteSection === "needsImprovement" && (
                  <KarteSectionTable rows={needsImprovementRows} />
                )}
              </div>

              {/* Achieved */}
              <div className="space-y-2">
                <Button
                  type="button"
                  onClick={() =>
                    setOpenKarteSection((prev) =>
                      prev === "achieved" ? null : "achieved"
                    )
                  }
                  variant="muted"
                  size="md"
                  className="w-full"
                >
                  <span>
                    Achieved
                    <span className="ml-2 text-xs text-gray-500">
                      ({achievedRows.length})
                    </span>
                  </span>
                  <span className="text-xs text-gray-500">
                    {openKarteSection === "achieved" ? "Hide ▲" : "Show ▼"}
                  </span>
                </Button>
                {openKarteSection === "achieved" && (
                  <KarteSectionTable rows={achievedRows} />
                )}
              </div>

              {/* Excellent */}
              <div className="space-y-2">
                <Button
                  type="button"
                  onClick={() =>
                    setOpenKarteSection((prev) =>
                      prev === "excellent" ? null : "excellent"
                    )
                  }
                  variant="muted"
                  size="md"
                  className="w-full"
                >
                  <span>
                    Excellent
                    <span className="ml-2 text-xs text-gray-500">
                      ({excellentRows.length})
                    </span>
                  </span>
                  <span className="text-xs text-gray-500">
                    {openKarteSection === "excellent" ? "Hide ▲" : "Show ▼"}
                  </span>
                </Button>
                {openKarteSection === "excellent" && (
                  <KarteSectionTable rows={excellentRows} />
                )}
              </div>
            </div>
          )}
        </section>

        {/*
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4">Recently accessed</h2>
          {recentTrainings.length === 0 ? (
            <p className="text-sm text-gray-500">No recent items.</p>
          ) : (
            <ul className="space-y-3">
              {recentTrainings.map((t) => (
                <li key={t.id}>
                  <Link
                    href={t.href}
                    className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{t.title}</p>
                      {t.accessedAt && (
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(t.accessedAt).toLocaleString()}</p>
                      )}
                    </div>
                    <span className="text-gray-400">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        */}

        {/* その他の情報 */}
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4">その他の情報</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {completedCount > 0 && (
              <Link
                href={`/physical-test-results/${userId}`}
                className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition block"
                data-tour="physical-test-results"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="7" width="3" height="11"/><rect x="17" y="10" width="3" height="8"/></svg>
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">パフォーマンステストの結果</p>
                    <p className="text-sm text-gray-600 mt-1">直近 {completedCount} 件の記録を表示</p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </section>
      </div>
    </Container>
  );
}


