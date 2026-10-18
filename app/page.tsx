'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { ActiveTab, TestConfig, TestResult, UserSettings } from '@/types';
import { BackgroundLayers } from '@/components/BackgroundLayers';
import { TopBar } from '@/components/TopBar';
import { StatsBar } from '@/components/StatsBar';
import { TypingArea } from '@/components/TypingArea';
import { VirtualKeyboard } from '@/components/VirtualKeyboard';
import { ResultScreen } from '@/components/ResultScreen';
import { HistoryView } from '@/components/HistoryView';
import { LearnView, LESSONS_PROGRESS_KEY, LessonProgress } from '@/components/LearnView';
import { StreakView } from '@/components/StreakView';
import { LayoutBuilder, LAYOUTS_STORAGE_KEY } from '@/components/LayoutBuilder';
import { SettingsView } from '@/components/SettingsView';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import { useSound } from '@/hooks/useSound';
import { useHistory } from '@/hooks/useHistory';
import { calculateMetrics, buildTestResult } from '@/lib/metrics';
import { getSafeStorage, setSafeStorage } from '@/lib/storage';
import { Lesson, LESSONS, generateLessonDrillWords } from '@/lib/lessons';
import { generateWeakKeysWords } from '@/lib/wordLists';
import { CustomLayout } from '@/lib/layouts';
import {
  RefreshCw,
  Command,
  Keyboard as KeyboardIcon,
  Sparkles,
  Flame,
  X,
  Play,
  HelpCircle,
} from 'lucide-react';

const SETTINGS_STORAGE_KEY = 'keyflow:settings';
const PB_STORAGE_KEY = 'keyflow:personal_best';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('test');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isPracticingWeakKeys, setIsPracticingWeakKeys] = useState(false);
  const [dismissAtRiskBanner, setDismissAtRiskBanner] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // User Settings with instant local storage persistence
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
      dailyGoal: '1-session',
      showStreakBadge: true,
      soundPack: 'clicky',
      reducedMotion: false,
    });
  });

  const handleUpdateSettings = useCallback((partial: Partial<UserSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      setSafeStorage(SETTINGS_STORAGE_KEY, next);
      return next;
    });
  }, []);

  // History & Streak system
  const { history, dailyLog, streakMetrics, stats, saveResult, recordLessonSession, clearHistory } =
    useHistory();
  const [previousResult, setPreviousResult] = useState<TestResult | null>(null);

  // Guard against duplicate saves
  const lastSavedResultIdRef = useRef<string | null>(null);

  // Personal Best
  const [personalBest, setPersonalBest] = useState<number | null>(() => {
    return getSafeStorage<number | null>(PB_STORAGE_KEY, null);
  });

  // Test configuration
  const [config, setConfig] = useState<TestConfig>({
    mode: 'time',
    duration: 30,
    time: 30,
    wordCount: 25,
    words: 25,
    difficulty: 'standard',
    punctuation: false,
    numbers: false,
    lives: 1,
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

    return buildTestResult(
      config,
      metrics,
      engine.secondSnapshots,
      engine.resultStatus,
      {
        cleanStreak: engine.bestCleanStreak,
        failedChar: engine.failedChar,
        quoteAuthor: engine.quoteAuthor,
      }
    );
  }, [
    engine.status,
    engine.resultStatus,
    config,
    engine.keystrokes,
    engine.completedWords,
    engine.secondSnapshots,
    engine.startTime,
    engine.endTime,
    engine.bestCleanStreak,
    engine.failedChar,
    engine.quoteAuthor,
  ]);

  // Handle test completion side-effects: auto-save once, update PB, update lesson progression
  useEffect(() => {
    if (engine.status === 'finished' && currentResult) {
      if (lastSavedResultIdRef.current === currentResult.id) {
        return;
      }
      lastSavedResultIdRef.current = currentResult.id;

      // 1. Save to History (updates daily streak log exactly once)
      saveResult(currentResult);

      // 2. Personal Best Sync (only for completed standard/word speed runs)
      if (currentResult.status === 'completed') {
        const storedPb = getSafeStorage<number | null>(PB_STORAGE_KEY, null);
        if (storedPb === null || currentResult.netWpm > storedPb) {
          setSafeStorage(PB_STORAGE_KEY, currentResult.netWpm);
          const timer = setTimeout(() => {
            setPersonalBest(currentResult.netWpm);
          }, 0);
          return () => clearTimeout(timer);
        }
      }

      // 3. Lesson Progression Sync if drill completed
      if (activeLesson) {
        recordLessonSession(activeLesson.id, currentResult.elapsedSeconds);

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
  }, [engine.status, currentResult, activeLesson, saveResult, recordLessonSession]);

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
    const drillWords = generateLessonDrillWords(lesson, 20);
    engine.resetTest(drillWords);
  };

  // Layout testing handler from LayoutBuilder
  const handleTestLayout = (layoutId: string) => {
    handleUpdateSettings({ layout: layoutId });
    setActiveTab('test');
    engine.resetTest();
  };

  // Global shortcut listeners for '?' (shortcuts modal) and Ctrl+K
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if (e.key === '?' && !isRunning && (e.target as HTMLElement)?.tagName !== 'INPUT' && (e.target as HTMLElement)?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [isRunning]);

  // Read custom layouts for virtual keyboard
  const customLayouts = useMemo(() => {
    return getSafeStorage<CustomLayout[]>(LAYOUTS_STORAGE_KEY, []);
  }, []);

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

      {/* Top Bar with Brand, Nav, Streak Badge, and Theme Switcher */}
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
        streakMetrics={streakMetrics}
        showStreakBadge={settings.showStreakBadge !== false}
      />

      {/* At-Risk Streak Calm In-App Banner */}
      {streakMetrics.status === 'at-risk' && !dismissAtRiskBanner && (
        <div className="relative z-20 w-full bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-xs font-mono text-amber-300 flex items-center justify-between">
          <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 fill-current text-amber-400" />
              <span>
                Your {streakMetrics.currentStreak}-day practice streak is alive! Complete today&apos;s goal before midnight to keep it rolling.
              </span>
            </div>
            <button
              onClick={() => setDismissAtRiskBanner(true)}
              className="p-1 rounded hover:bg-amber-500/20 text-amber-300/80 hover:text-amber-300 transition-colors"
              title="Dismiss notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Workspace */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Mobile polite notice */}
        <div className="lg:hidden w-full mb-4 p-3 rounded-md border border-[var(--border)] bg-[var(--panel)] text-center text-xs font-mono text-[var(--text-muted)]">
          <p className="text-[var(--text)] font-medium mb-1">Physical Keyboard Recommended</p>
          <p>KeyFlow is optimized for desktop and tactile mechanical typing experiences on 1024px+ displays.</p>
        </div>

        {/* 1. TEST TAB */}
        {activeTab === 'test' && (
          <div className="w-full flex flex-col items-center space-y-4 sm:space-y-6">
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
              <div className="w-full max-w-4xl p-3 rounded-md border border-rose-500/40 bg-rose-500/10 flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-rose-400">
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
                streakMetrics={streakMetrics}
                onTryAgain={handleTryAgain}
                onNextTest={handleNextTest}
              />
            ) : (
              <>
                {/* Live Stats & 2-Row Config Controls */}
                <StatsBar
                  config={config}
                  onConfigChange={(newCfg) => setConfig(newCfg)}
                  wpm={engine.liveNetWpm}
                  accuracy={engine.liveAccuracy}
                  timeRemaining={engine.timeRemaining}
                  elapsedSeconds={engine.elapsedSeconds}
                  wordProgress={{
                    current: Math.min(engine.wordIndex + 1, config.words || 25),
                    total: config.wordCount || config.words || 25,
                  }}
                  isRunning={isRunning}
                  livesRemaining={engine.livesRemaining}
                  cleanStreak={engine.cleanStreak}
                  streakMetrics={streakMetrics}
                  onFinishZen={() => engine.finishTest('zen')}
                />

                {/* Typing Area Canvas with Font Size & Caret Styling */}
                <div
                  className={`relative w-full ${
                    settings.fontSize === 'small'
                      ? '[&_.typing-text]:!text-[24px]'
                      : settings.fontSize === 'large'
                      ? '[&_.typing-text]:!text-[32px]'
                      : ''
                  }`}
                >
                  {/* Window Blur Pause Overlay */}
                  {!engine.isFocused && engine.status === 'paused' && (
                    <div
                      onClick={() => engine.setFocused(true)}
                      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[var(--bg)]/85 backdrop-blur-[2px] rounded-lg cursor-pointer select-none font-mono text-center p-4"
                    >
                      <Play className="w-8 h-8 text-[var(--accent)] mb-2 animate-pulse" />
                      <span className="text-base font-semibold text-[var(--text)]">
                        Test Paused
                      </span>
                      <span className="text-xs text-[var(--text-muted)] mt-1">
                        Click anywhere or press any key to resume
                      </span>
                    </div>
                  )}

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
                    customLayouts={customLayouts}
                    activeKeyCode={engine.activeKeyCode}
                    isKeyError={engine.isKeyError}
                    targetKeyCode={engine.targetKeyCode}
                    targetNeedsShift={engine.targetNeedsShift}
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

                  <div className="flex items-center space-x-4">
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

                    <button
                      onClick={() => setShowShortcutsModal(true)}
                      className="p-1 rounded hover:text-[var(--text)] text-[var(--text-muted)] transition-colors"
                      title="Keyboard shortcuts (?)"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
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

        {/* 4. STREAK TAB */}
        {activeTab === 'streak' && (
          <StreakView
            dailyLog={dailyLog}
            streakMetrics={streakMetrics}
            dailyGoal={settings.dailyGoal}
            onStartPractice={() => setActiveTab('test')}
          />
        )}

        {/* 5. LAYOUTS TAB */}
        {activeTab === 'layouts' && (
          <LayoutBuilder
            activeLayoutId={settings.layout}
            onTestLayout={handleTestLayout}
            onApplyLayoutToSettings={(layoutId) => handleUpdateSettings({ layout: layoutId })}
          />
        )}

        {/* 6. SETTINGS TAB */}
        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onTestSound={() => playKeySound('standard')}
          />
        )}
      </main>

      {/* Shortcuts Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
          <div className="w-full max-w-md p-6 rounded-md border border-[var(--border)] bg-[var(--panel)] font-mono space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-sm font-semibold text-[var(--text)]">Keyboard Shortcuts</h3>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded hover:text-[var(--text)] text-[var(--text-muted)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[var(--border)]/40">
                <span className="text-[var(--text-muted)]">Restart test</span>
                <span className="flex items-center space-x-1">
                  <kbd className="px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--bg)]">Tab</kbd>
                  <span>+</span>
                  <kbd className="px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--bg)]">Enter</kbd>
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[var(--border)]/40">
                <span className="text-[var(--text-muted)]">New words / Exit Zen</span>
                <kbd className="px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--bg)]">Esc</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[var(--border)]/40">
                <span className="text-[var(--text-muted)]">Previous word</span>
                <span className="text-[11px] text-[var(--text)]">Backspace at word start</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[var(--text-muted)]">Toggle shortcuts</span>
                <kbd className="px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--bg)]">?</kbd>
              </div>
            </div>

            <button
              onClick={() => setShowShortcutsModal(false)}
              className="w-full mt-2 py-2 rounded bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] hover:border-[var(--accent)] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

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

