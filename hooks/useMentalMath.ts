import { useState, useRef, useCallback, useEffect } from "react";
import { generateMathQuestion, type MathQuestion } from "@/lib/mental-math-data";

export type MentalMathPhase = "setup" | "countdown" | "playing" | "results";

export interface MathAttempt {
  question: MathQuestion;
  userAnswer: number | null;
  correct: boolean;
  skipped: boolean;
  responseTimeMs: number;
}

interface MentalMathConfig {
  difficulty: number; // 1-5
  questionCount: number;
  timeLimitSeconds: number; // 0 = no limit
}

export function useMentalMath(config: MentalMathConfig) {
  const [phase, setPhase] = useState<MentalMathPhase>("setup");
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attempts, setAttempts] = useState<MathAttempt[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const questionStartRef = useRef(0);

  const correctCount = attempts.filter((a) => a.correct).length;
  const skippedCount = attempts.filter((a) => a.skipped).length;
  const wrongCount = attempts.filter((a) => !a.correct && !a.skipped).length;
  const totalAnswered = attempts.length;
  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
  const avgResponseTime =
    attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.responseTimeMs, 0) / attempts.length)
      : 0;
  const isFinished = phase === "results";

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Time limit check
  useEffect(() => {
    if (
      phase === "playing" &&
      config.timeLimitSeconds > 0 &&
      elapsedSeconds >= config.timeLimitSeconds
    ) {
      finishGame();
    }
  }, [elapsedSeconds, config.timeLimitSeconds, phase]);

  const nextQuestion = useCallback(() => {
    const q = generateMathQuestion(config.difficulty);
    setCurrentQuestion(q);
    questionStartRef.current = Date.now();
  }, [config.difficulty]);

  const finishGame = useCallback(() => {
    setPhase("results");
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
  }, []);

  const start = useCallback(() => {
    setAttempts([]);
    setCurrentIndex(0);
    setElapsedSeconds(0);
    startTimeRef.current = Date.now();

    // Countdown
    setPhase("countdown");
    setTimeout(() => {
      setPhase("playing");
      // Start elapsed timer
      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

      // First question
      const q = generateMathQuestion(config.difficulty);
      setCurrentQuestion(q);
      questionStartRef.current = Date.now();
    }, 1500);
  }, [config.difficulty]);

  const submitAnswer = useCallback(
    (userAnswer: number) => {
      if (phase !== "playing" || !currentQuestion) return;

      const responseTimeMs = Date.now() - questionStartRef.current;
      const isCorrect = userAnswer === currentQuestion.answer;

      const attempt: MathAttempt = {
        question: currentQuestion,
        userAnswer,
        correct: isCorrect,
        skipped: false,
        responseTimeMs,
      };

      const updatedAttempts = [...attempts, attempt];
      setAttempts(updatedAttempts);

      const nextIdx = currentIndex + 1;
      if (nextIdx >= config.questionCount) {
        finishGame();
      } else {
        setCurrentIndex(nextIdx);
        nextQuestion();
      }
    },
    [phase, currentQuestion, attempts, currentIndex, config.questionCount, finishGame, nextQuestion]
  );

  const skip = useCallback(() => {
    if (phase !== "playing" || !currentQuestion) return;

    const responseTimeMs = Date.now() - questionStartRef.current;
    const attempt: MathAttempt = {
      question: currentQuestion,
      userAnswer: null,
      correct: false,
      skipped: true,
      responseTimeMs,
    };

    const updatedAttempts = [...attempts, attempt];
    setAttempts(updatedAttempts);

    const nextIdx = currentIndex + 1;
    if (nextIdx >= config.questionCount) {
      finishGame();
    } else {
      setCurrentIndex(nextIdx);
      nextQuestion();
    }
  }, [phase, currentQuestion, attempts, currentIndex, config.questionCount, finishGame, nextQuestion]);

  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("setup");
    setCurrentQuestion(null);
    setCurrentIndex(0);
    setAttempts([]);
    setElapsedSeconds(0);
  }, []);

  return {
    phase,
    currentQuestion,
    currentIndex,
    attempts,
    correctCount,
    wrongCount,
    skippedCount,
    totalAnswered,
    accuracy,
    avgResponseTime,
    elapsedSeconds,
    isFinished,
    questionCount: config.questionCount,
    timeLimitSeconds: config.timeLimitSeconds,
    start,
    submitAnswer,
    skip,
    reset,
  };
}
