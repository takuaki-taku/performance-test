'use client';

import { useCooldownTrainings } from '@/hooks/useFlexibilityChecks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Link from 'next/link';

export default function CooldownPage() {
  const { trainings, loading, error } = useCooldownTrainings();

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">クールダウン</h1>
        </div>
        <LoadingSpinner text="データを読み込み中..." fullScreen={false} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="w-full">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
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
        <p className="text-xs text-gray-500 mt-1">
          API URL: {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">クールダウン</h1>
      </div>
      <div className="mb-8">
        <p className="text-gray-700 mb-4">
          このページでは、テニス選手のパフォーマンス向上とケガ予防のためのクールダウンメニューを確認できます。
        </p>
        <p className="hidden md:block text-gray-700 mb-4">
          各トレーニングを順番に実施し、正しいフォームで行いましょう。
        </p>
      </div>
      {trainings.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">トレーニングデータが見つかりませんでした。</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainings.map((training) => (
          <Link
            key={training.id}
            href={`/training/cooldown/${training.id}`}
            className="block"
          >
            <Card className="w-full h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{training.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageWithFallback
                  src={training.image_path}
                  alt={training.title}
                  fill
                  containerClassName="w-full h-48 mb-4"
                  className="object-contain"
                />
                <p className="whitespace-pre-line text-sm text-gray-700">
                  {training.description}
                </p>
                {training.series_name && training.series_number && (
                  <p className="mt-2 text-xs text-gray-500">
                    {training.series_name} シリーズ{training.series_number}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

