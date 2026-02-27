import { useState, useRef, useCallback, useEffect } from "react";
import {
  getWordsForDifficulty,
  getRandomItems,
  generateDistractors,
} from "@/lib/speed-reading-data";

export type PeripheralPhase =
  | "setup"
  | "fixation"
  | "showing"
  | "answering"
  | "feedback"
  | "results";

export interface PeripheralRound {
  targetWords: string[];
  options: string[];
  selectedWords: string[];
  correct: boolean;
}

interface PeripheralConfig {
  level: number; // 1-10
}

// Level determines: number of words, display time, spread distance
function getLevelParams(level: number) {
  // Words shown at periphery
  const wordCount = level <= 3 ? 1 : level <= 6 ? 2 : 3;
  // Display time in ms (shorter = harder)
  const displayMs = Math.max(200, 600 - (level - 1) * 40);
  // Spread multiplier (higher = further from center)
  const spreadPercent = 15 + (level - 1) * 5; // 15-60% from center
  // Difficulty for word selection
  const difficulty = Math.ceil(level / 2);

  return { wordCount, displayMs, spreadPercent, difficulty };
}

const TOTAL_ROUNDS = 15;

export function usePeripheralVision(config: PeripheralConfig) {
  const [phase, setPhase] = useState<PeripheralPhase>("setup");
  const [currentRound, setCurrentRound] = useState(0);
  const [rounds, setRounds] = useState<PeripheralRound[]>([]);
  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  const correctCount = rounds.filter((r) => r.correct).length;
  const totalRounds = TOTAL_ROUNDS;
  const isFinished = phase === "results";
  const accuracy =
    rounds.length > 0 ? Math.round((correctCount / rounds.length) * 100) : 0;
  const levelParams = getLevelParams(config.level);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
  }, []);

  const prepareRound = useCallback(() => {
    const params = getLevelParams(config.level);
    // Get target words
    const targets = getWordsForDifficulty(params.difficulty, params.wordCount);
    // Get distractor words (2-3 extra options)
    const distractorCount = Math.min(4, params.wordCount + 2);
    const distractors = generateDistractors(targets, distractorCount);
    // Shuffle all options together
    const allOptions = [...targets, ...distractors].sort(
      () => Math.random() - 0.5
    );

    setTargetWords(targets);
    setOptions(allOptions);
    setSelectedWords([]);
  }, [config.level]);

  const showRound = useCallback(() => {
    prepareRound();
    setPhase("fixation");

    // Brief fixation phase (focus on center)
    timerRef.current = setTimeout(() => {
      setPhase("showing");

      // Show peripheral words for displayMs
      timerRef.current = setTimeout(() => {
        setPhase("answering");
      }, levelParams.displayMs);
    }, 800); // 800ms fixation
  }, [prepareRound, levelParams.displayMs]);

  const start = useCallback(() => {
    setRounds([]);
    setCurrentRound(0);
    setElapsedSeconds(0);
    startTimeRef.current = Date.now();

    // Start elapsed timer
    elapsedRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    // Start first round
    showRound();
  }, [showRound]);

  const toggleWord = useCallback(
    (word: string) => {
      if (phase !== "answering") return;
      setSelectedWords((prev) =>
        prev.includes(word)
          ? prev.filter((w) => w !== word)
          : [...prev, word]
      );
    },
    [phase]
  );

  const submitAnswer = useCallback(() => {
    if (phase !== "answering") return;

    // Check if selected words match target words
    const sortedSelected = [...selectedWords].sort();
    const sortedTargets = [...targetWords].sort();
    const isCorrect =
      sortedSelected.length === sortedTargets.length &&
      sortedSelected.every((w, i) => w === sortedTargets[i]);

    const round: PeripheralRound = {
      targetWords: [...targetWords],
      options: [...options],
      selectedWords: [...selectedWords],
      correct: isCorrect,
    };

    const updatedRounds = [...rounds, round];
    setRounds(updatedRounds);

    // Show feedback briefly
    setPhase("feedback");

    const nextRoundNum = currentRound + 1;

    timerRef.current = setTimeout(() => {
      if (nextRoundNum >= totalRounds) {
        // Finished
        setPhase("results");
        if (elapsedRef.current) {
          clearInterval(elapsedRef.current);
        }
        setElapsedSeconds(
          Math.floor((Date.now() - startTimeRef.current) / 1000)
        );
      } else {
        setCurrentRound(nextRoundNum);
        showRound();
      }
    }, 1000);
  }, [
    phase,
    selectedWords,
    targetWords,
    options,
    rounds,
    currentRound,
    totalRounds,
    showRound,
  ]);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    setPhase("setup");
    setCurrentRound(0);
    setRounds([]);
    setTargetWords([]);
    setOptions([]);
    setSelectedWords([]);
    setElapsedSeconds(0);
  }, []);

  return {
    phase,
    currentRound,
    totalRounds,
    rounds,
    targetWords,
    options,
    selectedWords,
    correctCount,
    accuracy,
    isFinished,
    elapsedSeconds,
    levelParams,
    start,
    toggleWord,
    submitAnswer,
    reset,
  };
}
