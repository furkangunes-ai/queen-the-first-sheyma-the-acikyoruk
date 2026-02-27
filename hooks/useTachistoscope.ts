import { useState, useRef, useCallback, useEffect } from "react";
import { generateTachistoscopeItem } from "@/lib/speed-reading-data";

export type TachistoscopeMode = "word" | "phrase" | "number";
export type TachistoscopePhase =
  | "setup"
  | "countdown"
  | "showing"
  | "answering"
  | "feedback"
  | "results";

export interface TachistoscopeItem {
  shown: string;
  answer: string;
  correct: boolean;
}

interface TachistoscopeConfig {
  mode: TachistoscopeMode;
  displayMs: number;
  itemCount: number;
  difficulty: number; // 1-5
}

export function useTachistoscope(config: TachistoscopeConfig) {
  const [phase, setPhase] = useState<TachistoscopePhase>("setup");
  const [currentItem, setCurrentItem] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [items, setItems] = useState<TachistoscopeItem[]>([]);
  const [displayMs, setDisplayMs] = useState(config.displayMs);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  const correctCount = items.filter((i) => i.correct).length;
  const totalAnswered = items.length;
  const isFinished = phase === "results";
  const accuracy =
    totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
  }, []);

  const generateNextItem = useCallback(() => {
    return generateTachistoscopeItem(config.mode, config.difficulty);
  }, [config.mode, config.difficulty]);

  const showItem = useCallback(() => {
    const item = generateNextItem();
    setCurrentItem(item);
    setPhase("showing");

    // Hide after displayMs
    timerRef.current = setTimeout(() => {
      setPhase("answering");
    }, displayMs);
  }, [generateNextItem, displayMs]);

  const start = useCallback(() => {
    setItems([]);
    setCurrentIndex(0);
    setDisplayMs(config.displayMs);
    setElapsedSeconds(0);
    startTimeRef.current = Date.now();

    // Start elapsed timer
    elapsedRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    // Brief countdown before first item
    setPhase("countdown");
    timerRef.current = setTimeout(() => {
      const item = generateTachistoscopeItem(config.mode, config.difficulty);
      setCurrentItem(item);
      setPhase("showing");

      timerRef.current = setTimeout(() => {
        setPhase("answering");
      }, config.displayMs);
    }, 1500);
  }, [config.displayMs, config.mode, config.difficulty]);

  const submitAnswer = useCallback(
    (answer: string) => {
      if (phase !== "answering") return;

      const normalizedAnswer = answer.trim().toLowerCase();
      const normalizedShown = currentItem.trim().toLowerCase();
      const isCorrect = normalizedAnswer === normalizedShown;

      const newItem: TachistoscopeItem = {
        shown: currentItem,
        answer: answer.trim(),
        correct: isCorrect,
      };

      const updatedItems = [...items, newItem];
      setItems(updatedItems);

      // Show feedback
      setPhase("feedback");

      const nextIndex = currentIndex + 1;

      timerRef.current = setTimeout(() => {
        if (nextIndex >= config.itemCount) {
          // All items done
          setPhase("results");
          if (elapsedRef.current) {
            clearInterval(elapsedRef.current);
          }
          setElapsedSeconds(
            Math.floor((Date.now() - startTimeRef.current) / 1000)
          );
        } else {
          setCurrentIndex(nextIndex);

          // Adaptive difficulty: decrease displayMs if accuracy > 80%
          const answeredSoFar = updatedItems.length;
          if (answeredSoFar >= 5 && answeredSoFar % 5 === 0) {
            const recentCorrect = updatedItems
              .slice(-5)
              .filter((i) => i.correct).length;
            if (recentCorrect >= 4) {
              setDisplayMs((ms) => Math.max(50, ms - 50));
            }
          }

          // Show next item
          const item = generateTachistoscopeItem(
            config.mode,
            config.difficulty
          );
          setCurrentItem(item);
          setPhase("showing");

          timerRef.current = setTimeout(() => {
            setPhase("answering");
          }, displayMs);
        }
      }, Math.max(500, displayMs * 3)); // proportional feedback display
    },
    [
      phase,
      currentItem,
      items,
      currentIndex,
      config.itemCount,
      config.mode,
      config.difficulty,
      displayMs,
    ]
  );

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    setPhase("setup");
    setCurrentItem("");
    setCurrentIndex(0);
    setItems([]);
    setDisplayMs(config.displayMs);
    setElapsedSeconds(0);
  }, [config.displayMs]);

  return {
    phase,
    currentItem,
    currentIndex,
    items,
    correctCount,
    totalAnswered,
    accuracy,
    isFinished,
    displayMs,
    elapsedSeconds,
    itemCount: config.itemCount,
    start,
    submitAnswer,
    reset,
  };
}
