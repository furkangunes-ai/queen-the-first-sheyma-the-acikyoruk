"use client";

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Brain, ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { calculateClarityScore } from '@/lib/exam-metrics';

interface ExamForTask {
  id: string;
  title: string;
  date: string;
  subjectResults: Array<{
    subjectId: string;
    subject: { name: string };
    wrongCount: number;
    emptyCount: number;
  }>;
  cognitiveVoids?: Array<{
    status: string;
    severity?: number;
  }>;
}

interface NextTaskWidgetProps {
  exams: ExamForTask[];
}

interface Task {
  type: 'classify' | 'repair';
  examId: string;
  label: string;
  sublabel: string;
  color: string;
  borderColor: string;
  bgColor: string;
}

export default function NextTaskWidget({ exams }: NextTaskWidgetProps) {
  const router = useRouter();

  const task = useMemo<Task | null>(() => {
    // 1. En düşük clarity score'lu deneme → "Haritalandır"
    let worstClarity: { exam: ExamForTask; score: number; rawCount: number } | null = null;

    for (const exam of exams) {
      const voids = exam.cognitiveVoids || [];
      const hasErrors = exam.subjectResults.some(sr => sr.wrongCount > 0 || sr.emptyCount > 0);
      if (!hasErrors) continue;

      const score = voids.length > 0 ? calculateClarityScore(voids) : 0;
      if (score >= 1) continue;

      const rawCount = voids.filter(v => v.status === 'RAW').length;
      if (!worstClarity || score < worstClarity.score) {
        worstClarity = { exam, score, rawCount };
      }
    }

    if (worstClarity) {
      const rawCount = worstClarity.rawCount ||
        worstClarity.exam.subjectResults.reduce((sum, sr) => sum + sr.wrongCount + sr.emptyCount, 0);
      return {
        type: 'classify',
        examId: worstClarity.exam.id,
        label: `${rawCount} ham zafiyet haritalanmayı bekliyor`,
        sublabel: worstClarity.exam.title,
        color: 'text-amber-400',
        borderColor: 'border-amber-500/30',
        bgColor: 'from-amber-500/10 via-amber-500/5',
      };
    }

    // 2. En yüksek severity UNRESOLVED void → "Onar"
    let worstVoidExam: ExamForTask | null = null;
    let maxSeverity = 0;
    let unresolvedCount = 0;

    for (const exam of exams) {
      const voids = exam.cognitiveVoids || [];
      const unresolved = voids.filter(v => v.status === 'UNRESOLVED');
      if (unresolved.length === 0) continue;

      const maxSev = Math.max(...unresolved.map(v => v.severity || 0));
      if (maxSev > maxSeverity) {
        maxSeverity = maxSev;
        worstVoidExam = exam;
        unresolvedCount = unresolved.length;
      }
    }

    if (worstVoidExam) {
      return {
        type: 'repair',
        examId: worstVoidExam.id,
        label: `${unresolvedCount} zafiyet onarım bekliyor`,
        sublabel: worstVoidExam.title,
        color: 'text-rose-400',
        borderColor: 'border-rose-500/30',
        bgColor: 'from-rose-500/10 via-rose-500/5',
      };
    }

    return null;
  }, [exams]);

  if (!task) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border ${task.borderColor} bg-gradient-to-r ${task.bgColor} to-transparent p-4 cursor-pointer group`}
      onClick={() => router.push(`/exams/${task.examId}`)}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl ${task.type === 'classify' ? 'bg-amber-500/20 border-amber-500/30' : 'bg-rose-500/20 border-rose-500/30'} border flex items-center justify-center shrink-0`}>
          {task.type === 'classify' ? (
            <Brain size={20} className={task.color} />
          ) : (
            <Sparkles size={20} className={task.color} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold ${task.color}`}>{task.label}</p>
          <p className="text-xs text-white/40 truncate">{task.sublabel}</p>
        </div>
        <ArrowRight size={18} className="text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all shrink-0" />
      </div>
    </motion.div>
  );
}
