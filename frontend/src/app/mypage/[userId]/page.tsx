"use client";

import { useParams } from 'next/navigation';
import MyPageContent from '../MyPageContent';

export default function MyPageByIdPage() {
  const params = useParams();
  const userId = Number(params.userId);

  return <MyPageContent userId={userId} />;
}


