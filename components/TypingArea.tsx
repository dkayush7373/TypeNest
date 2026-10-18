'use client';

import React, { useRef, useEffect } from 'react';
import { CompletedWord } from '@/hooks/useTypingEngine';
import { MousePointerClick } from 'lucide-react';

interface TypingAreaProps {
  words: string[];
  wordIndex: number;
  currentInput: string;
  completedWords: CompletedWord[];
  isFocused: boolean;
  onFocusRequest: () => void;
  caretStyle?: 'line' | 'block' | 'underline';
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  words,
  wordIndex,
  currentInput,
  completedWords,
  isFocused,
  onFocusRequest,
  caretStyle = 'line',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);

  // Auto-scroll when active word moves past visible window lines
  useEffect(() => {
    if (activeWordRef.current && containerRef.current) {
      const activeEl = activeWordRef.current;
      const container = containerRef.current;
      const offsetTop = activeEl.offsetTop - container.offsetTop;

      if (offsetTop > 75) {
        container.scrollTo({
          top: offsetTop - 65,
          behavior: 'smooth',
        });
      } else {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [wordIndex]);

  const currentWord = words[wordIndex] || '';

  return (
    <div
      onClick={onFocusRequest}
      className="relative w-full max-w-4xl p-5 sm:p-6 rounded-lg border border-[var(--border)] bg-[var(--panel)] cursor-text select-none min-h-[160px] flex items-center"
      aria-label="Typing test canvas"
    >
      {/* Blur overlay when window is unfocused */}
      {!isFocused && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[var(--panel)]/95 rounded-lg border border-[var(--accent)]/40 transition-all cursor-pointer">
          <div className="flex items-center space-x-2 text-[var(--accent)] mb-1">
            <MousePointerClick className="w-5 h-5 animate-bounce" />
            <span className="font-semibold text-sm font-mono">Click or press any key to focus</span>
          </div>
          <p className="text-xs font-mono text-[var(--text-muted)]">
            Test paused while window was unfocused
          </p>
        </div>
      )}

      {/* Word stream container */}
      <div
        ref={containerRef}
        className="typing-text w-full max-h-[140px] overflow-hidden leading-relaxed text-[var(--text-muted)] tracking-wide"
      >
        {/* Completed Words */}
        {completedWords.map((cw, i) => {
          return (
            <span
              key={`completed-${i}`}
              className={`mr-3 inline-block transition-colors ${
                cw.correct
                  ? 'text-[var(--text)]'
                  : 'text-[var(--error)] underline decoration-[var(--error)]/60 underline-offset-4'
              }`}
            >
              {cw.typed}
            </span>
          );
        })}

        {/* Current Active Word */}
        {currentWord && (
          <span
            ref={activeWordRef}
            className="relative mr-3 inline-block font-semibold"
          >
            {/* Render expected letters compared with currentInput */}
            {currentWord.split('').map((char, charIdx) => {
              const isTyped = charIdx < currentInput.length;
              const typedChar = currentInput[charIdx];
              const isCorrect = isTyped && typedChar === char;
              const isCurrentChar = charIdx === currentInput.length;

              let charClass = 'relative inline-block ';
              if (isTyped) {
                charClass += isCorrect
                  ? 'text-[var(--text)] '
                  : 'text-[var(--error)] bg-[var(--error-soft)] rounded-xs ';
              } else {
                charClass += 'text-[var(--text-muted)] ';
              }

              return (
                <span key={`char-${charIdx}`} className={charClass}>
                  {/* Caret rendering */}
                  {isCurrentChar && (
                    <span
                      className={`absolute pointer-events-none caret-anim ${
                        caretStyle === 'block'
                          ? 'inset-0 bg-[var(--accent)]/30 border-b-2 border-[var(--accent)]'
                          : caretStyle === 'underline'
                          ? 'bottom-0 left-0 right-0 h-[2px] bg-[var(--accent)]'
                          : 'top-1 bottom-1 -left-[1px] w-[2px] bg-[var(--accent)]'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                  {char}
                </span>
              );
            })}

            {/* Extra letters typed beyond expected length */}
            {currentInput.length > currentWord.length &&
              currentInput
                .slice(currentWord.length)
                .split('')
                .map((extraChar, extraIdx) => {
                  const isCurrentCaret =
                    extraIdx === currentInput.length - currentWord.length - 1;
                  return (
                    <span
                      key={`extra-${extraIdx}`}
                      className="relative inline-block text-[var(--error)] opacity-85 underline decoration-[var(--error)]"
                    >
                      {extraChar}
                      {isCurrentCaret && (
                        <span
                          className="absolute top-1 bottom-1 -right-[1px] w-[2px] bg-[var(--accent)] caret-anim pointer-events-none"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                  );
                })}
          </span>
        )}

        {/* Future Words */}
        {words.slice(wordIndex + 1).map((w, futureIdx) => (
          <span
            key={`future-${futureIdx}`}
            className="mr-3 inline-block text-[var(--text-muted)] opacity-60"
          >
            {w}
          </span>
        ))}
      </div>
    </div>
  );
};
