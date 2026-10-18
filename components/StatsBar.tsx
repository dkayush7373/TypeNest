'use client';

import React from 'react';
import { TestConfig } from '@/types';
import { Clock, Type, Hash, AtSign } from 'lucide-react';

interface StatsBarProps {
  config: TestConfig;
  onConfigChange: (config: TestConfig) => void;
  wpm: number;
  accuracy: number;
  timeRemaining: number;
  wordProgress?: { current: number; total: number };
  isRunning: boolean;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  config,
  onConfigChange,
  wpm,
  accuracy,
  timeRemaining,
  wordProgress,
  isRunning,
}) => {
  return (
    <div className="w-full max-w-4xl flex flex-col space-y-4 select-none">
      {/* Top Test Configuration Pill Controls - dim slightly during test to prevent distraction */}
      <div
        className={`flex flex-wrap items-center justify-center gap-3 px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--panel)] text-xs font-mono text-[var(--text-muted)] transition-opacity duration-300 ${
          isRunning ? 'opacity-30 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Mode Toggle */}
        <div className="flex items-center space-x-1 border-r border-[var(--border)] pr-3">
          <button
            onClick={() => onConfigChange({ ...config, mode: 'time' })}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded transition-colors ${
              config.mode === 'time'
                ? 'text-[var(--accent)] bg-[var(--bg)] font-semibold'
                : 'hover:text-[var(--text)]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>time</span>
          </button>
          <button
            onClick={() => onConfigChange({ ...config, mode: 'words' })}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded transition-colors ${
              config.mode === 'words'
                ? 'text-[var(--accent)] bg-[var(--bg)] font-semibold'
                : 'hover:text-[var(--text)]'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>words</span>
          </button>
        </div>

        {/* Options */}
        <div className="flex items-center space-x-1.5 border-r border-[var(--border)] pr-3">
          {config.mode === 'time' ? (
            ([15, 30, 60, 120] as const).map((t) => (
              <button
                key={t}
                onClick={() => onConfigChange({ ...config, time: t })}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  config.time === t
                    ? 'text-[var(--accent)] font-semibold'
                    : 'hover:text-[var(--text)]'
                }`}
              >
                {t}
              </button>
            ))
          ) : (
            ([10, 25, 50, 100] as const).map((w) => (
              <button
                key={w}
                onClick={() => onConfigChange({ ...config, words: w })}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  config.words === w
                    ? 'text-[var(--accent)] font-semibold'
                    : 'hover:text-[var(--text)]'
                }`}
              >
                {w}
              </button>
            ))
          )}
        </div>

        {/* Modifiers: punctuation, numbers */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onConfigChange({ ...config, punctuation: !config.punctuation })}
            className={`flex items-center space-x-1 transition-colors ${
              config.punctuation ? 'text-[var(--accent)] font-semibold' : 'hover:text-[var(--text)]'
            }`}
          >
            <AtSign className="w-3 h-3" />
            <span>punctuation</span>
          </button>
          <button
            onClick={() => onConfigChange({ ...config, numbers: !config.numbers })}
            className={`flex items-center space-x-1 transition-colors ${
              config.numbers ? 'text-[var(--accent)] font-semibold' : 'hover:text-[var(--text)]'
            }`}
          >
            <Hash className="w-3 h-3" />
            <span>numbers</span>
          </button>
        </div>
      </div>

      {/* Primary Live Stat Display */}
      <div className="w-full flex items-baseline justify-between px-2">
        <div className="flex items-baseline space-x-8">
          <div>
            <span className="block text-[10px] tracking-widest uppercase font-mono text-[var(--text-muted)]">
              WPM
            </span>
            <span className="text-3xl sm:text-4xl font-semibold font-mono text-[var(--accent)] num-tabular">
              {wpm}
            </span>
          </div>

          <div>
            <span className="block text-[10px] tracking-widest uppercase font-mono text-[var(--text-muted)]">
              ACCURACY
            </span>
            <span className="text-3xl sm:text-4xl font-semibold font-mono text-[var(--text)] num-tabular">
              {accuracy}%
            </span>
          </div>
        </div>

        <div>
          <span className="block text-[10px] tracking-widest uppercase font-mono text-[var(--text-muted)] text-right">
            {config.mode === 'time' ? 'TIME' : 'WORDS'}
          </span>
          <span className="text-3xl sm:text-4xl font-semibold font-mono text-[var(--text)] num-tabular">
            {config.mode === 'time'
              ? `${timeRemaining}s`
              : `${wordProgress ? wordProgress.current : 0}/${config.words}`}
          </span>
        </div>
      </div>
    </div>
  );
};
