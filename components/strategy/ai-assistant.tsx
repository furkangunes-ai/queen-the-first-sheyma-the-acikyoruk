"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import {
  Send,
  Mic,
  MicOff,
  Trash2,
  Loader2,
  Bot,
  User,
} from "lucide-react";
import { useVoiceInput } from "@/hooks/useVoiceInput";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatMessage {
  id?: string;
  role: string;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AIAssistant() {
  // ---- State ---------------------------------------------------------------
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(true);

  // Track whether the current input originated from voice
  const wasVoiceRef = useRef(false);

  // ---- Refs ----------------------------------------------------------------
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ---- Voice ---------------------------------------------------------------
  const {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    clearTranscript,
  } = useVoiceInput();

  // ---- Helpers -------------------------------------------------------------

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const autoResizeTextarea = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, []);

  // ---- Load history on mount -----------------------------------------------

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/ai/chat/history?limit=50");
        if (res.ok) {
          const data: ChatMessage[] = await res.json();
          setMessages(data);
        }
      } catch {
        // silently fail – user can still chat
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  // ---- Auto-scroll when messages change ------------------------------------

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ---- Voice transcript sync -----------------------------------------------

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
      wasVoiceRef.current = true;
      autoResizeTextarea();
    }
  }, [transcript, autoResizeTextarea]);

  // When listening stops and there is a transcript, keep it in input
  useEffect(() => {
    if (!isListening && transcript) {
      setInput(transcript);
      wasVoiceRef.current = true;
      clearTranscript();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  // ---- Send message --------------------------------------------------------

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const wasVoice = wasVoiceRef.current;
    wasVoiceRef.current = false;

    // Optimistically add user message
    const userMsg: ChatMessage = {
      role: "user",
      content: trimmed,
      metadata: wasVoice ? { voiceInput: true } : undefined,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Placeholder assistant message for streaming
    const assistantMsg: ChatMessage = {
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          metadata: { voiceInput: wasVoice },
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Stream failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let partialText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        partialText += decoder.decode(value, { stream: true });

        // Update the last assistant message in-place
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === "assistant") {
            updated[updated.length - 1] = { ...last, content: partialText };
          }
          return updated;
        });
      }
    } catch {
      // On error replace assistant placeholder with error text
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.role === "assistant" && !last.content) {
          updated[updated.length - 1] = {
            ...last,
            content: "Bir hata olustu. Lutfen tekrar deneyin.",
          };
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming]);

  // ---- Clear history -------------------------------------------------------

  const handleClearHistory = useCallback(async () => {
    if (!window.confirm("Sohbet gecmisini silmek istediginize emin misiniz?")) {
      return;
    }
    try {
      await fetch("/api/ai/chat/history", { method: "DELETE" });
      setMessages([]);
    } catch {
      // ignore
    }
  }, []);

  // ---- Toggle voice --------------------------------------------------------

  const toggleVoice = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // ---- Keyboard handling ---------------------------------------------------

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ---- Typing indicator ----------------------------------------------------

  const TypingIndicator = () => (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-pink-400"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );

  // ---- Render --------------------------------------------------------------

  return (
    <div className="flex h-full flex-col bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-pink-500/15 bg-white/5 px-5 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/30 to-amber-400/20">
            <Bot className="h-5 w-5 text-pink-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white/90">
              YKS Asistan
            </h2>
            <p className="text-xs text-white/50">
              Yapay zeka destekli calisma arkadasi
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-white/50 transition-colors hover:bg-white/5 hover:text-pink-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Gecmisi Temizle
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-pink-400/60" />
          </div>
        ) : messages.length === 0 ? (
          /* Empty state */
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/20 to-amber-400/15 backdrop-blur"
            >
              <Bot className="h-8 w-8 text-pink-400" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="max-w-md text-sm leading-relaxed text-white/60"
            >
              Merhaba! Ben YKS hazirlik asistanin. Calisma planin, deneme
              sonuclarin ve konu durumun hakkinda konusabiliriz. Ne sormak
              istersin?
            </motion.p>
          </div>
        ) : (
          /* Message list */
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => {
                const isUser = msg.role === "user";
                const isAssistant = msg.role === "assistant";
                const isStreamingThis =
                  isStreaming &&
                  isAssistant &&
                  idx === messages.length - 1 &&
                  !msg.content;

                return (
                  <motion.div
                    key={msg.id ?? `msg-${idx}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`relative max-w-[85%] rounded-2xl px-4 py-3 ${
                        isUser
                          ? "bg-gradient-to-br from-pink-500/20 to-pink-600/20 text-white/90"
                          : "border border-pink-500/15 bg-white/5 text-white/90 backdrop-blur"
                      }`}
                    >
                      {/* Role icon */}
                      <div
                        className={`mb-1.5 flex items-center gap-2 text-xs font-medium ${
                          isUser ? "text-pink-400" : "text-amber-400"
                        }`}
                      >
                        {isUser ? (
                          <User className="h-3.5 w-3.5" />
                        ) : (
                          <Bot className="h-3.5 w-3.5" />
                        )}
                        <span>{isUser ? "Sen" : "Asistan"}</span>
                        {!!msg.metadata?.voiceInput && (
                          <Mic className="h-3 w-3 text-pink-400/60" />
                        )}
                      </div>

                      {/* Content */}
                      {isStreamingThis ? (
                        <TypingIndicator />
                      ) : isAssistant ? (
                        <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:text-white/90 prose-strong:text-pink-300 prose-code:rounded prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-amber-300 prose-pre:bg-white/5 prose-pre:border prose-pre:border-pink-500/10">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {msg.content}
                        </p>
                      )}

                      {/* Timestamp */}
                      <p className="mt-2 text-right text-[10px] text-white/30">
                        {format(new Date(msg.createdAt), "HH:mm")}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-pink-500/15 bg-white/5 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          {/* Voice button */}
          {isSupported && (
            <button
              type="button"
              onClick={toggleVoice}
              disabled={isStreaming}
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all ${
                isListening
                  ? "animate-pulse bg-red-500/20 text-red-400 ring-2 ring-red-500/40"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
              } disabled:pointer-events-none disabled:opacity-40`}
              aria-label={isListening ? "Dinlemeyi durdur" : "Sesli giris"}
            >
              {isListening ? (
                <MicOff className="h-4.5 w-4.5" />
              ) : (
                <Mic className="h-4.5 w-4.5" />
              )}
            </button>
          )}

          {/* Textarea */}
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                wasVoiceRef.current = false;
                autoResizeTextarea();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Mesajinizi yazin..."
              disabled={isStreaming}
              rows={1}
              className="w-full resize-none rounded-xl border border-pink-500/15 bg-white/5 px-4 py-2.5 text-sm text-white/90 placeholder-white/30 backdrop-blur transition-colors focus:border-pink-500/30 focus:outline-none focus:ring-1 focus:ring-pink-500/20 disabled:opacity-50"
              style={{ maxHeight: 160 }}
            />
          </div>

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg shadow-pink-500/20 transition-all hover:shadow-pink-500/30 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
            aria-label="Mesaj gonder"
          >
            {isStreaming ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <Send className="h-4.5 w-4.5" />
            )}
          </button>
        </div>

        {/* Voice listening indicator */}
        <AnimatePresence>
          {isListening && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 text-center text-xs text-red-400"
            >
              Dinleniyor... Konusmanizi bitirdiginde otomatik durur.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
