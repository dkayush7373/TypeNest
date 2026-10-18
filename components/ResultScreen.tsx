'use client';

import React, { useState, useEffect } from 'react';
import { TestResult } from '@/types';
import { ResultChart } from '@/components/ResultChart';
import { Heatmap } from '@/components/Heatmap';
import {
  RotateCcw,
  ArrowRight,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Target,
  Zap,
  Activity,
} from 'lucide-react';

interface ResultScreenProps {
  result: TestResult;
  previousResult?: TestResult | null;
  personalBest?: number | null;
  onTryAgain: () => void;
  onNextTest: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  previousResult,
  personalBest,
  onTryAgain,
  onNextTest,
}) => {
  const [copied, setCopied] = useState(false);
  const [animatedWpm, setAnimatedWpm] = useState(0);

  // Animated number counter respecting prefers-reduced-motion
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      const timer = setTimeout(() => setAnimatedWpm(result.netWpm), 0);
      return () => clearTimeout(timer);
    }

    const start = 0;
    const end = result.netWpm;
    const duration = 650;
    const startTime = performance.now();
    let frameId: number;

    const frame = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(start + (end - start) * ease);
      setAnimatedWpm(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(frame);
      }
    };

    frameId = requestAnimationFrame(frame);
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [result.netWpm]);

  // Copy result handler
  const handleCopyResult = async () => {
    const text = `KeyFlow Speed Test Result:
- Net WPM: ${result.netWpm}
- Raw WPM: ${result.rawWpm}
- Accuracy: ${result.accuracy}%
- Consistency: ${result.consistency}%
- Mode: ${result.mode === 'time' ? `${result.targetCount}s` : `${result.targetCount} words`}
- Characters: ${result.charStats.correct}/${result.charStats.wrong}/${result.charStats.missed}/${result.charStats.extra}`;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Difference with previous test
  const diffPrevious = previousResult ? result.netWpm - previousResult.netWpm : null;
  // Difference with personal best
  const diffPb = personalBest !== undefined && personalBest !== null ? result.netWpm - personalBest : null;

  // Verdict calculation
  let verdictTitle = 'Beginner';
  let verdictDesc = 'Keep building muscle memory and rhythm.';

  if (result.netWpm >= 100) {
    verdictTitle = 'Pro';
    verdictDesc = 'Exceptional typing velocity and mechanical precision.';
  } else if (result.netWpm >= 70) {
    verdictTitle = 'Fast';
    verdictDesc = 'Swift keystrokes with high natural flow.';
  } else if (result.netWpm >= 45) {
    verdictTitle = 'Good';
    verdictDesc = 'Solid everyday typing speed with steady execution.';
  } else if (result.netWpm >= 25) {
    verdictTitle = 'Improving';
    verdictDesc = 'Noticeable progress. Smooth transitions between letter pairs.';
  }

  if (result.accuracy < 90) {
    verdictDesc += ' Slow down and aim for accuracy first.';
  }

  return (
    <div
      className="w-full max-w-4xl flex flex-col space-y-8 animate-fadeIn"
      aria-label="Typing test result report"
    >
      {/* Hero Section: Giant Net WPM & Verdict */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[var(--border)]">
        <div className="flex flex-col">
          <span className="text-xs uppercase font-mono tracking-widest text-[var(--text-muted)] mb-1">
            Net Typing Speed
          </span>
          <div className="flex items-baseline space-x-4">
            <span className="text-7xl sm:text-8xl font-bold font-mono text-[var(--accent)] num-tabular leading-none">
              {animatedWpm}
            </span>
            <div className="flex flex-col">
              <span className="text-lg font-mono text-[var(--text-muted)] font-medium">WPM</span>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                {result.rawWpm} raw
              </span>
            </div>
          </div>
        </div>

        {/* Verdict Badge & Line */}
        <div className="flex flex-col sm:items-end sm:text-right max-w-sm">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md border border-[var(--accent)]/30 bg-[var(--accent-soft)] mb-2 self-start sm:self-end">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            <span className="text-xs font-mono font-semibold text-[var(--accent)] uppercase tracking-wider">
              {verdictTitle}
            </span>
          </div>
          <p className="text-sm font-mono text-[var(--text)] leading-relaxed">
            {verdictDesc}
          </p>
        </div>
      </div>

      {/* Comparisons Row (Previous test & Personal best) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Accuracy */}
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          <div className="flex items-center space-x-2 text-[var(--text-muted)] mb-1">
            <Target className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-xs font-mono uppercase tracking-wider">Accuracy</span>
          </div>
          <span className="text-2xl font-bold font-mono text-[var(--text)] num-tabular">
            {result.accuracy}%
          </span>
        </div>

        {/* Consistency */}
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          <div className="flex items-center space-x-2 text-[var(--text-muted)] mb-1">
            <Activity className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-xs font-mono uppercase tracking-wider">Consistency</span>
          </div>
          <span className="text-2xl font-bold font-mono text-[var(--text)] num-tabular">
            {result.consistency}%
          </span>
        </div>

        {/* Comparison: Previous */}
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          <div className="flex items-center space-x-2 text-[var(--text-muted)] mb-1">
            <Zap className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="text-xs font-mono uppercase tracking-wider">vs Previous</span>
          </div>
          <div className="flex items-center space-x-1.5 text-2xl font-bold font-mono num-tabular">
            {diffPrevious === null ? (
              <span className="text-[var(--text-muted)] text-base">First test</span>
            ) : diffPrevious > 0 ? (
              <>
                <TrendingUp className="w-5 h-5 text-[var(--accent)]" />
                <span className="text-[var(--accent)]">+{diffPrevious}</span>
              </>
            ) : diffPrevious < 0 ? (
              <>
                <TrendingDown className="w-5 h-5 text-[var(--error)]" />
                <span className="text-[var(--error)]">{diffPrevious}</span>
              </>
            ) : (
              <>
                <Minus className="w-5 h-5 text-[var(--text-muted)]" />
                <span className="text-[var(--text)]">0</span>
              </>
            )}
          </div>
        </div>

        {/* Comparison: Personal Best */}
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          <div className="flex items-center space-x-2 text-[var(--text-muted)] mb-1">
            <Clock className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="text-xs font-mono uppercase tracking-wider">vs Best</span>
          </div>
          <div className="flex items-center space-x-1.5 text-2xl font-bold font-mono num-tabular">
            {diffPb === null ? (
              <span className="text-[var(--text-muted)] text-base">New record</span>
            ) : diffPb >= 0 ? (
              <>
                <TrendingUp className="w-5 h-5 text-[var(--accent)]" />
                <span className="text-[var(--accent)]">
                  {diffPb === 0 ? 'PB Match' : `+${diffPb} (New PB)`}
                </span>
              </>
            ) : (
              <>
                <TrendingDown className="w-5 h-5 text-[var(--text-muted)]" />
                <span className="text-[var(--text-muted)]">{diffPb}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Character Breakdown Details */}
      <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--panel)] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <span className="text-[var(--text-muted)] uppercase tracking-wider">Characters Breakdown:</span>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-[var(--text-muted)]">Correct:</span>
            <span className="font-semibold text-[var(--text)] num-tabular">{result.charStats.correct}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[var(--text-muted)]">Wrong:</span>
            <span className="font-semibold text-[var(--error)] num-tabular">{result.charStats.wrong}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[var(--text-muted)]">Missed:</span>
            <span className="font-semibold text-[var(--text-muted)] num-tabular">{result.charStats.missed}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[var(--text-muted)]">Extra:</span>
            <span className="font-semibold text-[var(--text-muted)] num-tabular">{result.charStats.extra}</span>
          </div>
        </div>
      </div>

      {/* Progression Line Chart */}
      <ResultChart data={result.wpmHistory} />

      {/* Keyboard Miss Heatmap */}
      <Heatmap missedKeys={result.missedKeys} />

      {/* Slowest Words List (if any recorded) */}
      {result.slowestWords.length > 0 && (
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--panel)] text-xs font-mono">
          <span className="text-[var(--text-muted)] uppercase tracking-wider block mb-3">
            Slowest Words
          </span>
          <div className="flex flex-wrap gap-2">
            {result.slowestWords.map((item, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded border border-[var(--border)] bg-[var(--bg)] flex items-center space-x-2 text-[var(--text)]"
              >
                <span>{item.word}</span>
                <span className="text-[var(--text-muted)] text-[10px]">
                  ~{item.durationMs}ms
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Primary Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--border)]">
        <div className="flex items-center space-x-3">
          <button
            onClick={onTryAgain}
            className="px-5 py-2.5 rounded-md font-mono text-sm font-medium bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 active:translate-y-[1px] transition-all flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <button
            onClick={onNextTest}
            className="px-5 py-2.5 rounded-md font-mono text-sm font-medium border border-[var(--border)] bg-transparent text-[var(--text)] hover:border-[var(--text-muted)] active:translate-y-[1px] transition-all flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
          >
            <span>Next Test</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleCopyResult}
          className="px-4 py-2.5 rounded-md font-mono text-xs font-medium border border-[var(--border)] bg-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)] active:translate-y-[1px] transition-all flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-[var(--accent)]">Copied to Clipboard</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Result</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
