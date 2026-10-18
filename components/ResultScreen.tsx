'use client';

import React, { useState, useEffect } from 'react';
import { TestResult } from '@/types';
import { ResultChart } from '@/components/ResultChart';
import { Heatmap } from '@/components/Heatmap';
import { StreakMetrics } from '@/lib/streak';
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
  Flame,
  Award,
  Download,
  AlertTriangle,
  Wind,
  Quote as QuoteIcon,
} from 'lucide-react';

interface ResultScreenProps {
  result: TestResult;
  previousResult?: TestResult | null;
  personalBest?: number | null;
  streakMetrics?: StreakMetrics;
  onTryAgain: () => void;
  onNextTest: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  previousResult,
  personalBest,
  streakMetrics,
  onTryAgain,
  onNextTest,
}) => {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [animatedWpm, setAnimatedWpm] = useState(0);
  const [isExportingPng, setIsExportingPng] = useState(false);

  // Animated number counter respecting prefers-reduced-motion
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || result.status !== 'completed') {
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
  }, [result.netWpm, result.status]);

  // Copy result handler with visible error handling
  const handleCopyResult = async () => {
    const text = `KeyFlow Speed Test Result:
- Net WPM: ${result.netWpm}
- Raw WPM: ${result.rawWpm}
- Accuracy: ${result.accuracy}%
- Consistency: ${result.consistency}%
- Mode: ${result.mode}
- Characters: ${result.charStats.correct}/${result.charStats.wrong}/${result.charStats.missed}/${result.charStats.extra}`;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 2500);
    }
  };

  // Download result card as PNG via Canvas
  const handleDownloadCard = () => {
    try {
      setIsExportingPng(true);
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 450;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Dark ink background
      ctx.fillStyle = '#0b1118';
      ctx.fillRect(0, 0, 800, 450);

      // Subtle border
      ctx.strokeStyle = '#1b2733';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, 780, 430);

      // Accent header
      ctx.fillStyle = '#3dd6c6';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('KEYFLOW STUDIO', 40, 55);

      ctx.fillStyle = '#64748b';
      ctx.font = '14px monospace';
      ctx.fillText(`Mode: ${result.mode.toUpperCase()}`, 40, 80);

      // Large Net WPM
      ctx.fillStyle = '#3dd6c6';
      ctx.font = 'bold 96px monospace';
      ctx.fillText(`${result.netWpm}`, 40, 190);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '18px monospace';
      ctx.fillText('NET WPM', 40, 225);

      // Stats column
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 28px monospace';
      ctx.fillText(`${result.accuracy}%`, 320, 150);
      ctx.fillText(`${result.rawWpm}`, 480, 150);
      ctx.fillText(`${result.consistency}%`, 640, 150);

      ctx.fillStyle = '#64748b';
      ctx.font = '12px monospace';
      ctx.fillText('ACCURACY', 320, 175);
      ctx.fillText('RAW WPM', 480, 175);
      ctx.fillText('CONSISTENCY', 640, 175);

      // Character stats
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px monospace';
      ctx.fillText(
        `Chars: ${result.charStats.correct} correct, ${result.charStats.wrong} wrong, ${result.charStats.missed} missed`,
        40,
        280
      );

      // Footer
      ctx.fillStyle = '#475569';
      ctx.font = '12px monospace';
      ctx.fillText(
        `Generated on ${new Date(result.timestamp).toLocaleDateString()} • keyflow.studio`,
        40,
        400
      );

      // Download
      const link = document.createElement('a');
      link.download = `keyflow-result-${result.netWpm}wpm.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setIsExportingPng(false);
    }
  };

  // Difference with previous test
  const diffPrevious = previousResult ? result.netWpm - previousResult.netWpm : null;
  // Difference with personal best
  const diffPb =
    personalBest !== undefined && personalBest !== null ? result.netWpm - personalBest : null;

  // Streak feedback
  const isStreakMilestone =
    streakMetrics &&
    [3, 7, 14, 30, 60, 100, 365].includes(streakMetrics.currentStreak) &&
    streakMetrics.isTodayGoalMet;

  // ZEN MODE SUMMARY VIEW
  if (result.status === 'zen') {
    const approxWords =
      result.charStats.correct > 0 ? Math.round(result.charStats.correct / 5) : 0;
    return (
      <div className="w-full max-w-4xl p-6 sm:p-8 rounded-lg border border-[var(--border)] bg-[var(--panel)] font-mono space-y-6 animate-fadeIn">
        <div className="flex items-center space-x-3 text-[var(--accent)] pb-4 border-b border-[var(--border)]">
          <Wind className="w-6 h-6" />
          <h2 className="text-xl font-semibold text-[var(--text)]">Zen Session Completed</h2>
        </div>

        <p className="text-sm text-[var(--text-muted)]">
          You practiced mindfully without the pressure of a timer or error penalty.
        </p>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="p-4 rounded border border-[var(--border)] bg-[var(--bg)]">
            <span className="block text-[10px] text-[var(--text-muted)] uppercase">Time Practiced</span>
            <span className="text-2xl font-bold text-[var(--text)] num-tabular">
              {result.elapsedSeconds}s
            </span>
          </div>

          <div className="p-4 rounded border border-[var(--border)] bg-[var(--bg)]">
            <span className="block text-[10px] text-[var(--text-muted)] uppercase">Words Typed</span>
            <span className="text-2xl font-bold text-[var(--accent)] num-tabular">
              {approxWords}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-4 border-t border-[var(--border)]">
          <button
            onClick={onTryAgain}
            className="px-5 py-2.5 rounded bg-[var(--accent)] text-[var(--bg)] font-semibold text-xs hover:opacity-90 transition-opacity"
          >
            Start Another Zen Session
          </button>
          <button
            onClick={onNextTest}
            className="px-5 py-2.5 rounded border border-[var(--border)] text-[var(--text)] text-xs hover:text-[var(--accent)] transition-colors"
          >
            Exit to Test
          </button>
        </div>
      </div>
    );
  }

  // SUDDEN DEATH FAILED VIEW
  if (result.status === 'failed') {
    return (
      <div className="w-full max-w-4xl p-6 sm:p-8 rounded-lg border border-rose-500/40 bg-[var(--panel)] font-mono space-y-6 animate-fadeIn">
        <div className="flex items-center space-x-3 text-rose-400 pb-4 border-b border-[var(--border)]">
          <AlertTriangle className="w-6 h-6" />
          <div>
            <h2 className="text-xl font-semibold text-[var(--text)]">Sudden Death Terminated</h2>
            <p className="text-xs text-[var(--text-muted)]">
              A single keystroke error ended the run.
            </p>
          </div>
        </div>

        {/* Failed Keycap Comparison */}
        {result.failedChar && (
          <div className="p-4 rounded border border-[var(--border)] bg-[var(--bg)] flex items-center justify-around text-center">
            <div>
              <span className="block text-[10px] text-[var(--text-muted)] uppercase mb-1">Expected Key</span>
              <kbd className="px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--panel)] text-sm font-bold text-[var(--accent)]">
                {result.failedChar.expected === ' ' ? 'Space' : result.failedChar.expected}
              </kbd>
            </div>
            <span className="text-xs text-[var(--text-muted)]">vs</span>
            <div>
              <span className="block text-[10px] text-[var(--text-muted)] uppercase mb-1">Typed Key</span>
              <kbd className="px-3 py-1.5 rounded border border-rose-500/50 bg-rose-500/10 text-sm font-bold text-rose-400">
                {result.failedChar.typed === ' ' ? 'Space' : result.failedChar.typed}
              </kbd>
            </div>
          </div>
        )}

        {/* Metrics reached */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded border border-[var(--border)] bg-[var(--bg)]">
            <span className="block text-[10px] text-[var(--text-muted)] uppercase">Clean Keystroke Streak</span>
            <span className="text-2xl font-bold text-[var(--text)] num-tabular">
              {result.cleanStreak || 0}
            </span>
          </div>

          <div className="p-4 rounded border border-[var(--border)] bg-[var(--bg)]">
            <span className="block text-[10px] text-[var(--text-muted)] uppercase">Characters Reached</span>
            <span className="text-2xl font-bold text-[var(--text)] num-tabular">
              {result.charStats.correct}
            </span>
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)]">
          * Note: Failed sudden death attempts are excluded from speed averages, but still count toward your daily practice streak.
        </p>

        <div className="flex items-center space-x-3 pt-4 border-t border-[var(--border)]">
          <button
            onClick={onTryAgain}
            className="px-5 py-2.5 rounded bg-[var(--accent)] text-[var(--bg)] font-semibold text-xs hover:opacity-90 transition-opacity"
          >
            Retry Sudden Death
          </button>
          <button
            onClick={onNextTest}
            className="px-5 py-2.5 rounded border border-[var(--border)] text-[var(--text)] text-xs hover:text-[var(--accent)] transition-colors"
          >
            Switch Mode
          </button>
        </div>
      </div>
    );
  }

  // STANDARD COMPLETED TEST REPORT
  return (
    <div
      className="w-full max-w-4xl flex flex-col space-y-6 sm:space-y-8 animate-fadeIn"
      aria-label="Typing test result report"
    >
      {/* Streak Achievement Banner */}
      {streakMetrics && (
        <div className="p-3 rounded-md border border-[var(--border)] bg-[var(--panel)] flex items-center justify-between font-mono text-xs">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-[var(--accent)]" />
            <span>
              {streakMetrics.isTodayGoalMet
                ? `Day ${streakMetrics.currentStreak} of your streak • Goal done for today.`
                : 'Session logged toward today’s streak goal.'}
            </span>
          </div>

          {isStreakMilestone && (
            <div className="flex items-center space-x-1.5 text-[var(--accent)] font-semibold">
              <Award className="w-4 h-4" />
              <span>{streakMetrics.currentStreak} Day Milestone Unlocked!</span>
            </div>
          )}
        </div>
      )}

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
              {result.netWpm >= 100
                ? 'Pro'
                : result.netWpm >= 70
                ? 'Fast'
                : result.netWpm >= 45
                ? 'Good'
                : result.netWpm >= 25
                ? 'Improving'
                : 'Beginner'}
            </span>
          </div>
          <p className="text-sm font-mono text-[var(--text)] leading-relaxed">
            {result.accuracy < 90
              ? 'Steady execution. Slow down and aim for accuracy first.'
              : 'Consistent mechanical velocity and precision.'}
          </p>
          {result.quoteAuthor && (
            <span className="text-xs text-[var(--text-muted)] mt-1 font-mono flex items-center space-x-1">
              <QuoteIcon className="w-3 h-3 text-[var(--accent)]" />
              <span>Quote by {result.quoteAuthor}</span>
            </span>
          )}
        </div>
      </div>

      {/* Comparisons Row (Accuracy, Consistency, vs Previous, vs Best) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          <div className="flex items-center space-x-2 text-[var(--text-muted)] mb-1">
            <Target className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-xs font-mono uppercase tracking-wider">Accuracy</span>
          </div>
          <span className="text-2xl font-bold font-mono text-[var(--text)] num-tabular">
            {result.accuracy}%
          </span>
        </div>

        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          <div className="flex items-center space-x-2 text-[var(--text-muted)] mb-1">
            <Activity className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-xs font-mono uppercase tracking-wider">Consistency</span>
          </div>
          <span className="text-2xl font-bold font-mono text-[var(--text)] num-tabular">
            {result.consistency > 0 ? `${result.consistency}%` : '-'}
          </span>
        </div>

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
                <TrendingDown className="w-5 h-5 text-rose-400" />
                <span className="text-rose-400">{diffPrevious}</span>
              </>
            ) : (
              <>
                <Minus className="w-5 h-5 text-[var(--text-muted)]" />
                <span className="text-[var(--text)]">0</span>
              </>
            )}
          </div>
        </div>

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
                  {diffPb === 0 ? 'PB Match' : `+${diffPb} (PB)`}
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
            <span className="font-semibold text-rose-400 num-tabular">{result.charStats.wrong}</span>
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

      {/* Slowest Words List */}
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
            className="px-5 py-2.5 rounded-md font-mono text-sm font-medium bg-[var(--accent)] text-[var(--bg)] hover:opacity-90 active:translate-y-[1px] transition-all flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
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

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadCard}
            disabled={isExportingPng}
            className="px-4 py-2.5 rounded-md font-mono text-xs font-medium border border-[var(--border)] bg-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)] active:translate-y-[1px] transition-all flex items-center space-x-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            title="Download result card as PNG"
          >
            <Download className="w-4 h-4" />
            <span>Save Card</span>
          </button>

          <button
            onClick={handleCopyResult}
            className="px-4 py-2.5 rounded-md font-mono text-xs font-medium border border-[var(--border)] bg-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)] active:translate-y-[1px] transition-all flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-[var(--accent)]">Copied</span>
              </>
            ) : copyFailed ? (
              <span className="text-rose-400">Copy Failed</span>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Result</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

