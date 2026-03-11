"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronRight, Star } from "lucide-react";
import { LEVEL_COLORS, LEVEL_LABELS, LEVEL_BORDER_COLORS } from "@/lib/constants";

export interface CurriculumKazanim {
  id: string;
  code: string;
  description: string;
  isKeyKazanim: boolean;
}

export interface CurriculumTopic {
  id: string;
  name: string;
  sortOrder: number;
  currentLevel?: number;
  kazanimlar: CurriculumKazanim[];
}

export interface CurriculumSubjectData {
  id: string;
  name: string;
  examTypeName: string;
  topics: CurriculumTopic[];
}

interface CurriculumDisplayProps {
  subjects: CurriculumSubjectData[];
  highlightedTopicId?: string | null;
  compact?: boolean;
}

export function CurriculumDisplay({ subjects, highlightedTopicId, compact }: CurriculumDisplayProps) {
  return (
    <div className="space-y-4 overflow-y-auto">
      {subjects.map((subject) => (
        <SubjectSection
          key={subject.id}
          subject={subject}
          highlightedTopicId={highlightedTopicId}
          compact={compact}
        />
      ))}
    </div>
  );
}

function SubjectSection({
  subject,
  highlightedTopicId,
  compact,
}: {
  subject: CurriculumSubjectData;
  highlightedTopicId?: string | null;
  compact?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border border-zinc-700/50 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-zinc-800/50 flex items-center justify-between hover:bg-zinc-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          )}
          <span className="text-sm font-medium text-white">
            {subject.examTypeName} — {subject.name}
          </span>
          <span className="text-xs text-zinc-500">({subject.topics.length} konu)</span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-2 py-1 space-y-0.5">
              {subject.topics.map((topic, index) => (
                <TopicRow
                  key={topic.id}
                  topic={topic}
                  index={index + 1}
                  isHighlighted={highlightedTopicId === topic.id}
                  compact={compact}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TopicRow({
  topic,
  index,
  isHighlighted,
  compact,
}: {
  topic: CurriculumTopic;
  index: number;
  isHighlighted: boolean;
  compact?: boolean;
}) {
  const [showKazanimlar, setShowKazanimlar] = useState(false);
  const level = topic.currentLevel ?? -1;
  const hasKazanimlar = topic.kazanimlar.length > 0;

  return (
    <div
      className={`rounded-md transition-all ${
        isHighlighted
          ? "bg-cyan-500/10 border border-cyan-500/30 ring-1 ring-cyan-500/20"
          : "hover:bg-zinc-800/30"
      }`}
    >
      <div
        className={`flex items-center gap-2 px-2 py-1.5 ${hasKazanimlar && !compact ? "cursor-pointer" : ""}`}
        onClick={() => hasKazanimlar && !compact && setShowKazanimlar(!showKazanimlar)}
      >
        {/* Topic number */}
        <span className="text-xs text-zinc-500 w-6 text-right shrink-0 font-mono">
          {index}.
        </span>

        {/* Level dot */}
        <div
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            level >= 0 ? LEVEL_COLORS[level] : "bg-zinc-600"
          }`}
          title={level >= 0 ? `${LEVEL_LABELS[level]} (${level}/5)` : "Değerlendirilmedi"}
        />

        {/* Topic name */}
        <span className="text-sm text-zinc-200 flex-1 truncate">{topic.name}</span>

        {/* Level badge */}
        {level >= 0 && (
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded border ${LEVEL_BORDER_COLORS[level]}`}
          >
            {level}/5
          </span>
        )}

        {/* Kazanim count */}
        {hasKazanimlar && !compact && (
          <span className="text-[10px] text-zinc-500">
            {topic.kazanimlar.length}K
          </span>
        )}

        {/* Expand icon */}
        {hasKazanimlar && !compact && (
          showKazanimlar ? (
            <ChevronDown className="w-3 h-3 text-zinc-500" />
          ) : (
            <ChevronRight className="w-3 h-3 text-zinc-500" />
          )
        )}
      </div>

      {/* Kazanimlar */}
      <AnimatePresence>
        {showKazanimlar && hasKazanimlar && !compact && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="pl-10 pr-2 pb-2 space-y-1">
              {topic.kazanimlar.map((k) => (
                <div
                  key={k.id}
                  className="flex items-start gap-1.5 text-xs text-zinc-400"
                >
                  {k.isKeyKazanim && (
                    <Star className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <span className="text-zinc-500 shrink-0">{k.code}</span>
                  <span className="text-zinc-400">{k.description}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
