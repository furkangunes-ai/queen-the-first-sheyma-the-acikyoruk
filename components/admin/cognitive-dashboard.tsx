"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Brain, Loader2, RefreshCw, AlertTriangle,
} from "lucide-react";
import {
  calculateRetention,
  getEffectiveMastery,
} from "@/lib/cognitive-engine";
import type { CognitiveStateData, DependencyEdgeData } from "@/lib/cognitive-engine";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StateItem {
  id: string;
  nodeId: string;
  masteryLevel: number;
  strength: number;
  successCount: number;
  lastTestedAt: string | null;
  updatedAt: string;
  node: {
    id: string;
    name: string;
    domain: string;
    examType: string;
    complexityScore: number;
  };
}

interface EdgeRaw {
  parentNodeId: string;
  childNodeId: string;
  dependencyWeight: number;
}

const DOMAINS = [
  "Matematik", "Geometri", "Fizik", "Kimya", "Biyoloji",
  "Türkçe", "Edebiyat", "Tarih", "Coğrafya", "Felsefe", "Din Kültürü",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const masteryColor = (m: number) => {
  if (m >= 0.7) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  if (m >= 0.4) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  return "bg-red-500/20 text-red-400 border-red-500/30";
};

const masteryBar = (m: number) => {
  if (m >= 0.7) return "bg-emerald-500";
  if (m >= 0.4) return "bg-amber-500";
  return "bg-red-500";
};

const retentionLabel = (r: number) => {
  if (r >= 0.85) return { text: "İyi", color: "text-emerald-400" };
  if (r >= 0.6) return { text: "Düşüyor", color: "text-amber-400" };
  return { text: "Kritik", color: "text-red-400" };
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CognitiveDashboard() {
  const [states, setStates] = useState<StateItem[]>([]);
  const [edges, setEdges] = useState<EdgeRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDomain, setFilterDomain] = useState("");
  const [sortBy, setSortBy] = useState<"mastery" | "retention" | "name">("mastery");

  // --- Fetch ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterDomain) params.set("domain", filterDomain);

      const [statesRes, edgesRes] = await Promise.allSettled([
        fetch(`/api/cognitive/state?${params}`),
        fetch("/api/cognitive/edges"),
      ]);

      if (statesRes.status === "fulfilled" && statesRes.value.ok) {
        setStates(await statesRes.value.json());
      }
      if (edgesRes.status === "fulfilled" && edgesRes.value.ok) {
        const rawEdges = await edgesRes.value.json();
        setEdges(rawEdges.map((e: any) => ({
          parentNodeId: e.parentNodeId,
          childNodeId: e.childNodeId,
          dependencyWeight: e.dependencyWeight,
        })));
      }
    } catch {
      toast.error("Veriler yüklenemedi");
    }
    setLoading(false);
  }, [filterDomain]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Computed ---
  const stateMap = new Map<string, number>();
  for (const s of states) {
    stateMap.set(s.nodeId, s.masteryLevel);
  }

  const enrichedStates = states.map((s) => {
    const cogState: CognitiveStateData = {
      nodeId: s.nodeId,
      masteryLevel: s.masteryLevel,
      strength: s.strength,
      successCount: s.successCount,
      lastTestedAt: s.lastTestedAt ? new Date(s.lastTestedAt) : null,
    };
    const retention = s.lastTestedAt ? calculateRetention(cogState) : 0;
    const effectiveMastery = getEffectiveMastery(s.nodeId, edges, stateMap);

    return { ...s, retention, effectiveMastery };
  });

  // Sort
  const sorted = [...enrichedStates].sort((a, b) => {
    if (sortBy === "mastery") return a.masteryLevel - b.masteryLevel; // Ascending (worst first)
    if (sortBy === "retention") return a.retention - b.retention;
    return a.node.name.localeCompare(b.node.name);
  });

  // Stats
  const avgMastery = enrichedStates.length > 0
    ? enrichedStates.reduce((sum, s) => sum + s.masteryLevel, 0) / enrichedStates.length
    : 0;
  const criticalCount = enrichedStates.filter((s) => s.retention < 0.85 && s.retention > 0).length;
  const weakCount = enrichedStates.filter((s) => s.masteryLevel < 0.4).length;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="glass-panel overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <Brain size={18} />
          </div>
          <div>
            <h2 className="text-base font-black tracking-wider text-white/90">
              BİLİŞSEL DURUM
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-0.5">
              {enrichedStates.length} kavram takipte
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, rotate: 15 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchData}
          className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 border border-white/10 transition-colors text-white/60 hover:text-white"
        >
          <RefreshCw size={16} />
        </motion.button>
      </div>

      {/* Summary Cards */}
      {enrichedStates.length > 0 && (
        <div className="grid grid-cols-3 gap-3 p-4 border-b border-white/5">
          <div className="bg-white/[0.03] p-3 rounded-xl border border-white/[0.06]">
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 block mb-1">
              ORT. MASTERY
            </span>
            <span className="text-xl font-black text-white/90">
              {(avgMastery * 100).toFixed(0)}%
            </span>
          </div>
          <div className="bg-white/[0.03] p-3 rounded-xl border border-white/[0.06]">
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 block mb-1">
              KRİTİK (R&lt;85%)
            </span>
            <span className={`text-xl font-black ${criticalCount > 0 ? "text-red-400" : "text-emerald-400"}`}>
              {criticalCount}
            </span>
          </div>
          <div className="bg-white/[0.03] p-3 rounded-xl border border-white/[0.06]">
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 block mb-1">
              ZAYIF (M&lt;40%)
            </span>
            <span className={`text-xl font-black ${weakCount > 0 ? "text-amber-400" : "text-emerald-400"}`}>
              {weakCount}
            </span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 p-4 border-b border-white/5">
        <select
          value={filterDomain}
          onChange={(e) => setFilterDomain(e.target.value)}
          className="px-3 py-2 bg-white/[0.03] rounded-lg border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-pink-500/40 [color-scheme:dark]"
        >
          <option value="">Tüm Alanlar</option>
          {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 bg-white/[0.03] rounded-lg border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-pink-500/40 [color-scheme:dark]"
        >
          <option value="mastery">En Düşük Mastery</option>
          <option value="retention">En Düşük Retention</option>
          <option value="name">İsme Göre</option>
        </select>
      </div>

      {/* State List */}
      <div className="max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-pink-400 animate-spin" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-12 opacity-50">
            <Brain className="w-8 h-8 text-white/30 mx-auto mb-2" />
            <p className="text-xs text-white/40">Bilişsel durum verisi yok</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {sorted.map((item) => {
              const ret = retentionLabel(item.retention);
              const cappedDiff = item.effectiveMastery < item.masteryLevel - 0.05;

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Node info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white/90 truncate">{item.node.name}</span>
                      {cappedDiff && (
                        <span className="text-[9px] flex items-center gap-0.5 text-amber-400" title="Parent darboğazı var">
                          <AlertTriangle size={10} />
                          Tavan
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/[0.06] text-white/40">
                        {item.node.domain}
                      </span>
                      <span className="text-[9px] text-white/30">
                        K:{item.node.complexityScore}
                      </span>
                      <span className="text-[9px] text-white/30">
                        S:{item.strength.toFixed(1)}
                      </span>
                      <span className="text-[9px] text-white/30">
                        x{item.successCount}
                      </span>
                    </div>
                  </div>

                  {/* Mastery bar */}
                  <div className="w-24">
                    <div className="flex items-center justify-between text-[9px] mb-1">
                      <span className="text-white/40">M</span>
                      <span className="font-bold text-white/70">{(item.masteryLevel * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${masteryBar(item.masteryLevel)}`}
                        style={{ width: `${item.masteryLevel * 100}%` }}
                      />
                    </div>
                    {cappedDiff && (
                      <div className="flex items-center justify-between text-[8px] mt-0.5">
                        <span className="text-white/30">Efektif</span>
                        <span className="font-bold text-amber-400">{(item.effectiveMastery * 100).toFixed(0)}%</span>
                      </div>
                    )}
                  </div>

                  {/* Retention */}
                  <div className="w-16 text-right">
                    {item.lastTestedAt ? (
                      <div>
                        <span className={`text-xs font-black ${ret.color}`}>
                          R:{(item.retention * 100).toFixed(0)}%
                        </span>
                        <span className={`text-[8px] block ${ret.color}`}>{ret.text}</span>
                      </div>
                    ) : (
                      <span className="text-[9px] text-white/20">Test yok</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
