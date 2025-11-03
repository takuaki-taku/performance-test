"use client";

import Container from '@/components/Container';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface InProgressItem {
  id: string;
  title: string;
  startedAt?: string; // ISO string
}

export default function InProgressListPage() {
  const isAuthenticated = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<InProgressItem[]>([]);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('inProgressTrainings');
      const parsed: InProgressItem[] = raw ? JSON.parse(raw) : [];
      setItems(Array.isArray(parsed) ? parsed : []);
    } catch {
      setItems([]);
    }
  }, []);

  if (isAuthenticated === null) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // redirecting
  }

  return (
    <Container>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-4">In-progress trainings</h1>
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-600">
            No trainings in progress.
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((it) => (
              <li key={it.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-amber-50 text-amber-600">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6v6l4 2"/></svg>
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{it.title}</p>
                    {it.startedAt && (
                      <p className="text-xs text-gray-500">Started: {new Date(it.startedAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}
