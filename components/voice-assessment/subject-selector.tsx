"use client";

import React from "react";
import { motion } from "motion/react";
import { BookOpen, Mic, Zap } from "lucide-react";
import { SUBJECT_GROUPS } from "@/lib/constants";

export interface SubjectOption {
  id: string;
  name: string;
  examTypeName: string;
  examTypeId: string;
  topicCount: number;
}

type AssessMode = "voice" | "quick";

interface SubjectSelectorProps {
  subjects: SubjectOption[];
  onSelect: (subjectId: string, mode: AssessMode) => void;
  loading?: boolean;
}

export function SubjectSelector({ subjects, onSelect, loading }: SubjectSelectorProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-cyan-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Group subjects by exam type
  const examTypes = new Map<string, { name: string; subjects: SubjectOption[] }>();
  for (const s of subjects) {
    if (!examTypes.has(s.examTypeId)) {
      examTypes.set(s.examTypeId, { name: s.examTypeName, subjects: [] });
    }
    examTypes.get(s.examTypeId)!.subjects.push(s);
  }

  // Sort subjects within each exam type according to SUBJECT_GROUPS order
  for (const [, group] of examTypes) {
    const groups = SUBJECT_GROUPS[group.name];
    if (groups) {
      const order = groups.flatMap((g) => g.subjectNames);
      group.subjects.sort((a, b) => {
        const ai = order.indexOf(a.name);
        const bi = order.indexOf(b.name);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-white">Ders Seçimi</h2>
        <p className="text-sm text-zinc-400">
          Değerlendirmek istediğin dersi seç. Sesli anlatabilir veya hızlı butonlarla seviye belirleyebilirsin.
        </p>
      </div>

      {/* Per exam type */}
      {Array.from(examTypes.entries()).map(([examTypeId, group]) => (
        <div key={examTypeId} className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-400">{group.name}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {group.subjects.map((subject) => (
              <div
                key={subject.id}
                className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-3 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm font-medium text-white flex-1">{subject.name}</span>
                  <span className="text-xs text-zinc-500">{subject.topicCount} konu</span>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onSelect(subject.id, "quick")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-colors text-xs font-medium"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Hızlı Değerlendir
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onSelect(subject.id, "voice")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors text-xs font-medium"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    Sesli Değerlendir
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
