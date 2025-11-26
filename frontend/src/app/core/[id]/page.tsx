'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useFlexibilityCheck } from '@/hooks/useFlexibilityChecks';

export default function CoreTrainingDetailPage() {
  const { id } = useParams<{ id: string }>();
  // trainings API は共通なので、既存のフックを再利用
  const { check: training, loading, error } = useFlexibilityCheck(id);
  const router = useRouter();

  if (loading) return <div className="p-4">読み込み中…</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  if (!training) {
    return (
      <div className="p-4">
        トレーニングが見つかりません。
        <button
          className="ml-2 text-blue-600 underline"
          onClick={() => router.push('/core')}
        >
          一覧に戻る
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <button
        className="mb-4 text-blue-600 underline"
        onClick={() => router.push('/core')}
      >
        ← 体幹トレーニング一覧に戻る
      </button>

      <h1 className="mb-4 text-3xl font-bold">{training.title}</h1>

      {training.image_path && (
        <div className="relative w-full h-64 mb-4">
          <Image
            src={training.image_path}
            alt={training.title}
            fill
            className="object-contain"
          />
        </div>
      )}

      <section className="mb-6">
        <h2 className="font-bold mb-2">トレーニングの説明</h2>
        <p className="whitespace-pre-line">{training.description}</p>
      </section>

      {training.instructions && (
        <section className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h2 className="font-bold mb-2">実施方法・チェックポイント</h2>
          <p className="whitespace-pre-line">{training.instructions}</p>
        </section>
      )}
    </div>
  );
}


