import { describe, it, expect } from 'vitest';
import { calculateMetrics, buildTestResult } from '../lib/metrics';
import { TestConfig, KeystrokeLog } from '../types';

describe('Typing Engine Pause, Scoring and Metric Regression Tests', () => {
  const baseConfig: TestConfig = {
    mode: 'time',
    duration: 30,
    time: 30,
    words: 25,
    difficulty: 'standard',
    punctuation: false,
    numbers: false,
  };

  it('excludes paused duration from active elapsed test time', () => {
    const keystrokes: KeystrokeLog[] = [
      { key: 'h', code: 'KeyH', typedChar: 'h', expectedChar: 'h', timestamp: 2000, correct: true },
      { key: 'e', code: 'KeyE', typedChar: 'e', expectedChar: 'e', timestamp: 3000, correct: true },
      { key: 'l', code: 'KeyL', typedChar: 'l', expectedChar: 'l', timestamp: 4000, correct: true },
      { key: 'l', code: 'KeyL', typedChar: 'l', expectedChar: 'l', timestamp: 5000, correct: true },
      { key: 'o', code: 'KeyO', typedChar: 'o', expectedChar: 'o', timestamp: 30000, correct: true },
    ];

    const totalPausedMs = 20000;
    const startTime = 1000;
    const endTime = 31000;

    const metrics = calculateMetrics(
      baseConfig,
      keystrokes,
      [{ expected: 'hello', typed: 'hello', correct: true }],
      [],
      startTime,
      endTime,
      totalPausedMs
    );

    // 10 active seconds = ~1/6 minute. 5 chars = 1 word / (10/60) min = 6 WPM.
    expect(metrics.elapsedSeconds).toBe(10);
    expect(metrics.netWpm).toBe(6);
  });

  it('scores final word without trailing space in completedWords and metrics', () => {
    // 2 words: 'quick' and 'brown'. User typed 'quick ' then 'brown' (final character typed, no space after)
    const completedWords = [
      { expected: 'quick', typed: 'quick', correct: true },
      { expected: 'brown', typed: 'brown', correct: true },
    ];
    const keystrokes: KeystrokeLog[] = [
      { key: 'q', code: 'KeyQ', typedChar: 'q', expectedChar: 'q', timestamp: 1000, correct: true },
      { key: 'u', code: 'KeyU', typedChar: 'u', expectedChar: 'u', timestamp: 1100, correct: true },
      { key: 'i', code: 'KeyI', typedChar: 'i', expectedChar: 'i', timestamp: 1200, correct: true },
      { key: 'c', code: 'KeyC', typedChar: 'c', expectedChar: 'c', timestamp: 1300, correct: true },
      { key: 'k', code: 'KeyK', typedChar: 'k', expectedChar: 'k', timestamp: 1400, correct: true },
      { key: ' ', code: 'Space', typedChar: ' ', expectedChar: ' ', timestamp: 1500, correct: true },
      { key: 'b', code: 'KeyB', typedChar: 'b', expectedChar: 'b', timestamp: 2000, correct: true },
      { key: 'r', code: 'KeyR', typedChar: 'r', expectedChar: 'r', timestamp: 2100, correct: true },
      { key: 'o', code: 'KeyO', typedChar: 'o', expectedChar: 'o', timestamp: 2200, correct: true },
      { key: 'w', code: 'KeyW', typedChar: 'w', expectedChar: 'w', timestamp: 2300, correct: true },
      { key: 'n', code: 'KeyN', typedChar: 'n', expectedChar: 'n', timestamp: 2400, correct: true },
    ];

    const metrics = calculateMetrics(
      { ...baseConfig, mode: 'words', wordCount: 10 },
      keystrokes,
      completedWords,
      [],
      1000,
      3000
    );

    // Both words (5 + 5 chars + 1 space = 11 correct characters)
    expect(metrics.charStats.correct).toBe(11);
    expect(metrics.charStats.wrong).toBe(0);
    expect(metrics.accuracy).toBe(100);
  });

  it('scores characters in partial word typed before timeout expires', () => {
    // In a 30s test, user finished 'apple ' and typed 'ban' of 'banana' when time expired
    const completedWordsWithPartial = [
      { expected: 'apple', typed: 'apple', correct: true },
      { expected: 'banana', typed: 'ban', correct: false },
    ];
    const keystrokes: KeystrokeLog[] = [
      { key: 'a', code: 'KeyA', typedChar: 'a', expectedChar: 'a', timestamp: 1000, correct: true },
      { key: 'p', code: 'KeyP', typedChar: 'p', expectedChar: 'p', timestamp: 1100, correct: true },
      { key: 'p', code: 'KeyP', typedChar: 'p', expectedChar: 'p', timestamp: 1200, correct: true },
      { key: 'l', code: 'KeyL', typedChar: 'l', expectedChar: 'l', timestamp: 1300, correct: true },
      { key: 'e', code: 'KeyE', typedChar: 'e', expectedChar: 'e', timestamp: 1400, correct: true },
      { key: ' ', code: 'Space', typedChar: ' ', expectedChar: ' ', timestamp: 1500, correct: true },
      { key: 'b', code: 'KeyB', typedChar: 'b', expectedChar: 'b', timestamp: 2000, correct: true },
      { key: 'a', code: 'KeyA', typedChar: 'a', expectedChar: 'a', timestamp: 2100, correct: true },
      { key: 'n', code: 'KeyN', typedChar: 'n', expectedChar: 'n', timestamp: 2200, correct: true },
    ];

    const metrics = calculateMetrics(
      baseConfig,
      keystrokes,
      completedWordsWithPartial,
      [],
      1000,
      31000
    );

    // Correct chars: 5 (apple) + 1 (space) + 3 (ban) = 9
    // Missed chars in banana: 6 - 3 = 3
    expect(metrics.charStats.correct).toBe(9);
    expect(metrics.charStats.missed).toBe(3);
    expect(metrics.accuracy).toBe(100);
  });

  it('preserves stable test result ID across multiple invocations when ID is provided', () => {
    const fixedId = 'test-run-12345';
    const dummyMetrics = calculateMetrics(baseConfig, [], [], [], null, null);

    const res1 = buildTestResult(baseConfig, dummyMetrics, [], 'completed', { id: fixedId });
    const res2 = buildTestResult(baseConfig, dummyMetrics, [], 'completed', { id: fixedId });

    expect(res1.id).toBe(fixedId);
    expect(res2.id).toBe(fixedId);
    expect(res1.id).toBe(res2.id);
  });

  it('guarantees lesson drill words only use the specific keys in that lesson', async () => {
    const { LESSONS, generateLessonDrillWords } = await import('../lib/lessons');
    for (const lesson of LESSONS) {
      const allowed = new Set(lesson.keys.map((k) => k.toLowerCase()));
      const words = generateLessonDrillWords(lesson, 30);
      for (const word of words) {
        for (const ch of word) {
          expect(allowed.has(ch.toLowerCase())).toBe(true);
        }
      }
    }
  });

  it('does not penalize space keystroke accuracy when previous word had an error', () => {
    // User typed 'aple' instead of 'apple', then pressed Space
    const keystrokes: KeystrokeLog[] = [
      { key: 'a', code: 'KeyA', typedChar: 'a', expectedChar: 'a', timestamp: 1000, correct: true },
      { key: 'p', code: 'KeyP', typedChar: 'p', expectedChar: 'p', timestamp: 1100, correct: true },
      { key: 'l', code: 'KeyL', typedChar: 'l', expectedChar: 'p', timestamp: 1200, correct: false },
      { key: 'e', code: 'KeyE', typedChar: 'e', expectedChar: 'l', timestamp: 1300, correct: false },
      { key: ' ', code: 'Space', typedChar: ' ', expectedChar: ' ', timestamp: 1400, correct: true },
    ];

    const spaceKeystroke = keystrokes.find((k) => k.key === ' ');
    expect(spaceKeystroke?.correct).toBe(true);

    const metrics = calculateMetrics(
      baseConfig,
      keystrokes,
      [{ expected: 'apple', typed: 'aple', correct: false }],
      [],
      1000,
      2000
    );

    // 5 keystrokes total: 3 correct ('a', 'p', ' '), 2 wrong ('l', 'e')
    // Live/final accuracy = 3/5 = 60%
    expect(metrics.accuracy).toBe(60);
    expect(metrics.charStats.extra).toBe(0);
  });

  it('handles zero elapsed time safely with 0 WPM and no NaN/Infinity', () => {
    const metrics = calculateMetrics(baseConfig, [], [], [], 1000, 1000);
    expect(metrics.netWpm).toBe(0);
    expect(metrics.rawWpm).toBe(0);
    expect(Number.isFinite(metrics.netWpm)).toBe(true);
    expect(Number.isNaN(metrics.netWpm)).toBe(false);
  });
});
