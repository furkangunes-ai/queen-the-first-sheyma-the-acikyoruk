import { useState, useRef, useCallback, useEffect } from "react";

const SENTENCE_END = /[.!?]$/;
const PUNCTUATION = /[.!?;:,]$/;

interface RSVPConfig {
  wpm: number;
  chunkSize: number;
  autoSpeed: boolean;
  autoSpeedIncrement: number;
  autoSpeedInterval: number;
  punctuationPause: boolean;
}

export function useRSVP(config: RSVPConfig) {
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [currentWpm, setCurrentWpm] = useState(config.wpm);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wordsReadSinceSpeedup = useRef(0);
  const initialWpmRef = useRef(config.wpm);

  // Derived
  const totalWords = words.length;
  const wordsRead = Math.min(currentIndex, totalWords);
  const progress = totalWords > 0 ? (wordsRead / totalWords) * 100 : 0;
  const currentChunk = words
    .slice(currentIndex, currentIndex + config.chunkSize)
    .join(" ");
  const remainingWords = totalWords - wordsRead;
  const estimatedRemainingSeconds =
    currentWpm > 0 ? (remainingWords / currentWpm) * 60 : 0;

  const loadText = useCallback(
    (text: string) => {
      const parsed = text
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0);
      setWords(parsed);
      setCurrentIndex(0);
      setIsPlaying(false);
      setIsFinished(false);
      setCurrentWpm(config.wpm);
      setElapsedSeconds(0);
      initialWpmRef.current = config.wpm;
      wordsReadSinceSpeedup.current = 0;
    },
    [config.wpm]
  );

  const getIntervalMs = useCallback(
    (chunkWords: string[]): number => {
      const base = (60000 / currentWpm) * config.chunkSize;
      const lastWord = chunkWords[chunkWords.length - 1] || "";
      if (config.punctuationPause && SENTENCE_END.test(lastWord)) {
        return base * 1.5;
      }
      if (config.punctuationPause && PUNCTUATION.test(lastWord)) {
        return base * 1.2;
      }
      return base;
    },
    [currentWpm, config.chunkSize, config.punctuationPause]
  );

  // Use setTimeout chain instead of setInterval for precision
  const scheduleNext = useCallback(() => {
    if (!isPlaying || isFinished) return;

    setCurrentIndex((prev) => {
      const next = prev + config.chunkSize;

      if (next >= totalWords) {
        setIsPlaying(false);
        setIsFinished(true);
        return totalWords;
      }

      // Auto speed
      if (config.autoSpeed) {
        wordsReadSinceSpeedup.current += config.chunkSize;
        if (wordsReadSinceSpeedup.current >= config.autoSpeedInterval) {
          wordsReadSinceSpeedup.current = 0;
          setCurrentWpm((w) => w + config.autoSpeedIncrement);
        }
      }

      return next;
    });
  }, [
    isPlaying,
    isFinished,
    config.chunkSize,
    config.autoSpeed,
    config.autoSpeedIncrement,
    config.autoSpeedInterval,
    totalWords,
  ]);

  // Main timer effect — setTimeout chain
  useEffect(() => {
    if (!isPlaying || isFinished || words.length === 0) {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const chunk = words.slice(currentIndex, currentIndex + config.chunkSize);
    const ms = getIntervalMs(chunk);

    intervalRef.current = setTimeout(() => {
      scheduleNext();
    }, ms);

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    isPlaying,
    isFinished,
    currentIndex,
    words,
    config.chunkSize,
    getIntervalMs,
    scheduleNext,
  ]);

  // Elapsed seconds counter
  useEffect(() => {
    if (isPlaying) {
      elapsedRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (elapsedRef.current) {
        clearInterval(elapsedRef.current);
        elapsedRef.current = null;
      }
    };
  }, [isPlaying]);

  // Sync WPM when not playing
  useEffect(() => {
    if (!isPlaying) {
      setCurrentWpm(config.wpm);
      initialWpmRef.current = config.wpm;
    }
  }, [config.wpm, isPlaying]);

  const play = useCallback(() => {
    if (isFinished || totalWords === 0) return;
    setIsPlaying(true);
  }, [isFinished, totalWords]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const restart = useCallback(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
    setIsFinished(false);
    setCurrentWpm(config.wpm);
    setElapsedSeconds(0);
    wordsReadSinceSpeedup.current = 0;
  }, [config.wpm]);

  const stop = useCallback(() => {
    setIsPlaying(false);
  }, []);

  return {
    words,
    currentIndex,
    isPlaying,
    isFinished,
    currentWpm,
    currentChunk,
    wordsRead,
    totalWords,
    elapsedSeconds,
    progress,
    estimatedRemainingSeconds,
    initialWpm: initialWpmRef.current,
    loadText,
    play,
    pause,
    restart,
    stop,
    setCurrentWpm,
  };
}
