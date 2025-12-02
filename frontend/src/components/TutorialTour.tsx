'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

export type TourStep = {
  target: string; // CSS selector or data attribute
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void; // アクション（例：モーダルを開く、ページ遷移など）
};

interface TutorialTourProps {
  steps: TourStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
  run: boolean; // ツアーを開始するかどうか
}

export default function TutorialTour({
  steps,
  isActive,
  onComplete,
  onSkip,
  run,
}: TutorialTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({});
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const previousElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!run || !isActive || steps.length === 0) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    updateStepPosition();
  }, [run, isActive, currentStep, steps]);

  useEffect(() => {
    if (!isVisible) return;

    const handleResize = () => {
      updateStepPosition();
    };

    const handleScroll = () => {
      updateStepPosition();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isVisible, currentStep]);

  const updateStepPosition = () => {
    if (currentStep >= steps.length) return;

    const step = steps[currentStep];
    const element = document.querySelector(step.target);

    if (!element) {
      // 要素が見つからない場合は中央に表示
      setOverlayStyle({
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9998,
      });
      setHighlightStyle({});
      setTooltipStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        maxWidth: '400px',
      });
      return;
    }

    const rect = element.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    // オーバーレイはハイライトボックスのboxShadowで実現するため、透明にする
    setOverlayStyle({
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'transparent',
      zIndex: 9996,
      pointerEvents: 'none',
    });

    // 前の要素のスタイルをリセット
    if (previousElementRef.current && previousElementRef.current !== element) {
      previousElementRef.current.style.outline = '';
      previousElementRef.current.style.outlineOffset = '';
      previousElementRef.current.style.borderRadius = '';
    }

    // ターゲット要素をハイライト
    const htmlElement = element as HTMLElement;
    htmlElement.style.outline = '3px solid #3b82f6';
    htmlElement.style.outlineOffset = '4px';
    htmlElement.style.borderRadius = '8px';
    htmlElement.style.transition = 'all 0.3s ease';
    htmlElement.style.zIndex = '9999';
    htmlElement.style.position = 'relative';
    
    previousElementRef.current = htmlElement;

    // ハイライトボックスのスタイルを設定
    setHighlightStyle({
      position: 'fixed',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      border: '3px solid #3b82f6',
      borderRadius: '8px',
      pointerEvents: 'none',
      zIndex: 9997,
      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
    });

    // ツールチップの位置を計算
    const position = step.position || 'bottom';
    let top = 0;
    let left = 0;
    let transform = '';

    switch (position) {
      case 'top':
        top = rect.top + scrollY - 10;
        left = rect.left + scrollX + rect.width / 2;
        transform = 'translate(-50%, -100%)';
        break;
      case 'bottom':
        top = rect.bottom + scrollY + 10;
        left = rect.left + scrollX + rect.width / 2;
        transform = 'translate(-50%, 0)';
        break;
      case 'left':
        top = rect.top + scrollY + rect.height / 2;
        left = rect.left + scrollX - 10;
        transform = 'translate(-100%, -50%)';
        break;
      case 'right':
        top = rect.top + scrollY + rect.height / 2;
        left = rect.right + scrollX + 10;
        transform = 'translate(0, -50%)';
        break;
      case 'center':
        top = rect.top + scrollY + rect.height / 2;
        left = rect.left + scrollX + rect.width / 2;
        transform = 'translate(-50%, -50%)';
        break;
    }

    setTooltipStyle({
      position: 'absolute',
      top: `${top}px`,
      left: `${left}px`,
      transform,
      zIndex: 9999,
      maxWidth: '400px',
    });

    // 要素をビューポートの中央にスクロール
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const currentStepData = steps[currentStep];
      if (currentStepData.action) {
        currentStepData.action();
      }
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const clearHighlights = () => {
    // すべてのハイライトをクリア
    steps.forEach((step) => {
      const element = document.querySelector(step.target);
      if (element) {
        const htmlElement = element as HTMLElement;
        htmlElement.style.zIndex = '';
        htmlElement.style.position = '';
        htmlElement.style.transition = '';
        htmlElement.style.outline = '';
        htmlElement.style.outlineOffset = '';
        htmlElement.style.borderRadius = '';
      }
    });
    if (previousElementRef.current) {
      previousElementRef.current.style.outline = '';
      previousElementRef.current.style.outlineOffset = '';
      previousElementRef.current.style.borderRadius = '';
      previousElementRef.current = null;
    }
  };

  const handleComplete = () => {
    clearHighlights();
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    clearHighlights();
    setIsVisible(false);
    onSkip();
  };

  if (!isVisible || currentStep >= steps.length) {
    return null;
  }

  const step = steps[currentStep];

  return createPortal(
    <>
      {/* ハイライトボックス（boxShadowでオーバーレイ効果も実現） */}
      {Object.keys(highlightStyle).length > 0 && (
        <div style={highlightStyle} />
      )}
      
      {/* フォールバック用のオーバーレイ（要素が見つからない場合） */}
      {Object.keys(highlightStyle).length === 0 && (
        <div
          style={overlayStyle}
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      )}

      {/* ツールチップ */}
      <div
        ref={tooltipRef}
        style={tooltipStyle}
        className="bg-white rounded-lg shadow-2xl p-6 border-2 border-blue-500"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {step.title}
            </h3>
            <p className="text-gray-700 leading-relaxed">{step.content}</p>
          </div>
          <button
            onClick={handleSkip}
            className="ml-4 text-gray-400 hover:text-gray-600 transition"
            aria-label="スキップ"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            {currentStep + 1} / {steps.length}
          </div>
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                戻る
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              {currentStep === steps.length - 1 ? '完了' : '次へ'}
            </button>
          </div>
        </div>

        {/* 矢印（位置に応じて表示） */}
        {step.position && step.position !== 'center' && (
          <div
            className={`absolute w-0 h-0 ${
              step.position === 'top'
                ? 'bottom-[-10px] left-1/2 transform -translate-x-1/2 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-blue-500'
                : step.position === 'bottom'
                ? 'top-[-10px] left-1/2 transform -translate-x-1/2 border-l-[10px] border-r-[10px] border-b-[10px] border-l-transparent border-r-transparent border-b-blue-500'
                : step.position === 'left'
                ? 'right-[-10px] top-1/2 transform -translate-y-1/2 border-t-[10px] border-b-[10px] border-l-[10px] border-t-transparent border-b-transparent border-l-blue-500'
                : 'left-[-10px] top-1/2 transform -translate-y-1/2 border-t-[10px] border-b-[10px] border-r-[10px] border-t-transparent border-b-transparent border-r-blue-500'
            }`}
          />
        )}
      </div>
    </>,
    document.body
  );
}
