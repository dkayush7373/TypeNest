import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  formatLocalDate,
  checkGoalMet,
  buildDailyLogFromResults,
  loadV2Data,
  saveV2Data,
  clearHistoryStorage,
  V1_STORAGE_KEY,
  V2_STORAGE_KEY,
} from '../lib/storage';
import { TestResult, V2StorageSchema } from '../types';

describe('Storage and Migration Subsystem', () => {
  let localStorageMock: Record<string, string> = {};

  beforeEach(() => {
    localStorageMock = {};
    const mockStorage = {
      getItem: (key: string) => localStorageMock[key] ?? null,
      setItem: (key: string, value: string) => {
        localStorageMock[key] = value;
      },
      removeItem: (key: string) => {
        delete localStorageMock[key];
      },
      clear: () => {
        localStorageMock = {};
      },
    };
    vi.stubGlobal('localStorage', mockStorage);
    vi.stubGlobal('window', { localStorage: mockStorage });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('formats dates into local YYYY-MM-DD string consistently', () => {
    const d = new Date(2026, 4, 9); // May 9, 2026
    expect(formatLocalDate(d)).toBe('2026-05-09');
    expect(formatLocalDate(d.getTime())).toBe('2026-05-09');
  });

  it('evaluates checkGoalMet for all options correctly', () => {
    // 1-session: >= 1 session
    expect(checkGoalMet(0, 0, '1-session')).toBe(false);
    expect(checkGoalMet(1, 30, '1-session')).toBe(true);

    // 3-sessions: >= 3 sessions
    expect(checkGoalMet(2, 200, '3-sessions')).toBe(false);
    expect(checkGoalMet(3, 100, '3-sessions')).toBe(true);

    // 5-minutes: >= 300 seconds
    expect(checkGoalMet(10, 299, '5-minutes')).toBe(false);
    expect(checkGoalMet(1, 300, '5-minutes')).toBe(true);
  });

  it('builds daily log aggregate accurately from a list of test results', () => {
    const baseTime = new Date(2026, 9, 18, 12, 0, 0).getTime();
    const results: TestResult[] = [
      {
        id: '1',
        timestamp: baseTime,
        mode: 'time',
        status: 'completed',
        difficulty: 'standard',
        config: { mode: 'time', duration: 30, time: 30, words: 25, difficulty: 'standard', punctuation: false, numbers: false },
        targetCount: 30,
        punctuation: false,
        numbers: false,
        netWpm: 60,
        rawWpm: 65,
        accuracy: 96,
        consistency: 90,
        elapsedSeconds: 30,
        charStats: { correct: 150, wrong: 5, missed: 0, extra: 0 },
        wpmHistory: [],
        missedKeys: {},
        slowestWords: [],
      },
      {
        id: '2',
        timestamp: baseTime + 10000,
        mode: 'words',
        status: 'completed',
        difficulty: 'standard',
        config: { mode: 'words', duration: 30, time: 30, words: 25, difficulty: 'standard', punctuation: false, numbers: false },
        targetCount: 25,
        punctuation: false,
        numbers: false,
        netWpm: 80,
        rawWpm: 85,
        accuracy: 100,
        consistency: 92,
        elapsedSeconds: 25,
        charStats: { correct: 125, wrong: 0, missed: 0, extra: 0 },
        wpmHistory: [],
        missedKeys: {},
        slowestWords: [],
      },
    ];

    const log = buildDailyLogFromResults(results, '1-session');
    const day = formatLocalDate(baseTime);
    expect(log[day]).toBeDefined();
    expect(log[day].sessions).toBe(2);
    expect(log[day].totalSeconds).toBe(55);
    expect(log[day].bestWpm).toBe(80);
    expect(log[day].avgAccuracy).toBe(98); // (96 + 100) / 2
    expect(log[day].modes).toContain('time');
    expect(log[day].modes).toContain('words');
    expect(log[day].goalMet).toBe(true);
  });

  it('migrates legacy keyflow:v1 storage format to keyflow:v2 cleanly', () => {
    // Seed v1 data
    const legacyV1 = [
      {
        id: 'legacy-1',
        timestamp: new Date(2026, 9, 10).getTime(),
        mode: 'time',
        netWpm: 65,
        rawWpm: 70,
        accuracy: 94,
        consistency: 88,
        elapsedSeconds: 60,
        punctuation: false,
        numbers: false,
      },
    ];
    localStorage.setItem(V1_STORAGE_KEY, JSON.stringify(legacyV1));

    // loadV2Data should perform the migration
    const v2Data = loadV2Data();
    expect(v2Data.version).toBe(2);
    expect(v2Data.results).toHaveLength(1);
    expect(v2Data.results[0].id).toBe('legacy-1');
    expect(v2Data.results[0].netWpm).toBe(65);

    // Verify it was persisted to V2 storage key
    const storedV2 = JSON.parse(localStorage.getItem(V2_STORAGE_KEY)!);
    expect(storedV2.version).toBe(2);
    expect(storedV2.results[0].id).toBe('legacy-1');
  });

  it('gracefully handles corrupted JSON in localStorage without throwing', () => {
    localStorage.setItem(V2_STORAGE_KEY, '{ invalid json');
    const data = loadV2Data();
    expect(data.version).toBe(2);
    expect(data.results).toEqual([]);
    expect(data.dailyLog).toEqual({});
  });

  it('clears history storage and preserves schema shape', () => {
    const dummyResult: TestResult = {
      id: 'test-1',
      timestamp: Date.now(),
      mode: 'time',
      status: 'completed',
      difficulty: 'standard',
      config: { mode: 'time', duration: 30, time: 30, words: 25, difficulty: 'standard', punctuation: false, numbers: false },
      targetCount: 30,
      punctuation: false,
      numbers: false,
      netWpm: 50,
      rawWpm: 50,
      accuracy: 100,
      consistency: 100,
      elapsedSeconds: 30,
      charStats: { correct: 100, wrong: 0, missed: 0, extra: 0 },
      wpmHistory: [],
      missedKeys: {},
      slowestWords: [],
    };
    const dummyV2: V2StorageSchema = {
      version: 2,
      results: [dummyResult],
      dailyLog: {
        '2026-10-18': {
          sessions: 1,
          totalSeconds: 30,
          bestWpm: 50,
          avgAccuracy: 100,
          modes: ['time'],
          lessonsDone: [],
          goalMet: true,
        },
      },
    };
    saveV2Data(dummyV2);
    expect(loadV2Data().results).toHaveLength(1);

    clearHistoryStorage();
    const afterClear = loadV2Data();
    expect(afterClear.results).toHaveLength(0);
    expect(afterClear.dailyLog).toEqual({});
  });
});
