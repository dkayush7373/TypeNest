import { DailyLog, DailyGoalOption } from '../types';
import { formatLocalDate } from './storage';

export interface StreakMetrics {
  currentStreak: number;
  longestStreak: number;
  totalPracticeDays: number;
  isTodayGoalMet: boolean;
  status: 'active' | 'at-risk' | 'none';
  todaySessions: number;
  todaySeconds: number;
}

/**
 * Returns previous calendar day string YYYY-MM-DD given a date.
 */
function getPrevDateString(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return formatLocalDate(date);
}

/**
 * Returns next calendar day string YYYY-MM-DD given a date.
 */
function getNextDateString(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + 1);
  return formatLocalDate(date);
}

export const DEFAULT_STREAK_METRICS: StreakMetrics = {
  currentStreak: 0,
  longestStreak: 0,
  totalPracticeDays: 0,
  isTodayGoalMet: false,
  status: 'none',
  todaySessions: 0,
  todaySeconds: 0,
};

/**
 * Derives current streak, longest streak, and status from the daily log.
 * Pure function with optional reference date for deterministic testing.
 */
export function calculateStreakFromLog(
  dailyLog: DailyLog,
  referenceDate?: Date
): StreakMetrics {
  const ref = referenceDate ?? new Date();
  const todayStr = formatLocalDate(ref);
  const yesterdayDate = new Date(
    ref.getFullYear(),
    ref.getMonth(),
    ref.getDate() - 1
  );
  const yesterdayStr = formatLocalDate(yesterdayDate);

  const todayEntry = dailyLog[todayStr];
  const isTodayGoalMet = !!todayEntry?.goalMet;
  const isYesterdayGoalMet = !!dailyLog[yesterdayStr]?.goalMet;

  // 1. Calculate Current Streak
  let currentStreak = 0;
  if (isTodayGoalMet) {
    // Walk back from today
    let checkDateStr = todayStr;
    while (dailyLog[checkDateStr]?.goalMet) {
      currentStreak++;
      checkDateStr = getPrevDateString(checkDateStr);
    }
  } else if (isYesterdayGoalMet) {
    // Today not done yet, but streak stays alive through yesterday
    let checkDateStr = yesterdayStr;
    while (dailyLog[checkDateStr]?.goalMet) {
      currentStreak++;
      checkDateStr = getPrevDateString(checkDateStr);
    }
  } else {
    currentStreak = 0;
  }

  // 2. Calculate Longest Streak & Total Practice Days
  const goalMetDates = Object.keys(dailyLog)
    .filter((k) => dailyLog[k]?.goalMet)
    .sort();

  const totalPracticeDays = goalMetDates.length;

  let longestStreak = 0;
  let runningStreak = 0;
  let prevDateStr: string | null = null;

  for (const dateStr of goalMetDates) {
    if (!prevDateStr) {
      runningStreak = 1;
    } else {
      const expectedNext = getNextDateString(prevDateStr);
      if (dateStr === expectedNext) {
        runningStreak++;
      } else {
        runningStreak = 1;
      }
    }
    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
    prevDateStr = dateStr;
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  // 3. Status
  let status: 'active' | 'at-risk' | 'none' = 'none';
  if (currentStreak > 0) {
    status = isTodayGoalMet ? 'active' : 'at-risk';
  }

  return {
    currentStreak,
    longestStreak,
    totalPracticeDays,
    isTodayGoalMet,
    status,
    todaySessions: todayEntry?.sessions || 0,
    todaySeconds: todayEntry?.totalSeconds || 0,
  };
}

/**
 * Returns day goal progress text, e.g. "2 / 3 sessions" or "140s / 300s"
 */
export function getGoalProgressText(
  todaySessions: number,
  todaySeconds: number,
  goalOption: DailyGoalOption = '1-session'
): { current: number; target: number; unit: string; formatted: string } {
  if (goalOption === '3-sessions') {
    return {
      current: todaySessions,
      target: 3,
      unit: 'sessions',
      formatted: `${Math.min(todaySessions, 3)} / 3 sessions`,
    };
  }
  if (goalOption === '5-minutes') {
    const mins = Math.min(Math.floor(todaySeconds / 60), 5);
    return {
      current: mins,
      target: 5,
      unit: 'min',
      formatted: `${mins} / 5 min`,
    };
  }
  return {
    current: Math.min(todaySessions, 1),
    target: 1,
    unit: 'session',
    formatted: `${Math.min(todaySessions, 1)} / 1 session`,
  };
}
