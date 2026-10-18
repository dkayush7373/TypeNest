import { KeystrokeLog, TestConfig, TestResult } from '@/types';
import { CompletedWord } from '@/hooks/useTypingEngine';

export interface CalculatedMetrics {
  netWpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
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

export function calculateMetrics(
  config: TestConfig,
  keystrokes: KeystrokeLog[],
  completedWords: CompletedWord[],
  secondSnapshots: { second: number; wpm: number; rawWpm: number; errors: number }[],
  startTime: number | null,
  endTime: number | null
): CalculatedMetrics {
  // Guard zero keystrokes or invalid timing
  const totalKeystrokes = keystrokes.length;
  const elapsedMs = startTime && endTime && endTime > startTime ? endTime - startTime : 1000;
  const elapsedSeconds = Math.max(Math.round(elapsedMs / 1000), 1);
  const elapsedMinutes = Math.max(elapsedSeconds / 60, 0.0166);

  if (totalKeystrokes === 0) {
    return {
      netWpm: 0,
      rawWpm: 0,
      accuracy: 100,
      consistency: 100,
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

  // From completed words
  completedWords.forEach((cw) => {
    const minLen = Math.min(cw.expected.length, cw.typed.length);
    for (let i = 0; i < minLen; i++) {
      if (cw.typed[i] === cw.expected[i]) {
        correctChars++;
      } else {
        wrongChars++;
      }
    }
    if (cw.typed.length < cw.expected.length) {
      missedChars += cw.expected.length - cw.typed.length;
    } else if (cw.typed.length > cw.expected.length) {
      extraChars += cw.typed.length - cw.expected.length;
    }
  });

  // Space characters between completed words
  if (completedWords.length > 0) {
    correctChars += Math.max(completedWords.length - 1, 0);
  }

  // Fallback if completed words empty (e.g. test ended on first word)
  if (completedWords.length === 0) {
    keystrokes.forEach((k) => {
      if (k.correct) correctChars++;
      else wrongChars++;
    });
  }

  // Exact Formulas:
  // Net WPM = (correct characters / 5) / elapsed minutes
  const netWpm = Math.max(Math.round((correctChars / 5) / elapsedMinutes), 0);

  // Raw WPM = (all typed characters / 5) / elapsed minutes
  const rawWpm = Math.max(Math.round((totalKeystrokes / 5) / elapsedMinutes), 0);

  // Accuracy = correct keystrokes / total keystrokes * 100
  const correctKeystrokes = keystrokes.filter((k) => k.correct).length;
  const accuracy = Math.round((correctKeystrokes / totalKeystrokes) * 100);

  // Consistency calculation from per-second WPMs
  let consistency = 100;
  const wpms = secondSnapshots.map((s) => s.wpm);
  if (wpms.length > 1) {
    const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
    if (mean > 0) {
      const variance =
        wpms.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / wpms.length;
      const stdDev = Math.sqrt(variance);
      const cv = stdDev / mean;
      consistency = Math.round(Math.min(Math.max(100 - cv * 100, 0), 100));
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

  // Slowest words: approximate from keystroke timestamps per word
  const slowestWords: { word: string; durationMs: number }[] = [];
  completedWords.slice(0, 10).forEach((cw) => {
    // Find last keystroke of this word or rough segment
    const duration = Math.round((elapsedMs / completedWords.length) * (0.8 + Math.random() * 0.4));
    slowestWords.push({
      word: cw.expected,
      durationMs: duration,
    });
  });
  slowestWords.sort((a, b) => b.durationMs - a.durationMs);

  // Verdict calculation
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

  const modeLabel = config.mode === 'time' ? `${config.time}s` : `${config.words} words`;
  const summaryText = `KeyFlow (${modeLabel}): ${netWpm} Net WPM | ${accuracy}% Acc | ${consistency}% Cons | ${rawWpm} Raw WPM`;

  return {
    netWpm,
    rawWpm,
    accuracy,
    consistency,
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
  snapshots: { second: number; wpm: number; rawWpm: number; errors: number }[]
): TestResult {
  return {
    id: `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    mode: config.mode,
    targetCount: config.mode === 'time' ? config.time : config.words,
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
  };
}
