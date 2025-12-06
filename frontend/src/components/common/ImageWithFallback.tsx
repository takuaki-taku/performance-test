'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageWithFallbackProps {
  src: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  containerClassName?: string;
}

export default function ImageWithFallback({
  src,
  alt,
  fill = false,
  width,
  height,
  className = 'object-contain',
  containerClassName = '',
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!src || hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded ${containerClassName}`}
        style={fill ? undefined : { width, height }}
      >
        <div className="text-center p-4">
          <svg
            className="w-12 h-12 text-gray-400 mx-auto mb-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <p className="text-gray-400 text-sm">画像なし</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative ${containerClassName}`}
      style={fill ? undefined : { width, height }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}

