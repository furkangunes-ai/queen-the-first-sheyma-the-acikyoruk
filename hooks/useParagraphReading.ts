import { useState, useCallback, useRef } from "react";

// ─── Types ─────────────────────────────────────────

export interface ParagraphQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface ParagraphData {
  id: string;
  title?: string;
  content: string;
  difficulty: number;
  questions: ParagraphQuestion[];
}

export interface QuestionResult {
  questionId: string;
  selectedAnswer: number;
  correct: boolean;
  timeSpent: number; // ms
}

export type ParagraphPhase = "setup" | "reading" | "questions" | "results";

export interface ParagraphReadingState {
  phase: ParagraphPhase;
  paragraph: ParagraphData | null;
  // Reading phase
  readingStartTime: number;
  readingEndTime: number;
  readingTimeMs: number;
  // Questions phase
  currentQuestionIndex: number;
  questionStartTime: number;
  answers: QuestionResult[];
  selectedAnswer: number | null;
  showExplanation: boolean;
  // Results
  correctCount: number;
  totalQuestions: number;
  avgQuestionTime: number;
  wordsPerMinute: number;
}

// ─── Hook ──────────────────────────────────────────

export function useParagraphReading() {
  const [state, setState] = useState<ParagraphReadingState>({
    phase: "setup",
    paragraph: null,
    readingStartTime: 0,
    readingEndTime: 0,
    readingTimeMs: 0,
    currentQuestionIndex: 0,
    questionStartTime: 0,
    answers: [],
    selectedAnswer: null,
    showExplanation: false,
    correctCount: 0,
    totalQuestions: 0,
    avgQuestionTime: 0,
    wordsPerMinute: 0,
  });

  const questionTimerRef = useRef<number>(0);

  // Start reading with a paragraph
  const startReading = useCallback((paragraph: ParagraphData) => {
    setState({
      phase: "reading",
      paragraph,
      readingStartTime: Date.now(),
      readingEndTime: 0,
      readingTimeMs: 0,
      currentQuestionIndex: 0,
      questionStartTime: 0,
      answers: [],
      selectedAnswer: null,
      showExplanation: false,
      correctCount: 0,
      totalQuestions: paragraph.questions.length,
      avgQuestionTime: 0,
      wordsPerMinute: 0,
    });
  }, []);

  // Finish reading, move to questions
  const finishReading = useCallback(() => {
    setState((prev) => {
      const now = Date.now();
      const readingTimeMs = now - prev.readingStartTime;
      return {
        ...prev,
        phase: "questions",
        readingEndTime: now,
        readingTimeMs,
        questionStartTime: now,
      };
    });
  }, []);

  // Select an answer
  const selectAnswer = useCallback((answerIndex: number) => {
    setState((prev) => ({
      ...prev,
      selectedAnswer: answerIndex,
    }));
  }, []);

  // Confirm answer and move on
  const confirmAnswer = useCallback(() => {
    setState((prev) => {
      if (prev.selectedAnswer === null || !prev.paragraph) return prev;

      const question = prev.paragraph.questions[prev.currentQuestionIndex];
      const isCorrect = prev.selectedAnswer === question.correctAnswer;
      const timeSpent = Date.now() - prev.questionStartTime;

      const newResult: QuestionResult = {
        questionId: question.id,
        selectedAnswer: prev.selectedAnswer,
        correct: isCorrect,
        timeSpent,
      };

      const newAnswers = [...prev.answers, newResult];

      // Show explanation if available
      if (question.explanation) {
        return {
          ...prev,
          answers: newAnswers,
          showExplanation: true,
        };
      }

      // No explanation — check if more questions
      const nextIndex = prev.currentQuestionIndex + 1;
      if (nextIndex >= prev.paragraph.questions.length) {
        // Calculate results
        const correctCount = newAnswers.filter((a) => a.correct).length;
        const totalTime = newAnswers.reduce((s, a) => s + a.timeSpent, 0);
        const wordCount = prev.paragraph.content.split(/\s+/).filter(Boolean).length;
        const readingMinutes = prev.readingTimeMs / 60000;
        const wpm = readingMinutes > 0 ? Math.round(wordCount / readingMinutes) : 0;

        return {
          ...prev,
          phase: "results",
          answers: newAnswers,
          selectedAnswer: null,
          showExplanation: false,
          correctCount,
          avgQuestionTime: Math.round(totalTime / newAnswers.length),
          wordsPerMinute: wpm,
        };
      }

      return {
        ...prev,
        currentQuestionIndex: nextIndex,
        answers: newAnswers,
        selectedAnswer: null,
        showExplanation: false,
        questionStartTime: Date.now(),
      };
    });
  }, []);

  // Move past explanation
  const nextAfterExplanation = useCallback(() => {
    setState((prev) => {
      if (!prev.paragraph) return prev;

      const nextIndex = prev.currentQuestionIndex + 1;
      if (nextIndex >= prev.paragraph.questions.length) {
        // Calculate results
        const correctCount = prev.answers.filter((a) => a.correct).length;
        const totalTime = prev.answers.reduce((s, a) => s + a.timeSpent, 0);
        const wordCount = prev.paragraph.content.split(/\s+/).filter(Boolean).length;
        const readingMinutes = prev.readingTimeMs / 60000;
        const wpm = readingMinutes > 0 ? Math.round(wordCount / readingMinutes) : 0;

        return {
          ...prev,
          phase: "results",
          selectedAnswer: null,
          showExplanation: false,
          correctCount,
          avgQuestionTime: Math.round(totalTime / prev.answers.length),
          wordsPerMinute: wpm,
        };
      }

      return {
        ...prev,
        currentQuestionIndex: nextIndex,
        selectedAnswer: null,
        showExplanation: false,
        questionStartTime: Date.now(),
      };
    });
  }, []);

  // Reset to setup
  const reset = useCallback(() => {
    setState({
      phase: "setup",
      paragraph: null,
      readingStartTime: 0,
      readingEndTime: 0,
      readingTimeMs: 0,
      currentQuestionIndex: 0,
      questionStartTime: 0,
      answers: [],
      selectedAnswer: null,
      showExplanation: false,
      correctCount: 0,
      totalQuestions: 0,
      avgQuestionTime: 0,
      wordsPerMinute: 0,
    });
  }, []);

  return {
    ...state,
    startReading,
    finishReading,
    selectAnswer,
    confirmAnswer,
    nextAfterExplanation,
    reset,
  };
}
