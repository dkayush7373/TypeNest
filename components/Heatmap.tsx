'use client';

import React, { useMemo } from 'react';
import { QWERTY_LAYOUT, KeyDefinition } from '@/lib/layouts';

interface HeatmapProps {
  missedKeys: Record<string, number>;
}

export const Heatmap: React.FC<HeatmapProps> = ({ missedKeys }) => {
  const maxMisses = useMemo(() => {
    const values = Object.values(missedKeys);
    return values.length > 0 ? Math.max(...values, 1) : 1;
  }, [missedKeys]);

  const topMissed = useMemo(() => {
    return Object.entries(missedKeys)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [missedKeys]);

  return (
    <div
      className="w-full p-4 sm:p-5 rounded-lg border border-[var(--border)] bg-[var(--panel)] select-none"
      aria-label="Keyboard Miss Heatmap"
    >
      <div className="flex items-center justify-between mb-3 text-xs font-mono text-[var(--text-muted)]">
        <span className="uppercase tracking-wider">Keyboard Miss Heatmap</span>
        <div className="flex items-center space-x-2">
          <span>0 misses</span>
          <span className="w-3 h-3 rounded-xs border border-[var(--border)] bg-[var(--bg)]" />
          <span className="w-3 h-3 rounded-xs bg-[var(--error)] opacity-30" />
          <span className="w-3 h-3 rounded-xs bg-[var(--error)] opacity-70" />
          <span className="w-3 h-3 rounded-xs bg-[var(--error)] text-white" />
          <span>High misses</span>
        </div>
      </div>

      {/* Mini Visual Heatmap Keyboard */}
      <div className="flex flex-col gap-1 sm:gap-1.5 w-full">
        {QWERTY_LAYOUT.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex items-center justify-center gap-1 sm:gap-1.5 w-full"
          >
            {row.map((keyDef: KeyDefinition) => {
              const charKey = keyDef.label.toLowerCase();
              const misses = missedKeys[charKey] || 0;
              const intensity = misses > 0 ? Math.min(misses / maxMisses, 1) : 0;
              const widthMultiplier = keyDef.width || 1;

              let bgStyle = 'var(--panel)';
              let textColor = 'var(--text-muted)';
              let borderColor = 'var(--border)';

              if (misses > 0) {
                textColor = '#ffffff';
                borderColor = 'var(--error)';
                if (intensity > 0.6) {
                  bgStyle = 'var(--error)';
                } else if (intensity > 0.3) {
                  bgStyle = 'rgba(255, 107, 107, 0.65)';
                } else {
                  bgStyle = 'rgba(255, 107, 107, 0.35)';
                }
              }

              return (
                <div
                  key={keyDef.code}
                  className="keycap relative flex flex-col items-center justify-center h-8 sm:h-9 text-[10px] sm:text-xs font-mono transition-colors"
                  style={{
                    flex: `${widthMultiplier} ${widthMultiplier} 0px`,
                    minWidth: `${Math.round(20 * widthMultiplier)}px`,
                    backgroundColor: bgStyle,
                    borderColor: borderColor,
                    color: textColor,
                  }}
                  title={misses > 0 ? `${keyDef.label}: ${misses} missed` : keyDef.label}
                >
                  <span className="leading-none font-medium">
                    {keyDef.label}
                  </span>
                  {misses > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[var(--error)] text-white text-[8px] font-bold flex items-center justify-center shadow-xs">
                      {misses}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Top Missed Keys List */}
      <div className="mt-4 pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between text-xs font-mono">
        <span className="text-[var(--text-muted)]">Focus areas:</span>
        {topMissed.length > 0 ? (
          <div className="flex items-center space-x-3">
            {topMissed.map(([key, count]) => (
              <span
                key={key}
                className="flex items-center space-x-1.5 px-2 py-0.5 rounded border border-[var(--error)]/40 bg-[var(--error-soft)] text-[var(--error)]"
              >
                <kbd className="font-bold">{key.toUpperCase()}</kbd>
                <span className="text-[10px] opacity-80">{count}x</span>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[var(--accent)] font-medium">
            Zero missed keys! Perfect keycap accuracy.
          </span>
        )}
      </div>
    </div>
  );
};
