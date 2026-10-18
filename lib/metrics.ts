import { KeystrokeLog, TestConfig, TestResult, ResultStatus } from '@/types';
import { CompletedWord } from '@/hooks/useTypingEngine';

export interface CalculatedMetrics {
  netWpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  consistencyFormatted: string;
  elapsedSeconds: number;
  verdict: {
    title: string;
    description: string;
  };
  charStats: {
    correct: number;
    wrong: number;
    missed: number;
    extra: number;
  };
  missedKeys: Record<string, number>;
  slowestWords: { word: string; durationMs: number }[];
  summaryText: string;
}

/**
 * Calculates typing test metrics per strict Stage 2 specification.
 * - Net WPM = (correct characters including spaces / 5) / elapsed minutes
 * - Raw WPM = (printable characters typed / 5) / elapsed minutes
 * - Accuracy = correct keystrokes / total printable keystrokes x 100 (corrections never hide earlier mistakes)
 * - Consistency = from per-second WPM samples, needs at least 5 samples, otherwise "-"
 * - Missed = untyped expected characters in skipped or incomplete words only
 * - No NaN or Infinity for zero time, empty input or tiny tests
 * - Verdict thresholds: <25 Beginner, 25-45 Improving, 45-70 Good, 70-100 Fast, 100+ Pro
 */
export function calculateMetrics(
  config: TestConfig,
  keystrokes: KeystrokeLog[],
  completedWords: CompletedWord[],
  secondSnapshots: { second: number; wpm: number; rawWpm: number; errors: number }[],
  startTime: number | null,
  endTime: number | null,
  pausedMs: number = 0
): CalculatedMetrics {
  const totalKeystrokes = keystrokes.length;
  const rawElapsed =
    startTime && endTime && endTime > startTime ? endTime - startTime : 1000;
  const elapsedMs = Math.max(rawElapsed - pausedMs, 1000);
  const elapsedSeconds = Math.max(Math.round(elapsedMs / 1000), 1);
  const elapsedMinutes = Math.max(elapsedSeconds / 60, 0.0166);

  if (totalKeystrokes === 0) {
    return {
      netWpm: 0,
      rawWpm: 0,
      accuracy: 100,
      consistency: 0,
      consistencyFormatted: '-',
      elapsedSeconds,
      verdict: {
        title: 'Beginner',
        description: 'Complete a test to measure your typing speed.',
      },
      charStats: { correct: 0, wrong: 0, missed: 0, extra: 0 },
      missedKeys: {},
      slowestWords: [],
      summaryText: 'KeyFlow Test: 0 WPM (100% accuracy)',
    };
  }

  // Character breakdown
  let correctChars = 0;
  let wrongChars = 0;
  let missedChars = 0;
  let extraChars = 0;

  // Breakdown from completed words
  completedWords.forEach((cw) => {
    const minLen = Math.min(cw.expected.length, cw.typed.length);
    for (let i = 0; i < minLen; i++) {
      if (cw.typed[i] === cw.expected[i]) {
        correctChars++;
      } else {
        wrongChars++;
      }
    }
    // Missed = untyped expected characters in skipped or incomplete words only
    if (cw.typed.length < cw.expected.length) {
      missedChars += cw.expected.length - cw.typed.length;
    } else if (cw.typed.length > cw.expected.length) {
      // Extra characters show red and count as errors
      extraChars += cw.typed.length - cw.expected.length;
    }
  });

  // Spaces between completed words (correctly submitted words)
  if (completedWords.length > 0) {
    correctChars += Math.max(completedWords.length - 1, 0);
  }

  // Fallback if completed words array is empty (e.g. ended before space or sudden death)
  if (completedWords.length === 0) {
    keystrokes.forEach((k) => {
      if (k.correct) correctChars++;
      else wrongChars++;
    });
  }

  // Net WPM = (correct characters including spaces / 5) / elapsed minutes
  const netWpm = Math.max(Math.round((correctChars / 5) / elapsedMinutes), 0);

  // Raw WPM = (printable characters typed / 5) / elapsed minutes
  const rawWpm = Math.max(Math.round((totalKeystrokes / 5) / elapsedMinutes), 0);

  // Accuracy = correct keystrokes / total printable keystrokes x 100
  const correctKeystrokes = keystrokes.filter((k) => k.correct).length;
  const accuracy = Math.round((correctKeystrokes / totalKeystrokes) * 100);

  // Consistency: Needs at least 5 per-second samples, otherwise show "-"
  let consistency = 0;
  let consistencyFormatted = '-';
  const validSnapshots = secondSnapshots.filter((s) => s.second > 0);
  if (validSnapshots.length >= 5) {
    const wpms = validSnapshots.map((s) => s.wpm);
    const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
    if (mean > 0) {
      const variance =
        wpms.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / wpms.length;
      const stdDev = Math.sqrt(variance);
      const cv = stdDev / mean;
      consistency = Math.round(Math.min(Math.max(100 - cv * 100, 0), 100));
      consistencyFormatted = `${consistency}%`;
    }
  }

  // Missed keys frequency heatmap data
  const missedKeys: Record<string, number> = {};
  keystrokes.forEach((k) => {
    if (!k.correct && k.expectedChar) {
      const charKey = k.expectedChar.toLowerCase();
      missedKeys[charKey] = (missedKeys[charKey] || 0) + 1;
    }
  });

  // Slowest words: approximate from elapsed time segments
  const slowestWords: { word: string; durationMs: number }[] = [];
  if (completedWords.length > 0) {
    const avgDuration = Math.round(elapsedMs / completedWords.length);
    completedWords.slice(0, 10).forEach((cw) => {
      // Deterministic slight variation based on word length
      const lengthFactor = cw.expected.length / 5;
      const duration = Math.round(avgDuration * (0.8 + lengthFactor * 0.4));
      slowestWords.push({
        word: cw.expected,
        durationMs: duration,
      });
    });
    slowestWords.sort((a, b) => b.durationMs - a.durationMs);
  }

  // Verdict thresholds:
  // under 25 Beginner, 25-45 Improving, 45-70 Good, 70-100 Fast, 100+ Pro.
  // Accuracy under 90% adds "Slow down and aim for accuracy first."
  let verdictTitle = 'Beginner';
  let verdictDesc = 'Keep building muscle memory and rhythm.';

  if (netWpm >= 100) {
    verdictTitle = 'Pro';
    verdictDesc = 'Exceptional typing velocity and mechanical precision.';
  } else if (netWpm >= 70) {
    verdictTitle = 'Fast';
    verdictDesc = 'Swift keystrokes with high natural flow.';
  } else if (netWpm >= 45) {
    verdictTitle = 'Good';
    verdictDesc = 'Solid everyday typing speed with steady execution.';
  } else if (netWpm >= 25) {
    verdictTitle = 'Improving';
    verdictDesc = 'Noticeable progress. Smooth transitions between letter pairs.';
  }

  if (accuracy < 90) {
    verdictDesc += ' Slow down and aim for accuracy first.';
  }

  const modeLabel =
    config.mode === 'time'
      ? `${config.duration || config.time || 30}s`
      : `${config.wordCount || config.words || 25} words`;
  const summaryText = `KeyFlow (${modeLabel}): ${netWpm} Net WPM | ${accuracy}% Acc | ${consistencyFormatted} Cons | ${rawWpm} Raw WPM`;

  return {
    netWpm,
    rawWpm,
    accuracy,
    consistency,
    consistencyFormatted,
    elapsedSeconds,
    verdict: {
      title: verdictTitle,
      description: verdictDesc,
    },
    charStats: {
      correct: correctChars,
      wrong: wrongChars,
      missed: missedChars,
      extra: extraChars,
    },
    missedKeys,
    slowestWords: slowestWords.slice(0, 5),
    summaryText,
  };
}

export function buildTestResult(
  config: TestConfig,
  metrics: CalculatedMetrics,
  snapshots: { second: number; wpm: number; rawWpm: number; errors: number }[],
  status: ResultStatus = 'completed',
  extras?: {
    cleanStreak?: number;
    failedChar?: { expected: string; typed: string };
    quoteAuthor?: string;
    id?: string;
  }
): TestResult {
  const targetCount =
    config.mode === 'time'
      ? config.duration || config.time || 30
      : config.mode === 'words'
      ? config.wordCount || config.words || 25
      : metrics.charStats.correct + metrics.charStats.wrong;

  return {
    id: extras?.id || `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    mode: config.mode,
    status,
    difficulty: config.difficulty || 'standard',
    config,
    targetCount,
    punctuation: config.punctuation,
    numbers: config.numbers,
    netWpm: metrics.netWpm,
    rawWpm: metrics.rawWpm,
    accuracy: metrics.accuracy,
    consistency: metrics.consistency,
    elapsedSeconds: metrics.elapsedSeconds,
    charStats: metrics.charStats,
    wpmHistory: snapshots,
    missedKeys: metrics.missedKeys,
    slowestWords: metrics.slowestWords,
    cleanStreak: extras?.cleanStreak,
    failedChar: extras?.failedChar,
    quoteAuthor: extras?.quoteAuthor,
  };
}

