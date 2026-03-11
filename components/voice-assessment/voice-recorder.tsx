"use client";

import React from "react";
import { motion } from "motion/react";
import { Mic, MicOff, Pause, Play, Square, AlertCircle } from "lucide-react";

interface VoiceRecorderProps {
  isListening: boolean;
  isPaused: boolean;
  isSupported: boolean;
  formattedTime: string;
  fullTranscript: string;
  interimText: string;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
}

export function VoiceRecorder({
  isListening,
  isPaused,
  isSupported,
  formattedTime,
  fullTranscript,
  interimText,
  onStart,
  onStop,
  onPause,
  onResume,
}: VoiceRecorderProps) {
  if (!isSupported) {
    return (
      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
        <div className="flex items-center gap-2 text-amber-400">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Ses kaydı desteklenmiyor</span>
        </div>
        <p className="text-xs text-zinc-400 mt-2">
          Tarayıcınız ses tanıma özelliğini desteklemiyor. Chrome veya Edge
          kullanmanızı öneriyoruz.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {!isListening ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white font-medium transition-colors"
          >
            <Mic className="w-5 h-5" />
            Kayda Başla
          </motion.button>
        ) : (
          <>
            {/* Pause / Resume */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isPaused ? onResume : onPause}
              className="p-3 rounded-full border border-zinc-600 bg-zinc-800 hover:bg-zinc-700 transition-colors"
              title={isPaused ? "Devam Et" : "Duraklat"}
            >
              {isPaused ? (
                <Play className="w-5 h-5 text-cyan-400" />
              ) : (
                <Pause className="w-5 h-5 text-amber-400" />
              )}
            </motion.button>

            {/* Recording indicator */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-800 border border-zinc-700">
              {!isPaused && (
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-3 h-3 rounded-full bg-red-500"
                />
              )}
              {isPaused && <MicOff className="w-4 h-4 text-zinc-500" />}
              <span className="text-sm font-mono text-white">{formattedTime}</span>
            </div>

            {/* Stop */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStop}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400 font-medium transition-colors"
            >
              <Square className="w-4 h-4" />
              Kaydı Tamamla
            </motion.button>
          </>
        )}
      </div>

      {/* Transcript area */}
      {(isListening || fullTranscript) && (
        <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/50 p-4 max-h-60 overflow-y-auto">
          <div className="flex items-center gap-2 mb-2">
            <Mic className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Canlı Transkript</span>
          </div>
          <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
            {fullTranscript}
            {interimText && (
              <span className="text-zinc-500 italic"> {interimText}</span>
            )}
            {!fullTranscript && !interimText && isListening && (
              <span className="text-zinc-600 italic">Konuşmaya başlayın...</span>
            )}
          </div>
        </div>
      )}

      {/* Tips */}
      {!isListening && !fullTranscript && (
        <div className="rounded-lg bg-zinc-800/30 border border-zinc-700/30 p-3">
          <p className="text-xs text-zinc-500 font-medium mb-2">İpuçları:</p>
          <ul className="text-xs text-zinc-500 space-y-1">
            <li>• Konuları sırasıyla anlatabilirsin: &quot;1. konu tamam, 2. konuyu biraz biliyorum...&quot;</li>
            <li>• Konu adını söylemen yeterli: &quot;Türev iyi biliyorum, limit biraz zayıf...&quot;</li>
            <li>• Detay verebilirsin: &quot;Olasılıkta koşullu olasılık hariç biliyorum&quot;</li>
            <li>• İstediğin kadar uzun konuşabilirsin, duraklatma butonu var</li>
          </ul>
        </div>
      )}
    </div>
  );
}
