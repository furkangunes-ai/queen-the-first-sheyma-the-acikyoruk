"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Edit3,
  Mic,
  Save,
  AlertTriangle,
  RotateCcw,
  Star,
  Loader2,
} from "lucide-react";
import { LEVEL_COLORS, LEVEL_LABELS, LEVEL_BORDER_COLORS } from "@/lib/constants";

// Types matching the API response
export interface AssessedKazanim {
  kazanimId: string;
  checked: boolean;
  note?: string;
}

export interface AssessedTopic {
  topicId: string;
  topicName: string;
  suggestedLevel: number;
  confidence: "high" | "medium" | "low";
  reasoning: string;
  kazanimlar: AssessedKazanim[];
  wrongAreas: string[];
  needsReview: boolean;
  studentQuote: string;
}

export interface AssessmentData {
  topics: AssessedTopic[];
  unmentionedTopics: string[];
  generalNotes: string;
}

interface AssessmentResultProps {
  data: AssessmentData;
  onDataChange: (data: AssessmentData) => void;
  onConfirm: () => void;
  onVoiceCorrection: () => void;
  saving: boolean;
  allTopicNames?: Map<string, string>; // topicId -> name for unmentioned topics
}

export function AssessmentResult({
  data,
  onDataChange,
  onConfirm,
  onVoiceCorrection,
  saving,
  allTopicNames,
}: AssessmentResultProps) {
  const mentionedCount = data.topics.length;
  const unmentionedCount = data.unmentionedTopics.length;

  const handleLevelChange = useCallback(
    (topicId: string, newLevel: number) => {
      const newTopics = data.topics.map((t) =>
        t.topicId === topicId ? { ...t, suggestedLevel: newLevel } : t
      );
      onDataChange({ ...data, topics: newTopics });
    },
    [data, onDataChange]
  );

  const handleKazanimToggle = useCallback(
    (topicId: string, kazanimId: string) => {
      const newTopics = data.topics.map((t) => {
        if (t.topicId !== topicId) return t;
        const newKazanimlar = t.kazanimlar.map((k) =>
          k.kazanimId === kazanimId ? { ...k, checked: !k.checked } : k
        );
        return { ...t, kazanimlar: newKazanimlar };
      });
      onDataChange({ ...data, topics: newTopics });
    },
    [data, onDataChange]
  );

  const handleRemoveTopic = useCallback(
    (topicId: string) => {
      const topic = data.topics.find((t) => t.topicId === topicId);
      const newTopics = data.topics.filter((t) => t.topicId !== topicId);
      const newUnmentioned = [...data.unmentionedTopics, topicId];
      onDataChange({
        ...data,
        topics: newTopics,
        unmentionedTopics: newUnmentioned,
      });
    },
    [data, onDataChange]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-white">
          Anladığım Kadarıyla
        </h2>
        <p className="text-sm text-zinc-400">
          {mentionedCount} konu değerlendirildi
          {unmentionedCount > 0 && `, ${unmentionedCount} konu bahsedilmedi`}
        </p>
        {data.generalNotes && (
          <p className="text-xs text-zinc-500 italic">{data.generalNotes}</p>
        )}
      </div>

      {/* Topic cards */}
      <div className="space-y-2">
        {data.topics.map((topic) => (
          <TopicCard
            key={topic.topicId}
            topic={topic}
            onLevelChange={(level) => handleLevelChange(topic.topicId, level)}
            onKazanimToggle={(kazanimId) =>
              handleKazanimToggle(topic.topicId, kazanimId)
            }
            onRemove={() => handleRemoveTopic(topic.topicId)}
          />
        ))}
      </div>

      {/* Unmentioned topics */}
      {unmentionedCount > 0 && (
        <UnmentionedSection
          topicIds={data.unmentionedTopics}
          allTopicNames={allTopicNames}
        />
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-700/50">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onVoiceCorrection}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-zinc-600 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors disabled:opacity-50"
        >
          <Mic className="w-4 h-4" />
          Sesle Düzelt
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onConfirm}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-medium transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Onayla ve Kaydet
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}

// -- Topic Card --

function TopicCard({
  topic,
  onLevelChange,
  onKazanimToggle,
  onRemove,
}: {
  topic: AssessedTopic;
  onLevelChange: (level: number) => void;
  onKazanimToggle: (kazanimId: string) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const level = topic.suggestedLevel;

  const confidenceIcon =
    topic.confidence === "high" ? "✅" :
    topic.confidence === "medium" ? "⚠️" : "❓";

  return (
    <div
      className={`rounded-lg border transition-colors ${
        LEVEL_BORDER_COLORS[level]
          ? `border-${LEVEL_BORDER_COLORS[level].split(" ")[0].replace("border-", "")}`
          : "border-zinc-700"
      } bg-zinc-800/30`}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        <span className="text-base">{confidenceIcon}</span>

        <div
          className={`w-3 h-3 rounded-full shrink-0 ${LEVEL_COLORS[level]}`}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white truncate">
              {topic.topicName}
            </span>
            {topic.needsReview && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Tekrar
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 truncate">{topic.reasoning}</p>
        </div>

        {/* Level selector */}
        {editing ? (
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4, 5].map((l) => (
              <button
                key={l}
                onClick={() => {
                  onLevelChange(l);
                  setEditing(false);
                }}
                className={`w-6 h-6 rounded text-xs font-medium transition-colors ${
                  l === level
                    ? `${LEVEL_COLORS[l]} text-white`
                    : "bg-zinc-700 text-zinc-400 hover:bg-zinc-600"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs border ${LEVEL_BORDER_COLORS[level]} hover:bg-zinc-700/50 transition-colors`}
          >
            <span className="font-medium">{level}/5</span>
            <Edit3 className="w-3 h-3" />
          </button>
        )}

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 text-zinc-500 hover:text-zinc-300"
        >
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-3 border-t border-zinc-700/30 pt-2">
              {/* Student quote */}
              {topic.studentQuote && (
                <div className="text-xs text-zinc-400 italic bg-zinc-800/50 rounded p-2">
                  &quot;{topic.studentQuote}&quot;
                </div>
              )}

              {/* Wrong areas */}
              {topic.wrongAreas.length > 0 && (
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">
                    Zayıf Alanlar
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {topic.wrongAreas.map((area, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Kazanimlar */}
              {topic.kazanimlar.length > 0 && (
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">
                    Kazanımlar
                  </span>
                  <div className="space-y-1 mt-1">
                    {topic.kazanimlar.map((k) => (
                      <label
                        key={k.kazanimId}
                        className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer hover:text-zinc-300"
                      >
                        <input
                          type="checkbox"
                          checked={k.checked}
                          onChange={() => onKazanimToggle(k.kazanimId)}
                          className="rounded border-zinc-600 bg-zinc-800 text-cyan-500 focus:ring-cyan-500/30"
                        />
                        <span>{k.note || k.kazanimId}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Remove button */}
              <button
                onClick={onRemove}
                className="flex items-center gap-1 text-xs text-red-400/60 hover:text-red-400 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Bu konuyu değerlendirmeden çıkar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// -- Unmentioned Topics Section --

function UnmentionedSection({
  topicIds,
  allTopicNames,
}: {
  topicIds: string[];
  allTopicNames?: Map<string, string>;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-lg border border-zinc-700/30 bg-zinc-800/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-800/30 transition-colors"
      >
        <AlertTriangle className="w-4 h-4 text-zinc-500" />
        <span className="text-xs text-zinc-500">
          {topicIds.length} konu hakkında bilgi verilmedi
        </span>
        {isOpen ? (
          <ChevronDown className="w-3 h-3 text-zinc-600 ml-auto" />
        ) : (
          <ChevronRight className="w-3 h-3 text-zinc-600 ml-auto" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-2 space-y-0.5">
              {topicIds.map((id) => (
                <div key={id} className="text-xs text-zinc-600 py-0.5">
                  • {allTopicNames?.get(id) || id}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
