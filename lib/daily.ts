import { formatLocalDate } from '@/lib/storage';
import { STANDARD_WORDS } from '@/lib/wordLists';

/**
 * Simple 32-bit integer hash from string.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
  }
  return hash;
}

/**
 * Deterministic pseudo-random number generator (Mulberry32).
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates identical daily challenge words for all users on a given calendar day.
 */
export function getDailyChallengeWords(
  dateOrDateString?: Date | string,
  count: number = 30
): { words: string[]; seed: string; dateString: string } {
  const dateString =
    typeof dateOrDateString === 'string'
      ? dateOrDateString
      : formatLocalDate(dateOrDateString);

  const seedNum = Math.abs(hashString(`keyflow-daily-${dateString}`));
  const rng = mulberry32(seedNum);

  const words: string[] = [];
  let lastWord = '';

  for (let i = 0; i < count; i++) {
    let word = '';
    let attempts = 0;
    do {
      const idx = Math.floor(rng() * STANDARD_WORDS.length);
      word = STANDARD_WORDS[idx];
      attempts++;
    } while (word === lastWord && attempts < 10);
    lastWord = word;
    words.push(word);
  }

  return {
    words,
    seed: `seed-${dateString}`,
    dateString,
  };
}
