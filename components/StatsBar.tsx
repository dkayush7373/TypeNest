'use client';

import React, { useState } from 'react';
import {
  TestConfig,
  TestMode,
  DifficultyOption,
  CodeLanguage,
} from '@/types';
import {
  Clock,
  Type,
  Quote,
  Wind,
  Skull,
  Code2,
  FileText,
  Calendar,
  Ghost,
  Hash,
  AtSign,
  Flame,
  CheckCircle2,
  Heart,
} from 'lucide-react';
import { StreakMetrics } from '@/lib/streak';

interface StatsBarProps {
  config: TestConfig;
  onConfigChange: (config: TestConfig) => void;
  wpm: number;
  accuracy: number;
  timeRemaining: number;
  elapsedSeconds?: number;
  wordProgress?: { current: number; total: number };
  isRunning: boolean;
  livesRemaining?: number;
  cleanStreak?: number;
  streakMetrics?: StreakMetrics;
  onFinishZen?: () => void;
}

const MODES: { id: TestMode; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'time', label: 'time', icon: Clock },
  { id: 'words', label: 'words', icon: Type },
  { id: 'quote', label: 'quote', icon: Quote },
  { id: 'zen', label: 'zen', icon: Wind },
  { id: 'suddenDeath', label: 'sudden death', icon: Skull },
  { id: 'code', label: 'code', icon: Code2 },
  { id: 'custom', label: 'custom', icon: FileText },
  { id: 'daily', label: 'daily', icon: Calendar },
  { id: 'ghost', label: 'ghost', icon: Ghost },
];

const CODE_LANGS: { id: CodeLanguage; label: string }[] = [
  { id: 'typescript', label: 'TS' },
  { id: 'javascript', label: 'JS' },
  { id: 'python', label: 'Python' },
  { id: 'htmlcss', label: 'HTML/CSS' },
  { id: 'cpp', label: 'C++' },
  { id: 'java', label: 'Java' },
  { id: 'sql', label: 'SQL' },
];

export const StatsBar: React.FC<StatsBarProps> = ({
  config,
  onConfigChange,
  wpm,
  accuracy,
  timeRemaining,
  elapsedSeconds = 0,
  wordProgress,
  isRunning,
  livesRemaining = 1,
  cleanStreak = 0,
  streakMetrics,
  onFinishZen,
}) => {
  const [customTextDraft, setCustomTextDraft] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);

  const handleOpenCustom = () => {
    setCustomTextDraft(config.customText || '');
    setShowCustomModal(true);
  };

  const handleSaveCustom = () => {
    if (customTextDraft.trim()) {
      onConfigChange({
        ...config,
        mode: 'custom',
        customText: customTextDraft.slice(0, 2000),
      });
    }
    setShowCustomModal(false);
  };

  return (
    <div className="w-full max-w-4xl flex flex-col space-y-4 select-none">
      {/* 2-Row Unified Mode & Options Bar */}
      <div
        className={`flex flex-col gap-2 p-2 sm:p-2.5 rounded-md border border-[var(--border)] bg-[var(--panel)] font-mono text-xs transition-opacity duration-300 ${
          isRunning ? 'opacity-30 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* ROW 1: Mode Selector */}
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 pb-2 border-b border-[var(--border)]/60">
          {MODES.map((m) => {
            const Icon = m.icon;
            const isActive = config.mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onConfigChange({ ...config, mode: m.id })}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded transition-colors ${
                  isActive
                    ? 'text-[var(--accent)] bg-[var(--bg)] font-semibold border border-[var(--border)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
                title={`Switch to ${m.label} mode`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* ROW 2: Contextual Options for Active Mode */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-[11px] text-[var(--text-muted)]">
          {/* Left sub-options according to mode */}
          <div className="flex flex-wrap items-center gap-3">
            {config.mode === 'time' && (
              <div className="flex items-center space-x-1">
                <span className="text-[var(--text-muted)]/70 uppercase text-[9px] mr-1">time:</span>
                {([15, 30, 60, 120] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => onConfigChange({ ...config, duration: t, time: t })}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      (config.duration || config.time || 30) === t
                        ? 'text-[var(--accent)] bg-[var(--bg)] font-semibold'
                        : 'hover:text-[var(--text)]'
                    }`}
                  >
                    {t}s
                  </button>
                ))}
              </div>
            )}

            {config.mode === 'words' && (
              <div className="flex items-center space-x-1">
                <span className="text-[var(--text-muted)]/70 uppercase text-[9px] mr-1">words:</span>
                {([10, 25, 50, 100] as const).map((w) => (
                  <button
                    key={w}
                    onClick={() => onConfigChange({ ...config, wordCount: w, words: w })}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      (config.wordCount || config.words || 25) === w
                        ? 'text-[var(--accent)] bg-[var(--bg)] font-semibold'
                        : 'hover:text-[var(--text)]'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            )}

            {config.mode === 'suddenDeath' && (
              <div className="flex items-center space-x-2">
                <span className="text-[var(--text-muted)]/70 uppercase text-[9px]">rules:</span>
                <button
                  onClick={() => onConfigChange({ ...config, lives: 1 })}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    (config.lives || 1) === 1
                      ? 'text-[var(--accent)] bg-[var(--bg)] font-semibold'
                      : 'hover:text-[var(--text)]'
                  }`}
                >
                  Strict (1 mistake)
                </button>
                <button
                  onClick={() => onConfigChange({ ...config, lives: 3 })}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    config.lives === 3
                      ? 'text-[var(--accent)] bg-[var(--bg)] font-semibold'
                      : 'hover:text-[var(--text)]'
                  }`}
                >
                  3 Lives
                </button>
              </div>
            )}

            {config.mode === 'code' && (
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[var(--text-muted)]/70 uppercase text-[9px] mr-1">lang:</span>
                {CODE_LANGS.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => onConfigChange({ ...config, language: lang.id })}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      (config.language || 'typescript') === lang.id
                        ? 'text-[var(--accent)] bg-[var(--bg)] font-semibold'
                        : 'hover:text-[var(--text)]'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}

            {config.mode === 'zen' && (
              <div className="flex items-center space-x-2 text-[var(--text-muted)]">
                <span>Free practice without timer or red errors.</span>
              </div>
            )}

            {config.mode === 'custom' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleOpenCustom}
                  className="px-2.5 py-0.5 rounded border border-[var(--border)] hover:text-[var(--accent)] transition-colors"
                >
                  {config.customText ? 'Edit Custom Text' : 'Paste Custom Text'}
                </button>
                {config.customText && (
                  <span className="text-[10px] text-[var(--text-muted)] truncate max-w-xs">
                    {config.customText.length} chars loaded
                  </span>
                )}
              </div>
            )}

            {config.mode === 'daily' && (
              <div className="flex items-center space-x-1.5 text-[var(--accent)]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Deterministic daily challenge (same text for everyone today)</span>
              </div>
            )}

            {config.mode === 'ghost' && (
              <div className="flex items-center space-x-1.5 text-[var(--text-muted)]">
                <span>Race against your Personal Best replay</span>
              </div>
            )}

            {/* Difficulty tiers for applicable modes */}
            {(config.mode === 'time' || config.mode === 'words' || config.mode === 'suddenDeath' || config.mode === 'zen') && (
              <div className="flex items-center space-x-1 border-l border-[var(--border)]/60 pl-3">
                <span className="text-[var(--text-muted)]/70 uppercase text-[9px] mr-1">vocab:</span>
                {(['standard', 'advanced', 'expert'] as const).map((diff: DifficultyOption) => (
                  <button
                    key={diff}
                    onClick={() => onConfigChange({ ...config, difficulty: diff })}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      (config.difficulty || 'standard') === diff
                        ? 'text-[var(--accent)] bg-[var(--bg)] font-semibold'
                        : 'hover:text-[var(--text)]'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right modifiers (punctuation, numbers) */}
          {(config.mode === 'time' || config.mode === 'words' || config.mode === 'zen') && (
            <div className="flex items-center space-x-3 ml-auto border-l border-[var(--border)]/60 pl-3">
              <button
                onClick={() => onConfigChange({ ...config, punctuation: !config.punctuation })}
                className={`flex items-center space-x-1 transition-colors ${
                  config.punctuation ? 'text-[var(--accent)] font-semibold' : 'hover:text-[var(--text)]'
                }`}
                title="Toggle punctuation marks"
              >
                <AtSign className="w-3 h-3" />
                <span>punctuation</span>
              </button>
              <button
                onClick={() => onConfigChange({ ...config, numbers: !config.numbers })}
                className={`flex items-center space-x-1 transition-colors ${
                  config.numbers ? 'text-[var(--accent)] font-semibold' : 'hover:text-[var(--text)]'
                }`}
                title="Toggle numbers"
              >
                <Hash className="w-3 h-3" />
                <span>numbers</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Primary Live Stat Display + Today Streak Progress Strip */}
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

          {/* Sudden death lives indicator */}
          {config.mode === 'suddenDeath' && (
            <div>
              <span className="block text-[10px] tracking-widest uppercase font-mono text-[var(--text-muted)]">
                LIVES
              </span>
              <div className="flex items-center space-x-1 text-rose-400 h-9">
                {Array.from({ length: livesRemaining }).map((_, i) => (
                  <Heart key={i} className="w-4 h-4 fill-current" />
                ))}
                <span className="text-xs text-[var(--text-muted)] ml-1 font-mono">
                  ({cleanStreak} clean)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right side: 3rd stat + streak indicator */}
        <div className="flex flex-col items-end space-y-1">
          <div>
            <span className="block text-[10px] tracking-widest uppercase font-mono text-[var(--text-muted)] text-right">
              {config.mode === 'time'
                ? 'TIME'
                : config.mode === 'zen'
                ? 'ELAPSED'
                : 'PROGRESS'}
            </span>
            <span className="text-3xl sm:text-4xl font-semibold font-mono text-[var(--text)] num-tabular">
              {config.mode === 'time'
                ? `${timeRemaining}s`
                : config.mode === 'zen'
                ? `${elapsedSeconds}s`
                : `${wordProgress ? wordProgress.current : 0}/${
                    wordProgress ? wordProgress.total : config.wordCount || config.words || 25
                  }`}
            </span>
          </div>

          {/* Today Practice Progress Strip */}
          {streakMetrics && (
            <div className="flex items-center space-x-1.5 text-[11px] font-mono text-[var(--text-muted)]">
              <Flame
                className={`w-3.5 h-3.5 ${
                  streakMetrics.isTodayGoalMet ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
                }`}
              />
              <span>
                Today: {streakMetrics.todaySessions} session{streakMetrics.todaySessions === 1 ? '' : 's'}
                {streakMetrics.isTodayGoalMet && (
                  <span className="text-[var(--accent)] ml-1 font-medium">(Goal Met)</span>
                )}
              </span>
            </div>
          )}

          {/* Zen Finish Button */}
          {config.mode === 'zen' && isRunning && onFinishZen && (
            <button
              onClick={onFinishZen}
              className="mt-1 px-3 py-1 text-xs font-mono rounded bg-[var(--panel)] border border-[var(--border)] text-[var(--accent)] hover:bg-[var(--bg)] transition-colors"
            >
              Finish Zen
            </button>
          )}
        </div>
      </div>

      {/* Custom Text Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg p-5 rounded-md border border-[var(--border)] bg-[var(--panel)] space-y-4">
            <h3 className="text-base font-semibold text-[var(--text)] font-mono">
              Custom Practice Text
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Paste or type custom practice text (up to 2,000 characters).
            </p>
            <textarea
              value={customTextDraft}
              onChange={(e) => setCustomTextDraft(e.target.value.slice(0, 2000))}
              placeholder="Paste custom text here..."
              rows={6}
              className="w-full p-3 rounded border border-[var(--border)] bg-[var(--bg)] text-xs font-mono text-[var(--text)] focus:border-[var(--accent)] outline-none resize-none"
            />
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-mono">
              <span>{customTextDraft.length} / 2,000 chars</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="px-3 py-1.5 rounded border border-[var(--border)] hover:text-[var(--text)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCustom}
                  className="px-3 py-1.5 rounded bg-[var(--accent)] text-[var(--bg)] font-semibold hover:opacity-90 transition-opacity"
                >
                  Use Custom Text
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

