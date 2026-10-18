'use client';

import React, { useState } from 'react';
import { LESSONS, Lesson } from '@/lib/lessons';
import { FingerGuide } from '@/components/FingerGuide';
import { getSafeStorage } from '@/lib/storage';
import { CheckCircle2, Lock, Play, Award } from 'lucide-react';

export const LESSONS_PROGRESS_KEY = 'keyflow:lessons_progress';

export interface LessonProgress {
  unlockedLessonIds: string[];
  lessonBestAccuracy: Record<string, number>;
}

interface LearnViewProps {
  onStartLessonPractice: (lesson: Lesson) => void;
}

export const LearnView: React.FC<LearnViewProps> = ({ onStartLessonPractice }) => {
  const [progress] = useState<LessonProgress>(() => {
    return getSafeStorage<LessonProgress>(LESSONS_PROGRESS_KEY, {
      unlockedLessonIds: ['home-row'],
      lessonBestAccuracy: {},
    });
  });

  const [selectedLessonId, setSelectedLessonId] = useState<string>('home-row');

  const selectedLesson =
    LESSONS.find((l) => l.id === selectedLessonId) || LESSONS[0];
  const isUnlocked = progress.unlockedLessonIds.includes(selectedLesson.id);
  const bestAcc = progress.lessonBestAccuracy[selectedLesson.id] || 0;
  const isCompleted = bestAcc >= selectedLesson.requiredAccuracy;

  return (
    <div className="w-full max-w-4xl flex flex-col space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="pb-4 border-b border-[var(--border)]">
        <h2 className="text-2xl font-bold tracking-normal text-[var(--text)]">
          Touch Typing Curriculum
        </h2>
        <p className="text-xs font-mono text-[var(--text-muted)] mt-1">
          Achieve 95%+ accuracy to master each mechanical row and unlock the next lesson.
        </p>
      </div>

      {/* Lesson Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {LESSONS.map((lesson, idx) => {
          const unlocked = progress.unlockedLessonIds.includes(lesson.id);
          const selected = selectedLesson.id === lesson.id;
          const acc = progress.lessonBestAccuracy[lesson.id] || 0;
          const completed = acc >= lesson.requiredAccuracy;

          return (
            <button
              key={lesson.id}
              onClick={() => setSelectedLessonId(lesson.id)}
              className={`p-3.5 rounded-lg border text-left transition-all relative select-none focus-visible:outline-none ${
                selected
                  ? 'border-[var(--accent)] bg-[var(--panel)] shadow-sm'
                  : 'border-[var(--border)] bg-[var(--panel)] hover:border-[var(--text-muted)]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                  Step 0{idx + 1}
                </span>
                {completed ? (
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />
                ) : unlocked ? (
                  <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-50" />
                )}
              </div>

              <h3 className="font-semibold text-xs tracking-normal text-[var(--text)] mb-1 truncate">
                {lesson.title.replace(/^\d+\.\s*/, '')}
              </h3>

              <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                <span>Pass: {lesson.requiredAccuracy}%</span>
                {acc > 0 && (
                  <span className={completed ? 'text-[var(--accent)] font-semibold' : ''}>
                    {acc}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Lesson Detail Workspace */}
      <div className="p-6 sm:p-8 rounded-lg border border-[var(--border)] bg-[var(--panel)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-xl font-bold tracking-normal text-[var(--text)]">
                {selectedLesson.title}
              </h3>
              {isCompleted && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30 flex items-center space-x-1">
                  <Award className="w-3 h-3" />
                  <span>Mastered</span>
                </span>
              )}
            </div>
            <p className="text-sm font-mono text-[var(--text-muted)] max-w-xl leading-relaxed">
              {selectedLesson.description}
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0">
            <span className="text-xs font-mono text-[var(--text-muted)]">Personal Best</span>
            <span className="text-2xl font-bold font-mono text-[var(--accent)] num-tabular">
              {bestAcc > 0 ? `${bestAcc}%` : 'Not tested'}
            </span>
          </div>
        </div>

        {/* Lesson Key Target Matrix */}
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] block">
            Target Lesson Keys
          </span>
          <div className="flex flex-wrap gap-2">
            {selectedLesson.keys.map((k) => (
              <span
                key={k}
                className="w-10 h-10 rounded-[6px] border border-[var(--border)] bg-[var(--bg)] flex items-center justify-center font-mono font-bold text-sm text-[var(--accent)] shadow-xs"
              >
                {k}
              </span>
            ))}
          </div>
        </div>

        {/* Interactive Finger Anatomy Guide with Highlighted Keys */}
        <FingerGuide highlightedKeys={selectedLesson.keys} />

        {/* Action Button */}
        <div className="pt-4 flex items-center justify-between border-t border-[var(--border)]">
          <div className="text-xs font-mono text-[var(--text-muted)]">
            <span>Test length: 20 focused words • Pass threshold: </span>
            <span className="text-[var(--text)] font-semibold">{selectedLesson.requiredAccuracy}%</span>
          </div>

          <button
            onClick={() => onStartLessonPractice(selectedLesson)}
            disabled={!isUnlocked}
            className={`px-6 py-2.5 rounded-md font-mono text-sm font-medium transition-all flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
              isUnlocked
                ? 'bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 active:translate-y-[1px]'
                : 'bg-[var(--panel)] text-[var(--text-muted)] border border-[var(--border)] opacity-60 cursor-not-allowed'
            }`}
          >
            {isUnlocked ? (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start Practice Drill</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Locked (Complete Step {LESSONS.findIndex(l => l.id === selectedLesson.id)})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
