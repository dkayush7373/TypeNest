import test from 'node:test';
import assert from 'node:assert/strict';

// Re-implement pure metric calculations for isolated testing
function calculateNetWpm(correctChars, elapsedSeconds) {
  const elapsedMinutes = Math.max(elapsedSeconds / 60, 0.0166);
  return Math.max(Math.round((correctChars / 5) / elapsedMinutes), 0);
}

function calculateRawWpm(totalKeystrokes, elapsedSeconds) {
  const elapsedMinutes = Math.max(elapsedSeconds / 60, 0.0166);
  return Math.max(Math.round((totalKeystrokes / 5) / elapsedMinutes), 0);
}

function calculateAccuracy(correctKeystrokes, totalKeystrokes) {
  if (totalKeystrokes === 0) return 100;
  return Math.round((correctKeystrokes / totalKeystrokes) * 100);
}

function calculateConsistency(wpms) {
  if (wpms.length <= 1) return 100;
  const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
  if (mean === 0) return 100;
  const variance = wpms.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / wpms.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean;
  return Math.round(Math.min(Math.max(100 - cv * 100, 0), 100));
}

function getVerdict(netWpm, accuracy) {
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

test('Metrics - Net WPM formula calculates correctly', () => {
  // 300 correct characters in 60 seconds = 60 Net WPM
  const wpm = calculateNetWpm(300, 60);
  assert.equal(wpm, 60);

  // 150 correct characters in 30 seconds = 60 Net WPM
  const wpmHalfMin = calculateNetWpm(150, 30);
  assert.equal(wpmHalfMin, 60);
});

test('Metrics - Raw WPM formula includes mistakes', () => {
  // 350 total keystrokes in 60 seconds = 70 Raw WPM
  const raw = calculateRawWpm(350, 60);
  assert.equal(raw, 70);
});

test('Metrics - Accuracy handles zero keystrokes and edge cases', () => {
  assert.equal(calculateAccuracy(0, 0), 100);
  assert.equal(calculateAccuracy(95, 100), 95);
  assert.equal(calculateAccuracy(48, 50), 96);
});

test('Metrics - Consistency computes coefficient of variation clamped 0-100', () => {
  // Perfectly consistent speeds
  assert.equal(calculateConsistency([60, 60, 60, 60]), 100);

  // Variable speeds
  const cons = calculateConsistency([50, 70, 60, 65]);
  assert.ok(cons > 0 && cons <= 100);

  // Empty or single snapshot
  assert.equal(calculateConsistency([]), 100);
  assert.equal(calculateConsistency([75]), 100);
});

test('Metrics - Verdict brackets adhere to requirements', () => {
  assert.equal(getVerdict(15, 95).title, 'Beginner');
  assert.equal(getVerdict(35, 95).title, 'Improving');
  assert.equal(getVerdict(55, 95).title, 'Good');
  assert.equal(getVerdict(85, 95).title, 'Fast');
  assert.equal(getVerdict(120, 95).title, 'Pro');

  const lowAcc = getVerdict(60, 85);
  assert.equal(lowAcc.title, 'Good');
  assert.match(lowAcc.advice, /Slow down and aim for accuracy first/);
});

test('Metrics - Divide by zero protection returns finite numbers', () => {
  const zeroNet = calculateNetWpm(0, 0);
  assert.ok(!Number.isNaN(zeroNet) && Number.isFinite(zeroNet));

  const zeroRaw = calculateRawWpm(0, 0);
  assert.ok(!Number.isNaN(zeroRaw) && Number.isFinite(zeroRaw));
});
