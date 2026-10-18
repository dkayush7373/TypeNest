'use client';

import React, { useState } from 'react';
import { TestResult } from '@/types';
import { HistoryStats } from '@/hooks/useHistory';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Trophy,
  Flame,
  Activity,
  Target,
  Clock,
  Trash2,
  Sparkles,
  Play,
  RotateCcw,
} from 'lucide-react';

interface HistoryViewProps {
  history: TestResult[];
  stats: HistoryStats;
  onPracticeWeakKeys: (keys: string[]) => void;
  onClearHistory: () => void;
  onStartNewTest: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  stats,
  onPracticeWeakKeys,
  onClearHistory,
  onStartNewTest,
}) => {
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Take the last 30 tests in chronological order for the progression chart
  const recent30 = history.slice(0, 30).reverse().map((t, idx) => ({
    testNumber: idx + 1,
    netWpm: t.netWpm,
    accuracy: t.accuracy,
    date: new Date(t.timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
  }));

  // Empty state if no history exists yet
  if (history.length === 0) {
    return (
      <div className="w-full max-w-4xl p-10 sm:p-14 rounded-lg border border-[var(--border)] bg-[var(--panel)] text-center flex flex-col items-center justify-center space-y-5 animate-fadeIn">
        <div
          className="w-16 h-16 rounded-xl border border-[var(--border)] bg-[var(--bg)] flex items-center justify-center text-[var(--accent)]"
          style={{
            boxShadow: 'inset 0 1px 0 var(--key-highlight), 0 2px 0 var(--key-shadow)',
          }}
        >
          <Sparkles className="w-8 h-8 text-[var(--accent)]" />
        </div>

        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-medium tracking-tight text-[var(--text)]">
            No Typing Sessions Recorded Yet
          </h2>
          <p className="text-sm font-mono text-[var(--text-muted)] leading-relaxed">
            Every keystroke, WPM curve, and mistake frequency is tracked locally under versioned storage. Complete your first test to initialize your telemetry history.
          </p>
        </div>

        <button
          onClick={onStartNewTest}
          className="px-6 py-2.5 rounded-md font-mono text-sm font-medium bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 active:translate-y-[1px] transition-all flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Start First Test</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl flex flex-col space-y-8 animate-fadeIn">
      {/* Header and Clear Data Dialog */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text)]">
            Practice History & Analytics
          </h2>
          <p className="text-xs font-mono text-[var(--text-muted)] mt-1">
            Telemetry saved under keyflow:v1
          </p>
        </div>

        <div>
          {showConfirmClear ? (
            <div className="flex items-center space-x-2 p-1 rounded-md border border-[var(--error)]/40 bg-[var(--error-soft)] text-xs font-mono">
              <span className="text-[var(--error)] px-2">Permanently erase telemetry?</span>
              <button
                onClick={() => {
                  onClearHistory();
                  setShowConfirmClear(false);
                }}
                className="px-2.5 py-1 rounded bg-[var(--error)] text-white hover:opacity-90 transition-opacity"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-2 py-1 rounded border border-[var(--border)] text-[var(--text)] hover:bg-[var(--panel)] transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmClear(true)}
              className="px-3 py-1.5 rounded-md border border-[var(--border)] text-xs font-mono text-[var(--text-muted)] hover:text-[var(--error)] hover:border-[var(--error)]/50 transition-colors flex items-center space-x-1.5 focus-visible:outline-none"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Data</span>
            </button>
          )}
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Best WPM */}
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          <div className="flex items-center space-x-1.5 text-[var(--text-muted)] mb-1">
            <Trophy className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="text-[10px] font-mono uppercase tracking-wider">Best WPM</span>
          </div>
          <span className="text-2xl font-bold font-mono text-[var(--accent)] num-tabular">
            {stats.bestWpm}
          </span>
        </div>

        {/* Average WPM */}
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          <div className="flex items-center space-x-1.5 text-[var(--text-muted)] mb-1">
            <Activity className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="text-[10px] font-mono uppercase tracking-wider">Avg WPM</span>
          </div>
          <span className="text-2xl font-bold font-mono text-[var(--text)] num-tabular">
            {stats.avgWpm}
          </span>
        </div>

        {/* Average Accuracy */}
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          <div className="flex items-center space-x-1.5 text-[var(--text-muted)] mb-1">
            <Target className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="text-[10px] font-mono uppercase tracking-wider">Avg Acc</span>
          </div>
          <span className="text-2xl font-bold font-mono text-[var(--text)] num-tabular">
            {stats.avgAccuracy}%
          </span>
        </div>

        {/* Daily Streak */}
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          <div className="flex items-center space-x-1.5 text-[var(--text-muted)] mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-mono uppercase tracking-wider">Streak</span>
          </div>
          <span className="text-2xl font-bold font-mono text-amber-400 num-tabular">
            {stats.streak} {stats.streak === 1 ? 'day' : 'days'}
          </span>
        </div>

        {/* Total Tests */}
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          <div className="flex items-center space-x-1.5 text-[var(--text-muted)] mb-1">
            <RotateCcw className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="text-[10px] font-mono uppercase tracking-wider">Tests</span>
          </div>
          <span className="text-2xl font-bold font-mono text-[var(--text)] num-tabular">
            {stats.totalTests}
          </span>
        </div>

        {/* Practice Time */}
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          <div className="flex items-center space-x-1.5 text-[var(--text-muted)] mb-1">
            <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="text-[10px] font-mono uppercase tracking-wider">Time</span>
          </div>
          <span className="text-2xl font-bold font-mono text-[var(--text)] num-tabular">
            {stats.formattedTime}
          </span>
        </div>
      </div>

      {/* Chart: Last 30 Tests Trend */}
      <div className="w-full h-72 p-5 rounded-lg border border-[var(--border)] bg-[var(--panel)] select-none">
        <div className="flex items-center justify-between mb-3 text-xs font-mono text-[var(--text-muted)]">
          <span className="uppercase tracking-wider">30-Test Velocity & Accuracy Trajectory</span>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-0.5 bg-[var(--accent)] inline-block" />
              <span>Net WPM</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-0.5 bg-[var(--text-muted)] inline-block opacity-60" />
              <span>Accuracy %</span>
            </span>
          </div>
        </div>

        <div className="w-full h-[calc(100%-2rem)]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={recent30} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid
                stroke="var(--border)"
                strokeDasharray="3 3"
                opacity={0.3}
                vertical={false}
              />
              <XAxis
                dataKey="testNumber"
                stroke="var(--text-muted)"
                fontSize={11}
                fontFamily="var(--font-mono), monospace"
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
                tickFormatter={(n) => `#${n}`}
              />
              <YAxis
                stroke="var(--text-muted)"
                fontSize={11}
                fontFamily="var(--font-mono), monospace"
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const wpm = payload.find((p) => p.dataKey === 'netWpm')?.value;
                    const acc = payload.find((p) => p.dataKey === 'accuracy')?.value;
                    return (
                      <div className="p-2.5 rounded-md border border-[var(--border)] bg-[var(--panel)] shadow-md font-mono text-xs select-none">
                        <p className="text-[var(--accent)] font-semibold">Net WPM: {wpm}</p>
                        <p className="text-[var(--text)] opacity-80">Accuracy: {acc}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="netWpm"
                stroke="var(--accent)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: 'var(--accent)', stroke: 'var(--panel)', strokeWidth: 1 }}
                activeDot={{ r: 5, fill: 'var(--accent)' }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="var(--text-muted)"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                opacity={0.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weak Keys & Focused Practice Action */}
      <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--panel)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] block">
            Most Missed Keycaps Across All Tests
          </span>
          {stats.weakKeys.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {stats.weakKeys.map(({ char, count }) => (
                <span
                  key={char}
                  className="px-2.5 py-1 rounded border border-[var(--error)]/40 bg-[var(--error-soft)] text-xs font-mono text-[var(--error)] flex items-center space-x-1.5"
                >
                  <kbd className="font-bold">{char.toUpperCase()}</kbd>
                  <span className="text-[10px] opacity-75">{count} misses</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs font-mono text-[var(--accent)]">
              No weak keys detected! Precision is clean.
            </p>
          )}
        </div>

        {stats.weakKeys.length > 0 && (
          <button
            onClick={() => onPracticeWeakKeys(stats.weakKeys.map((w) => w.char))}
            className="px-4 py-2 rounded-md font-mono text-xs font-medium bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 active:translate-y-[1px] transition-all flex items-center space-x-2 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Practice Weak Keys</span>
          </button>
        )}
      </div>
    </div>
  );
};
