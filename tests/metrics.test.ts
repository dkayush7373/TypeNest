import { describe, it, expect } from 'vitest';

// Re-implement pure metric calculations for isolated testing
function calculateNetWpm(correctChars: number, elapsedSeconds: number): number {
  const elapsedMinutes = Math.max(elapsedSeconds / 60, 0.0166);
  return Math.max(Math.round((correctChars / 5) / elapsedMinutes), 0);
}

function calculateRawWpm(totalKeystrokes: number, elapsedSeconds: number): number {
  const elapsedMinutes = Math.max(elapsedSeconds / 60, 0.0166);
  return Math.max(Math.round((totalKeystrokes / 5) / elapsedMinutes), 0);
}

function calculateAccuracy(correctKeystrokes: number, totalKeystrokes: number): number {
  if (totalKeystrokes === 0) return 100;
  return Math.round((correctKeystrokes / totalKeystrokes) * 100);
}

function calculateConsistency(wpms: number[]): number {
  if (wpms.length <= 1) return 100;
  const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
  if (mean === 0) return 100;
  const variance = wpms.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / wpms.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean;
  return Math.round(Math.min(Math.max(100 - cv * 100, 0), 100));
}

function getVerdict(netWpm: number, accuracy: number) {
  let title = 'Beginner';
  if (netWpm >= 100) title = 'Pro';
  else if (netWpm >= 70) title = 'Fast';
  else if (netWpm >= 45) title = 'Good';
  else if (netWpm >= 25) title = 'Improving';

  let advice = '';
  if (accuracy < 90) {
    advice = 'Slow down and aim for accuracy first.';
  }
  return { title, advice };
}

describe('Typing Metrics Engine', () => {
  it('calculates Net WPM correctly', () => {
    // 300 correct characters in 60 seconds = 60 Net WPM
    expect(calculateNetWpm(300, 60)).toBe(60);
    // 150 correct characters in 30 seconds = 60 Net WPM
    expect(calculateNetWpm(150, 30)).toBe(60);
  });

  it('calculates Raw WPM including mistakes', () => {
    // 350 total keystrokes in 60 seconds = 70 Raw WPM
    expect(calculateRawWpm(350, 60)).toBe(70);
  });

  it('handles zero keystrokes and accuracy edge cases', () => {
    expect(calculateAccuracy(0, 0)).toBe(100);
    expect(calculateAccuracy(95, 100)).toBe(95);
    expect(calculateAccuracy(48, 50)).toBe(96);
  });

  it('computes consistency clamped between 0 and 100', () => {
    expect(calculateConsistency([60, 60, 60, 60])).toBe(100);
    const cons = calculateConsistency([50, 70, 60, 65]);
    expect(cons).toBeGreaterThan(0);
    expect(cons).toBeLessThanOrEqual(100);
    expect(calculateConsistency([])).toBe(100);
    expect(calculateConsistency([75])).toBe(100);
  });

  it('verifies verdict rating brackets and advice', () => {
    expect(getVerdict(15, 95).title).toBe('Beginner');
    expect(getVerdict(35, 95).title).toBe('Improving');
    expect(getVerdict(55, 95).title).toBe('Good');
    expect(getVerdict(85, 95).title).toBe('Fast');
    expect(getVerdict(120, 95).title).toBe('Pro');

    const lowAcc = getVerdict(60, 85);
    expect(lowAcc.title).toBe('Good');
    expect(lowAcc.advice).toContain('Slow down and aim for accuracy first');
  });

  it('protects against divide by zero returning finite numbers', () => {
    const zeroNet = calculateNetWpm(0, 0);
    expect(Number.isFinite(zeroNet)).toBe(true);
    expect(Number.isNaN(zeroNet)).toBe(false);

    const zeroRaw = calculateRawWpm(0, 0);
    expect(Number.isFinite(zeroRaw)).toBe(true);
    expect(Number.isNaN(zeroRaw)).toBe(false);
  });
});
