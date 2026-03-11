"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Upload, Loader2, CheckCircle2, XCircle, Copy, FileJson,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Example JSON
// ---------------------------------------------------------------------------

const EXAMPLE_JSON = `{
  "nodes": [
    {
      "name": "Doğal Sayılar",
      "slug": "dogal-sayilar",
      "domain": "Matematik",
      "examType": "tyt",
      "complexityScore": 2
    },
    {
      "name": "Tam Sayılar",
      "slug": "tam-sayilar",
      "domain": "Matematik",
      "examType": "tyt",
      "complexityScore": 3
    },
    {
      "name": "Rasyonel Sayılar",
      "slug": "rasyonel-sayilar",
      "domain": "Matematik",
      "examType": "tyt",
      "complexityScore": 4
    }
  ],
  "edges": [
    {
      "parentSlug": "dogal-sayilar",
      "childSlug": "tam-sayilar",
      "dependencyWeight": 0.8
    },
    {
      "parentSlug": "tam-sayilar",
      "childSlug": "rasyonel-sayilar",
      "dependencyWeight": 0.7
    }
  ]
}`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BulkImport() {
  const [jsonInput, setJsonInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    nodesCreated: number;
    nodesSkipped: number;
    edgesCreated: number;
    edgesSkipped: number;
    errors: string[];
  } | null>(null);

  // --- Preview ---
  const preview = (() => {
    if (!jsonInput.trim()) return null;
    try {
      const parsed = JSON.parse(jsonInput);
      return {
        nodeCount: parsed.nodes?.length || 0,
        edgeCount: parsed.edges?.length || 0,
        valid: true,
      };
    } catch {
      return { nodeCount: 0, edgeCount: 0, valid: false };
    }
  })();

  // --- Submit ---
  const handleSubmit = async () => {
    setResult(null);
    let parsed: any;
    try {
      parsed = JSON.parse(jsonInput);
    } catch {
      toast.error("Geçersiz JSON formatı");
      return;
    }

    if (!parsed.nodes || !Array.isArray(parsed.nodes)) {
      toast.error("JSON'da 'nodes' dizisi zorunludur");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/cognitive/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonInput,
      });
      const data = await res.json();

      if (res.ok) {
        setResult(data);
        toast.success(`${data.nodesCreated} kavram, ${data.edgesCreated} bağlantı oluşturuldu`);
        if (data.errors.length === 0) setJsonInput("");
      } else {
        toast.error(data.error || "Import başarısız");
      }
    } catch {
      toast.error("Ağ hatası");
    }
    setSubmitting(false);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="glass-panel overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Upload size={18} />
          </div>
          <div>
            <h2 className="text-base font-black tracking-wider text-white/90">
              TOPLU KAVRAM İMPORT
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-0.5">
              JSON ile kavram ve bağlantı ekle
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setJsonInput(EXAMPLE_JSON);
            setResult(null);
            toast.info("Örnek JSON yapıştırıldı");
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-colors"
        >
          <Copy size={12} />
          Örnek JSON
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* JSON Input */}
        <textarea
          value={jsonInput}
          onChange={(e) => { setJsonInput(e.target.value); setResult(null); }}
          placeholder='{ "nodes": [...], "edges": [...] }'
          className="w-full h-64 px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white/80 font-mono placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-amber-500/40 resize-y"
          spellCheck={false}
        />

        {/* Preview */}
        {preview && (
          <div className={`flex items-center gap-4 px-4 py-2.5 rounded-lg text-xs ${
            preview.valid
              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              : "bg-red-500/10 text-red-300 border border-red-500/20"
          }`}>
            {preview.valid ? (
              <>
                <FileJson size={14} />
                <span className="font-bold">{preview.nodeCount} kavram + {preview.edgeCount} bağlantı</span>
                <span className="text-white/30">hazır</span>
              </>
            ) : (
              <>
                <XCircle size={14} />
                <span className="font-bold">Geçersiz JSON</span>
              </>
            )}
          </div>
        )}

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-lg bg-white/[0.03] border border-white/10 space-y-2"
            >
              <div className="flex items-center gap-4 text-xs">
                <span className="font-bold text-emerald-400">
                  <CheckCircle2 size={12} className="inline mr-1" />
                  {result.nodesCreated} kavram oluşturuldu
                </span>
                <span className="font-bold text-emerald-400">
                  {result.edgesCreated} bağlantı oluşturuldu
                </span>
                {result.nodesSkipped > 0 && (
                  <span className="font-bold text-amber-400">
                    {result.nodesSkipped} kavram atlandı
                  </span>
                )}
                {result.edgesSkipped > 0 && (
                  <span className="font-bold text-amber-400">
                    {result.edgesSkipped} bağlantı atlandı
                  </span>
                )}
              </div>
              {result.errors.length > 0 && (
                <div className="mt-2 text-[10px] text-red-300/80 max-h-32 overflow-y-auto space-y-0.5">
                  {result.errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <XCircle size={10} className="mt-0.5 flex-shrink-0" />
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={submitting || !jsonInput.trim() || (preview !== null && !preview.valid)}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black tracking-widest bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload size={14} />
          )}
          {submitting ? "İMPORT EDİLİYOR..." : "İMPORT ET"}
        </motion.button>
      </div>
    </div>
  );
}
