 "use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Container from "@/components/common/Container";
import Link from "next/link";
import { TrainingType, Training } from "@/types/flexibility";
import {
  useUserInfo,
  useUserTrainingResults,
  UserTrainingResultWithTraining,
} from "@/hooks/useUserTrainingResults";

type Row = {
  name: string; // 種目名
  description: string; // 内容
  grade: "A" | "B" | "C" | "-"; // 評価
  linkHref?: string; // やり方へのリンク
  progressText?: string; // 進捗（今は最新日付など）
  achievementLevel?: number | null; // 生の評価（1-3）
  trainingId: number;
  trainingType: number;
};

const mapAchievementToGrade = (achievementLevel: number | null | undefined) => {
  if (achievementLevel === 1) return "A";
  if (achievementLevel === 2) return "B";
  if (achievementLevel === 3) return "C";
  return "-";
};

const buildRowsFromResults = (
  results: UserTrainingResultWithTraining[]
): Row[] => {
  // トレーニング毎に最新の日付の結果だけを採用
  const latestByTraining = new Map<number, UserTrainingResultWithTraining>();

  for (const r of results) {
    const existing = latestByTraining.get(r.training.id);
    if (!existing) {
      latestByTraining.set(r.training.id, r);
      continue;
    }
    if (new Date(r.date) > new Date(existing.date)) {
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
      progressText: r.date, // ひとまず最新測定日を表示
      achievementLevel: r.achievement_level,
      trainingId: r.training.id,
      trainingType: r.training.training_type,
    };
  });
};

const SectionTable = ({ rows }: { rows: Row[] }) => {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      <table className="min-w-[720px] w-full table-fixed border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-700">
            <th className="w-[18%] border-b px-4 py-3 text-left text-sm font-medium">
              種目名
            </th>
            <th className="w-[36%] border-b px-4 py-3 text-left text-sm font-medium hidden md:table-cell">
              内容
            </th>
            <th className="w-[14%] border-b px-4 py-3 text-left text-sm font-medium">
              評価(A,B,C)
            </th>
            <th className="w-[16%] border-b px-4 py-3 text-left text-sm font-medium">
              やり方
            </th>
            <th className="w-[16%] border-b px-4 py-3 text-left text-sm font-medium hidden md:table-cell">
              進捗
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
                該当するトレーニングはありません。
              </td>
            </tr>
          ) : (
            rows.map((r, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
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
                      やり方
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
};

type SectionKey = "needsImprovement" | "achieved" | "excellent";

export default function KarteByUserPage() {
  const params = useParams();
  const userId = params.userId as string;

  const {
    user,
    loading: userLoading,
    error: userError,
  } = useUserInfo(userId);

  const {
    results,
    loading: resultsLoading,
    error: resultsError,
  } = useUserTrainingResults(userId);

  const [openSection, setOpenSection] = useState<SectionKey | null>("needsImprovement");

  const loading = userLoading || resultsLoading;
  const error = userError || resultsError;

  const rowsFromResults: Row[] = useMemo(
    () => (results ? buildRowsFromResults(results) : []),
    [results]
  );

  const {
    needsImprovementRows,
    achievedRows,
    excellentRows,
  }: {
    needsImprovementRows: Row[];
    achievedRows: Row[];
    excellentRows: Row[];
  } = useMemo(() => {
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

  if (loading) {
    return (
      <Container>
        <div className="mx-auto max-w-5xl p-6 text-gray-700">
          トレーニングカルテを読み込み中です…
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="mx-auto max-w-5xl p-6 text-red-500">{error}</div>
      </Container>
    );
  }

  const renderSectionHeader = (
    key: SectionKey,
    title: string,
    count: number
  ) => (
    <button
      type="button"
      onClick={() =>
        setOpenSection((prev) => (prev === key ? null : key))
      }
      className="flex w-full items-center justify-between rounded-2xl bg-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-800 hover:bg-gray-200"
    >
      <span>
        {title}
        <span className="ml-2 text-xs text-gray-500">({count}件)</span>
      </span>
      <span className="text-xs text-gray-500">
        {openSection === key ? "閉じる ▲" : "開く ▼"}
      </span>
    </button>
  );

  return (
    <Container>
      <div className="mx-auto max-w-5xl">
        {/* タイトル */}
        <h1 className="mt-10 text-2xl font-semibold text-gray-900">
          {user?.name ?? "選手"} トレーニングカルテ
        </h1>

        {/* 学年 */}
        <div className="mt-6 mb-8">
          <span className="text-lg text-gray-800">
            学年 {user?.grade ?? "-"}
          </span>
        </div>

        <p className="mb-4 text-sm text-gray-600">
          記録が登録されているトレーニング数: <span className="font-semibold">{totalWithStatus}</span>
        </p>

        <div className="space-y-4">
          {/* 1. 要改善 */}
          <div className="space-y-2">
            {renderSectionHeader(
              "needsImprovement",
              "要改善 (Needs improvement)",
              needsImprovementRows.length
            )}
            {openSection === "needsImprovement" && (
              <SectionTable rows={needsImprovementRows} />
            )}
          </div>

          {/* 2. 達成 */}
          <div className="space-y-2">
            {renderSectionHeader(
              "achieved",
              "達成 (Achieved)",
              achievedRows.length
            )}
            {openSection === "achieved" && (
              <SectionTable rows={achievedRows} />
            )}
          </div>

          {/* 3. 優秀 */}
          <div className="space-y-2">
            {renderSectionHeader(
              "excellent",
              "優秀 (Excellent)",
              excellentRows.length
            )}
            {openSection === "excellent" && (
              <SectionTable rows={excellentRows} />
            )}
          </div>
        </div>

        <div className="h-10" />
      </div>
    </Container>
  );
}


