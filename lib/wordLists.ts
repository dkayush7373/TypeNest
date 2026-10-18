/**
 * Curated list of common English words for high-velocity typing tests.
 */
export const COMMON_WORDS: string[] = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  'write', 'code', 'keyboard', 'focus', 'switch', 'tactile', 'fluid', 'speed', 'stream',
  'light', 'click', 'rhythm', 'motion', 'studio', 'craft', 'clean', 'simple', 'swift',
  'drift', 'space', 'entry', 'signal', 'sound', 'habit', 'flow', 'build', 'shape', 'logic'
];

export const PUNCTUATION_MARKS = ['.', ',', ';', '!', '?', '-', '"', "'"];

export function generateWords(count: number, options: { punctuation?: boolean; numbers?: boolean } = {}): string[] {
  const words: string[] = [];
  const len = COMMON_WORDS.length;

  for (let i = 0; i < count; i++) {
    // Random word
    const randIndex = Math.floor(Math.random() * len);
    let word = COMMON_WORDS[randIndex];

    // Optional numbers injection (~15% of words if enabled)
    if (options.numbers && Math.random() < 0.15) {
      const num = Math.floor(Math.random() * 900) + 10;
      word = num.toString();
    }

    // Optional punctuation injection (~20% of words if enabled)
    if (options.punctuation && Math.random() < 0.2) {
      const p = PUNCTUATION_MARKS[Math.floor(Math.random() * PUNCTUATION_MARKS.length)];
      if (p === '"' || p === "'") {
        word = `${p}${word}${p}`;
      } else {
        word = `${word}${p}`;
      }
      // Capitalize next or current word sometimes
      if (Math.random() < 0.3) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
    }

    words.push(word);
  }

  return words;
}
