'use client';

import { useFlexibilityChecks } from '@/hooks/useFlexibilityChecks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

export default function FlexibilityPage() {
  const { checks, loading, error } = useFlexibilityChecks();

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">柔軟性チェック項目</h1>
        <a
          href="/pdfs/flexibility_check.pdf"
          download
          className="
            bg-blue-500 hover:bg-blue-600 text-white
            px-3 py-1.5 text-sm
            md:px-4 md:py-2 md:text-base
            rounded-lg flex items-center gap-2
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          PDF
        </a>
      </div>
      <div className="mb-8">
        <p className="text-gray-700 mb-4">
          このチェック項目は、身体の柔軟性を評価するための基本的なテストです。テニス選手が怪我予防のために最低限クリアして欲しいラインになります。
        </p>
        <p className="hidden md:block text-gray-700 mb-4">
          以下の項目を順番にチェックし、自分の柔軟性の状態を確認しましょう。各項目には具体的な判定基準が示されています。
        </p>
        <p className="hidden md:block text-gray-700">
          定期的にチェックを行うことで、柔軟性の変化を追跡し、トレーニングの効果を確認することができます。
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // ローディング中のスケルトンUI
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="w-full">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          checks.map((check) => (
            <Card key={check.id} className="w-full">
              <CardHeader>
                <CardTitle>{check.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {check.image_path && (
                  <div className="relative w-full h-48 mb-4">
                    <Image
                      src={check.image_path}
                      alt={check.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <p className="whitespace-pre-line">{check.description}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 