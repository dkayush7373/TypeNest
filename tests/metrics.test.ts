import { describe, it, expect } from 'vitest';
import { calculateMetrics, buildTestResult } from '../lib/metrics';
import { TestConfig, KeystrokeLog } from '../types';
import { CompletedWord } from '../hooks/useTypingEngine';

function mockKey(
  char: string,
  timestamp: number,
  correct: boolean,
  expectedChar: string = char
): KeystrokeLog {
  return {
    key: char,
    code: `Key${char.toUpperCase()}`,
    typedChar: char,
    expectedChar,
    timestamp,
    correct,
  };
}

function mockWord(expected: string, typed: string): CompletedWord {
  return {
    expected,
    typed,
    correct: expected === typed,
  };
}

describe('Typing Metrics Engine', () => {
  const baseConfig: TestConfig = {
    mode: 'time',
    duration: 60,
    time: 60,
    words: 25,
    difficulty: 'standard',
    punctuation: false,
    numbers: false,
  };

  it('calculates Net WPM and Raw WPM accurately', () => {
    const completedWords: CompletedWord[] = [
      mockWord('hello', 'hello'),
      mockWord('world', 'world'),
    ];
    const keystrokes: KeystrokeLog[] = [];
    for (let i = 0; i < 11; i++) {
      keystrokes.push(mockKey('a', i * 100, true));
    }

    const metrics = calculateMetrics(
      baseConfig,
      keystrokes,
      completedWords,
      [],
      1000,
      61000 // 60s
    );

    expect(metrics.rawWpm).toBeGreaterThan(0);
    expect(metrics.accuracy).toBe(100);
    expect(metrics.charStats.correct).toBe(11); // 5 + 5 + 1 space
    expect(metrics.charStats.wrong).toBe(0);
  });

  it('calculates consistency only when at least 5 second-snapshots are present', () => {
    // Fewer than 5 snapshots should yield '-'
    const fewSnapshots = [
      { second: 1, wpm: 50, rawWpm: 55, errors: 0 },
      { second: 2, wpm: 52, rawWpm: 56, errors: 0 },
      { second: 3, wpm: 48, rawWpm: 50, errors: 0 },
    ];
    const metricsFew = calculateMetrics(
      baseConfig,
      [mockKey('a', 100, true)],
      [mockWord('a', 'a')],
      fewSnapshots,
      1000,
      4000
    );
    expect(metricsFew.consistencyFormatted).toBe('-');

    // 5 or more snapshots should yield a percentage string
    const enoughSnapshots = [
      { second: 1, wpm: 60, rawWpm: 60, errors: 0 },
      { second: 2, wpm: 60, rawWpm: 60, errors: 0 },
      { second: 3, wpm: 60, rawWpm: 60, errors: 0 },
      { second: 4, wpm: 60, rawWpm: 60, errors: 0 },
      { second: 5, wpm: 60, rawWpm: 60, errors: 0 },
    ];
    const metricsEnough = calculateMetrics(
      baseConfig,
      [mockKey('a', 100, true)],
      [mockWord('a', 'a')],
      enoughSnapshots,
      1000,
      6000
    );
    expect(metricsEnough.consistencyFormatted).toBe('100%');
    expect(metricsEnough.consistency).toBe(100);
  });

  it('correctly tracks missed and extra characters', () => {
    const completedWords: CompletedWord[] = [
      mockWord('apple', 'appl'),
      mockWord('house', 'houses'),
    ];
    const keystrokes: KeystrokeLog[] = [
      mockKey('a', 100, true),
      mockKey('p', 200, true),
      mockKey('p', 300, true),
      mockKey('l', 400, true),
      mockKey('h', 500, true),
      mockKey('o', 600, true),
      mockKey('u', 700, true),
      mockKey('s', 800, true),
      mockKey('e', 900, true),
      mockKey('s', 1000, false, ' '),
    ];

    const metrics = calculateMetrics(
      baseConfig,
      keystrokes,
      completedWords,
      [],
      1000,
      10000
    );

    expect(metrics.charStats.missed).toBe(1);
    expect(metrics.charStats.extra).toBe(1);
    expect(metrics.charStats.correct).toBe(9 + 1); // 4 + 5 + 1 space
  });

  it('protects against divide-by-zero on empty keystrokes or zero elapsed time', () => {
    const metrics = calculateMetrics(baseConfig, [], [], [], null, null);
    expect(metrics.netWpm).toBe(0);
    expect(metrics.rawWpm).toBe(0);
    expect(metrics.accuracy).toBe(100);
    expect(metrics.consistencyFormatted).toBe('-');
    expect(Number.isFinite(metrics.netWpm)).toBe(true);
    expect(Number.isNaN(metrics.netWpm)).toBe(false);
  });

  it('assigns correct verdict titles and advice based on speed and accuracy', () => {
    // Pro tier: >= 100 WPM
    const proKeystrokes: KeystrokeLog[] = Array.from({ length: 500 }, (_, i) =>
      mockKey('a', i * 50, true)
    );
    const proWords: CompletedWord[] = Array.from({ length: 100 }, () =>
      mockWord('words', 'words')
    );
    const proMetrics = calculateMetrics(
      baseConfig,
      proKeystrokes,
      proWords,
      [],
      1000,
      61000 // 60s -> ~100 wpm
    );
    expect(proMetrics.verdict.title).toBe('Pro');

    // Low accuracy advice
    const inaccurateKeystrokes: KeystrokeLog[] = [
      mockKey('a', 100, true),
      mockKey('b', 200, false, 'c'),
    ];
    const inaccMetrics = calculateMetrics(
      baseConfig,
      inaccurateKeystrokes,
      [],
      [],
      1000,
      5000
    );
    expect(inaccMetrics.accuracy).toBe(50);
    expect(inaccMetrics.verdict.description).toContain('Slow down and aim for accuracy first.');
  });

  it('builds a complete TestResult object with unique id and timestamp', () => {
    const metrics = calculateMetrics(baseConfig, [], [], [], 1000, 2000);
    const result = buildTestResult(baseConfig, metrics, [], 'completed', {
      cleanStreak: 42,
    });

    expect(result.id).toMatch(/^test-\d+/);
    expect(result.cleanStreak).toBe(42);
    expect(result.status).toBe('completed');
    expect(result.netWpm).toBe(0);
  });
});
