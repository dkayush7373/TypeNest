'use client';

import { useState, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  TestResult,
  DailyLog,
  DailyGoalOption,
  UserSettings,
} from '@/types';
import {
  loadV2Data,
  saveV2Data,
  clearHistoryStorage,
  formatLocalDate,
  checkGoalMet,
  getSafeStorage,
  SETTINGS_STORAGE_KEY,
} from '@/lib/storage';
import { calculateStreakFromLog, StreakMetrics, DEFAULT_STREAK_METRICS } from '@/lib/streak';

export interface HistoryStats {
  bestWpm: number;
  avgWpm: number;
  avgAccuracy: number;
  totalTests: number;
  totalTimeSeconds: number;
  formattedTime: string;
  streak: number;
  longestStreak: number;
  weakKeys: { char: string; count: number }[];
}

const emptySubscribe = () => () => {};

export function useHistory() {
  const isLoaded = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [data, setData] = useState<{ results: TestResult[]; dailyLog: DailyLog }>(() => {
    const loaded = loadV2Data();
    return {
      results: loaded.results || [],
      dailyLog: loaded.dailyLog || {},
    };
  });

  // Re-read settings for current daily goal
  const getGoalSetting = useCallback((): DailyGoalOption => {
    const settings = getSafeStorage<UserSettings | null>(SETTINGS_STORAGE_KEY, null);
    return settings?.dailyGoal || '1-session';
  }, []);

  // Save completed typing test
  const saveResult = useCallback(
    (result: TestResult) => {
      setData((prev) => {
        // Prevent duplicate save if same id already exists
        if (prev.results.some((r) => r.id === result.id)) {
          return prev;
        }

        const nextResults = [result, ...prev.results.slice(0, 499)];
        const goal = getGoalSetting();
        const dateKey = formatLocalDate(result.timestamp);

        const currentEntry = prev.dailyLog[dateKey] || {
          sessions: 0,
          totalSeconds: 0,
          bestWpm: 0,
          avgAccuracy: 0,
          modes: [],
          lessonsDone: [],
          goalMet: false,
        };

        const nextSessions = currentEntry.sessions + 1;
        const nextSeconds = currentEntry.totalSeconds + (result.elapsedSeconds || 0);
        const nextBestWpm = Math.max(currentEntry.bestWpm, result.netWpm || 0);
        const prevAccSum = currentEntry.avgAccuracy * currentEntry.sessions;
        const nextAvgAcc = Math.round((prevAccSum + (result.accuracy || 0)) / nextSessions);
        const nextModes = currentEntry.modes.includes(result.mode)
          ? currentEntry.modes
          : [...currentEntry.modes, result.mode];
        const nextGoalMet = checkGoalMet(nextSessions, nextSeconds, goal);

        const nextDailyLog: DailyLog = {
          ...prev.dailyLog,
          [dateKey]: {
            ...currentEntry,
            sessions: nextSessions,
            totalSeconds: nextSeconds,
            bestWpm: nextBestWpm,
            avgAccuracy: nextAvgAcc,
            modes: nextModes,
            goalMet: nextGoalMet,
          },
        };

        saveV2Data({
          version: 2,
          results: nextResults,
          dailyLog: nextDailyLog,
        });

        return {
          results: nextResults,
          dailyLog: nextDailyLog,
        };
      });
    },
    [getGoalSetting]
  );

  // Record a completed lesson session toward daily goal
  const recordLessonSession = useCallback(
    (lessonId: string, durationSeconds: number = 60) => {
      setData((prev) => {
        const goal = getGoalSetting();
        const dateKey = formatLocalDate();
        const currentEntry = prev.dailyLog[dateKey] || {
          sessions: 0,
          totalSeconds: 0,
          bestWpm: 0,
          avgAccuracy: 0,
          modes: [],
          lessonsDone: [],
          goalMet: false,
        };

        const nextSessions = currentEntry.sessions + 1;
        const nextSeconds = currentEntry.totalSeconds + durationSeconds;
        const nextLessons = currentEntry.lessonsDone.includes(lessonId)
          ? currentEntry.lessonsDone
          : [...currentEntry.lessonsDone, lessonId];
        const nextGoalMet = checkGoalMet(nextSessions, nextSeconds, goal);

        const nextDailyLog: DailyLog = {
          ...prev.dailyLog,
          [dateKey]: {
            ...currentEntry,
            sessions: nextSessions,
            totalSeconds: nextSeconds,
            lessonsDone: nextLessons,
            goalMet: nextGoalMet,
          },
        };

        saveV2Data({
          version: 2,
          results: prev.results,
          dailyLog: nextDailyLog,
        });

        return {
          results: prev.results,
          dailyLog: nextDailyLog,
        };
      });
    },
    [getGoalSetting]
  );

  // Clear history and daily streak safely
  const clearHistory = useCallback(() => {
    clearHistoryStorage();
    setData({
      results: [],
      dailyLog: {},
    });
  }, []);

  // Compute streak metrics derived from dailyLog
  const streakMetrics: StreakMetrics = useMemo(() => {
    if (!isLoaded) {
      return DEFAULT_STREAK_METRICS;
    }
    return calculateStreakFromLog(data.dailyLog);
  }, [data.dailyLog, isLoaded]);

  // Compute aggregate stats across results
  const stats: HistoryStats = useMemo(() => {
    const results = data.results;
    if (results.length === 0) {
      return {
        bestWpm: 0,
        avgWpm: 0,
        avgAccuracy: 0,
        totalTests: 0,
        totalTimeSeconds: 0,
        formattedTime: '0m',
        streak: streakMetrics.currentStreak,
        longestStreak: streakMetrics.longestStreak,
        weakKeys: [],
      };
    }

    // Exclude failed runs from speed averages as per prompt requirements
    const validSpeedResults = results.filter((r) => r.status !== 'failed');
    const totalTests = results.length;
    const bestWpm = validSpeedResults.length > 0 ? Math.max(...validSpeedResults.map((t) => t.netWpm), 0) : 0;
    const avgWpm =
      validSpeedResults.length > 0
        ? Math.round(validSpeedResults.reduce((acc, t) => acc + t.netWpm, 0) / validSpeedResults.length)
        : 0;
    const avgAccuracy = Math.round(
      results.reduce((acc, t) => acc + t.accuracy, 0) / totalTests
    );
    const totalTimeSeconds = results.reduce((acc, t) => acc + (t.elapsedSeconds || 0), 0);

    const hours = Math.floor(totalTimeSeconds / 3600);
    const minutes = Math.floor((totalTimeSeconds % 3600) / 60);
    const formattedTime =
      hours > 0 ? `${hours}h ${minutes}m` : `${Math.max(minutes, 1)}m`;

    // Aggregate missed keys
    const missedMap: Record<string, number> = {};
    results.forEach((t) => {
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
      streak: streakMetrics.currentStreak,
      longestStreak: streakMetrics.longestStreak,
      weakKeys,
    };
  }, [data.results, streakMetrics.currentStreak, streakMetrics.longestStreak]);

  // Sync safely after mount if storage had data
  useEffect(() => {
    const loaded = loadV2Data();
    if (loaded.results.length > 0 && loaded.results.length !== data.results.length) {
      const timer = setTimeout(() => {
        setData({
          results: loaded.results,
          dailyLog: loaded.dailyLog,
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [data.results.length]);

  return {
    history: data.results,
    dailyLog: data.dailyLog,
    streakMetrics,
    stats,
    saveResult,
    recordLessonSession,
    clearHistory,
    isLoaded,
  };
}

