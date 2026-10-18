'use client';

import React, { useState } from 'react';
import { ActiveTab, TestConfig } from '@/types';
import { BackgroundLayers } from '@/components/BackgroundLayers';
import { TopBar } from '@/components/TopBar';
import { Sparkles, RefreshCw, Command, Clock, Type, Hash, AtSign } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('test');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isTyping] = useState(false);

  // Default test configuration
  const [config, setConfig] = useState<TestConfig>({
    mode: 'time',
    time: 30,
    words: 25,
    punctuation: false,
    numbers: false,
  });

  return (
    <div className="relative min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent)] selection:text-[var(--accent-contrast)]">
      {/* Background Layers: Depth, Faint Grid, Noise Grain, Vignette */}
      <BackgroundLayers isTyping={isTyping} />

      {/* Top Bar with Brand, Nav, and Theme Switcher */}
      <TopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
      />

      {/* Main Content Workspace */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-5xl w-full mx-auto px-6 py-8">
        {/* Mobile polite notice */}
        <div className="md:hidden w-full mb-6 p-4 rounded-md border border-[var(--border)] bg-[var(--panel)] text-center text-xs font-mono text-[var(--text-muted)]">
          <p className="text-[var(--text)] font-medium mb-1">Physical Keyboard Recommended</p>
          <p>KeyFlow is optimized for desktop and tactile mechanical typing experiences.</p>
        </div>

        {activeTab === 'test' && (
          <div className="w-full flex flex-col items-center space-y-8">
            {/* Minimal Mode Configuration Bar */}
            <div className="flex flex-wrap items-center justify-center gap-4 px-4 py-2 rounded-md border border-[var(--border)] bg-[var(--panel)] text-xs font-mono text-[var(--text-muted)] select-none">
              {/* Mode: Time vs Words */}
              <div className="flex items-center space-x-1 border-r border-[var(--border)] pr-3">
                <button
                  onClick={() => setConfig({ ...config, mode: 'time' })}
                  className={`flex items-center space-x-1.5 px-2 py-1 rounded transition-colors ${
                    config.mode === 'time'
                      ? 'text-[var(--accent)] bg-[var(--bg)] font-medium'
                      : 'hover:text-[var(--text)]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>time</span>
                </button>
                <button
                  onClick={() => setConfig({ ...config, mode: 'words' })}
                  className={`flex items-center space-x-1.5 px-2 py-1 rounded transition-colors ${
                    config.mode === 'words'
                      ? 'text-[var(--accent)] bg-[var(--bg)] font-medium'
                      : 'hover:text-[var(--text)]'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>words</span>
                </button>
              </div>

              {/* Counts */}
              <div className="flex items-center space-x-2 border-r border-[var(--border)] pr-3">
                {config.mode === 'time' ? (
                  ([15, 30, 60, 120] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setConfig({ ...config, time: t })}
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        config.time === t
                          ? 'text-[var(--accent)] font-semibold'
                          : 'hover:text-[var(--text)]'
                      }`}
                    >
                      {t}s
                    </button>
                  ))
                ) : (
                  ([10, 25, 50, 100] as const).map((w) => (
                    <button
                      key={w}
                      onClick={() => setConfig({ ...config, words: w })}
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

              {/* Toggles: punctuation, numbers */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setConfig({ ...config, punctuation: !config.punctuation })}
                  className={`flex items-center space-x-1 transition-colors ${
                    config.punctuation ? 'text-[var(--accent)] font-medium' : 'hover:text-[var(--text)]'
                  }`}
                >
                  <AtSign className="w-3.5 h-3.5" />
                  <span>punctuation</span>
                </button>
                <button
                  onClick={() => setConfig({ ...config, numbers: !config.numbers })}
                  className={`flex items-center space-x-1 transition-colors ${
                    config.numbers ? 'text-[var(--accent)] font-medium' : 'hover:text-[var(--text)]'
                  }`}
                >
                  <Hash className="w-3.5 h-3.5" />
                  <span>numbers</span>
                </button>
              </div>
            </div>

            {/* Live Stats Bar Preview */}
            <div className="w-full max-w-3xl flex items-baseline justify-between px-4">
              <div className="flex items-baseline space-x-6">
                <div>
                  <span className="block text-[10px] tracking-widest uppercase font-mono text-[var(--text-muted)]">
                    WPM
                  </span>
                  <span className="text-3xl font-semibold font-mono text-[var(--accent)] num-tabular">
                    0
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] tracking-widest uppercase font-mono text-[var(--text-muted)]">
                    ACCURACY
                  </span>
                  <span className="text-3xl font-semibold font-mono text-[var(--text)] num-tabular">
                    100%
                  </span>
                </div>
              </div>

              <div>
                <span className="block text-[10px] tracking-widest uppercase font-mono text-[var(--text-muted)] text-right">
                  TIME LEFT
                </span>
                <span className="text-3xl font-semibold font-mono text-[var(--text)] num-tabular">
                  {config.time}s
                </span>
              </div>
            </div>

            {/* Stage 1 Typing Area Look & Feel Canvas */}
            <div className="w-full max-w-3xl p-8 rounded-lg border border-[var(--border)] bg-[var(--panel)] transition-colors">
              <div className="typing-text relative select-none leading-relaxed text-[var(--text-muted)]">
                <span className="text-[var(--text)]">the quick </span>
                <span className="relative text-[var(--accent)] border-b-2 border-[var(--accent)]">
                  b
                  <span
                    className="absolute -right-0.5 top-1 bottom-1 w-[2px] bg-[var(--accent)] caret-anim"
                    aria-hidden="true"
                  />
                </span>
                <span>rown fox jumps over the lazy dog and tests every mechanical switch with precision and tactile satisfaction</span>
              </div>

              {/* Shortcut Hints */}
              <div className="mt-8 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--bg)] text-[10px]">tab</kbd>
                    <span>+</span>
                    <kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--bg)] text-[10px]">enter</kbd>
                    <span className="ml-1">restart</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--bg)] text-[10px]">esc</kbd>
                    <span className="ml-1">new words</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>Stage 1 Foundation Ready</span>
                </div>
              </div>
            </div>

            {/* Action Buttons Showcase */}
            <div className="flex items-center space-x-4">
              <button
                className="px-5 py-2 rounded-md font-mono text-sm font-medium bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 active:translate-y-[1px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                Start Typing Test
              </button>
              <button
                className="px-5 py-2 rounded-md font-mono text-sm font-medium border border-[var(--border)] bg-transparent text-[var(--text)] hover:border-[var(--text-muted)] active:translate-y-[1px] transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] flex items-center space-x-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Words</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'learn' && (
          <div className="w-full max-w-2xl p-8 rounded-lg border border-[var(--border)] bg-[var(--panel)] text-center space-y-4">
            <h2 className="text-xl font-medium tracking-tight text-[var(--text)]">Beginner Lessons</h2>
            <p className="text-sm font-mono text-[var(--text-muted)]">
              Master the home row, top row, bottom row, numbers, and punctuation with real-time finger placement guidance.
            </p>
            <div className="pt-4 flex justify-center">
              <span className="px-3 py-1 rounded border border-[var(--border)] text-xs font-mono text-[var(--accent)]">
                Unlocks in Stage 4
              </span>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="w-full max-w-2xl p-8 rounded-lg border border-[var(--border)] bg-[var(--panel)] text-center space-y-4">
            <h2 className="text-xl font-medium tracking-tight text-[var(--text)]">Performance History</h2>
            <p className="text-sm font-mono text-[var(--text-muted)]">
              Track personal bests, average WPM, consistency trends, and weak keys over time.
            </p>
            <div className="pt-4 flex justify-center">
              <span className="px-3 py-1 rounded border border-[var(--border)] text-xs font-mono text-[var(--accent)]">
                Unlocks in Stage 4
              </span>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="w-full max-w-2xl p-8 rounded-lg border border-[var(--border)] bg-[var(--panel)] text-center space-y-4">
            <h2 className="text-xl font-medium tracking-tight text-[var(--text)]">Workspace Settings</h2>
            <p className="text-sm font-mono text-[var(--text-muted)]">
              Customize themes, mechanical sound profiles, keyboard layouts, and caret styles.
            </p>
            <div className="pt-4 flex justify-center">
              <span className="px-3 py-1 rounded border border-[var(--border)] text-xs font-mono text-[var(--accent)]">
                Unlocks in Stage 4
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-[var(--border)] py-4 text-center text-xs font-mono text-[var(--text-muted)]">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Command className="w-3.5 h-3.5" />
            <span>KeyFlow Studio</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Midnight Studio Design</span>
            <span>•</span>
            <span>Strict TypeScript</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
