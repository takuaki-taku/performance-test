'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  useCoreTrainings,
  useFlexibilityCheck,
} from '@/hooks/useFlexibilityChecks';

export default function CoreTrainingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // 一覧（体幹トレーニング全体）を取得して、分母・前後の種目を計算する
  const {
    trainings,
    loading: trainingsLoading,
    error: trainingsError,
  } = useCoreTrainings();

  // 詳細データ（1件分）を取得
  const {
    check: training,
    loading: trainingLoading,
    error: trainingError,
  } = useFlexibilityCheck(id);

  const [inputSeconds, setInputSeconds] = useState(30);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
   const [hasPlayedForCycle, setHasPlayedForCycle] = useState(false);

  // タイマー終了時に鳴らす簡易ビープ音（3連音で少し「それっぽく」）
  const playBeep = () => {
    if (typeof window === 'undefined') return;
    const AudioContext =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const audioCtx = new AudioContext();

    const createTone = (frequency: number, startTime: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.value = frequency;
      gain.gain.value = 0.12;

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = audioCtx.currentTime;
    // 下→中→上 と少しだけ高さを変えた 3 連音
    createTone(660, now, 0.12);
    createTone(770, now + 0.14, 0.12);
    createTone(880, now + 0.28, 0.18);

    // 少し余裕を見てクローズ
    setTimeout(() => {
      audioCtx.close();
    }, 800);
  };

  // タイマー処理
  useEffect(() => {
    if (!isRunning || remainingSeconds === null || remainingSeconds <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          // 0 になったら停止
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [isRunning, remainingSeconds]);

  const handleStart = () => {
    if (inputSeconds <= 0) return;
    setRemainingSeconds(inputSeconds);
    setIsRunning(true);
    setHasPlayedForCycle(false);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(null);
    setHasPlayedForCycle(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (
    e: React.TouchEvent<HTMLDivElement>,
    prevId: number | null,
    nextId: number | null
  ) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const threshold = 50; // スワイプ判定のしきい値(px)

    if (deltaX > threshold && prevId !== null) {
      router.push(`/core/${prevId}`);
    } else if (deltaX < -threshold && nextId !== null) {
      router.push(`/core/${nextId}`);
    }

    setTouchStartX(null);
  };

  // 残り時間が 0 になったタイミングで一度だけビープ音を鳴らす
  useEffect(() => {
    if (
      remainingSeconds === 0 &&
      !isRunning &&
      !hasPlayedForCycle
    ) {
      playBeep();
      setHasPlayedForCycle(true);
    }
  }, [remainingSeconds, isRunning, hasPlayedForCycle]);

  const loading = trainingsLoading || trainingLoading;
  const error = trainingsError || trainingError;

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

  // 一覧から現在の種目の位置と前後のIDを計算
  const total = trainings.length;
  const currentIndex = trainings.findIndex((t) => t.id === training.id);
  const currentNumber = currentIndex >= 0 ? currentIndex + 1 : null;
  const prevId =
    currentIndex > 0 && currentIndex < total ? trainings[currentIndex - 1].id : null;
  const nextId =
    currentIndex >= 0 && currentIndex < total - 1
      ? trainings[currentIndex + 1].id
      : null;

  return (
    <div className="container mx-auto p-4">
      <button
        className="mb-4 text-blue-600 underline"
        onClick={() => router.push('/core')}
      >
        ← 体幹トレーニング一覧に戻る
      </button>

      <div className="flex items-baseline justify-between mb-4">
        <h1 className="text-2xl md:text-3xl font-bold">{training.title}</h1>
        {currentNumber !== null && (
          <span className="text-sm text-gray-500">
            {currentNumber} / {total}
          </span>
        )}
      </div>

      <div
        className="rounded-lg bg-white"
        onTouchStart={handleTouchStart}
        onTouchEnd={(e) => handleTouchEnd(e, prevId, nextId)}
      >
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

        {/* タイマーUI */}
        <section className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="font-bold mb-3">タイマー</h2>
          <div className="flex items-center gap-3 mb-3">
            <label className="text-sm">
              秒数:
              <input
                type="number"
                min={1}
                className="ml-2 w-20 rounded border px-2 py-1 text-right"
                value={inputSeconds}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (Number.isNaN(value)) return;
                  setInputSeconds(value);
                }}
              />
            </label>
          </div>
          <div className="mb-3 text-2xl font-mono text-center">
            {remainingSeconds !== null ? remainingSeconds : inputSeconds} 秒
          </div>
          <div className="flex justify-center gap-3">
            {!isRunning ? (
              <button
                className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                onClick={handleStart}
                disabled={inputSeconds <= 0}
              >
                スタート
              </button>
            ) : (
              <button
                className="rounded bg-gray-600 px-4 py-2 text-sm font-semibold text-white"
                onClick={handlePause}
              >
                一時停止
              </button>
            )}
            <button
              className="rounded border border-gray-300 px-4 py-2 text-sm"
              onClick={handleReset}
            >
              リセット
            </button>
          </div>
        </section>
      </div>

      {/* 前後ナビゲーション */}
      <div className="mt-6 flex items-center justify-between">
        <button
          className="rounded border border-gray-300 px-3 py-2 text-sm disabled:opacity-40"
          onClick={() => prevId !== null && router.push(`/core/${prevId}`)}
          disabled={prevId === null}
        >
          ← 前の種目
        </button>
        {currentNumber !== null && (
          <span className="text-sm text-gray-500">
            {currentNumber} / {total}
          </span>
        )}
        <button
          className="rounded border border-gray-300 px-3 py-2 text-sm disabled:opacity-40"
          onClick={() => nextId !== null && router.push(`/core/${nextId}`)}
          disabled={nextId === null}
        >
          次の種目 →
        </button>
      </div>
    </div>
  );
}


