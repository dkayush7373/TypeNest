/**
 * Safe local storage helper with SSR safety and corrupted JSON fallback.
 * Manages KeyFlow v1 -> v2 migration and daily streak log persistence.
 */

import {
  TestResult,
  V2StorageSchema,
  DailyLog,
  DailyGoalOption,
  TestMode,
} from '../types';

export const V1_STORAGE_KEY = 'keyflow:v1';
export const V2_STORAGE_KEY = 'keyflow:v2';
export const SETTINGS_STORAGE_KEY = 'keyflow:settings';
export const LESSON_STORAGE_KEY = 'keyflow:lessons';

function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage;
  }
  return null;
}

export function getSafeStorage<T>(key: string, fallback: T): T {
  const storage = getStorage();
  if (!storage) {
    return fallback;
  }
  try {
    const item = storage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    return parsed ?? fallback;
  } catch (error) {
    console.warn(`[storage] Failed to parse stored item for key "${key}", falling back.`, error);
    return fallback;
  }
}

export function setSafeStorage<T>(key: string, value: T): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[storage] Failed to set storage item for key "${key}".`, error);
  }
}

export function removeSafeStorage(key: string): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  try {
    storage.removeItem(key);
  } catch (error) {
    console.warn(`[storage] Failed to remove storage item for key "${key}".`, error);
  }
}

/**
 * Format a Date or timestamp into the user's LOCAL calendar date: "YYYY-MM-DD".
 * Avoids UTC offset bugs across timezones and midnight rollovers.
 */
export function formatLocalDate(dateOrTimestamp?: Date | number): string {
  const d =
    dateOrTimestamp !== undefined
      ? typeof dateOrTimestamp === 'number'
        ? new Date(dateOrTimestamp)
        : dateOrTimestamp
      : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Evaluates whether the daily goal is met given today's statistics.
 */
export function checkGoalMet(
  sessions: number,
  totalSeconds: number,
  goalOption: DailyGoalOption = '1-session'
): boolean {
  if (goalOption === '3-sessions') {
    return sessions >= 3;
  }
  if (goalOption === '5-minutes') {
    return totalSeconds >= 300;
  }
  // Default: 1 session
  return sessions >= 1;
}

/**
 * Reconstructs a daily log entry map from a list of test results.
 */
export function buildDailyLogFromResults(
  results: TestResult[],
  goalOption: DailyGoalOption = '1-session'
): DailyLog {
  const log: DailyLog = {};

  for (const res of results) {
    const dateKey = formatLocalDate(res.timestamp);
    if (!log[dateKey]) {
      log[dateKey] = {
        sessions: 0,
        totalSeconds: 0,
        bestWpm: 0,
        avgAccuracy: 0,
        modes: [],
        lessonsDone: [],
        goalMet: false,
      };
    }

    const entry = log[dateKey];
    entry.sessions += 1;
    entry.totalSeconds += res.elapsedSeconds || 0;
    entry.bestWpm = Math.max(entry.bestWpm, res.netWpm || 0);

    // Running average accuracy
    const prevSum = entry.avgAccuracy * (entry.sessions - 1);
    entry.avgAccuracy = Math.round((prevSum + (res.accuracy || 0)) / entry.sessions);

    if (res.mode && !entry.modes.includes(res.mode)) {
      entry.modes.push(res.mode);
    }

    entry.goalMet = checkGoalMet(entry.sessions, entry.totalSeconds, goalOption);
  }

  return log;
}

/**
 * Safely loads KeyFlow data, performing migration from keyflow:v1 if keyflow:v2 is missing.
 */
export function loadV2Data(): V2StorageSchema {
  if (!getStorage()) {
    return { version: 2, results: [], dailyLog: {} };
  }

  const v2Raw = getSafeStorage<V2StorageSchema | null>(V2_STORAGE_KEY, null);
  if (v2Raw && v2Raw.version === 2 && Array.isArray(v2Raw.results) && typeof v2Raw.dailyLog === 'object') {
    return v2Raw;
  }

  // Check v1 data for safe migration
  const v1Raw = getSafeStorage<unknown>(V1_STORAGE_KEY, null);
  const migratedResults: TestResult[] = [];

  if (Array.isArray(v1Raw)) {
    for (const item of v1Raw) {
      if (item && typeof item === 'object') {
        const legacy = item as Record<string, unknown>;
        const mode = (legacy.mode as TestMode) || 'time';
        const targetCount = Number(legacy.targetCount) || 30;
        const testRes: TestResult = {
          id: String(legacy.id || `migrated-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`),
          timestamp: Number(legacy.timestamp) || Date.now(),
          mode,
          status: 'completed',
          difficulty: 'standard',
          config: {
            mode,
            time: (targetCount as 15 | 30 | 60 | 120),
            words: 25,
            duration: (targetCount as 15 | 30 | 60 | 120),
            wordCount: 25,
            difficulty: 'standard',
            punctuation: Boolean(legacy.punctuation),
            numbers: Boolean(legacy.numbers),
          },
          targetCount,
          punctuation: Boolean(legacy.punctuation),
          numbers: Boolean(legacy.numbers),
          netWpm: Number(legacy.netWpm) || 0,
          rawWpm: Number(legacy.rawWpm) || 0,
          accuracy: Number(legacy.accuracy) || 0,
          consistency: Number(legacy.consistency) || 0,
          elapsedSeconds: Number(legacy.elapsedSeconds) || 0,
          charStats: (legacy.charStats as TestResult['charStats']) || {
            correct: 0,
            wrong: 0,
            missed: 0,
            extra: 0,
          },
          wpmHistory: Array.isArray(legacy.wpmHistory) ? (legacy.wpmHistory as TestResult['wpmHistory']) : [],
          missedKeys: (legacy.missedKeys as Record<string, number>) || {},
          slowestWords: Array.isArray(legacy.slowestWords) ? (legacy.slowestWords as TestResult['slowestWords']) : [],
        };
        migratedResults.push(testRes);
      }
    }
  }

  const dailyLog = buildDailyLogFromResults(migratedResults);
  const initialV2: V2StorageSchema = {
    version: 2,
    results: migratedResults,
    dailyLog,
  };

  // Only persist to v2 if we are in the browser and have migrated data
  if (migratedResults.length > 0) {
    setSafeStorage(V2_STORAGE_KEY, initialV2);
  }

  return initialV2;
}

/**
 * Saves V2 data safely.
 */
export function saveV2Data(data: V2StorageSchema): void {
  setSafeStorage(V2_STORAGE_KEY, data);
}

/**
 * Clears typing history and resets the daily streak log.
 * Preserves user settings and lesson progression.
 */
export function clearHistoryStorage(): void {
  const cleared: V2StorageSchema = {
    version: 2,
    results: [],
    dailyLog: {},
  };
  saveV2Data(cleared);
  // Also clear legacy v1 to prevent re-migration
  setSafeStorage(V1_STORAGE_KEY, []);
}

