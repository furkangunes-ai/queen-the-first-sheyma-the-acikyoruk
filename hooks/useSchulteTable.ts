import { useState, useRef, useCallback, useEffect } from "react";
import { generateSchulteGrid } from "@/lib/speed-reading-data";

export interface SchulteState {
  grid: number[];
  gridSize: number;
  currentTarget: number;
  errors: number;
  isActive: boolean;
  isFinished: boolean;
  elapsedMs: number;
  foundCells: Set<number>; // grid indices that have been found
}

interface SchulteConfig {
  gridSize: 3 | 4 | 5;
}

export function useSchulteTable(config: SchulteConfig) {
  const [grid, setGrid] = useState<number[]>([]);
  const [currentTarget, setCurrentTarget] = useState(1);
  const [errors, setErrors] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [foundCells, setFoundCells] = useState<Set<number>>(new Set());

  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const totalCells = config.gridSize * config.gridSize;

  // Timer loop using requestAnimationFrame for precision
  const updateTimer = useCallback(() => {
    if (startTimeRef.current > 0) {
      setElapsedMs(performance.now() - startTimeRef.current);
      rafRef.current = requestAnimationFrame(updateTimer);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const start = useCallback(() => {
    const newGrid = generateSchulteGrid(config.gridSize);
    setGrid(newGrid);
    setCurrentTarget(1);
    setErrors(0);
    setIsActive(true);
    setIsFinished(false);
    setElapsedMs(0);
    setFoundCells(new Set());
    startTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(updateTimer);
  }, [config.gridSize, updateTimer]);

  const handleCellClick = useCallback(
    (index: number): boolean => {
      if (!isActive || isFinished) return false;

      const clickedValue = grid[index];

      if (clickedValue === currentTarget) {
        // Correct!
        const newFound = new Set(foundCells);
        newFound.add(index);
        setFoundCells(newFound);

        const nextTarget = currentTarget + 1;
        if (nextTarget > totalCells) {
          // All found — finished!
          setIsFinished(true);
          setIsActive(false);
          setElapsedMs(performance.now() - startTimeRef.current);
          if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
          }
        } else {
          setCurrentTarget(nextTarget);
        }
        return true;
      } else {
        // Wrong click
        setErrors((e) => e + 1);
        return false;
      }
    },
    [isActive, isFinished, grid, currentTarget, foundCells, totalCells]
  );

  const reset = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    setGrid([]);
    setCurrentTarget(1);
    setErrors(0);
    setIsActive(false);
    setIsFinished(false);
    setElapsedMs(0);
    setFoundCells(new Set());
    startTimeRef.current = 0;
  }, []);

  const newGame = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    start();
  }, [start]);

  const restart = useCallback(() => {
    // Same grid, try again
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    setCurrentTarget(1);
    setErrors(0);
    setIsActive(true);
    setIsFinished(false);
    setElapsedMs(0);
    setFoundCells(new Set());
    startTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(updateTimer);
  }, [updateTimer]);

  const score = isFinished
    ? Math.max(0, Math.round(((totalCells - errors) / totalCells) * 100))
    : 0;

  return {
    grid,
    gridSize: config.gridSize,
    currentTarget,
    errors,
    isActive,
    isFinished,
    elapsedMs,
    foundCells,
    totalCells,
    score,
    start,
    handleCellClick,
    reset,
    newGame,
    restart,
  };
}
