'use client';

import { useReducer, useEffect, useRef, useCallback } from 'react';
import { TestConfig, KeystrokeLog, ResultStatus } from '@/types';
import { generateWords } from '@/lib/wordLists';
import { getRandomQuote } from '@/lib/quotes';
import { getRandomCodeSnippet } from '@/lib/codeSnippets';
import { getDailyChallengeWords } from '@/lib/daily';
import { charToEventCode, isShiftRequired } from '@/lib/layouts';

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
  resultStatus: ResultStatus;
  startTime: number | null;
  endTime: number | null;
  elapsedSeconds: number;
  timeRemaining: number;
  isFocused: boolean;
  activeKeyCode: string | null;
  isKeyError: boolean;
  keystrokes: KeystrokeLog[];
  secondSnapshots: { second: number; wpm: number; rawWpm: number; errors: number }[];
  // Sudden Death metrics
  livesRemaining: number;
  cleanStreak: number;
  bestCleanStreak: number;
  failedChar?: { expected: string; typed: string };
  // Quote attribution
  quoteAuthor?: string;
}

type Action =
  | {
      type: 'SET_WORDS';
      words: string[];
      initialTime: number;
      quoteAuthor?: string;
      initialLives?: number;
    }
  | { type: 'APPEND_ZEN_WORDS'; words: string[] }
  | { type: 'KEY_DOWN'; key: string; code: string; timestamp: number }
  | { type: 'TICK'; timestamp: number }
  | { type: 'SET_FOCUSED'; focused: boolean }
  | {
      type: 'RESET_WORDS';
      words: string[];
      initialTime: number;
      quoteAuthor?: string;
      initialLives?: number;
    }
  | { type: 'FINISH'; timestamp: number; resultStatus?: ResultStatus }
  | { type: 'CLEAR_ACTIVE_KEY' };

function engineReducer(
  state: TypingEngineState,
  action: Action,
  config: TestConfig
): TypingEngineState {
  switch (action.type) {
    case 'SET_WORDS':
    case 'RESET_WORDS': {
      const lives = config.lives || (config.mode === 'suddenDeath' ? 1 : 1);
      return {
        ...state,
        words: action.words,
        wordIndex: 0,
        currentInput: '',
        completedWords: [],
        status: 'idle',
        resultStatus: 'completed',
        startTime: null,
        endTime: null,
        elapsedSeconds: 0,
        timeRemaining: action.initialTime,
        activeKeyCode: null,
        isKeyError: false,
        keystrokes: [],
        secondSnapshots: [],
        livesRemaining: action.initialLives ?? lives,
        cleanStreak: 0,
        bestCleanStreak: 0,
        failedChar: undefined,
        quoteAuthor: action.quoteAuthor,
      };
    }

    case 'APPEND_ZEN_WORDS': {
      return {
        ...state,
        words: [...state.words, ...action.words],
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

      // Snapshot calculation for progression charts
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

      // Time mode expiration
      if (config.mode === 'time') {
        const timeLimit = config.duration || config.time || 30;
        const remaining = Math.max(timeLimit - elapsedSec, 0);
        if (remaining <= 0) {
          return {
            ...state,
            elapsedSeconds: timeLimit,
            timeRemaining: 0,
            status: 'finished',
            resultStatus: 'completed',
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

      // Start on first valid keypress (using performance.now)
      if (state.status === 'idle' || state.status === 'paused') {
        nextStatus = 'running';
        if (!nextStartTime) {
          nextStartTime = timestamp;
        }
      }

      const currentWord = state.words[state.wordIndex] || '';

      // Space advances to next word
      if (key === ' ') {
        if (state.currentInput.length === 0) {
          // Ignore leading empty spaces on a fresh word
          return {
            ...state,
            activeKeyCode: code,
            isKeyError: false,
          };
        }

        const isWordCorrect = state.currentInput === currentWord;
        const newCompleted: CompletedWord[] = [
          ...state.completedWords,
          {
            expected: currentWord,
            typed: state.currentInput,
            correct: isWordCorrect,
          },
        ];

        const spaceLog: KeystrokeLog = {
          expectedChar: ' ',
          typedChar: ' ',
          timestamp,
          correct: isWordCorrect,
          key,
          code,
        };

        const nextWordIndex = state.wordIndex + 1;

        // Check if finished by words mode limit or text completion
        const isWordsFinished =
          config.mode === 'words' &&
          nextWordIndex >= (config.wordCount || config.words || 25);
        const isQuoteOrCustomFinished =
          (config.mode === 'quote' || config.mode === 'custom' || config.mode === 'code' || config.mode === 'daily') &&
          nextWordIndex >= state.words.length;

        if (isWordsFinished || isQuoteOrCustomFinished) {
          return {
            ...state,
            status: 'finished',
            resultStatus: 'completed',
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

      // Backspace: within current word AND can return to the previous word
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

        // Return to previous word if at beginning of word
        if (state.wordIndex > 0 && state.completedWords.length > 0) {
          const prevWord = state.completedWords[state.completedWords.length - 1];
          const newCompleted = state.completedWords.slice(0, -1);
          return {
            ...state,
            status: nextStatus,
            startTime: nextStartTime,
            wordIndex: state.wordIndex - 1,
            currentInput: prevWord.typed,
            completedWords: newCompleted,
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

        // Sudden Death logic
        if (config.mode === 'suddenDeath' && !isCharCorrect) {
          const remainingLives = state.livesRemaining - 1;
          if (remainingLives <= 0) {
            // Sudden Death Failure
            return {
              ...state,
              status: 'finished',
              resultStatus: 'failed',
              endTime: timestamp,
              activeKeyCode: code,
              isKeyError: true,
              livesRemaining: 0,
              failedChar: { expected: expectedChar || ' ', typed: key },
              keystrokes: [...state.keystrokes, newKeystroke],
            };
          } else {
            // Deduct life
            return {
              ...state,
              livesRemaining: remainingLives,
              activeKeyCode: code,
              isKeyError: true,
              cleanStreak: 0,
              keystrokes: [...state.keystrokes, newKeystroke],
            };
          }
        }

        const nextCleanStreak = isCharCorrect ? state.cleanStreak + 1 : 0;
        const nextBestClean = Math.max(state.bestCleanStreak, nextCleanStreak);
        const nextInput = state.currentInput + key;

        // Check if finished on the final character of words/quotes/custom/code
        let isFinalCharFinished = false;
        const isLastWord = state.wordIndex === state.words.length - 1;
        const isTargetLengthMet =
          config.mode === 'words' &&
          state.wordIndex === (config.wordCount || config.words || 25) - 1;

        if (
          (isTargetLengthMet || (isLastWord && (config.mode === 'quote' || config.mode === 'custom' || config.mode === 'daily' || config.mode === 'code'))) &&
          nextInput === currentWord
        ) {
          isFinalCharFinished = true;
        }

        return {
          ...state,
          status: isFinalCharFinished ? 'finished' : nextStatus,
          resultStatus: 'completed',
          startTime: nextStartTime,
          endTime: isFinalCharFinished ? timestamp : state.endTime,
          currentInput: nextInput,
          activeKeyCode: code,
          isKeyError: config.mode === 'zen' ? false : !isCharCorrect,
          cleanStreak: nextCleanStreak,
          bestCleanStreak: nextBestClean,
          keystrokes: [...state.keystrokes, newKeystroke],
        };
      }

      return state;
    }

    case 'FINISH': {
      return {
        ...state,
        status: 'finished',
        resultStatus: action.resultStatus || (config.mode === 'zen' ? 'zen' : 'completed'),
        endTime: action.timestamp,
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
  const initialTime = config.duration || config.time || 30;

  const [state, dispatch] = useReducer(
    (s: TypingEngineState, a: Action) => engineReducer(s, a, config),
    {
      words: [],
      wordIndex: 0,
      currentInput: '',
      completedWords: [],
      status: 'idle',
      resultStatus: 'completed',
      startTime: null,
      endTime: null,
      elapsedSeconds: 0,
      timeRemaining: initialTime,
      isFocused: true,
      activeKeyCode: null,
      isKeyError: false,
      keystrokes: [],
      secondSnapshots: [],
      livesRemaining: config.lives || 1,
      cleanStreak: 0,
      bestCleanStreak: 0,
    }
  );

  const tabPressedRef = useRef(false);
  const activeKeyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or reset words based on active TestMode
  const resetTest = useCallback(
    (customWords?: string[]) => {
      let newWords: string[];
      let author: string | undefined = undefined;

      if (customWords && customWords.length > 0) {
        newWords = customWords;
      } else if (config.mode === 'quote') {
        const quote = getRandomQuote();
        newWords = quote.text.split(' ');
        author = quote.author;
      } else if (config.mode === 'code') {
        const snippet = getRandomCodeSnippet(config.language || 'typescript');
        newWords = snippet.split(' ');
      } else if (config.mode === 'custom' && config.customText) {
        newWords = config.customText.trim().split(/\s+/).slice(0, 400);
      } else if (config.mode === 'daily') {
        const daily = getDailyChallengeWords();
        newWords = daily.words;
      } else {
        const count =
          config.mode === 'words'
            ? config.wordCount || config.words || 25
            : config.mode === 'zen'
            ? 120
            : 100;
        newWords = generateWords(count, {
          difficulty: config.difficulty || 'standard',
          punctuation: config.punctuation,
          numbers: config.numbers,
        });
      }

      dispatch({
        type: 'RESET_WORDS',
        words: newWords,
        initialTime: config.duration || config.time || 30,
        quoteAuthor: author,
        initialLives: config.lives || (config.mode === 'suddenDeath' ? 1 : 1),
      });
    },
    [
      config.mode,
      config.difficulty,
      config.wordCount,
      config.words,
      config.duration,
      config.time,
      config.punctuation,
      config.numbers,
      config.customText,
      config.language,
      config.lives,
    ]
  );

  // Initial load inside useEffect to prevent SSR hydration mismatch
  useEffect(() => {
    resetTest();
  }, [resetTest]);

  // Append words dynamically in Zen mode when nearing the end
  useEffect(() => {
    if (config.mode === 'zen' && state.words.length > 0 && state.wordIndex >= state.words.length - 20) {
      const moreWords = generateWords(60, {
        difficulty: config.difficulty,
        punctuation: config.punctuation,
        numbers: config.numbers,
      });
      dispatch({ type: 'APPEND_ZEN_WORDS', words: moreWords });
    }
  }, [config.mode, config.difficulty, config.punctuation, config.numbers, state.words.length, state.wordIndex]);

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

      // Ignore modifiers, F-keys, navigation arrows
      if (
        e.key === 'Shift' ||
        e.key === 'Control' ||
        e.key === 'Alt' ||
        e.key === 'Meta' ||
        e.key === 'CapsLock' ||
        e.key.startsWith('Arrow') ||
        (e.key.startsWith('F') && e.key.length > 1)
      ) {
        return;
      }

      // Shortcut: Esc = restart / new words (in zen = finish)
      if (e.key === 'Escape') {
        e.preventDefault();
        if (config.mode === 'zen' && state.status === 'running') {
          dispatch({ type: 'FINISH', timestamp: performance.now(), resultStatus: 'zen' });
        } else {
          resetTest();
        }
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

      // Play audio feedback
      if (onPlaySound) {
        if (e.key === ' ') {
          onPlaySound('space');
        } else if (e.key.length === 1) {
          if (e.key === expectedChar || config.mode === 'zen') {
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
    [
      config.mode,
      state.words,
      state.wordIndex,
      state.currentInput,
      state.status,
      onPlaySound,
      resetTest,
    ]
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

  // Target expected character, event code, and shift requirement
  const currentWord = state.words[state.wordIndex] || '';
  const targetChar =
    state.currentInput.length < currentWord.length
      ? currentWord[state.currentInput.length]
      : ' ';
  const targetKeyCode = charToEventCode(targetChar);
  const targetNeedsShift = isShiftRequired(targetChar);

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
    targetNeedsShift,
    liveNetWpm,
    liveAccuracy,
    resetTest,
    finishTest: (status?: ResultStatus) =>
      dispatch({ type: 'FINISH', timestamp: performance.now(), resultStatus: status }),
    setFocused: (focused: boolean) => dispatch({ type: 'SET_FOCUSED', focused }),
  };
}

