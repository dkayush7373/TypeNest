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
      'The foundation of touch typing. Rest your left hand on ASDF and your right hand on JKL;. Feel the tactile bumps on F and J.',
    keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
    sampleWords: [
      'as', 'ask', 'all', 'fall', 'glad', 'half', 'hall', 'flash', 'flask',
      'salad', 'dash', 'slash', 'glass', 'had', 'has', 'lass', 'dad', 'lad'
    ],
    requiredAccuracy: 95,
  },
  {
    id: 'top-row',
    title: '2. Top Row Reach',
    description:
      'Reach upward from home row with fluid, minimal finger movement. Return your fingers promptly to home row after each strike.',
    keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    sampleWords: [
      'the', 'were', 'write', 'power', 'quiet', 'tree', 'pour', 'route',
      'wire', 'tire', 'tower', 'quit', 'port', 'pure', 'rope', 'trip', 'ripe'
    ],
    requiredAccuracy: 95,
  },
  {
    id: 'bottom-row',
    title: '3. Bottom Row Incline',
    description:
      'Curl your fingers smoothly downward to strike bottom row keys without twisting your wrists. Keep wrists elevated and relaxed.',
    keys: ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
    sampleWords: [
      'van', 'cab', 'man', 'can', 'ban', 'box', 'mix', 'zinc', 'calm',
      'back', 'next', 'vocal', 'zone', 'bomb', 'comb', 'bank', 'blank', 'clan'
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
      'key:val;', '{code}', '(call)', 'id#1', '100%', 'sum+1', 'done!',
      'true;', 'array[0]', 'func()', 'str="val"', 'a>b', 'flag?', 'item&next'
    ],
    requiredAccuracy: 95,
  },
];
