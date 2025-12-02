'use client';

import { useCooldownTrainings } from '@/hooks/useFlexibilityChecks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import Link from 'next/link';

export default function CooldownPage() {
  const { trainings, loading, error } = useCooldownTrainings();

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? // ローディング中のスケルトンUI
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
          : trainings.map((training) => (
              <Link
                key={training.id}
                href={`/cooldown/${training.id}`}
                className="block"
              >
                <Card className="w-full h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{training.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {training.image_path && (
                      <div className="relative w-full h-48 mb-4">
                        <Image
                          src={training.image_path}
                          alt={training.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
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

