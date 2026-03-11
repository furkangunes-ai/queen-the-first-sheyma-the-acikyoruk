"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseContinuousVoiceInputOptions {
  onInterimTranscript?: (text: string) => void;
  onFinalChunk?: (text: string) => void;
}

export function useContinuousVoiceInput(options?: UseContinuousVoiceInputOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [fullTranscript, setFullTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const accumulatedRef = useRef("");
  const shouldRestartRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    setIsSupported(
      typeof window !== "undefined" &&
        !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    );
  }, []);

  // Timer for elapsed time
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (isListening && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isListening, isPaused]);

  const createRecognition = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "tr-TR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (finalText) {
        const separator = accumulatedRef.current.length > 0 ? " " : "";
        accumulatedRef.current += separator + finalText;
        setFullTranscript(accumulatedRef.current);
        options?.onFinalChunk?.(finalText);
      }

      setInterimText(interim);
      if (interim) {
        options?.onInterimTranscript?.(interim);
      }
    };

    recognition.onend = () => {
      // Auto-restart if we haven't explicitly stopped
      if (shouldRestartRef.current && !isPausedRef.current) {
        try {
          setTimeout(() => {
            if (shouldRestartRef.current && !isPausedRef.current) {
              const newRecognition = createRecognition();
              if (newRecognition) {
                recognitionRef.current = newRecognition;
                newRecognition.start();
              }
            }
          }, 100);
        } catch {
          // Failed to restart, stop gracefully
          setIsListening(false);
          shouldRestartRef.current = false;
        }
      } else if (!isPausedRef.current) {
        setIsListening(false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // "no-speech" and "aborted" are recoverable
      if (event.error === "no-speech" || event.error === "aborted") {
        return; // onend will handle restart
      }
      // For other errors, stop completely
      shouldRestartRef.current = false;
      setIsListening(false);
      setIsPaused(false);
      isPausedRef.current = false;
    };

    return recognition;
  }, [isSupported, options]);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    accumulatedRef.current = "";
    setFullTranscript("");
    setInterimText("");
    setElapsedSeconds(0);
    setIsPaused(false);
    isPausedRef.current = false;
    shouldRestartRef.current = true;

    const recognition = createRecognition();
    if (recognition) {
      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    }
  }, [isSupported, createRecognition]);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    isPausedRef.current = false;
    setIsPaused(false);
    recognitionRef.current?.stop();
    setIsListening(false);
    setInterimText("");
  }, []);

  const pauseListening = useCallback(() => {
    isPausedRef.current = true;
    setIsPaused(true);
    recognitionRef.current?.stop();
  }, []);

  const resumeListening = useCallback(() => {
    if (!isSupported) return;
    isPausedRef.current = false;
    setIsPaused(false);
    shouldRestartRef.current = true;

    const recognition = createRecognition();
    if (recognition) {
      recognitionRef.current = recognition;
      recognition.start();
    }
  }, [isSupported, createRecognition]);

  const clearTranscript = useCallback(() => {
    accumulatedRef.current = "";
    setFullTranscript("");
    setInterimText("");
    setElapsedSeconds(0);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return {
    isListening,
    isPaused,
    isSupported,
    fullTranscript,
    interimText,
    elapsedSeconds,
    formattedTime: formatTime(elapsedSeconds),
    startListening,
    stopListening,
    pauseListening,
    resumeListening,
    clearTranscript,
  };
}
