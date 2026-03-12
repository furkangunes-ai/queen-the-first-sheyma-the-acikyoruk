"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Wand2, Loader2, Check, X, CheckCheck, SquareCheck, Square,
  Send, Sparkles, ArrowRight, AlertTriangle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Suggestion {
  type: "topic" | "kazanim";
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  reason: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AICurriculumEditor() {
  const [message, setMessage] = useState("");
  const [scope, setScope] = useState<"all" | "topics" | "kazanimlar">("all");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [applying, setApplying] = useState(false);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [applied, setApplied] = useState(false);

  // --- Fetch AI suggestions ---
  const fetchSuggestions = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setSuggestions([]);
    setSelected(new Set());
    setApplied(false);

    try {
      const res = await fetch("/api/admin/ai-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim(), scope }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuggestions(data.suggestions || []);
        setTokensUsed(data.tokensUsed || 0);
        // Auto-select all
        setSelected(new Set(data.suggestions?.map((_: any, i: number) => i) || []));
        if (data.suggestions?.length === 0) {
          toast.info("AI herhangi bir duzeltme onerisi bulamadi");
        } else {
          toast.success(`${data.suggestions.length} duzeltme onerisi bulundu`);
        }
      } else {
        toast.error(data.error || "Hata olustu");
      }
    } catch {
      toast.error("Ag hatasi");
    }
    setLoading(false);
  };

  // --- Apply selected suggestions ---
  const applySelected = async () => {
    const edits = suggestions
      .filter((_, i) => selected.has(i))
      .map((s) => ({ type: s.type, id: s.id, field: s.field, newValue: s.newValue }));

    if (edits.length === 0) {
      toast.error("Onaylanacak duzeltme secilmedi");
      return;
    }

    setApplying(true);
    try {
      const res = await fetch("/api/admin/ai-edit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ edits }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setApplied(true);
      } else {
        toast.error(data.error || "Uygulama basarisiz");
      }
    } catch {
      toast.error("Ag hatasi");
    }
    setApplying(false);
  };

  // --- Toggle selection ---
  const toggleSelect = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(suggestions.map((_, i) => i)));
  const selectNone = () => setSelected(new Set());

  // --- Quick presets ---
  const presets = [
    { label: "Turkce karakter duzelt", msg: "Tum konu adlarinda ve kazanim aciklamalarinda Turkce karakter eksikliklerini duzelt. Ornekler: u→u, o→o, c→c, s→s, g→g gibi. Sadece goruntulenen isimleri duzelt." },
    { label: "Buyuk/kucuk harf duzelt", msg: "Konu adlarinda buyuk-kucuk harf kurallarini duzelt. Her kelimenin ilk harfi buyuk olmali (edatlar haric)." },
    { label: "Yazim hatalari duzelt", msg: "Turkce yazim kurallarini uygula: ses uyumu, uzun unluler, cift unsuzler vb. Sadece yazim hatalari, anlam degisikligi yapma." },
  ];

  return (
    <div className="glass-panel overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-b border-white/10">
        <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
          <Wand2 size={18} />
        </div>
        <div>
          <h2 className="text-base font-black tracking-wider text-white/90">
            AI ILE MUFREDAT DUZENLEME
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-0.5">
            Talimat ver → AI onersin → Sen onayla
          </p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Preset buttons */}
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => setMessage(p.msg)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 transition-colors"
            >
              <Sparkles size={10} />
              {p.label}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className="space-y-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ne duzenlenmeli? Ornegin: 'Turkce karakter eksikliklerini duzelt', 'Buyuk harf kurallarini uygula'..."
            className="w-full h-24 px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500/40 resize-y"
          />

          <div className="flex items-center gap-3">
            {/* Scope selector */}
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="text-white/40 font-bold uppercase tracking-widest">Kapsam:</span>
              {(["all", "topics", "kazanimlar"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setScope(s)}
                  className={`px-2.5 py-1 rounded-lg font-bold tracking-wide transition-colors ${
                    scope === s
                      ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                      : "bg-white/[0.04] text-white/40 border border-white/10 hover:bg-white/[0.08]"
                  }`}
                >
                  {s === "all" ? "TUMU" : s === "topics" ? "KONULAR" : "KAZANIMLAR"}
                </button>
              ))}
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchSuggestions}
              disabled={loading || !message.trim()}
              className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black tracking-widest bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send size={14} />
              )}
              {loading ? "ANALIZ EDILIYOR..." : "AI'A SOR"}
            </motion.button>
          </div>
        </div>

        {/* Suggestions list */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* Selection controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black tracking-wider text-white/60">
                    {suggestions.length} ONERI BULUNDU
                  </span>
                  <span className="text-[10px] text-white/30">
                    ({selected.size} secili)
                  </span>
                  {tokensUsed > 0 && (
                    <span className="text-[9px] text-white/20 font-mono">
                      {tokensUsed} token
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAll}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-colors"
                  >
                    <CheckCheck size={12} />
                    Tumunu Sec
                  </button>
                  <button
                    onClick={selectNone}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-colors"
                  >
                    <X size={12} />
                    Temizle
                  </button>
                </div>
              </div>

              {/* Suggestion cards */}
              <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                {suggestions.map((s, idx) => {
                  const isSelected = selected.has(idx);
                  return (
                    <motion.div
                      key={`${s.type}-${s.id}-${s.field}-${idx}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      onClick={() => toggleSelect(idx)}
                      className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                        isSelected
                          ? "bg-violet-500/10 border-violet-500/20"
                          : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
                      }`}
                    >
                      {/* Checkbox */}
                      <div className="mt-0.5 flex-shrink-0">
                        {isSelected ? (
                          <SquareCheck size={16} className="text-violet-400" />
                        ) : (
                          <Square size={16} className="text-white/20" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                            s.type === "topic"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-emerald-500/20 text-emerald-400"
                          }`}>
                            {s.type === "topic" ? "KONU" : "KAZANIM"}
                          </span>
                          <span className="text-[9px] text-white/30 font-mono">{s.field}</span>
                          <span className="text-[9px] text-white/20">{s.reason}</span>
                        </div>

                        {/* Old → New */}
                        <div className="flex items-start gap-2 text-[11px]">
                          <span className="text-red-400/70 line-through flex-1 break-all">
                            {s.oldValue}
                          </span>
                          <ArrowRight size={12} className="text-white/20 mt-0.5 flex-shrink-0" />
                          <span className="text-emerald-400 flex-1 break-all font-medium">
                            {s.newValue}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Apply button */}
              {!applied ? (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={applySelected}
                  disabled={applying || selected.size === 0}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-xs font-black tracking-widest bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {applying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  {applying ? "UYGULANIYOR..." : `${selected.size} DUZELTMEYI ONAYLA VE UYGULA`}
                </motion.button>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                  <CheckCheck size={16} />
                  Duzeltmeler basariyla uygulandi
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Warning note */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[10px] text-amber-400/60">
          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
          <span>
            AI onerileri kontrol edin. Slug/id gibi teknik alanlar degistirilmez, sadece goruntulenen metinler duzeltilir.
          </span>
        </div>
      </div>
    </div>
  );
}
