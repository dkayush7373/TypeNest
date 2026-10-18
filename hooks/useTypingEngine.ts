'use client';

import { useReducer, useEffect, useRef, useCallback } from 'react';
import { TestConfig, KeystrokeLog } from '@/types';
import { generateWords } from '@/lib/wordLists';
import { charToEventCode } from '@/lib/layouts';

export interface CompletedWord {
  expected: string;
  typed: string;
  correct: boolean;
}

export interface TypingEngineState {
  words: string[];
  wordIndex: number;
  currentInput: string;
  completedWords: CompletedWord[];
  status: 'idle' | 'running' | 'paused' | 'finished';
  startTime: number | null;
  endTime: number | null;
  elapsedSeconds: number;
  timeRemaining: number;
  isFocused: boolean;
  activeKeyCode: string | null;
  isKeyError: boolean;
  keystrokes: KeystrokeLog[];
  secondSnapshots: { second: number; wpm: number; rawWpm: number; errors: number }[];
}

type Action =
  | { type: 'SET_WORDS'; words: string[]; initialTime: number }
  | { type: 'KEY_DOWN'; key: string; code: string; timestamp: number }
  | { type: 'TICK'; timestamp: number }
  | { type: 'SET_FOCUSED'; focused: boolean }
  | { type: 'RESET_WORDS'; words: string[]; initialTime: number }
  | { type: 'FINISH'; timestamp: number }
  | { type: 'CLEAR_ACTIVE_KEY' };

function engineReducer(state: TypingEngineState, action: Action, config: TestConfig): TypingEngineState {
  switch (action.type) {
    case 'SET_WORDS': {
      return {
        ...state,
        words: action.words,
        wordIndex: 0,
        currentInput: '',
        completedWords: [],
        status: 'idle',
        startTime: null,
        endTime: null,
        elapsedSeconds: 0,
        timeRemaining: action.initialTime,
        activeKeyCode: null,
        isKeyError: false,
        keystrokes: [],
        secondSnapshots: [],
      };
    }

    case 'CLEAR_ACTIVE_KEY': {
      return {
        ...state,
        activeKeyCode: null,
        isKeyError: false,
      };
    }

    case 'SET_FOCUSED': {
      if (state.status === 'running' && !action.focused) {
        return { ...state, isFocused: false, status: 'paused' };
      }
      if (state.status === 'paused' && action.focused) {
        return { ...state, isFocused: true, status: 'running' };
      }
      return { ...state, isFocused: action.focused };
    }

    case 'TICK': {
      if (state.status !== 'running' || !state.startTime) return state;

      const elapsed = (action.timestamp - state.startTime) / 1000;
      const elapsedSec = Math.floor(elapsed);

      // Snapshot calculation for chart
      const totalChars = state.keystrokes.length;
      const correctChars = state.keystrokes.filter((k) => k.correct).length;
      const errors = totalChars - correctChars;
      const minutes = Math.max(elapsed / 60, 0.001);
      const currentWpm = Math.round((correctChars / 5) / minutes);
      const currentRawWpm = Math.round((totalChars / 5) / minutes);

      let snapshots = state.secondSnapshots;
      if (elapsedSec > 0 && !snapshots.some((s) => s.second === elapsedSec)) {
        snapshots = [
          ...snapshots,
          {
            second: elapsedSec,
            wpm: currentWpm,
            rawWpm: currentRawWpm,
            errors,
          },
        ];
      }

      if (config.mode === 'time') {
        const remaining = Math.max(config.time - elapsedSec, 0);
        if (remaining <= 0) {
          return {
            ...state,
            elapsedSeconds: config.time,
            timeRemaining: 0,
            status: 'finished',
            endTime: action.timestamp,
            secondSnapshots: snapshots,
          };
        }
        return {
          ...state,
          elapsedSeconds: elapsedSec,
          timeRemaining: remaining,
          secondSnapshots: snapshots,
        };
      }

      return {
        ...state,
        elapsedSeconds: elapsedSec,
        secondSnapshots: snapshots,
      };
    }

    case 'KEY_DOWN': {
      if (state.status === 'finished') return state;

      const { key, code, timestamp } = action;
      let nextStatus = state.status;
      let nextStartTime = state.startTime;

      // Start on first keypress
      if (state.status === 'idle' || state.status === 'paused') {
        nextStatus = 'running';
        if (!nextStartTime) {
          nextStartTime = timestamp;
        }
      }

      const currentWord = state.words[state.wordIndex] || '';

      // Space: advance word
      if (key === ' ') {
        if (state.currentInput.length === 0) {
          // Ignore leading spaces
          return {
            ...state,
            activeKeyCode: code,
            isKeyError: false,
          };
        }

        const isWordCorrect = state.currentInput === currentWord;
        const newCompleted = [
          ...state.completedWords,
          {
            expected: currentWord,
            typed: state.currentInput,
            correct: isWordCorrect,
          },
        ];

        // Keystroke log for space
        const spaceLog: KeystrokeLog = {
          expectedChar: ' ',
          typedChar: ' ',
          timestamp,
          correct: isWordCorrect,
          key,
          code,
        };

        const nextWordIndex = state.wordIndex + 1;

        // Check if words mode is completed
        if (config.mode === 'words' && nextWordIndex >= config.words) {
          return {
            ...state,
            status: 'finished',
            endTime: timestamp,
            wordIndex: nextWordIndex,
            currentInput: '',
            completedWords: newCompleted,
            activeKeyCode: code,
            isKeyError: !isWordCorrect,
            keystrokes: [...state.keystrokes, spaceLog],
          };
        }

        return {
          ...state,
          status: nextStatus,
          startTime: nextStartTime,
          wordIndex: nextWordIndex,
          currentInput: '',
          completedWords: newCompleted,
          activeKeyCode: code,
          isKeyError: !isWordCorrect,
          keystrokes: [...state.keystrokes, spaceLog],
        };
      }

      // Backspace: delete character within the current word only
      if (key === 'Backspace') {
        if (state.currentInput.length > 0) {
          return {
            ...state,
            status: nextStatus,
            startTime: nextStartTime,
            currentInput: state.currentInput.slice(0, -1),
            activeKeyCode: code,
            isKeyError: false,
          };
        }
        return {
          ...state,
          activeKeyCode: code,
          isKeyError: false,
        };
      }

      // Single printable character
      if (key.length === 1) {
        const charIndex = state.currentInput.length;
        const expectedChar = currentWord[charIndex] || '';
        const isCharCorrect = key === expectedChar;

        const newKeystroke: KeystrokeLog = {
          expectedChar,
          typedChar: key,
          timestamp,
          correct: isCharCorrect,
          key,
          code,
        };

        const nextInput = state.currentInput + key;

        // In words mode, check if last word completed on last character
        let finished = false;
        if (
          config.mode === 'words' &&
          state.wordIndex === config.words - 1 &&
          nextInput === currentWord
        ) {
          finished = true;
        }

        return {
          ...state,
          status: finished ? 'finished' : nextStatus,
          startTime: nextStartTime,
          endTime: finished ? timestamp : state.endTime,
          currentInput: nextInput,
          activeKeyCode: code,
          isKeyError: !isCharCorrect,
          keystrokes: [...state.keystrokes, newKeystroke],
        };
      }

      return state;
    }

    case 'FINISH': {
      return {
        ...state,
        status: 'finished',
        endTime: action.timestamp,
      };
    }

    case 'RESET_WORDS': {
      return {
        ...state,
        words: action.words,
        wordIndex: 0,
        currentInput: '',
        completedWords: [],
        status: 'idle',
        startTime: null,
        endTime: null,
        elapsedSeconds: 0,
        timeRemaining: action.initialTime,
        activeKeyCode: null,
        isKeyError: false,
        keystrokes: [],
        secondSnapshots: [],
      };
    }

    default:
      return state;
  }
}

export function useTypingEngine(
  config: TestConfig,
  onPlaySound?: (type: 'standard' | 'space' | 'error') => void
) {
  const [state, dispatch] = useReducer(
    (s: TypingEngineState, a: Action) => engineReducer(s, a, config),
    {
      words: [],
      wordIndex: 0,
      currentInput: '',
      completedWords: [],
      status: 'idle',
      startTime: null,
      endTime: null,
      elapsedSeconds: 0,
      timeRemaining: config.time,
      isFocused: true,
      activeKeyCode: null,
      isKeyError: false,
      keystrokes: [],
      secondSnapshots: [],
    }
  );

  const tabPressedRef = useRef(false);
  const activeKeyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or reset words on config changes
  const resetTest = useCallback(() => {
    const wordCount = config.mode === 'words' ? config.words : 120;
    const newWords = generateWords(wordCount, {
      punctuation: config.punctuation,
      numbers: config.numbers,
    });
    dispatch({ type: 'RESET_WORDS', words: newWords, initialTime: config.time });
  }, [config.mode, config.words, config.time, config.punctuation, config.numbers]);

  // Initial load inside useEffect to prevent SSR hydration errors
  useEffect(() => {
    resetTest();
  }, [resetTest]);

  // Timer loop when running
  useEffect(() => {
    if (state.status !== 'running') return;

    const interval = setInterval(() => {
      dispatch({ type: 'TICK', timestamp: performance.now() });
    }, 200);

    return () => clearInterval(interval);
  }, [state.status]);

  // Fade out active keycap lighting after 150ms
  useEffect(() => {
    if (state.activeKeyCode) {
      if (activeKeyTimeoutRef.current) clearTimeout(activeKeyTimeoutRef.current);
      activeKeyTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'CLEAR_ACTIVE_KEY' });
      }, 150);
    }
  }, [state.activeKeyCode]);

  // Global keydown listener
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore repeat events
      if (e.repeat) return;

      // Ignore modifiers, F-keys, arrows
      if (
        e.key === 'Shift' ||
        e.key === 'Control' ||
        e.key === 'Alt' ||
        e.key === 'Meta' ||
        e.key === 'CapsLock' ||
        e.key.startsWith('Arrow') ||
        e.key.startsWith('F') && e.key.length > 1
      ) {
        return;
      }

      // Shortcut: Esc = new words
      if (e.key === 'Escape') {
        e.preventDefault();
        resetTest();
        return;
      }

      // Shortcut: Tab then Enter = restart
      if (e.key === 'Tab') {
        e.preventDefault();
        tabPressedRef.current = true;
        setTimeout(() => {
          tabPressedRef.current = false;
        }, 1000);
        return;
      }

      if (e.key === 'Enter') {
        if (tabPressedRef.current) {
          e.preventDefault();
          resetTest();
          return;
        }
      }

      // Prevent page scrolling on Space
      if (e.key === ' ') {
        e.preventDefault();
      }

      const now = performance.now();
      const currentWord = state.words[state.wordIndex] || '';
      const charIndex = state.currentInput.length;
      const expectedChar = currentWord[charIndex] || '';

      // Trigger audio feedback
      if (onPlaySound) {
        if (e.key === ' ') {
          onPlaySound('space');
        } else if (e.key.length === 1) {
          if (e.key === expectedChar) {
            onPlaySound('standard');
          } else {
            onPlaySound('error');
          }
        }
      }

      dispatch({
        type: 'KEY_DOWN',
        key: e.key,
        code: e.code,
        timestamp: now,
      });
    },
    [state.words, state.wordIndex, state.currentInput, onPlaySound, resetTest]
  );

  // Focus and blur listeners
  useEffect(() => {
    const onFocus = () => dispatch({ type: 'SET_FOCUSED', focused: true });
    const onBlur = () => dispatch({ type: 'SET_FOCUSED', focused: false });

    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  // Window key listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Target expected character and event code for keyboard hint
  const currentWord = state.words[state.wordIndex] || '';
  const targetChar =
    state.currentInput.length < currentWord.length
      ? currentWord[state.currentInput.length]
      : ' ';
  const targetKeyCode = charToEventCode(targetChar);

  // Live calculation metrics
  const elapsedMinutes = Math.max(state.elapsedSeconds / 60, 0.001);
  const correctKeystrokes = state.keystrokes.filter((k) => k.correct).length;
  const liveNetWpm = state.startTime ? Math.round((correctKeystrokes / 5) / elapsedMinutes) : 0;
  const liveAccuracy =
    state.keystrokes.length > 0
      ? Math.round((correctKeystrokes / state.keystrokes.length) * 100)
      : 100;

  return {
    ...state,
    targetChar,
    targetKeyCode,
    liveNetWpm,
    liveAccuracy,
    resetTest,
    setFocused: (focused: boolean) => dispatch({ type: 'SET_FOCUSED', focused }),
  };
}
