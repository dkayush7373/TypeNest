export type ThemeMode = 'midnight' | 'ember' | 'paper' | 'forest';

export type TestMode = 'time' | 'words';
export type TimeOption = 15 | 30 | 60 | 120;
export type WordOption = 10 | 25 | 50 | 100;

export interface TestConfig {
  mode: TestMode;
  time: TimeOption;
  words: WordOption;
  punctuation: boolean;
  numbers: boolean;
}

export interface KeystrokeLog {
  expectedChar: string;
  typedChar: string;
  timestamp: number;
  correct: boolean;
  key: string;
  code: string;
}

export interface TestResult {
  id: string;
  timestamp: number;
  mode: TestMode;
  targetCount: number; // seconds or word count
  punctuation: boolean;
  numbers: boolean;
  netWpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  elapsedSeconds: number;
  charStats: {
    correct: number;
    wrong: number;
    missed: number;
    extra: number;
  };
  wpmHistory: { second: number; wpm: number; rawWpm: number; errors: number }[];
  missedKeys: Record<string, number>;
  slowestWords: { word: string; durationMs: number }[];
}

export type ActiveTab = 'test' | 'learn' | 'history' | 'settings';

export interface UserSettings {
  theme: ThemeMode;
  fontSize: 'small' | 'medium' | 'large';
  caretStyle: 'line' | 'block' | 'underline';
  soundEnabled: boolean;
  soundVolume: number;
  keyboardVisible: boolean;
  fingerColorsEnabled: boolean;
  layout: 'qwerty' | 'colemak' | 'dvorak';
}
