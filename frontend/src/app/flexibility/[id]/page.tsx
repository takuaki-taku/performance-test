'use client';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useFlexibilityCheck } from '@/hooks/useFlexibilityChecks';

export default function FlexibilityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { check, loading, error } = useFlexibilityCheck(id);
  const router = useRouter();

  if (loading) return <div className="p-4">読み込み中…</div>;
  if (error)   return <div className="p-4 text-red-500">{error}</div>;

//   const item = checks.find(c => String(c.id) === String(id));
  if (!check) {
    return (
      <div className="p-4">
        項目が見つかりません。
        <button className="ml-2 text-blue-600 underline" onClick={() => router.push('/flexibility')}>
          一覧に戻る
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-3xl font-bold">{check.title}</h1>
      {/* 画像・説明・やり方など好きに配置 */}
      <p className="whitespace-pre-line">{check.description}</p>
        <div className="relative w-full h-48 mb-4">
            <Image
            src={check.image_path}
            alt={check.title}
            fill
            className="object-contain"
            />
        </div>
    </div>
  );
}
