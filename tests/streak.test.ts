import { describe, it, expect } from 'vitest';
import { calculateStreakFromLog, getGoalProgressText } from '../lib/streak';
import { DailyLog } from '../types';

describe('Practice Streak Calculation Engine', () => {
  const refDate = new Date(2026, 9, 18); // Oct 18, 2026

  it('reports streak 0 and none status when log is empty', () => {
    const emptyLog: DailyLog = {};
    const metrics = calculateStreakFromLog(emptyLog, refDate);

    expect(metrics.currentStreak).toBe(0);
    expect(metrics.longestStreak).toBe(0);
    expect(metrics.totalPracticeDays).toBe(0);
    expect(metrics.isTodayGoalMet).toBe(false);
    expect(metrics.status).toBe('none');
  });

  it('marks status as active when today goal is met', () => {
    const log: DailyLog = {
      '2026-10-17': {
        sessions: 2,
        totalSeconds: 120,
        bestWpm: 75,
        avgAccuracy: 98,
        modes: ['time'],
        lessonsDone: [],
        goalMet: true,
      },
      '2026-10-18': {
        sessions: 1,
        totalSeconds: 60,
        bestWpm: 80,
        avgAccuracy: 99,
        modes: ['words'],
        lessonsDone: [],
        goalMet: true,
      },
    };

    const metrics = calculateStreakFromLog(log, refDate);
    expect(metrics.currentStreak).toBe(2);
    expect(metrics.longestStreak).toBe(2);
    expect(metrics.isTodayGoalMet).toBe(true);
    expect(metrics.status).toBe('active');
  });

  it('keeps streak alive through yesterday and marks at-risk when today is not yet done', () => {
    const log: DailyLog = {
      '2026-10-16': {
        sessions: 1,
        totalSeconds: 60,
        bestWpm: 70,
        avgAccuracy: 95,
        modes: ['time'],
        lessonsDone: [],
        goalMet: true,
      },
      '2026-10-17': {
        sessions: 1,
        totalSeconds: 60,
        bestWpm: 72,
        avgAccuracy: 96,
        modes: ['time'],
        lessonsDone: [],
        goalMet: true,
      },
      // 2026-10-18 (today) has not met goal yet
    };

    const metrics = calculateStreakFromLog(log, refDate);
    expect(metrics.currentStreak).toBe(2);
    expect(metrics.longestStreak).toBe(2);
    expect(metrics.isTodayGoalMet).toBe(false);
    expect(metrics.status).toBe('at-risk');
  });

  it('resets current streak to 0 if yesterday was missed', () => {
    const log: DailyLog = {
      '2026-10-15': {
        sessions: 1,
        totalSeconds: 60,
        bestWpm: 70,
        avgAccuracy: 95,
        modes: ['time'],
        lessonsDone: [],
        goalMet: true,
      },
      // 2026-10-16 missed
      // 2026-10-17 missed
      // 2026-10-18 (today) not done
    };

    const metrics = calculateStreakFromLog(log, refDate);
    expect(metrics.currentStreak).toBe(0);
    expect(metrics.longestStreak).toBe(1);
    expect(metrics.status).toBe('none');
  });

  it('accurately identifies longest streak over multiple non-contiguous clusters', () => {
    const log: DailyLog = {
      // 4-day streak in January
      '2026-01-01': { sessions: 1, totalSeconds: 60, bestWpm: 60, avgAccuracy: 95, modes: [], lessonsDone: [], goalMet: true },
      '2026-01-02': { sessions: 1, totalSeconds: 60, bestWpm: 60, avgAccuracy: 95, modes: [], lessonsDone: [], goalMet: true },
      '2026-01-03': { sessions: 1, totalSeconds: 60, bestWpm: 60, avgAccuracy: 95, modes: [], lessonsDone: [], goalMet: true },
      '2026-01-04': { sessions: 1, totalSeconds: 60, bestWpm: 60, avgAccuracy: 95, modes: [], lessonsDone: [], goalMet: true },
      // 2-day streak in October
      '2026-10-17': { sessions: 1, totalSeconds: 60, bestWpm: 60, avgAccuracy: 95, modes: [], lessonsDone: [], goalMet: true },
      '2026-10-18': { sessions: 1, totalSeconds: 60, bestWpm: 60, avgAccuracy: 95, modes: [], lessonsDone: [], goalMet: true },
    };

    const metrics = calculateStreakFromLog(log, refDate);
    expect(metrics.currentStreak).toBe(2);
    expect(metrics.longestStreak).toBe(4);
    expect(metrics.totalPracticeDays).toBe(6);
  });

  it('formats goal progress text correctly for all goal options', () => {
    // 1-session option
    const goal1 = getGoalProgressText(1, 45, '1-session');
    expect(goal1.formatted).toBe('1 / 1 session');

    // 3-sessions option
    const goal3 = getGoalProgressText(2, 100, '3-sessions');
    expect(goal3.formatted).toBe('2 / 3 sessions');

    // 5-minutes option (300 seconds)
    const goal5 = getGoalProgressText(1, 180, '5-minutes');
    expect(goal5.formatted).toBe('3 / 5 min');
  });
});
