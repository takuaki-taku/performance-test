"use client";

import Container from "@/components/Container";
import Link from 'next/link'; 

type Row = {
    name: string; // 種目名
    description: string; // 内容
    grade: "A" | "B" | "C" | "-"; // 評価
    flexibilityId?: string; // stretchのID（リンク先）
    progressText?: string; // 進捗（今はリンク風テキスト）
};

const USER_NAME = "○○さん";
const USER_GRADE = "2年"; // 学年

// ---- ダミーデータ（必要に応じて編集してください） ----
const ROWS: Row[] = [
    {
        name: "スクワット",
        description: "股関節のTrです",
        grade: "B",
        flexibilityId: "9",
        progressText: "リンク2",
    },
    {
        name: "デッドリフト",
        description: "",
        grade: "-",
        flexibilityId: "10",
        progressText: "",
    },
    {
        name: "肩のやつ",
        description: "",
        grade: "-",
        flexibilityId: "7",
        progressText: "",
    },
    {
        name: "回旋(捻り)",
        description: "",
        grade: "-",
        flexibilityId: "5",
        progressText: "",
    },
];

export default function KartePage() {
    return (
        <>
            {/* 右ヘッダーの項目ナビは今回は不要なので未指定。グローバルにKarteリンクはHeader.tsx側で追加します */}

            <Container>
                <div className="mx-auto max-w-5xl">
                    {/* タイトル */}
                    <h1 className="mt-10 text-2xl font-semibold text-gray-900">
                        {USER_NAME}　トレーニングカルテ
                    </h1>

                    {/* 学年 */}
                    <div className="mt-6 mb-8">
                        <span className="text-lg text-gray-800">
                            学年　{USER_GRADE}
                        </span>
                    </div>

                    {/* セクション見出し */}
                    <h2 className="mb-3 text-lg font-semibold text-gray-900">
                        トレーニング評価
                    </h2>

                    {/* テーブル（横スクロール許容） */}
                    <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
                        <table className="min-w-[720px] w-full table-fixed border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-700">
                                    <th className="w-[18%] border-b px-4 py-3 text-left text-sm font-medium">
                                        種目名
                                    </th>
                                    <th className="w-[36%] border-b px-4 py-3 text-left text-sm font-medium">
                                        内容
                                    </th>
                                    <th className="w-[14%] border-b px-4 py-3 text-left text-sm font-medium">
                                        評価(A,B,C)
                                    </th>
                                    <th className="w-[16%] border-b px-4 py-3 text-left text-sm font-medium">
                                        やり方
                                    </th>
                                    <th className="w-[16%] border-b px-4 py-3 text-left text-sm font-medium">
                                        進捗
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {ROWS.map((r, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="border-b px-4 py-3 align-top text-sm text-gray-900">
                                            {r.name}
                                        </td>
                                        <td className="border-b px-4 py-3 align-top text-sm text-gray-800">
                                            {r.description || (
                                                <span className="text-gray-400">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="border-b px-4 py-3 align-top text-sm font-medium text-gray-900">
                                            {r.grade}
                                        </td>
                                        <td className="border-b px-4 py-3 align-top text-sm">
                                            {r.flexibilityId ? (
                                            <Link
                                                href={`/flexibility/${r.flexibilityId}`}  // ← ここで詳細へ
                                                className="text-blue-600 underline underline-offset-4 hover:text-blue-700"
                                            >
                                                やり方
                                            </Link>
                                            ) : (
                                            <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                        {/* <td className="border-b px-4 py-3 align-top text-sm">
                                            {r.howText ? (
                                                <button
                                                    type="button"
                                                    onClick={(e) =>
                                                        e.preventDefault()
                                                    } // いまは遷移しない
                                                    className="text-blue-600 underline underline-offset-4 hover:text-blue-700"
                                                    aria-disabled
                                                >
                                                    {r.howText}
                                                </button>
                                            ) : (
                                                <span className="text-gray-400">
                                                    —
                                                </span>
                                            )}
                                        </td> */}
                                        <td className="border-b px-4 py-3 align-top text-sm">
                                            {r.progressText ? (
                                                <button
                                                    type="button"
                                                    onClick={(e) =>
                                                        e.preventDefault()
                                                    }
                                                    className="text-blue-600 underline underline-offset-4 hover:text-blue-700"
                                                    aria-disabled
                                                >
                                                    {r.progressText}
                                                </button>
                                            ) : (
                                                <span className="text-gray-400">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 余白 */}
                    <div className="h-10" />
                </div>
            </Container>
        </>
    );
}
