'use client';

import dynamic from 'next/dynamic';
import Container from '@/components/Container';
import { useState, useEffect } from 'react';
import UserForm from './UserForm';
import UserList from './UserList';
import ResultForm from './ResultForm';
import ResultList from './ResultList';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css/autoplay';

interface Result {
  id: number;
  date: string;
  long_jump: number;
  fifty_meter_run: number;
  spider: number;
  eight_shape_run: number;
  ball_throw: number;
}

// サーバーサイドは無視してクライアントのみでロード
const RotatingGlobe = dynamic(
  () => import('@/components/RotatingGlobe'),
  { ssr: false }
);

export default function Home() {
  const slides = [
    { img: '/images/hero1.jpg', caption: '科学的トレーニング' },
    { img: '/images/hero2.jpg', caption: '柔軟性チェック' },
    { img: '/images/hero3.jpg', caption: 'リアルタイム分析' },
  ];

  return (
    <Container className="p-0">
      {/* ① 回転地球儀 */}
      <RotatingGlobe />

      {/* ② キャッチコピー */}
      <section className="text-center py-12 bg-gray-100">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Elevate Your Performance
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          データ駆動型トレーニングで、新しい自分に出会う。
        </p>
        <Link
          href="/test-results"
          className="inline-block px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
        >
          今すぐ始める
        </Link>
      </section>
    </Container>
  );
}