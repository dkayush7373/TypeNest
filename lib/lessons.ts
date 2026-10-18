export interface Lesson {
  id: string;
  title: string;
  description: string;
  keys: string[];
  sampleWords: string[];
  requiredAccuracy: number;
}

export const LESSONS: Lesson[] = [
  {
    id: 'home-row',
    title: '1. Home Row Mastery',
    description:
      'The foundation of touch typing. Rest your left hand on ASDF and your right hand on JKL;. Feel the tactile bumps on F and J. Every drill word here uses ONLY Home Row keys.',
    keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
    sampleWords: [
      'as', 'ask', 'all', 'fall', 'glad', 'half', 'hall', 'flash', 'flask',
      'salad', 'dash', 'slash', 'glass', 'had', 'has', 'lass', 'dad', 'lad',
      'gala', 'saga', 'flag', 'slag', 'gash', 'shah', 'dall', 'fad'
    ],
    requiredAccuracy: 95,
  },
  {
    id: 'top-row',
    title: '2. Top Row Reach',
    description:
      'Reach upward from home row with fluid, minimal finger movement. Return your fingers promptly to home row after each strike. Every word here uses ONLY Top Row keys.',
    keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    sampleWords: [
      'type', 'write', 'power', 'quiet', 'pure', 'pour', 'route', 'tower',
      'tree', 'root', 'rope', 'port', 'wire', 'tire', 'trip', 'quit',
      'quite', 'query', 'retry', 'potter', 'pepper', 'top', 'pot', 'wet', 'pet'
    ],
    requiredAccuracy: 95,
  },
  {
    id: 'bottom-row',
    title: '3. Bottom Row Incline',
    description:
      'Curl your fingers smoothly downward to strike bottom row keys without twisting your wrists. Practice rhythmic bottom row sequences and comma/period strikes.',
    keys: ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
    sampleWords: [
      'zxcv', 'bnm,', 'zxcv.', 'bnm/', 'z,x.', 'c,v.', 'b,n.', 'm,/',
      'cz', 'xb', 'vn', 'zm', 'cx', 'vb', 'nm', 'z.x', 'c.v', 'b.n', 'm./',
      'zz', 'xx', 'cc', 'vv', 'bb', 'nn', 'mm'
    ],
    requiredAccuracy: 95,
  },
  {
    id: 'numbers',
    title: '4. Number Row Extension',
    description:
      'Extend upward with precision to strike digits 0 through 9 without looking down at your hands.',
    keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    sampleWords: [
      '10', '25', '50', '100', '2024', '1984', '360', '720', '1080',
      '404', '500', '12', '34', '56', '78', '90', '42', '99', '1000'
    ],
    requiredAccuracy: 95,
  },
  {
    id: 'punctuation',
    title: '5. Symbols & Punctuation',
    description:
      'Combine Shift key chords and symbol reaches. Crucial for coding syntax and professional prose.',
    keys: ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '{', '}', ':', '"', '<', '>', '?'],
    sampleWords: [
      '(!)', '{#}', '[$]', '(&)', '(*)', '(?!)', '(+)', '(_)',
      '{"key"}', '<data>', '100%', 'sum+1', '#tag', 'a>b', 'flag?', 'done!'
    ],
    requiredAccuracy: 95,
  },
];

/**
 * Generates drill words composed strictly from the lesson's keys.
 */
export function generateLessonDrillWords(lesson: Lesson, count: number = 25): string[] {
  const allowed = new Set(lesson.keys.map((k) => k.toLowerCase()));
  // Filter sample words that strictly contain only allowed keys
  const validWords = lesson.sampleWords.filter((word) =>
    word.split('').every((ch) => allowed.has(ch.toLowerCase()))
  );

  const pool = validWords.length > 0 ? validWords : lesson.sampleWords;
  const result: string[] = [];

  for (let i = 0; i < count; i++) {
    result.push(pool[Math.floor(Math.random() * pool.length)]);
  }

  return result;
}
