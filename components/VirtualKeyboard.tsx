'use client';

import React, { useMemo } from 'react';
import { getKeyboardLayout, KeyDefinition, CustomLayout } from '@/lib/layouts';

interface VirtualKeyboardProps {
  layout?: string;
  customLayouts?: CustomLayout[];
  activeKeyCode: string | null;
  isKeyError?: boolean;
  targetKeyCode?: string | null;
  targetNeedsShift?: boolean;
  showFingerGuides?: boolean;
  className?: string;
}

// Finger color tokens in muted tones (strictly no rainbow, no neon)
const FINGER_DOT_COLORS: Record<number, string> = {
  1: 'bg-teal-500/40', // left pinky
  2: 'bg-emerald-500/40', // left ring
  3: 'bg-cyan-500/40', // left middle
  4: 'bg-sky-500/40', // left index
  5: 'bg-slate-400/40', // thumbs
  6: 'bg-slate-400/40',
  7: 'bg-sky-500/40', // right index
  8: 'bg-cyan-500/40', // right middle
  9: 'bg-emerald-500/40', // right ring
  10: 'bg-teal-500/40', // right pinky
};

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  layout = 'qwerty',
  customLayouts = [],
  activeKeyCode,
  isKeyError = false,
  targetKeyCode,
  targetNeedsShift = false,
  showFingerGuides = false,
  className = '',
}) => {
  const layoutMatrix = useMemo(
    () => getKeyboardLayout(layout, customLayouts),
    [layout, customLayouts]
  );

  return (
    <div
      className={`w-full max-w-4xl p-4 sm:p-5 rounded-lg border border-[var(--border)] bg-[var(--panel)] select-none transition-all duration-200 ${className}`}
      aria-label="Virtual on-screen mechanical keyboard"
    >
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {layoutMatrix.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex items-center justify-center gap-1 sm:gap-1.5 w-full"
          >
            {row.map((keyDef: KeyDefinition) => {
              const isPressed = activeKeyCode === keyDef.code;
              const isShiftKey = keyDef.code === 'ShiftLeft' || keyDef.code === 'ShiftRight';
              const isTarget =
                targetKeyCode === keyDef.code ||
                (targetNeedsShift && isShiftKey);

              const widthMultiplier = keyDef.width || 1;
              const flexGrow = widthMultiplier;

              let keycapClass =
                'keycap relative flex flex-col items-center justify-center h-10 sm:h-12 text-xs sm:text-sm font-mono ';

              if (isPressed) {
                if (isKeyError) {
                  keycapClass += 'is-error ';
                } else {
                  keycapClass += 'is-lit ';
                }
              } else if (isTarget) {
                keycapClass += 'is-active-target ';
              }

              return (
                <div
                  key={keyDef.code}
                  className={keycapClass}
                  style={{
                    flex: `${flexGrow} ${flexGrow} 0px`,
                    minWidth: `${Math.round(26 * widthMultiplier)}px`,
                  }}
                  data-code={keyDef.code}
                >
                  {/* Key shift label (upper corner) */}
                  {keyDef.shiftLabel && (
                    <span
                      className={`absolute top-1 left-1.5 text-[9px] leading-none transition-colors ${
                        targetNeedsShift && isTarget
                          ? 'text-[var(--accent)] font-semibold'
                          : 'text-[var(--text-muted)] opacity-60'
                      }`}
                    >
                      {keyDef.shiftLabel}
                    </span>
                  )}

                  {/* Primary Key Label */}
                  <span
                    className={`leading-none font-medium ${
                      isPressed
                        ? 'text-inherit font-semibold'
                        : isTarget
                        ? 'text-[var(--accent)] font-semibold'
                        : 'text-[var(--text)]'
                    }`}
                  >
                    {keyDef.label}
                  </span>

                  {/* Finger position indicator dot */}
                  {showFingerGuides && keyDef.finger && !isPressed && !isTarget && (
                    <span
                      className={`absolute bottom-1 w-1 h-1 rounded-full ${
                        FINGER_DOT_COLORS[keyDef.finger] || 'bg-slate-500/30'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

