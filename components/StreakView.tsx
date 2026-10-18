'use client';

import React, { useState, useSyncExternalStore, useMemo } from 'react';
import { DailyLog, DailyLogEntry, DailyGoalOption } from '@/types';
import { StreakMetrics } from '@/lib/streak';
import { formatLocalDate } from '@/lib/storage';
import {
  Flame,
  Award,
  Calendar as CalendarIcon,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface StreakViewProps {
  dailyLog: DailyLog;
  streakMetrics: StreakMetrics;
  dailyGoal?: DailyGoalOption;
  onStartPractice?: () => void;
}

const MILESTONES = [
  { days: 3, title: 'Initiate', desc: '3-day consistency mark' },
  { days: 7, title: 'Habit Builder', desc: '1 week unbroken' },
  { days: 14, title: 'Fortnight', desc: '2 solid weeks' },
  { days: 30, title: 'Monthly Master', desc: '30 days dedicated practice' },
  { days: 60, title: 'Rhythm Engine', desc: '60 days kinetic velocity' },
  { days: 100, title: 'Centurion', desc: '100 days mechanical excellence' },
  { days: 365, title: 'Year of Flow', desc: '365 days continuous discipline' },
];

const emptySubscribe = () => () => {};

export const StreakView: React.FC<StreakViewProps> = ({
  dailyLog,
  streakMetrics,
  dailyGoal = '1-session',
  onStartPractice,
}) => {
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const todayStr = useMemo(() => (isMounted ? formatLocalDate() : ''), [isMounted]);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const activeSelectedDate = selectedDate || todayStr;
  const selectedEntry: DailyLogEntry | undefined = dailyLog[activeSelectedDate];

  // 12-month GitHub-style calendar grid (52 weeks x 7 days)
  const calendarDays = useMemo(() => {
    if (!todayStr) return [];
    const days: { dateStr: string; dayOfWeek: number; entry?: DailyLogEntry; isToday: boolean }[] = [];
    const today = new Date();
    // Start exactly 52 weeks ago from today, back to Sunday
    const start = new Date(today);
    start.setDate(today.getDate() - 364);
    const dayOfWeek = start.getDay();
    start.setDate(start.getDate() - dayOfWeek); // align to Sunday

    const current = new Date(start);
    while (current <= today) {
      const dateStr = formatLocalDate(current);
      days.push({
        dateStr,
        dayOfWeek: current.getDay(),
        entry: dailyLog[dateStr],
        isToday: dateStr === todayStr,
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [dailyLog, todayStr]);

  // This-week 7 days progress
  const thisWeekDays = useMemo(() => {
    if (!todayStr) return [];
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - currentDay);

    const week: { label: string; dateStr: string; goalMet: boolean; isToday: boolean }[] = [];
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const str = formatLocalDate(d);
      week.push({
        label: dayLabels[i],
        dateStr: str,
        goalMet: !!dailyLog[str]?.goalMet,
        isToday: str === todayStr,
      });
    }
    return week;
  }, [dailyLog, todayStr]);

  return (
    <div className="w-full max-w-4xl flex flex-col space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--border)] gap-2">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text)] tracking-normal font-mono flex items-center space-x-2">
            <Flame className="w-5 h-5 text-[var(--accent)]" />
            <span>Practice Streak & Consistency</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Every session counts. Build mechanical rhythm and muscle memory one day at a time.
          </p>
        </div>

        {streakMetrics.status === 'at-risk' && (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Streak at risk: complete today&apos;s goal</span>
          </div>
        )}
      </div>

      {/* Big Numbers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Current Streak */}
        <div className="p-4 rounded-md border border-[var(--border)] bg-[var(--panel)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-mono">
            <span className="uppercase tracking-wider text-[10px]">Current Streak</span>
            <Flame
              className={`w-4 h-4 ${
                streakMetrics.currentStreak > 0 ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
              }`}
            />
          </div>
          <div className="mt-2 flex items-baseline space-x-2 font-mono">
            <span className="text-4xl font-semibold text-[var(--accent)] num-tabular">
              {streakMetrics.currentStreak}
            </span>
            <span className="text-sm text-[var(--text-muted)]">days</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            {streakMetrics.isTodayGoalMet
              ? "Today's goal completed"
              : streakMetrics.currentStreak > 0
              ? 'Complete 1 session today to extend'
              : 'Start your streak today'}
          </p>
        </div>

        {/* Longest Streak */}
        <div className="p-4 rounded-md border border-[var(--border)] bg-[var(--panel)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-mono">
            <span className="uppercase tracking-wider text-[10px]">Longest Streak</span>
            <Award className="w-4 h-4 text-[var(--text-muted)]" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2 font-mono">
            <span className="text-4xl font-semibold text-[var(--text)] num-tabular">
              {streakMetrics.longestStreak}
            </span>
            <span className="text-sm text-[var(--text-muted)]">days</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Personal all-time consistency peak
          </p>
        </div>

        {/* Total Days */}
        <div className="p-4 rounded-md border border-[var(--border)] bg-[var(--panel)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-mono">
            <span className="uppercase tracking-wider text-[10px]">Total Practice Days</span>
            <CalendarIcon className="w-4 h-4 text-[var(--text-muted)]" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2 font-mono">
            <span className="text-4xl font-semibold text-[var(--text)] num-tabular">
              {streakMetrics.totalPracticeDays}
            </span>
            <span className="text-sm text-[var(--text-muted)]">days</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Lifetime days logged on KeyFlow
          </p>
        </div>
      </div>

      {/* This Week Progress Strip */}
      <div className="p-4 rounded-md border border-[var(--border)] bg-[var(--panel)] space-y-3 font-mono">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[var(--text)]">This Week&apos;s Progression</span>
          <span className="text-[var(--text-muted)] text-[11px]">
            Goal: {dailyGoal === '3-sessions' ? '3 sessions' : dailyGoal === '5-minutes' ? '5 minutes' : '1 session'}/day
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {thisWeekDays.map((day) => (
            <div
              key={day.dateStr}
              onClick={() => setSelectedDate(day.dateStr)}
              className={`p-2.5 rounded flex flex-col items-center justify-center space-y-1.5 cursor-pointer transition-colors border ${
                selectedDate === day.dateStr
                  ? 'border-[var(--accent)] bg-[var(--bg)]'
                  : 'border-[var(--border)]/40 hover:border-[var(--border)]'
              } ${day.isToday ? 'ring-1 ring-[var(--accent)]/60' : ''}`}
            >
              <span className="text-[10px] text-[var(--text-muted)] uppercase">
                {day.label}
              </span>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  day.goalMet
                    ? 'bg-[var(--accent)] text-[var(--bg)]'
                    : 'bg-[var(--panel)] text-[var(--text-muted)] border border-[var(--border)]'
                }`}
              >
                {day.goalMet ? (
                  <CheckCircle2 className="w-4 h-4 fill-current text-[var(--bg)]" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--border)]" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 12-Month Heatmap Calendar */}
      <div className="p-4 rounded-md border border-[var(--border)] bg-[var(--panel)] space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-semibold text-[var(--text)]">12-Month Practice Heatmap</span>
          <div className="flex items-center space-x-1.5 text-[10px] text-[var(--text-muted)]">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-sm bg-[var(--border)]/30" />
            <div className="w-2.5 h-2.5 rounded-sm bg-[var(--accent)]/30" />
            <div className="w-2.5 h-2.5 rounded-sm bg-[var(--accent)]/70" />
            <div className="w-2.5 h-2.5 rounded-sm bg-[var(--accent)]" />
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="inline-grid grid-rows-7 grid-flow-col gap-1 select-none">
            {calendarDays.map((d) => {
              const sessions = d.entry?.sessions || 0;
              let toneClass = 'bg-[var(--border)]/20';
              if (sessions >= 3) {
                toneClass = 'bg-[var(--accent)]';
              } else if (sessions === 2) {
                toneClass = 'bg-[var(--accent)]/70';
              } else if (sessions === 1) {
                toneClass = 'bg-[var(--accent)]/35';
              }

              const isSelected = selectedDate === d.dateStr;

              return (
                <button
                  key={d.dateStr}
                  onClick={() => setSelectedDate(d.dateStr)}
                  className={`w-3 h-3 rounded-sm transition-transform ${toneClass} ${
                    d.isToday ? 'ring-1 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--panel)]' : ''
                  } ${isSelected ? 'scale-125 z-10' : 'hover:scale-110'}`}
                  title={`${d.dateStr}: ${sessions} session${sessions === 1 ? '' : 's'}`}
                  aria-label={`${d.dateStr}: ${sessions} sessions`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Day Detail Panel */}
      <div className="p-4 rounded-md border border-[var(--border)] bg-[var(--panel)] font-mono space-y-3">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-[var(--border)]/60">
          <span className="font-semibold text-[var(--text)] flex items-center space-x-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Practice Details: {selectedDate}</span>
            {selectedDate === todayStr && (
              <span className="text-[10px] text-[var(--accent)] font-normal">(Today)</span>
            )}
          </span>
          {selectedEntry?.goalMet ? (
            <span className="text-xs text-[var(--accent)] flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Goal Met</span>
            </span>
          ) : (
            <span className="text-xs text-[var(--text-muted)]">Goal Not Met</span>
          )}
        </div>

        {selectedEntry && selectedEntry.sessions > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div>
              <span className="block text-[10px] text-[var(--text-muted)] uppercase">Sessions</span>
              <span className="text-lg font-semibold text-[var(--text)] num-tabular">
                {selectedEntry.sessions}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-[var(--text-muted)] uppercase">Time Practiced</span>
              <span className="text-lg font-semibold text-[var(--text)] num-tabular">
                {Math.floor(selectedEntry.totalSeconds / 60)}m {selectedEntry.totalSeconds % 60}s
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-[var(--text-muted)] uppercase">Peak WPM</span>
              <span className="text-lg font-semibold text-[var(--accent)] num-tabular">
                {selectedEntry.bestWpm}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-[var(--text-muted)] uppercase">Avg Accuracy</span>
              <span className="text-lg font-semibold text-[var(--text)] num-tabular">
                {selectedEntry.avgAccuracy}%
              </span>
            </div>
            {selectedEntry.modes && selectedEntry.modes.length > 0 && (
              <div className="col-span-2 sm:col-span-4 flex items-center space-x-2 pt-1">
                <span className="text-[10px] text-[var(--text-muted)] uppercase">Modes:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedEntry.modes.map((m) => (
                    <span
                      key={m}
                      className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--bg)] text-[10px] text-[var(--text-muted)]"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-[var(--text-muted)]">
            <p>No practice on this day.</p>
          </div>
        )}
      </div>

      {/* Milestone Track (3, 7, 14, 30, 60, 100, 365) */}
      <div className="p-4 rounded-md border border-[var(--border)] bg-[var(--panel)] space-y-3 font-mono">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-[var(--border)]/60">
          <span className="font-semibold text-[var(--text)] flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-[var(--accent)]" />
            <span>Consistency Milestones</span>
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">
            {MILESTONES.filter((m) => streakMetrics.longestStreak >= m.days).length} of {MILESTONES.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {MILESTONES.map((m) => {
            const isUnlocked = streakMetrics.longestStreak >= m.days;
            return (
              <div
                key={m.days}
                className={`p-3 rounded-md border transition-all ${
                  isUnlocked
                    ? 'border-[var(--accent)]/50 bg-[var(--accent-soft)]'
                    : 'border-[var(--border)]/40 bg-[var(--bg)]/40 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text)]">
                    {m.days} Days
                  </span>
                  {isUnlocked ? (
                    <Award className="w-4 h-4 text-[var(--accent)]" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  )}
                </div>
                <p className="text-xs font-medium text-[var(--text)] mt-1">{m.title}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{m.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State for New User */}
      {streakMetrics.totalPracticeDays === 0 && (
        <div className="p-8 rounded-md border border-[var(--border)] bg-[var(--panel)] text-center space-y-3 font-mono">
          <Flame className="w-8 h-8 text-[var(--accent)] mx-auto opacity-80" />
          <h3 className="text-base font-semibold text-[var(--text)]">
            Complete one session to start your streak
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
            Typing velocity is built on daily micro-sessions. Log just 1 test today to ignite your streak counter.
          </p>
          {onStartPractice && (
            <button
              onClick={onStartPractice}
              className="mt-2 inline-flex items-center space-x-2 px-4 py-2 rounded bg-[var(--accent)] text-[var(--bg)] font-semibold text-xs hover:opacity-90 transition-opacity"
            >
              <span>Start First Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
