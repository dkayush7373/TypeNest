'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { TestResult } from '@/types';
import { getSafeStorage, setSafeStorage } from '@/lib/storage';

export const HISTORY_STORAGE_KEY = 'keyflow:v1';

export interface HistoryStats {
  bestWpm: number;
  avgWpm: number;
  avgAccuracy: number;
  totalTests: number;
  totalTimeSeconds: number;
  formattedTime: string;
  streak: number;
  weakKeys: { char: string; count: number }[];
}

function calculateStreak(timestamps: number[]): number {
  if (timestamps.length === 0) return 0;

  // Convert timestamps to unique YYYY-MM-DD strings
  const dateStrings = Array.from(
    new Set(timestamps.map((t) => new Date(t).toISOString().slice(0, 10)))
  ).sort().reverse();

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // If most recent is not today or yesterday, streak is broken
  if (dateStrings[0] !== todayStr && dateStrings[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let expectedDate = new Date(dateStrings[0]);

  for (const dateStr of dateStrings) {
    const current = new Date(dateStr);
    const diffDays = Math.round(
      (expectedDate.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      streak++;
      expectedDate = new Date(current.getTime() - 86400000);
    } else {
      break;
    }
  }

  return streak;
}

export function useHistory() {
  const [history, setHistory] = useState<TestResult[]>(() => {
    return getSafeStorage<TestResult[]>(HISTORY_STORAGE_KEY, []);
  });

  const saveResult = useCallback((result: TestResult) => {
    setHistory((prev) => {
      const next = [result, ...prev.slice(0, 499)];
      setSafeStorage(HISTORY_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setSafeStorage(HISTORY_STORAGE_KEY, []);
  }, []);

  // Compute aggregate stats
  const stats: HistoryStats = useMemo(() => {
    if (history.length === 0) {
      return {
        bestWpm: 0,
        avgWpm: 0,
        avgAccuracy: 0,
        totalTests: 0,
        totalTimeSeconds: 0,
        formattedTime: '0m',
        streak: 0,
        weakKeys: [],
      };
    }

    const totalTests = history.length;
    const bestWpm = Math.max(...history.map((t) => t.netWpm), 0);
    const avgWpm = Math.round(
      history.reduce((acc, t) => acc + t.netWpm, 0) / totalTests
    );
    const avgAccuracy = Math.round(
      history.reduce((acc, t) => acc + t.accuracy, 0) / totalTests
    );
    const totalTimeSeconds = history.reduce((acc, t) => acc + (t.elapsedSeconds || 0), 0);

    const hours = Math.floor(totalTimeSeconds / 3600);
    const minutes = Math.floor((totalTimeSeconds % 3600) / 60);
    const formattedTime =
      hours > 0 ? `${hours}h ${minutes}m` : `${Math.max(minutes, 1)}m`;

    const streak = calculateStreak(history.map((t) => t.timestamp));

    // Aggregate missed keys
    const missedMap: Record<string, number> = {};
    history.forEach((t) => {
      if (t.missedKeys) {
        Object.entries(t.missedKeys).forEach(([k, count]) => {
          missedMap[k] = (missedMap[k] || 0) + count;
        });
      }
    });

    const weakKeys = Object.entries(missedMap)
      .map(([char, count]) => ({ char, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      bestWpm,
      avgWpm,
      avgAccuracy,
      totalTests,
      totalTimeSeconds,
      formattedTime,
      streak,
      weakKeys,
    };
  }, [history]);

  // Sync from storage on mount
  useEffect(() => {
    const stored = getSafeStorage<TestResult[]>(HISTORY_STORAGE_KEY, []);
    if (stored.length > 0 && stored.length !== history.length) {
      // Safe sync without cascading re-render
      const timer = setTimeout(() => setHistory(stored), 0);
      return () => clearTimeout(timer);
    }
  }, [history.length]);

  return {
    history,
    stats,
    saveResult,
    clearHistory,
  };
}
