export type ThemeMode = 'midnight' | 'ember' | 'paper' | 'forest';

export type TestMode =
  | 'time'
  | 'words'
  | 'quote'
  | 'zen'
  | 'suddenDeath'
  | 'code'
  | 'custom'
  | 'daily'
  | 'ghost';

export type TimeOption = 15 | 30 | 60 | 120;
export type WordOption = 10 | 25 | 50 | 100;
export type DifficultyOption = 'standard' | 'advanced' | 'expert';
export type CodeLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'htmlcss'
  | 'cpp'
  | 'java'
  | 'sql';
export type ResultStatus = 'completed' | 'failed' | 'zen';

export interface TestConfig {
  mode: TestMode;
  duration?: TimeOption;
  wordCount?: WordOption;
  // Legacy aliases for seamless compatibility
  time?: TimeOption;
  words?: WordOption;
  difficulty: DifficultyOption;
  punctuation: boolean;
  numbers: boolean;
  language?: CodeLanguage;
  customText?: string;
  seed?: string;
  lives?: number;
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
  status: ResultStatus;
  difficulty: DifficultyOption;
  config: TestConfig;
  targetCount: number; // seconds or word count or characters
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
  cleanStreak?: number;
  failedChar?: { expected: string; typed: string };
  quoteAuthor?: string;
}

export interface DailyLogEntry {
  sessions: number;
  totalSeconds: number;
  bestWpm: number;
  avgAccuracy: number;
  modes: TestMode[];
  lessonsDone: string[];
  goalMet: boolean;
}

export type DailyLog = Record<string, DailyLogEntry>;

export interface V2StorageSchema {
  version: 2;
  results: TestResult[];
  dailyLog: DailyLog;
}

export type ActiveTab = 'test' | 'learn' | 'history' | 'streak' | 'layouts' | 'settings';

export type DailyGoalOption = '1-session' | '3-sessions' | '5-minutes';

export interface UserSettings {
  theme: ThemeMode;
  fontSize: 'small' | 'medium' | 'large';
  caretStyle: 'line' | 'block' | 'underline';
  soundEnabled: boolean;
  soundVolume: number;
  keyboardVisible: boolean;
  fingerColorsEnabled: boolean;
  layout: string; // 'qwerty' | 'colemak' | 'dvorak' | 'workman' | custom id
  soundPack?: 'soft' | 'clicky' | 'thock';
  defaultMode?: TestMode;
  dailyGoal?: DailyGoalOption;
  showStreakBadge?: boolean;
  showNextKey?: boolean;
  autoIndent?: boolean;
  showWhitespace?: boolean;
  reducedMotion?: boolean;
}

