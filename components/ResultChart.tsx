'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  DotProps,
} from 'recharts';

export interface ChartDataPoint {
  second: number;
  wpm: number;
  rawWpm: number;
  errors: number;
}

interface ResultChartProps {
  data: ChartDataPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const wpmVal = payload.find((p) => p.name === 'wpm')?.value ?? 0;
    const rawVal = payload.find((p) => p.name === 'rawWpm')?.value ?? 0;
    return (
      <div className="p-2.5 rounded-md border border-[var(--border)] bg-[var(--panel)] shadow-md font-mono text-xs select-none">
        <p className="text-[var(--text-muted)] mb-1">Time: {label}s</p>
        <p className="text-[var(--accent)] font-semibold">Net WPM: {wpmVal}</p>
        <p className="text-[var(--text)] opacity-80">Raw WPM: {rawVal}</p>
      </div>
    );
  }
  return null;
};

// Custom dot renderer that highlights error seconds with a red dot
const ErrorDot = (props: DotProps & { payload?: ChartDataPoint }) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload) return null;

  if (payload.errors > 0) {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="var(--error)"
        stroke="var(--panel)"
        strokeWidth={1.5}
      />
    );
  }
  return null;
};

export const ResultChart: React.FC<ResultChartProps> = ({ data }) => {
  // If data is minimal or empty (e.g. test was super quick), supply baseline
  const chartData =
    data.length > 0
      ? data
      : [
          { second: 0, wpm: 0, rawWpm: 0, errors: 0 },
          { second: 1, wpm: 0, rawWpm: 0, errors: 0 },
        ];

  return (
    <div
      className="w-full h-64 sm:h-72 p-4 rounded-lg border border-[var(--border)] bg-[var(--panel)] select-none"
      aria-label="WPM Progression Chart"
    >
      <div className="flex items-center justify-between mb-3 text-xs font-mono text-[var(--text-muted)]">
        <span className="uppercase tracking-wider">Velocity & Accuracy Progression</span>
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-0.5 bg-[var(--accent)] inline-block" />
            <span>Net WPM</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-0.5 bg-[var(--text-muted)] inline-block opacity-60" />
            <span>Raw WPM</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--error)] inline-block" />
            <span>Errors</span>
          </span>
        </div>
      </div>

      <div className="w-full h-[calc(100%-2rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              stroke="var(--border)"
              strokeDasharray="3 3"
              opacity={0.3}
              vertical={false}
            />
            <XAxis
              dataKey="second"
              stroke="var(--text-muted)"
              fontSize={11}
              fontFamily="var(--font-mono), monospace"
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
              tickFormatter={(s) => `${s}s`}
            />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={11}
              fontFamily="var(--font-mono), monospace"
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Raw WPM line */}
            <Line
              type="monotone"
              dataKey="rawWpm"
              stroke="var(--text-muted)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              opacity={0.6}
              dot={false}
              isAnimationActive={false}
            />
            {/* Net WPM line with accent color and error dots */}
            <Line
              type="monotone"
              dataKey="wpm"
              stroke="var(--accent)"
              strokeWidth={2.5}
              dot={<ErrorDot />}
              activeDot={{
                r: 5,
                fill: 'var(--accent)',
                stroke: 'var(--panel)',
                strokeWidth: 2,
              }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
