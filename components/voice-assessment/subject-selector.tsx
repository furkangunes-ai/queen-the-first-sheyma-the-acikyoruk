"use client";

import React from "react";
import { motion } from "motion/react";
import { BookOpen, Zap } from "lucide-react";
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
          Değerlendirmek istediğin dersi seç ve konuları hızlıca puanla.
        </p>
      </div>

      {/* Per exam type */}
      {Array.from(examTypes.entries()).map(([examTypeId, group]) => (
        <div key={examTypeId} className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-400">{group.name}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {group.subjects.map((subject) => (
              <motion.button
                key={subject.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(subject.id, "quick")}
                className="p-3 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-600 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm font-medium text-white">{subject.name}</span>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-zinc-500">{subject.topicCount} konu</span>
                  <span className="flex items-center gap-1 text-[10px] text-amber-400">
                    <Zap className="w-3 h-3" />
                    Değerlendir
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
