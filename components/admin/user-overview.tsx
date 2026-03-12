"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Users, Loader2, ChevronRight, BookOpen, GraduationCap,
  TrendingUp, Brain, CheckCircle2, Flame, ArrowLeft,
  BarChart3, Clock, Target,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UserListItem {
  id: string;
  displayName: string;
  username: string;
  role: string;
  examTrack: string | null;
  createdAt: string;
  _count: {
    topicKnowledge: number;
    dailyStudies: number;
    exams: number;
    kazanimProgress: number;
  };
}

interface UserDetail {
  user: {
    id: string;
    displayName: string;
    username: string;
    examTrack: string | null;
    createdAt: string;
  };
  summary: {
    avgKnowledge: number;
    knowledgeByLevel: number[];
    totalKnowledge: number;
    totalStudySessions: number;
    totalQuestions: number;
    totalCorrect: number;
    totalWrong: number;
    correctRate: number;
    examCount: number;
    avgNet: number;
    checkedKazanim: number;
    totalKazanim: number;
    streak: { currentStreak: number; longestStreak: number; lastActiveDate: string } | null;
  };
  topicKnowledge: Array<{
    topicName: string;
    subject: string;
    exam: string;
    level: number;
    updatedAt: string;
  }>;
  recentStudies: Array<{
    date: string;
    subject: string;
    topic: string;
    questionCount: number;
    correctCount: number;
    wrongCount: number;
    emptyCount: number;
    duration: number | null;
    source: string | null;
  }>;
  recentExams: Array<{
    id: string;
    title: string;
    date: string;
    examType: string;
    totalNet: number;
    subjects: Array<{
      name: string;
      correct: number;
      wrong: number;
      empty: number;
      net: number;
    }>;
  }>;
  kazanimProgress: {
    checked: number;
    total: number;
    recent: Array<{
      code: string;
      description: string;
      topic: string;
      subject: string;
      checked: boolean;
      notes: string | null;
      updatedAt: string;
    }>;
  };
  cognitiveStates: Array<{
    concept: string;
    domain: string;
    mastery: number;
    strength: number;
    successCount: number;
    lastTested: string | null;
  }>;
}

// ---------------------------------------------------------------------------
// Level bar helper
// ---------------------------------------------------------------------------

function LevelBar({ level, max = 5 }: { level: number; max?: number }) {
  const pct = (level / max) * 100;
  const color =
    level <= 1 ? "bg-red-500" :
    level <= 2 ? "bg-orange-500" :
    level <= 3 ? "bg-yellow-500" :
    level <= 4 ? "bg-emerald-500" :
    "bg-cyan-400";
  return (
    <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function UserOverview() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailTab, setDetailTab] = useState<"knowledge" | "studies" | "exams" | "kazanim" | "cognitive">("knowledge");

  // --- Fetch user list ---
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/user-overview");
      if (res.ok) setUsers(await res.json());
    } catch {
      toast.error("Kullanicilar yuklenemedi");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // --- Fetch user detail ---
  const fetchDetail = useCallback(async (userId: string) => {
    setLoadingDetail(true);
    setDetail(null);
    try {
      const res = await fetch(`/api/admin/user-overview?userId=${userId}`);
      if (res.ok) setDetail(await res.json());
    } catch {
      toast.error("Kullanici bilgileri yuklenemedi");
    }
    setLoadingDetail(false);
  }, []);

  useEffect(() => {
    if (selectedUserId) fetchDetail(selectedUserId);
  }, [selectedUserId, fetchDetail]);

  // --- Formatters ---
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
  const fmtShort = (d: string) => new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="glass-panel overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-b border-white/10">
        {selectedUserId && (
          <button
            onClick={() => { setSelectedUserId(null); setDetail(null); }}
            className="p-1.5 rounded-lg bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white/80 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Users size={18} />
        </div>
        <div>
          <h2 className="text-base font-black tracking-wider text-white/90">
            {selectedUserId && detail ? detail.user.displayName.toUpperCase() : "KULLANICI TAKIBI"}
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-0.5">
            {selectedUserId ? "Mufredat, calisma ve test bilgileri" : `${users.length} kullanici`}
          </p>
        </div>
      </div>

      {/* User list */}
      {!selectedUserId && (
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-xs text-white/30 text-center py-8">Kullanici bulunamadi</p>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <motion.button
                  key={u.id}
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedUserId(u.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-cyan-500/20 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center text-sm font-black text-cyan-400">
                    {u.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white/90">{u.displayName}</span>
                      {u.examTrack && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400/70 font-bold uppercase">
                          {u.examTrack}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-white/40">
                      <span>{u._count.topicKnowledge} konu</span>
                      <span>{u._count.dailyStudies} calisma</span>
                      <span>{u._count.exams} deneme</span>
                      <span>{u._count.kazanimProgress} kazanim</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-white/20" />
                </motion.button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* User detail */}
      {selectedUserId && (
        <div className="p-4">
          {loadingDetail ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            </div>
          ) : detail ? (
            <div className="space-y-4">
              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">
                    <BookOpen size={12} />Bilgi Seviyesi
                  </div>
                  <div className="text-2xl font-black text-white/90">{detail.summary.avgKnowledge}</div>
                  <div className="text-[9px] text-white/30">{detail.summary.totalKnowledge} konu</div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">
                    <BarChart3 size={12} />Calisma
                  </div>
                  <div className="text-2xl font-black text-white/90">{detail.summary.totalStudySessions}</div>
                  <div className="text-[9px] text-white/30">{detail.summary.totalQuestions} soru, %{detail.summary.correctRate} dogru</div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-1">
                    <GraduationCap size={12} />Denemeler
                  </div>
                  <div className="text-2xl font-black text-white/90">{detail.summary.examCount}</div>
                  <div className="text-[9px] text-white/30">Ort. {detail.summary.avgNet} net</div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-[10px] text-orange-400 font-bold uppercase tracking-widest mb-1">
                    <Flame size={12} />Seri
                  </div>
                  <div className="text-2xl font-black text-white/90">{detail.summary.streak?.currentStreak ?? 0}</div>
                  <div className="text-[9px] text-white/30">En uzun: {detail.summary.streak?.longestStreak ?? 0} gun</div>
                </div>
              </div>

              {/* Knowledge distribution bar */}
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-2">
                  Bilgi Seviyesi Dagilimi
                </div>
                <div className="flex gap-1 h-6">
                  {detail.summary.knowledgeByLevel.map((count, lvl) => {
                    const total = detail.summary.totalKnowledge || 1;
                    const pct = (count / total) * 100;
                    const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-emerald-500", "bg-cyan-400"];
                    return pct > 0 ? (
                      <div
                        key={lvl}
                        className={`${colors[lvl]} rounded-sm flex items-center justify-center transition-all`}
                        style={{ width: `${Math.max(pct, 3)}%` }}
                        title={`Seviye ${lvl}: ${count} konu`}
                      >
                        <span className="text-[8px] font-black text-black/60">{count > 0 ? count : ""}</span>
                      </div>
                    ) : null;
                  })}
                </div>
                <div className="flex justify-between mt-1 text-[8px] text-white/20">
                  <span>0 - Bilmiyor</span>
                  <span>5 - Cok iyi</span>
                </div>
              </div>

              {/* Detail tabs */}
              <div className="flex gap-1.5 overflow-x-auto">
                {([
                  { key: "knowledge", label: "KONU BILGISI", icon: BookOpen },
                  { key: "studies", label: "CALISMALAR", icon: Clock },
                  { key: "exams", label: "DENEMELER", icon: GraduationCap },
                  { key: "kazanim", label: "KAZANIMLAR", icon: CheckCircle2 },
                  { key: "cognitive", label: "BILISSEL", icon: Brain },
                ] as const).map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setDetailTab(key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold tracking-wide whitespace-nowrap transition-colors ${
                      detailTab === key
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                        : "bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.06]"
                    }`}
                  >
                    <Icon size={12} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="max-h-[500px] overflow-y-auto space-y-1">
                {/* KNOWLEDGE TAB */}
                {detailTab === "knowledge" && (
                  detail.topicKnowledge.length === 0 ? (
                    <p className="text-xs text-white/30 py-4 text-center">Konu bilgisi yok</p>
                  ) : (
                    detail.topicKnowledge.map((tk, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] px-1 py-0.5 rounded bg-white/[0.06] text-white/30 font-bold">
                              {tk.exam}
                            </span>
                            <span className="text-[10px] text-white/40">{tk.subject}</span>
                          </div>
                          <div className="text-[11px] text-white/70 font-medium truncate">{tk.topicName}</div>
                        </div>
                        <div className="w-20 flex-shrink-0">
                          <LevelBar level={tk.level} />
                          <div className="text-[9px] text-white/30 text-right mt-0.5">Seviye {tk.level}</div>
                        </div>
                      </div>
                    ))
                  )
                )}

                {/* STUDIES TAB */}
                {detailTab === "studies" && (
                  detail.recentStudies.length === 0 ? (
                    <p className="text-xs text-white/30 py-4 text-center">Calisma verisi yok</p>
                  ) : (
                    detail.recentStudies.map((ds, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-white/40">{fmtShort(ds.date)}</span>
                            <span className="text-[10px] text-white/30">{ds.subject}</span>
                          </div>
                          <div className="text-[11px] text-white/70 font-medium truncate">{ds.topic}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-[11px]">
                            <span className="text-emerald-400 font-bold">{ds.correctCount}D</span>
                            <span className="text-white/20 mx-0.5">/</span>
                            <span className="text-red-400 font-bold">{ds.wrongCount}Y</span>
                            {ds.emptyCount > 0 && (
                              <>
                                <span className="text-white/20 mx-0.5">/</span>
                                <span className="text-white/30">{ds.emptyCount}B</span>
                              </>
                            )}
                          </div>
                          <div className="text-[9px] text-white/20">
                            {ds.questionCount} soru{ds.duration ? ` · ${ds.duration}dk` : ""}
                          </div>
                        </div>
                      </div>
                    ))
                  )
                )}

                {/* EXAMS TAB */}
                {detailTab === "exams" && (
                  detail.recentExams.length === 0 ? (
                    <p className="text-xs text-white/30 py-4 text-center">Deneme verisi yok</p>
                  ) : (
                    detail.recentExams.map((e) => (
                      <div key={e.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[11px] text-white/80 font-bold">{e.title}</span>
                            <span className="text-[10px] text-white/30 ml-2">{fmtShort(e.date)}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] text-white/40 font-bold mr-2">{e.examType}</span>
                            <span className="text-sm font-black text-cyan-400">{e.totalNet.toFixed(1)}</span>
                            <span className="text-[9px] text-white/30 ml-0.5">net</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                          {e.subjects.map((s, si) => (
                            <div key={si} className="flex items-center justify-between px-2 py-1 rounded bg-white/[0.02] text-[10px]">
                              <span className="text-white/40 truncate mr-1">{s.name}</span>
                              <span className="text-white/60 font-bold">{s.net?.toFixed(1)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )
                )}

                {/* KAZANIM TAB */}
                {detailTab === "kazanim" && (
                  <>
                    <div className="flex items-center gap-2 mb-2 text-[11px]">
                      <Target size={14} className="text-emerald-400" />
                      <span className="text-white/60 font-bold">
                        {detail.kazanimProgress.checked}/{detail.kazanimProgress.total} kazanim tamamlandi
                      </span>
                    </div>
                    {detail.kazanimProgress.recent.length === 0 ? (
                      <p className="text-xs text-white/30 py-4 text-center">Kazanim ilerleme verisi yok</p>
                    ) : (
                      detail.kazanimProgress.recent.map((kp, i) => (
                        <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                          <div className={`mt-0.5 ${kp.checked ? "text-emerald-400" : "text-white/15"}`}>
                            <CheckCircle2 size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-mono text-emerald-400/60">{kp.code}</span>
                              <span className="text-[9px] text-white/20">{kp.subject} · {kp.topic}</span>
                            </div>
                            <div className="text-[11px] text-white/60 mt-0.5">{kp.description}</div>
                            {kp.notes && <div className="text-[10px] text-white/30 mt-0.5 italic">{kp.notes}</div>}
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}

                {/* COGNITIVE TAB */}
                {detailTab === "cognitive" && (
                  detail.cognitiveStates.length === 0 ? (
                    <p className="text-xs text-white/30 py-4 text-center">Bilissel durum verisi yok</p>
                  ) : (
                    detail.cognitiveStates.map((cs, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] px-1 py-0.5 rounded bg-white/[0.06] text-white/30 font-bold">
                              {cs.domain}
                            </span>
                          </div>
                          <div className="text-[11px] text-white/70 font-medium truncate">{cs.concept}</div>
                        </div>
                        <div className="w-24 flex-shrink-0">
                          <LevelBar level={cs.mastery} max={1} />
                          <div className="flex justify-between mt-0.5 text-[9px] text-white/30">
                            <span>{(cs.mastery * 100).toFixed(0)}%</span>
                            <span>{cs.successCount}x</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-white/30 text-center py-8">Veri yuklenemedi</p>
          )}
        </div>
      )}
    </div>
  );
}
