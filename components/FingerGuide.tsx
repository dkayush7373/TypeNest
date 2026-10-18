'use client';

import React from 'react';

interface FingerGuideProps {
  activeFinger?: number | null; // 1-10
}

interface FingerInfo {
  id: number;
  name: string;
  hand: 'left' | 'right';
  homeKey: string;
  reachKeys: string;
}

const FINGERS: FingerInfo[] = [
  { id: 1, name: 'L. Pinky', hand: 'left', homeKey: 'A', reachKeys: 'Q, Z, 1, Tab, Shift' },
  { id: 2, name: 'L. Ring', hand: 'left', homeKey: 'S', reachKeys: 'W, X, 2' },
  { id: 3, name: 'L. Middle', hand: 'left', homeKey: 'D', reachKeys: 'E, C, 3' },
  { id: 4, name: 'L. Index', hand: 'left', homeKey: 'F', reachKeys: 'R, T, G, V, B, 4, 5' },
  { id: 5, name: 'Thumbs', hand: 'left', homeKey: 'Space', reachKeys: 'Spacebar' },
  { id: 7, name: 'R. Index', hand: 'right', homeKey: 'J', reachKeys: 'Y, U, H, N, M, 6, 7' },
  { id: 8, name: 'R. Middle', hand: 'right', homeKey: 'K', reachKeys: 'I, <, 8' },
  { id: 9, name: 'R. Ring', hand: 'right', homeKey: 'L', reachKeys: 'O, >, 9' },
  { id: 10, name: 'R. Pinky', hand: 'right', homeKey: ';', reachKeys: 'P, ?, 0, Enter, Shift' },
];

export const FingerGuide: React.FC<FingerGuideProps> = ({ activeFinger }) => {
  return (
    <div
      className="w-full p-5 rounded-lg border border-[var(--border)] bg-[var(--panel)] select-none"
      aria-label="Tactile Hand Placement & Finger Assignment Guide"
    >
      <div className="flex items-center justify-between mb-4 text-xs font-mono text-[var(--text-muted)]">
        <span className="uppercase tracking-wider">Ergonomic Finger Placement Guide</span>
        <span className="text-[var(--accent)]">Tactile Home Row (F & J bumps)</span>
      </div>

      {/* SVG Hands Anatomy Diagram */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
        {/* Left Hand SVG */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-mono text-[var(--text-muted)] mb-2 uppercase tracking-wide">
            Left Hand
          </span>
          <svg width="180" height="130" viewBox="0 0 180 130" className="overflow-visible">
            {/* Palm Base */}
            <path
              d="M 30 110 Q 30 75 45 60 Q 90 55 125 70 Q 140 90 135 110 Z"
              fill="var(--bg)"
              stroke="var(--border)"
              strokeWidth="1.5"
            />
            {/* Pinky (Finger 1) */}
            <rect
              x="20"
              y="32"
              width="16"
              height="45"
              rx="8"
              fill={activeFinger === 1 ? 'var(--accent)' : 'var(--panel)'}
              stroke={activeFinger === 1 ? 'var(--accent)' : 'var(--border)'}
              strokeWidth="1.5"
            />
            <text x="28" y="58" fill={activeFinger === 1 ? 'var(--accent-contrast)' : 'var(--text)'} fontSize="10" fontFamily="monospace" textAnchor="middle">A</text>

            {/* Ring (Finger 2) */}
            <rect
              x="42"
              y="18"
              width="18"
              height="55"
              rx="9"
              fill={activeFinger === 2 ? 'var(--accent)' : 'var(--panel)'}
              stroke={activeFinger === 2 ? 'var(--accent)' : 'var(--border)'}
              strokeWidth="1.5"
            />
            <text x="51" y="48" fill={activeFinger === 2 ? 'var(--accent-contrast)' : 'var(--text)'} fontSize="10" fontFamily="monospace" textAnchor="middle">S</text>

            {/* Middle (Finger 3) */}
            <rect
              x="66"
              y="10"
              width="18"
              height="62"
              rx="9"
              fill={activeFinger === 3 ? 'var(--accent)' : 'var(--panel)'}
              stroke={activeFinger === 3 ? 'var(--accent)' : 'var(--border)'}
              strokeWidth="1.5"
            />
            <text x="75" y="44" fill={activeFinger === 3 ? 'var(--accent-contrast)' : 'var(--text)'} fontSize="10" fontFamily="monospace" textAnchor="middle">D</text>

            {/* Index (Finger 4) */}
            <rect
              x="90"
              y="18"
              width="18"
              height="55"
              rx="9"
              fill={activeFinger === 4 ? 'var(--accent)' : 'var(--panel)'}
              stroke={activeFinger === 4 ? 'var(--accent)' : 'var(--border)'}
              strokeWidth="1.5"
            />
            <text x="99" y="48" fill={activeFinger === 4 ? 'var(--accent-contrast)' : 'var(--text)'} fontSize="10" fontFamily="monospace" textAnchor="middle">F*</text>

            {/* Thumb (Finger 5) */}
            <rect
              x="118"
              y="60"
              width="36"
              height="18"
              rx="9"
              transform="rotate(25 118 60)"
              fill={activeFinger === 5 ? 'var(--accent)' : 'var(--panel)'}
              stroke={activeFinger === 5 ? 'var(--accent)' : 'var(--border)'}
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Right Hand SVG */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-mono text-[var(--text-muted)] mb-2 uppercase tracking-wide">
            Right Hand
          </span>
          <svg width="180" height="130" viewBox="0 0 180 130" className="overflow-visible">
            {/* Palm Base */}
            <path
              d="M 45 110 Q 40 90 55 70 Q 90 55 135 60 Q 150 75 150 110 Z"
              fill="var(--bg)"
              stroke="var(--border)"
              strokeWidth="1.5"
            />
            {/* Thumb (Finger 6/5) */}
            <rect
              x="26"
              y="74"
              width="36"
              height="18"
              rx="9"
              transform="rotate(-25 26 74)"
              fill={activeFinger === 5 || activeFinger === 6 ? 'var(--accent)' : 'var(--panel)'}
              stroke={activeFinger === 5 || activeFinger === 6 ? 'var(--accent)' : 'var(--border)'}
              strokeWidth="1.5"
            />

            {/* Index (Finger 7) */}
            <rect
              x="72"
              y="18"
              width="18"
              height="55"
              rx="9"
              fill={activeFinger === 7 ? 'var(--accent)' : 'var(--panel)'}
              stroke={activeFinger === 7 ? 'var(--accent)' : 'var(--border)'}
              strokeWidth="1.5"
            />
            <text x="81" y="48" fill={activeFinger === 7 ? 'var(--accent-contrast)' : 'var(--text)'} fontSize="10" fontFamily="monospace" textAnchor="middle">J*</text>

            {/* Middle (Finger 8) */}
            <rect
              x="96"
              y="10"
              width="18"
              height="62"
              rx="9"
              fill={activeFinger === 8 ? 'var(--accent)' : 'var(--panel)'}
              stroke={activeFinger === 8 ? 'var(--accent)' : 'var(--border)'}
              strokeWidth="1.5"
            />
            <text x="105" y="44" fill={activeFinger === 8 ? 'var(--accent-contrast)' : 'var(--text)'} fontSize="10" fontFamily="monospace" textAnchor="middle">K</text>

            {/* Ring (Finger 9) */}
            <rect
              x="120"
              y="18"
              width="18"
              height="55"
              rx="9"
              fill={activeFinger === 9 ? 'var(--accent)' : 'var(--panel)'}
              stroke={activeFinger === 9 ? 'var(--accent)' : 'var(--border)'}
              strokeWidth="1.5"
            />
            <text x="129" y="48" fill={activeFinger === 9 ? 'var(--accent-contrast)' : 'var(--text)'} fontSize="10" fontFamily="monospace" textAnchor="middle">L</text>

            {/* Pinky (Finger 10) */}
            <rect
              x="144"
              y="32"
              width="16"
              height="45"
              rx="8"
              fill={activeFinger === 10 ? 'var(--accent)' : 'var(--panel)'}
              stroke={activeFinger === 10 ? 'var(--accent)' : 'var(--border)'}
              strokeWidth="1.5"
            />
            <text x="152" y="58" fill={activeFinger === 10 ? 'var(--accent-contrast)' : 'var(--text)'} fontSize="10" fontFamily="monospace" textAnchor="middle">;</text>
          </svg>
        </div>
      </div>

      {/* Finger Reach Assignments Grid */}
      <div className="mt-4 pt-3 border-t border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        {FINGERS.filter((f) => f.id !== 5).slice(0, 4).map((f) => (
          <div key={f.id} className="p-2 rounded border border-[var(--border)] bg-[var(--bg)]">
            <span className="text-[var(--accent)] font-semibold">{f.name}:</span>
            <span className="text-[var(--text-muted)] ml-1">{f.reachKeys}</span>
          </div>
        ))}
        {FINGERS.filter((f) => f.id !== 5).slice(4, 8).map((f) => (
          <div key={f.id} className="p-2 rounded border border-[var(--border)] bg-[var(--bg)]">
            <span className="text-[var(--accent)] font-semibold">{f.name}:</span>
            <span className="text-[var(--text-muted)] ml-1">{f.reachKeys}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
