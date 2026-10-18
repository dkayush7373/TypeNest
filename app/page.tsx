'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ActiveTab, TestConfig, TestResult } from '@/types';
import { BackgroundLayers } from '@/components/BackgroundLayers';
import { TopBar } from '@/components/TopBar';
import { StatsBar } from '@/components/StatsBar';
import { TypingArea } from '@/components/TypingArea';
import { VirtualKeyboard } from '@/components/VirtualKeyboard';
import { ResultScreen } from '@/components/ResultScreen';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import { useSound } from '@/hooks/useSound';
import { calculateMetrics, buildTestResult } from '@/lib/metrics';
import { getSafeStorage, setSafeStorage } from '@/lib/storage';
import { RefreshCw, Command, Keyboard as KeyboardIcon } from 'lucide-react';

const PB_STORAGE_KEY = 'keyflow:personal_best';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('test');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [previousResult, setPreviousResult] = useState<TestResult | null>(null);

  // Personal Best from safe storage
  const [personalBest, setPersonalBest] = useState<number | null>(() => {
    return getSafeStorage<number | null>(PB_STORAGE_KEY, null);
  });

  // Test configuration
  const [config, setConfig] = useState<TestConfig>({
    mode: 'time',
    time: 30,
    words: 25,
    punctuation: false,
    numbers: false,
  });

  // Sound generator
  const { playKeySound, getAudioContext } = useSound(soundEnabled, 0.45);

  const handlePlaySound = useCallback(
    (type: 'standard' | 'space' | 'error') => {
      playKeySound(type);
    },
    [playKeySound]
  );

  // Typing engine
  const engine = useTypingEngine(config, handlePlaySound);

  const isRunning = engine.status === 'running';

  // Compute test result once finished
  const currentResult: TestResult | null = useMemo(() => {
    if (engine.status !== 'finished') return null;

    const metrics = calculateMetrics(
      config,
      engine.keystrokes,
      engine.completedWords,
      engine.secondSnapshots,
      engine.startTime,
      engine.endTime
    );

    return buildTestResult(config, metrics, engine.secondSnapshots);
  }, [
    engine.status,
    config,
    engine.keystrokes,
    engine.completedWords,
    engine.secondSnapshots,
    engine.startTime,
    engine.endTime,
  ]);

  // Synchronize personal best when test finishes
  useEffect(() => {
    if (engine.status === 'finished' && currentResult) {
      const storedPb = getSafeStorage<number | null>(PB_STORAGE_KEY, null);
      if (storedPb === null || currentResult.netWpm > storedPb) {
        setSafeStorage(PB_STORAGE_KEY, currentResult.netWpm);
        const timer = setTimeout(() => {
          setPersonalBest(currentResult.netWpm);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [engine.status, currentResult]);

  const handleTryAgain = () => {
    if (currentResult) {
      setPreviousResult(currentResult);
    }
    engine.resetTest();
  };

  const handleNextTest = () => {
    if (currentResult) {
      setPreviousResult(currentResult);
    }
    engine.resetTest();
  };

  return (
    <div
      onClick={() => {
        getAudioContext();
        if (!engine.isFocused) {
          engine.setFocused(true);
        }
      }}
      className="relative min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent)] selection:text-[var(--accent-contrast)]"
    >
      {/* Background Layers: Depth, Faint Grid, Noise Grain, Vignette */}
      <BackgroundLayers isTyping={isRunning} />

      {/* Top Bar with Brand, Nav, and Theme Switcher */}
      <TopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
      />

      {/* Main Content Workspace */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Mobile polite notice */}
        <div className="md:hidden w-full mb-6 p-4 rounded-md border border-[var(--border)] bg-[var(--panel)] text-center text-xs font-mono text-[var(--text-muted)]">
          <p className="text-[var(--text)] font-medium mb-1">Physical Keyboard Recommended</p>
          <p>KeyFlow is optimized for desktop and tactile mechanical typing experiences.</p>
        </div>

        {activeTab === 'test' && (
          <div className="w-full flex flex-col items-center space-y-6 sm:space-y-8">
            {/* Show ResultScreen when finished, otherwise show test canvas */}
            {engine.status === 'finished' && currentResult ? (
              <ResultScreen
                result={currentResult}
                previousResult={previousResult}
                personalBest={personalBest}
                onTryAgain={handleTryAgain}
                onNextTest={handleNextTest}
              />
            ) : (
              <>
                {/* Live Stats & Config Controls */}
                <StatsBar
                  config={config}
                  onConfigChange={(newCfg) => setConfig(newCfg)}
                  wpm={engine.liveNetWpm}
                  accuracy={engine.liveAccuracy}
                  timeRemaining={engine.timeRemaining}
                  wordProgress={{
                    current: Math.min(engine.wordIndex + 1, config.words),
                    total: config.words,
                  }}
                  isRunning={isRunning}
                />

                {/* Typing Area Canvas */}
                <TypingArea
                  words={engine.words}
                  wordIndex={engine.wordIndex}
                  currentInput={engine.currentInput}
                  completedWords={engine.completedWords}
                  isFocused={engine.isFocused}
                  onFocusRequest={() => engine.setFocused(true)}
                />

                {/* Lit-up On-Screen Mechanical Keyboard */}
                {showKeyboard && (
                  <VirtualKeyboard
                    activeKeyCode={engine.activeKeyCode}
                    isKeyError={engine.isKeyError}
                    targetKeyCode={engine.targetKeyCode}
                    showFingerGuides={false}
                  />
                )}

                {/* Bottom Controls & Shortcut Hints */}
                <div className="w-full max-w-4xl flex items-center justify-between text-xs font-mono text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => engine.resetTest()}
                      className="flex items-center space-x-1.5 hover:text-[var(--text)] transition-colors"
                      title="Restart test (Tab + Enter)"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Restart</span>
                    </button>
                    <button
                      onClick={() => setShowKeyboard((prev) => !prev)}
                      className="flex items-center space-x-1.5 hover:text-[var(--text)] transition-colors"
                      title="Toggle virtual keyboard"
                    >
                      <KeyboardIcon className="w-3.5 h-3.5" />
                      <span>{showKeyboard ? 'Hide Keyboard' : 'Show Keyboard'}</span>
                    </button>
                  </div>

                  <div className="hidden sm:flex items-center space-x-4">
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
                </div>
              </>
            )}
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
