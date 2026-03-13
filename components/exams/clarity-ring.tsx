"use client";

import React from 'react';
import { getClarityColorClass, formatScorePercent } from '@/lib/exam-metrics';

interface ClarityRingProps {
  score: number; // 0.0 - 1.0
  size?: number;
}

export default function ClarityRing({ score, size = 36 }: ClarityRingProps) {
  const { ring, text } = getClarityColorClass(score);
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={ring}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className={`absolute text-[9px] font-black ${text}`}>
        {formatScorePercent(score)}
      </span>
    </div>
  );
}
