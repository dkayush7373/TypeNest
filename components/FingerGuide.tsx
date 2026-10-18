'use client';

import React from 'react';

interface FingerGuideProps {
  activeFinger?: number | null; // 1-10
  highlightedKeys?: string[];
}

interface FingerDetail {
  id: number;
  name: string;
  hand: 'left' | 'right';
  homeKey: string;
  reachKeys: string[];
  color: string;
}

const FINGERS_DATA: FingerDetail[] = [
  { id: 1, name: 'L. Pinky', hand: 'left', homeKey: 'A', reachKeys: ['Q', 'A', 'Z', '1', 'Tab', 'Shift'], color: '#0d9488' },
  { id: 2, name: 'L. Ring', hand: 'left', homeKey: 'S', reachKeys: ['W', 'S', 'X', '2'], color: '#059669' },
  { id: 3, name: 'L. Middle', hand: 'left', homeKey: 'D', reachKeys: ['E', 'D', 'C', '3'], color: '#0891b2' },
  { id: 4, name: 'L. Index', hand: 'left', homeKey: 'F', reachKeys: ['R', 'T', 'F', 'G', 'V', 'B', '4', '5'], color: '#0284c7' },
  { id: 5, name: 'Thumbs', hand: 'left', homeKey: 'Space', reachKeys: ['Spacebar'], color: '#64748b' },
  { id: 7, name: 'R. Index', hand: 'right', homeKey: 'J', reachKeys: ['Y', 'U', 'H', 'J', 'N', 'M', '6', '7'], color: '#0284c7' },
  { id: 8, name: 'R. Middle', hand: 'right', homeKey: 'K', reachKeys: ['I', 'K', ',', '<', '8'], color: '#0891b2' },
  { id: 9, name: 'R. Ring', hand: 'right', homeKey: 'L', reachKeys: ['O', 'L', '.', '>', '9'], color: '#059669' },
  { id: 10, name: 'R. Pinky', hand: 'right', homeKey: ';', reachKeys: ['P', ';', '/', '?', '0', 'Enter', 'Shift'], color: '#0d9488' },
];

export const FingerGuide: React.FC<FingerGuideProps> = ({
  activeFinger,
  highlightedKeys = [],
}) => {
  const normHighlighted = highlightedKeys.map((k) => k.toUpperCase());

  const isFingerHighlighted = (finger: FingerDetail): boolean => {
    if (activeFinger === finger.id) return true;
    if (normHighlighted.length === 0) return false;
    return finger.reachKeys.some((k) => normHighlighted.includes(k));
  };

  return (
    <div
      className="w-full p-6 rounded-lg border border-[var(--border)] bg-[var(--panel)] select-none"
      aria-label="Tactile Hand Placement & Finger Assignment Guide"
    >
      <div className="flex items-center justify-between mb-4 text-xs font-mono text-[var(--text-muted)]">
        <span className="uppercase tracking-wider">Ergonomic Finger Placement Guide</span>
        <span className="text-[var(--accent)] flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
          <span>Tactile Home Row (F & J bumps)</span>
        </span>
      </div>

      {/* Redesigned Large SVG Hands Anatomy Diagram */}
      <div className="w-full flex justify-center py-2">
        <svg
          viewBox="0 0 540 220"
          className="w-full max-w-2xl h-auto overflow-visible"
          aria-hidden="true"
        >
          {/* ================= LEFT HAND ================= */}
          <g transform="translate(15, 10)">
            {/* Palm */}
            <path
              d="M 40 180 Q 30 110 60 85 Q 120 75 160 100 Q 185 130 175 180 Z"
              fill="var(--bg)"
              stroke="var(--border)"
              strokeWidth="1.5"
            />
            <text
              x="105"
              y="155"
              fill="var(--text-muted)"
              fontSize="11"
              fontFamily="var(--font-mono), monospace"
              textAnchor="middle"
              className="opacity-70"
            >
              LEFT HAND
            </text>

            {/* Pinky (Finger 1) */}
            {(() => {
              const f = FINGERS_DATA[0];
              const hl = isFingerHighlighted(f);
              return (
                <g>
                  <rect
                    x="25"
                    y="45"
                    width="26"
                    height="68"
                    rx="13"
                    fill={hl ? 'var(--accent)' : f.color}
                    fillOpacity={hl ? 1 : 0.25}
                    stroke={hl ? 'var(--accent)' : f.color}
                    strokeWidth="1.5"
                  />
                  <text
                    x="38"
                    y="72"
                    fill={hl ? 'var(--accent-contrast)' : 'var(--text)'}
                    fontSize="13"
                    fontWeight="600"
                    fontFamily="var(--font-mono), monospace"
                    textAnchor="middle"
                  >
                    A
                  </text>
                  <text
                    x="38"
                    y="92"
                    fill={hl ? 'var(--accent-contrast)' : 'var(--text-muted)'}
                    fontSize="9"
                    fontFamily="var(--font-mono), monospace"
                    textAnchor="middle"
                  >
                    pinky
                  </text>
                </g>
              );
            })()}

            {/* Ring (Finger 2) */}
            {(() => {
              const f = FINGERS_DATA[1];
              const hl = isFingerHighlighted(f);
              return (
                <g>
                  <rect
                    x="57"
                    y="22"
                    width="28"
                    height="85"
                    rx="14"
                    fill={hl ? 'var(--accent)' : f.color}
                    fillOpacity={hl ? 1 : 0.25}
                    stroke={hl ? 'var(--accent)' : f.color}
                    strokeWidth="1.5"
                  />
                  <text
                    x="71"
                    y="55"
                    fill={hl ? 'var(--accent-contrast)' : 'var(--text)'}
                    fontSize="13"
                    fontWeight="600"
                    fontFamily="var(--font-mono), monospace"
                    textAnchor="middle"
                  >
                    S
                  </text>
                  <text
                    x="71"
                    y="75"
                    fill={hl ? 'var(--accent-contrast)' : 'var(--text-muted)'}
                    fontSize="9"
                    fontFamily="var(--font-mono), monospace"
                    textAnchor="middle"
                  >
                    ring
                  </text>
                </g>
              );
            })()}

            {/* Middle (Finger 3) */}
            {(() => {
              const f = FINGERS_DATA[2];
              const hl = isFingerHighlighted(f);
              return (
                <g>
                  <rect
                    x="91"
                    y="10"
                    width="28"
                    height="95"
                    rx="14"
                    fill={hl ? 'var(--accent)' : f.color}
                    fillOpacity={hl ? 1 : 0.25}
                    stroke={hl ? 'var(--accent)' : f.color}
                    strokeWidth="1.5"
                  />
                  <text
                    x="105"
                    y="50"
                    fill={hl ? 'var(--accent-contrast)' : 'var(--text)'}
                    fontSize="13"
                    fontWeight="600"
                    fontFamily="var(--font-mono), monospace"
                    textAnchor="middle"
                  >
                    D
                  </text>
                  <text
                    x="105"
                    y="70"
                    fill={hl ? 'var(--accent-contrast)' : 'var(--text-muted)'}
                    fontSize="9"
                    fontFamily="var(--font-mono), monospace"
                    textAnchor="middle"
                  >
                    mid
                  </text>
                </g>
              );
            })()}

            {/* Index (Finger 4) */}
            {(() => {
              const f = FINGERS_DATA[3];
              const hl = isFingerHighlighted(f);
              return (
                <g>
                  <rect
                    x="125"
                    y="22"
                    width="28"
                    height="85"
                    rx="14"
                    fill={hl ? 'var(--accent)' : f.color}
                    fillOpacity={hl ? 1 : 0.25}
                    stroke={hl ? 'var(--accent)' : f.color}
                    strokeWidth="1.5"
                  />
                  <text
                    x="139"
                    y="55"
                    fill={hl ? 'var(--accent-contrast)' : 'var(--text)'}
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="var(--font-mono), monospace"
                    textAnchor="middle"
                  >
                    F*
                  </text>
                  <text
                    x="139"
                    y="75"
                    fill={hl ? 'var(--accent-contrast)' : 'var(--text-muted)'}
                    fontSize="9"
                    fontFamily="var(--font-mono), monospace"
                    textAnchor="middle"
                  >
                    idx
                  </text>
                </g>
              );
            })()}

            {/* Thumb (Finger 5) */}
            {(() => {
              const f = FINGERS_DATA[4];
              const hl = isFingerHighlighted(f);
              return (
                <g transform="rotate(32 155 105)">
                  <rect
                    x="155"
                    y="88"
                    width="50"
                    height="26"
                    rx="13"
                    fill={hl ? 'var(--accent)' : f.color}
                    fillOpacity={hl ? 1 : 0.25}
                    stroke={hl ? 'var(--accent)' : f.color}
                    strokeWidth="1.5"
                  />
                  <text
                    x="180"
                    y="105"
                    fill={hl ? 'var(--accent-contrast)' : 'var(--text)'}
                    fontSize="10"
                    fontFamily="var(--font-mono), monospace"
                    textAnchor="middle"
                  >
                    Space
                  </text>
                </g>
              );
            })()}
          </g>

          {/* ================= RIGHT HAND ================= */}
          <g transform="translate(290, 10)">
            {/* Palm */}
            <path
              d="M 60 180 Q 50 130 75 100 Q 115 75 175 85 Q 205 110 195 180 Z"
              fill="var(--bg)"
              stroke="var(--border)"
              strokeWidth="1.5"
            />
            <text
              x="130"
              y="155"
              fill="var(--text-muted)"
              fontSize="11"
              fontFamily="var(--font-mono), monospace"
              textAnchor="middle"
              className="opacity-70"
            >
              RIGHT HAND
            </text>

            {/* Thumb (Finger 6) */}
            {(() => {
              const f = FINGERS_DATA[4];
              const hl = isFingerHighlighted(f);
              return (
                <g transform="rotate(-32 80 105)">
                  <rect
                    x="30"
                    y="88"
                    width="50"
                    height="26"
                    rx="13"
                    fill={hl ? 'var(--accent)' : f.color}
                    fillOpacity={hl ? 1 : 0.25}
                    stroke={hl ? 'var(--accent)' : f.color}
                    strokeWidth="1.5"
                  />
                  <text
                    x="55"
                    y="105"
                    fill={hl ? 'var(--accent-contrast)' : 'var(--text)'}
                    fontSize="10"
                    fontFamily="var(--font-mono), monospace"
                    textAnchor="middle"
                  >
                    Space
                  </text>
                </g>
              );
            })()}

            {/* Index (Finger 7) */}
            {(() => {
              const f = FINGERS_DATA[5];
              const hl = isFingerHighlighted(f);
              return (
                <g>
                  <rect
                    x="82"
                    y="22"
                    width="28"
                    height="85"
                    rx="14"
                    fill={hl ? 'var(--accent)' : f.color}
                    fillOpacity={hl ? 1 : 0.25}
                    stroke={hl ? 'var(--accent)' : f.color}
                    strokeWidth="1.5"
                  />
                  <text
                    x="96"
                    y="55"
                    fill={hl ? 'var(--accent-contrast)' : 'var(--text)'}
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="var(--font-mono), monospace"
                    textAnchor="middle"
                  >
                    J*
                  </text>
                  <text
                    x="96"
                    y="75"
                    fill={hl ? 'var(--accent-contrast)' : 'var(--text-muted)'}
                    fontSize="9"
                    fontFamily="var(--font-mono), monospace"
                    textAnchor="middle"
                  >
                    idx
                  </text>
                </g>
              );
            })()}

            {/* Middle (Finger 8) */}
            {(() => {
              const f = FINGERS_DATA[6];
              const hl = isFingerHighlighted(f);
              return (
                <g>
                  <rect
                    x="116"
                    y="10"
                    width="28"
                    height="95"
                    rx="14"
                    fill={hl ? 'var(--accent)' : f.color}
                    fillOpacity={hl ? 1 : 0.25}
                    stroke={hl ? 'var(--accent)' : f.color}
                    strokeWidth="1.5"
                  />
                  <text
                    x="130"
                    y="50"
                    fill={hl ? 'var(--accent-contrast)' : 'var(--text)'}
                    fontSize="13"
                    fontWeight="600"
                    fontFamily="var(--font-mono), monospace"
                    textAnchor="middle"
                  >
                    K
                  </text>
                  <text
                    x="130"
                    y="70"
                    fill={hl ? 'var(--accent-contrast)' : 'var(--text-muted)'}
                    fontSize="9"
                    fontFamily="var(--font-mono), monospace"
                    textAnchor="middle"
                  >
                    mid
                  </text>
                </g>
              );
            })()}

            {/* Ring (Finger 9) */}
            {(() => {
              const f = FINGERS_DATA[7];
              const hl = isFingerHighlighted(f);
              return (
                <g>
                  <rect
                    x="150"
                    y="22"
                    width="28"
                    height="85"
                    rx="14"
                    fill={hl ? 'var(--accent)' : f.color}
                    fillOpacity={hl ? 1 : 0.25}
                    stroke={hl ? 'var(--accent)' : f.color}
                    strokeWidth="1.5"
                  />
                  <text
                    x="164"
                    y="55"
                    fill={hl ? 'var(--accent-contrast)' : 'var(--text)'}
                    fontSize="13"
                    fontWeight="600"
                    fontFamily="var(--font-mono), monospace"
                    textAnchor="middle"
                  >
                    L
                  </text>
                  <text
                    x="164"
                    y="75"
                    fill={hl ? 'var(--accent-contrast)' : 'var(--text-muted)'}
                    fontSize="9"
                    fontFamily="var(--font-mono), monospace"
                    textAnchor="middle"
                  >
                    ring
                  </text>
                </g>
              );
            })()}

            {/* Pinky (Finger 10) */}
            {(() => {
              const f = FINGERS_DATA[8];
              const hl = isFingerHighlighted(f);
              return (
                <g>
                  <rect
                    x="184"
                    y="45"
                    width="26"
                    height="68"
                    rx="13"
                    fill={hl ? 'var(--accent)' : f.color}
                    fillOpacity={hl ? 1 : 0.25}
                    stroke={hl ? 'var(--accent)' : f.color}
                    strokeWidth="1.5"
                  />
                  <text
                    x="197"
                    y="72"
                    fill={hl ? 'var(--accent-contrast)' : 'var(--text)'}
                    fontSize="13"
                    fontWeight="600"
                    fontFamily="var(--font-mono), monospace"
                    textAnchor="middle"
                  >
                    ;
                  </text>
                  <text
                    x="197"
                    y="92"
                    fill={hl ? 'var(--accent-contrast)' : 'var(--text-muted)'}
                    fontSize="9"
                    fontFamily="var(--font-mono), monospace"
                    textAnchor="middle"
                  >
                    pinky
                  </text>
                </g>
              );
            })()}
          </g>
        </svg>
      </div>

      {/* Finger Reach Assignments Grid */}
      <div className="mt-4 pt-3 border-t border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        {FINGERS_DATA.filter((f) => f.id !== 5).map((f) => {
          const hl = isFingerHighlighted(f);
          return (
            <div
              key={f.id}
              className={`p-2.5 rounded border transition-colors ${
                hl
                  ? 'border-[var(--accent)] bg-[var(--bg)] shadow-xs'
                  : 'border-[var(--border)] bg-[var(--bg)]'
              }`}
            >
              <div className="flex items-center space-x-1.5 mb-1">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: f.color }}
                />
                <span className={hl ? 'text-[var(--accent)] font-semibold' : 'text-[var(--text)]'}>
                  {f.name}
                </span>
              </div>
              <span className="text-[11px] text-[var(--text-muted)] line-clamp-1">
                {f.reachKeys.join(' ')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
