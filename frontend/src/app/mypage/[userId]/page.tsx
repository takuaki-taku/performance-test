"use client";

import { useParams } from 'next/navigation';
import MyPageContent from '../MyPageContent';

export default function MyPageByIdPage() {
  const params = useParams();
  const userId = params.userId as string; // UUID文字列として扱う（Number()変換を削除）

  return <MyPageContent userId={userId} />;
}


