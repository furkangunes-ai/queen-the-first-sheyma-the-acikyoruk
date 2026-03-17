"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, Minus, History, ChevronDown, ChevronUp } from 'lucide-react';

interface KnowledgeLogEntry {
  id: string;
  topicId: string;
  source: string;
  oldLevel: number;
  newLevel: number;
  delta: number;
  detail: string | null;
  createdAt: string;
  topic: {
    id: string;
    name: string;
    subject: { id: string; name: string };
  };
}

const SOURCE_LABELS: Record<string, string> = {
  study_session: 'Çalışma',
  exam_error: 'Deneme Hatası',
  exam_implicit_positive: 'Deneme Doğru',
  exam: 'Deneme',
  manual: 'Manuel',
  initial: 'İlk Giriş',
};

const SOURCE_COLORS: Record<string, string> = {
  study_session: 'text-blue-400',
  exam_error: 'text-red-400',
  exam_implicit_positive: 'text-emerald-400',
  exam: 'text-amber-400',
  manual: 'text-purple-400',
  initial: 'text-zinc-400',
};

export default function KnowledgeLogWidget() {
  const [logs, setLogs] = useState<KnowledgeLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/student/knowledge-log?limit=20');
      if (!res.ok) return;
      const data = await res.json();
      setLogs(data.logs || []);
    } catch {
      // non-critical
    } finally {
      setLoading(false);
    }
  };

  if (loading || logs.length === 0) return null;

  const visibleLogs = expanded ? logs : logs.slice(0, 5);

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <History size={14} className="text-white/40" />
          <h3 className="text-xs font-bold text-white/60">Bilgi Değişim Geçmişi</h3>
        </div>
        <span className="text-[10px] text-white/30">{logs.length} kayıt</span>
      </div>

      <div className="space-y-1">
        <AnimatePresence initial={false}>
          {visibleLogs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-white/[0.02] transition-colors"
            >
              {/* Direction icon */}
              {log.delta > 0 ? (
                <TrendingUp size={12} className="text-emerald-400 shrink-0" />
              ) : log.delta < 0 ? (
                <TrendingDown size={12} className="text-red-400 shrink-0" />
              ) : (
                <Minus size={12} className="text-zinc-500 shrink-0" />
              )}

              {/* Topic name */}
              <span className="text-xs text-white/70 truncate flex-1 min-w-0">
                {log.topic.name}
              </span>

              {/* Source badge */}
              <span className={`text-[9px] font-bold shrink-0 ${SOURCE_COLORS[log.source] || 'text-zinc-400'}`}>
                {SOURCE_LABELS[log.source] || log.source}
              </span>

              {/* Level change */}
              <span className="text-[10px] font-mono text-white/40 shrink-0 w-16 text-right">
                {log.oldLevel.toFixed(1)} → {log.newLevel.toFixed(1)}
              </span>

              {/* Delta */}
              <span className={`text-[10px] font-bold shrink-0 w-8 text-right ${
                log.delta > 0 ? 'text-emerald-400' : log.delta < 0 ? 'text-red-400' : 'text-zinc-500'
              }`}>
                {log.delta > 0 ? '+' : ''}{log.delta.toFixed(1)}
              </span>

              {/* Time */}
              <span className="text-[9px] text-white/20 shrink-0 w-12 text-right">
                {formatTimeAgo(log.createdAt)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {logs.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-2 py-1.5 flex items-center justify-center gap-1 text-[10px] text-white/30 hover:text-white/50 transition-colors"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? 'Daralt' : `${logs.length - 5} daha göster`}
        </button>
      )}
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMin = Math.floor((now - then) / 60000);

  if (diffMin < 1) return 'şimdi';
  if (diffMin < 60) return `${diffMin}dk`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}sa`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}gün`;
  return `${Math.floor(diffDay / 7)}hf`;
}
