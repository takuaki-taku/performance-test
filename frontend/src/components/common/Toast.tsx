'use client';

import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

// Toastコンテキスト（簡易版：グローバルstateを使用）
let toastListeners: ((toasts: Toast[]) => void)[] = [];
let globalToasts: Toast[] = [];

const notifyListeners = () => {
  toastListeners.forEach((listener) => listener([...globalToasts]));
};

export const showToast = (message: string, type: ToastType = 'info') => {
  const id = Math.random().toString(36).substring(7);
  globalToasts = [...globalToasts, { id, message, type }];
  notifyListeners();

  // 5秒後に自動削除
  setTimeout(() => {
    removeToast(id);
  }, 5000);
};

export const removeToast = (id: string) => {
  globalToasts = globalToasts.filter((toast) => toast.id !== id);
  notifyListeners();
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setToasts(newToasts);
    };
    toastListeners.push(listener);
    setToasts([...globalToasts]);

    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            min-w-[300px] max-w-md px-4 py-3 rounded-lg shadow-lg
            flex items-center justify-between gap-4
            transition-all duration-300 ease-in-out
            ${
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : toast.type === 'error'
                ? 'bg-red-500 text-white'
                : toast.type === 'warning'
                ? 'bg-yellow-500 text-white'
                : 'bg-blue-500 text-white'
            }
          `}
        >
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/80 hover:text-white transition-colors"
            aria-label="閉じる"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

