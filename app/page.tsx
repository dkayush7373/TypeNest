'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ActiveTab, TestConfig, TestResult, UserSettings } from '@/types';
import { BackgroundLayers } from '@/components/BackgroundLayers';
import { TopBar } from '@/components/TopBar';
import { StatsBar } from '@/components/StatsBar';
import { TypingArea } from '@/components/TypingArea';
import { VirtualKeyboard } from '@/components/VirtualKeyboard';
import { ResultScreen } from '@/components/ResultScreen';
import { HistoryView } from '@/components/HistoryView';
import { LearnView, LESSONS_PROGRESS_KEY, LessonProgress } from '@/components/LearnView';
import { SettingsView } from '@/components/SettingsView';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import { useSound } from '@/hooks/useSound';
import { useHistory } from '@/hooks/useHistory';
import { calculateMetrics, buildTestResult } from '@/lib/metrics';
import { getSafeStorage, setSafeStorage } from '@/lib/storage';
import { Lesson, LESSONS } from '@/lib/lessons';
import { generateWeakKeysWords } from '@/lib/wordLists';
import { RefreshCw, Command, Keyboard as KeyboardIcon, Sparkles } from 'lucide-react';

const SETTINGS_STORAGE_KEY = 'keyflow:settings';
const PB_STORAGE_KEY = 'keyflow:personal_best';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('test');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isPracticingWeakKeys, setIsPracticingWeakKeys] = useState(false);

  // User Settings with instant storage sync
  const [settings, setSettings] = useState<UserSettings>(() => {
    return getSafeStorage<UserSettings>(SETTINGS_STORAGE_KEY, {
      theme: 'midnight',
      fontSize: 'medium',
      caretStyle: 'line',
      soundEnabled: true,
      soundVolume: 0.45,
      keyboardVisible: true,
      fingerColorsEnabled: false,
      layout: 'qwerty',
    });
  });

  const handleUpdateSettings = useCallback((partial: Partial<UserSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      setSafeStorage(SETTINGS_STORAGE_KEY, next);
      return next;
    });
  }, []);

  // History system
  const { history, stats, saveResult, clearHistory } = useHistory();
  const [previousResult, setPreviousResult] = useState<TestResult | null>(null);

  // Personal Best
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
  const { playKeySound, getAudioContext } = useSound(
    settings.soundEnabled,
    settings.soundVolume
  );

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

  // Handle test completion side-effects: auto-save to history, update PB, update lesson progression
  useEffect(() => {
    if (engine.status === 'finished' && currentResult) {
      // 1. Save to History
      saveResult(currentResult);

      // 2. Personal Best Sync
      const storedPb = getSafeStorage<number | null>(PB_STORAGE_KEY, null);
      if (storedPb === null || currentResult.netWpm > storedPb) {
        setSafeStorage(PB_STORAGE_KEY, currentResult.netWpm);
        const timer = setTimeout(() => {
          setPersonalBest(currentResult.netWpm);
        }, 0);
        return () => clearTimeout(timer);
      }

      // 3. Lesson Progression Sync if drill completed
      if (activeLesson) {
        const storedProgress = getSafeStorage<LessonProgress>(LESSONS_PROGRESS_KEY, {
          unlockedLessonIds: ['home-row'],
          lessonBestAccuracy: {},
        });

        const prevBest = storedProgress.lessonBestAccuracy[activeLesson.id] || 0;
        const newBest = Math.max(prevBest, currentResult.accuracy);
        const updatedAccMap = {
          ...storedProgress.lessonBestAccuracy,
          [activeLesson.id]: newBest,
        };

        const unlockedIds = [...storedProgress.unlockedLessonIds];
        if (currentResult.accuracy >= activeLesson.requiredAccuracy) {
          const currentIdx = LESSONS.findIndex((l) => l.id === activeLesson.id);
          const nextLesson = LESSONS[currentIdx + 1];
          if (nextLesson && !unlockedIds.includes(nextLesson.id)) {
            unlockedIds.push(nextLesson.id);
          }
        }

        setSafeStorage(LESSONS_PROGRESS_KEY, {
          unlockedLessonIds: unlockedIds,
          lessonBestAccuracy: updatedAccMap,
        });
      }
    }
  }, [engine.status, currentResult, activeLesson, saveResult]);

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
    setActiveLesson(null);
    setIsPracticingWeakKeys(false);
    engine.resetTest();
  };

  // Launch focused weak keys practice
  const handlePracticeWeakKeys = (weakKeys: string[]) => {
    if (weakKeys.length === 0) return;
    const drillWords = generateWeakKeysWords(weakKeys, 25);
    setIsPracticingWeakKeys(true);
    setActiveLesson(null);
    setActiveTab('test');
    engine.resetTest(drillWords);
  };

  // Launch lesson practice drill
  const handleStartLessonPractice = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setIsPracticingWeakKeys(false);
    setActiveTab('test');
    const drillWords: string[] = [];
    for (let i = 0; i < 20; i++) {
      drillWords.push(
        lesson.sampleWords[Math.floor(Math.random() * lesson.sampleWords.length)]
      );
    }
    engine.resetTest(drillWords);
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
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'test') {
            engine.resetTest();
          }
        }}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() =>
          handleUpdateSettings({ soundEnabled: !settings.soundEnabled })
        }
      />

      {/* Main Content Workspace */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Mobile polite notice */}
        <div className="md:hidden w-full mb-6 p-4 rounded-md border border-[var(--border)] bg-[var(--panel)] text-center text-xs font-mono text-[var(--text-muted)]">
          <p className="text-[var(--text)] font-medium mb-1">Physical Keyboard Recommended</p>
          <p>KeyFlow is optimized for desktop and tactile mechanical typing experiences.</p>
        </div>

        {/* 1. TEST TAB */}
        {activeTab === 'test' && (
          <div className="w-full flex flex-col items-center space-y-6 sm:space-y-8">
            {/* Active Drill / Weak Key Header Banner */}
            {activeLesson && (
              <div className="w-full max-w-4xl p-3 rounded-md border border-[var(--accent)]/40 bg-[var(--accent-soft)] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                  <span className="font-semibold text-[var(--text)]">
                    Curriculum Drill: {activeLesson.title}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveLesson(null);
                    engine.resetTest();
                  }}
                  className="text-[var(--accent)] hover:underline"
                >
                  Exit Drill
                </button>
              </div>
            )}

            {isPracticingWeakKeys && (
              <div className="w-full max-w-4xl p-3 rounded-md border border-[var(--error)]/40 bg-[var(--error-soft)] flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-[var(--error)]">
                  Focus Mode: Weak Keys Targeted Drill
                </span>
                <button
                  onClick={() => {
                    setIsPracticingWeakKeys(false);
                    engine.resetTest();
                  }}
                  className="text-[var(--text-muted)] hover:text-[var(--text)] hover:underline"
                >
                  Exit Focus Mode
                </button>
              </div>
            )}

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

                {/* Typing Area Canvas with Font Size & Caret Styling */}
                <div
                  className={
                    settings.fontSize === 'small'
                      ? '[&_.typing-text]:!text-[24px]'
                      : settings.fontSize === 'large'
                      ? '[&_.typing-text]:!text-[32px]'
                      : ''
                  }
                >
                  <TypingArea
                    words={engine.words}
                    wordIndex={engine.wordIndex}
                    currentInput={engine.currentInput}
                    completedWords={engine.completedWords}
                    isFocused={engine.isFocused}
                    caretStyle={settings.caretStyle}
                    onFocusRequest={() => engine.setFocused(true)}
                  />
                </div>

                {/* Lit-up On-Screen Mechanical Keyboard */}
                {settings.keyboardVisible && (
                  <VirtualKeyboard
                    layout={settings.layout}
                    activeKeyCode={engine.activeKeyCode}
                    isKeyError={engine.isKeyError}
                    targetKeyCode={engine.targetKeyCode}
                    showFingerGuides={settings.fingerColorsEnabled}
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
                      onClick={() =>
                        handleUpdateSettings({
                          keyboardVisible: !settings.keyboardVisible,
                        })
                      }
                      className="flex items-center space-x-1.5 hover:text-[var(--text)] transition-colors"
                      title="Toggle virtual keyboard"
                    >
                      <KeyboardIcon className="w-3.5 h-3.5" />
                      <span>
                        {settings.keyboardVisible ? 'Hide Keyboard' : 'Show Keyboard'}
                      </span>
                    </button>
                  </div>

                  <div className="hidden sm:flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--bg)] text-[10px]">
                        tab
                      </kbd>
                      <span>+</span>
                      <kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--bg)] text-[10px]">
                        enter
                      </kbd>
                      <span className="ml-1">restart</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--bg)] text-[10px]">
                        esc
                      </kbd>
                      <span className="ml-1">new words</span>
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 2. LEARN TAB */}
        {activeTab === 'learn' && (
          <LearnView onStartLessonPractice={handleStartLessonPractice} />
        )}

        {/* 3. HISTORY TAB */}
        {activeTab === 'history' && (
          <HistoryView
            history={history}
            stats={stats}
            onPracticeWeakKeys={handlePracticeWeakKeys}
            onClearHistory={clearHistory}
            onStartNewTest={() => setActiveTab('test')}
          />
        )}

        {/* 4. SETTINGS TAB */}
        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onTestSound={() => playKeySound('standard')}
          />
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
