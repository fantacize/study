"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useState that persists to localStorage.
 * SSR-safe: returns defaultValue on server, hydrates from storage on mount.
 */
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(defaultValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        setValue(JSON.parse(stored));
      }
    } catch {}
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value, hydrated]);

  return [value, setValue];
}

/**
 * Countdown timer hook for timed practice.
 */
export function useStudyTimer() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const onTimeUpRef = useRef(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      clear();
      if (isRunning && timeLeft <= 0) {
        setIsRunning(false);
        onTimeUpRef.current?.();
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return clear;
  }, [isRunning, timeLeft <= 0, clear]);

  const start = useCallback((seconds, onTimeUp) => {
    clear();
    onTimeUpRef.current = onTimeUp || null;
    setTimeLeft(seconds);
    setIsRunning(true);
  }, [clear]);

  const pause = useCallback(() => {
    setIsRunning(false);
    clear();
  }, [clear]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(0);
    clear();
    onTimeUpRef.current = null;
  }, [clear]);

  return { timeLeft, isRunning, start, pause, reset };
}
