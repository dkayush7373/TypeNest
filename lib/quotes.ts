/**
 * Public domain and classical quotes for Quote typing mode.
 * Contains 65 curated quotes.
 */

export interface QuoteItem {
  id: string;
  text: string;
  author: string;
  length: 'short' | 'medium' | 'long';
}

export const QUOTES: readonly QuoteItem[] = [
  {
    "id": "quote-1",
    "text": "We suffer more often in imagination than in reality.",
    "author": "Seneca",
    "length": "short"
  },
  {
    "id": "quote-2",
    "text": "The happiness of your life depends upon the quality of your thoughts.",
    "author": "Marcus Aurelius",
    "length": "short"
  },
  {
    "id": "quote-3",
    "text": "Waste no more time arguing what a good man should be. Be one.",
    "author": "Marcus Aurelius",
    "length": "short"
  },
  {
    "id": "quote-4",
    "text": "He who has a why to live can bear almost any how.",
    "author": "Friedrich Nietzsche",
    "length": "short"
  },
  {
    "id": "quote-5",
    "text": "It is not that we have a short time to live, but that we waste a lot of it.",
    "author": "Seneca",
    "length": "medium"
  },
  {
    "id": "quote-6",
    "text": "Life is very short and anxious for those who forget the past, neglect the present, and fear the future.",
    "author": "Seneca",
    "length": "medium"
  },
  {
    "id": "quote-7",
    "text": "The soul becomes dyed with the color of its thoughts.",
    "author": "Marcus Aurelius",
    "length": "short"
  },
  {
    "id": "quote-8",
    "text": "You have power over your mind - not outside events. Realize this, and you will find strength.",
    "author": "Marcus Aurelius",
    "length": "medium"
  },
  {
    "id": "quote-9",
    "text": "Difficulties strengthen the mind, as labor does the body.",
    "author": "Seneca",
    "length": "short"
  },
  {
    "id": "quote-10",
    "text": "Knowing yourself is the beginning of all wisdom.",
    "author": "Aristotle",
    "length": "short"
  },
  {
    "id": "quote-11",
    "text": "Quality is not an act, it is a habit.",
    "author": "Aristotle",
    "length": "short"
  },
  {
    "id": "quote-12",
    "text": "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    "author": "Will Durant",
    "length": "medium"
  },
  {
    "id": "quote-13",
    "text": "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
    "author": "Ralph Waldo Emerson",
    "length": "medium"
  },
  {
    "id": "quote-14",
    "text": "Do not go where the path may lead, go instead where there is no path and leave a trail.",
    "author": "Ralph Waldo Emerson",
    "length": "medium"
  },
  {
    "id": "quote-15",
    "text": "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    "author": "Ralph Waldo Emerson",
    "length": "medium"
  },
  {
    "id": "quote-16",
    "text": "Go confidently in the direction of your dreams. Live the life you have imagined.",
    "author": "Henry David Thoreau",
    "length": "medium"
  },
  {
    "id": "quote-17",
    "text": "Our life is frittered away by detail. Simplify, simplify.",
    "author": "Henry David Thoreau",
    "length": "short"
  },
  {
    "id": "quote-18",
    "text": "It is never too late to be what you might have been.",
    "author": "George Eliot",
    "length": "short"
  },
  {
    "id": "quote-19",
    "text": "There is no charm equal to tenderness of heart.",
    "author": "Jane Austen",
    "length": "short"
  },
  {
    "id": "quote-20",
    "text": "The person, be it gentleman or lady, who has not pleasure in a good novel, must be intolerably stupid.",
    "author": "Jane Austen",
    "length": "medium"
  },
  {
    "id": "quote-21",
    "text": "Beware; for I am fearless, and therefore powerful.",
    "author": "Mary Shelley",
    "length": "short"
  },
  {
    "id": "quote-22",
    "text": "Life, although it may only be an accumulation of anguish, is dear to me, and I will defend it.",
    "author": "Mary Shelley",
    "length": "medium"
  },
  {
    "id": "quote-23",
    "text": "The Analytical Engine weaves algebraic patterns just as the Jacquard loom weaves flowers and leaves.",
    "author": "Ada Lovelace",
    "length": "medium"
  },
  {
    "id": "quote-24",
    "text": "Those who can imagine anything, can create the impossible.",
    "author": "Alan Turing",
    "length": "short"
  },
  {
    "id": "quote-25",
    "text": "We can only see a short distance ahead, but we can see plenty there that needs to be done.",
    "author": "Alan Turing",
    "length": "medium"
  },
  {
    "id": "quote-26",
    "text": "Sometimes it is the people no one imagines anything of who do the things that no one can imagine.",
    "author": "Alan Turing",
    "length": "medium"
  },
  {
    "id": "quote-27",
    "text": "Simplicity is prerequisite for reliability.",
    "author": "Edsger W. Dijkstra",
    "length": "short"
  },
  {
    "id": "quote-28",
    "text": "If debugging is the process of removing bugs, then programming must be the process of putting them in.",
    "author": "Edsger W. Dijkstra",
    "length": "medium"
  },
  {
    "id": "quote-29",
    "text": "Computer science is no more about computers than astronomy is about telescopes.",
    "author": "Hal Abelson",
    "length": "medium"
  },
  {
    "id": "quote-30",
    "text": "Talk is cheap. Show me the code.",
    "author": "Linus Torvalds",
    "length": "short"
  },
  {
    "id": "quote-31",
    "text": "Premature optimization is the root of all evil in programming.",
    "author": "Donald Knuth",
    "length": "short"
  },
  {
    "id": "quote-32",
    "text": "An unexamined life is not worth living.",
    "author": "Socrates",
    "length": "short"
  },
  {
    "id": "quote-33",
    "text": "I cannot teach anybody anything. I can only make them think.",
    "author": "Socrates",
    "length": "short"
  },
  {
    "id": "quote-34",
    "text": "There is only one good, knowledge, and one evil, ignorance.",
    "author": "Socrates",
    "length": "short"
  },
  {
    "id": "quote-35",
    "text": "The only true wisdom is in knowing you know nothing.",
    "author": "Socrates",
    "length": "short"
  },
  {
    "id": "quote-36",
    "text": "In the middle of difficulty lies opportunity.",
    "author": "Albert Einstein",
    "length": "short"
  },
  {
    "id": "quote-37",
    "text": "A person who never made a mistake never tried anything new.",
    "author": "Albert Einstein",
    "length": "short"
  },
  {
    "id": "quote-38",
    "text": "Creativity is intelligence having fun.",
    "author": "Albert Einstein",
    "length": "short"
  },
  {
    "id": "quote-39",
    "text": "Everything should be made as simple as possible, but not simpler.",
    "author": "Albert Einstein",
    "length": "short"
  },
  {
    "id": "quote-40",
    "text": "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    "author": "Nelson Mandela",
    "length": "medium"
  },
  {
    "id": "quote-41",
    "text": "It always seems impossible until it is done.",
    "author": "Nelson Mandela",
    "length": "short"
  },
  {
    "id": "quote-42",
    "text": "The journey of a thousand miles begins with one step.",
    "author": "Lao Tzu",
    "length": "short"
  },
  {
    "id": "quote-43",
    "text": "Silence is a source of great strength.",
    "author": "Lao Tzu",
    "length": "short"
  },
  {
    "id": "quote-44",
    "text": "Care about what other people think and you will always be their prisoner.",
    "author": "Lao Tzu",
    "length": "medium"
  },
  {
    "id": "quote-45",
    "text": "Mastering others is strength. Mastering yourself is true power.",
    "author": "Lao Tzu",
    "length": "short"
  },
  {
    "id": "quote-46",
    "text": "When you are content to be simply yourself and do not compare or compete, everyone will respect you.",
    "author": "Lao Tzu",
    "length": "medium"
  },
  {
    "id": "quote-47",
    "text": "Nature does not hurry, yet everything is accomplished.",
    "author": "Lao Tzu",
    "length": "short"
  },
  {
    "id": "quote-48",
    "text": "Act without expectation.",
    "author": "Lao Tzu",
    "length": "short"
  },
  {
    "id": "quote-49",
    "text": "The mind is everything. What you think you become.",
    "author": "Buddha",
    "length": "short"
  },
  {
    "id": "quote-50",
    "text": "Drop by drop is the water pot filled. Likewise, the wise man, gathering it little by little, fills himself with good.",
    "author": "Buddha",
    "length": "medium"
  },
  {
    "id": "quote-51",
    "text": "Better than a thousand hollow words, is one word that brings peace.",
    "author": "Buddha",
    "length": "short"
  },
  {
    "id": "quote-52",
    "text": "No one saves us but ourselves. No one can and no one may. We ourselves must walk the path.",
    "author": "Buddha",
    "length": "medium"
  },
  {
    "id": "quote-53",
    "text": "Peace comes from within. Do not seek it without.",
    "author": "Buddha",
    "length": "short"
  },
  {
    "id": "quote-54",
    "text": "Dwell on the beauty of life. Watch the stars, and see yourself running with them.",
    "author": "Marcus Aurelius",
    "length": "medium"
  },
  {
    "id": "quote-55",
    "text": "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.",
    "author": "Marcus Aurelius",
    "length": "medium"
  },
  {
    "id": "quote-56",
    "text": "When you arise in the morning think of what a privilege it is to be alive, to think, to enjoy, to love.",
    "author": "Marcus Aurelius",
    "length": "medium"
  },
  {
    "id": "quote-57",
    "text": "Accept the things to which fate binds you, and love the people with whom fate brings you together.",
    "author": "Marcus Aurelius",
    "length": "medium"
  },
  {
    "id": "quote-58",
    "text": "Begin at once to live, and count each separate day as a separate life.",
    "author": "Seneca",
    "length": "short"
  },
  {
    "id": "quote-59",
    "text": "As is a tale, so is life: not how long it is, but how good it is, is what matters.",
    "author": "Seneca",
    "length": "medium"
  },
  {
    "id": "quote-60",
    "text": "Luck is what happens when preparation meets opportunity.",
    "author": "Seneca",
    "length": "short"
  },
  {
    "id": "quote-61",
    "text": "All cruelty springs from weakness.",
    "author": "Seneca",
    "length": "short"
  },
  {
    "id": "quote-62",
    "text": "If one does not know to which port one is sailing, no wind is favorable.",
    "author": "Seneca",
    "length": "medium"
  },
  {
    "id": "quote-63",
    "text": "He who fears death will never do anything worthy of a man who is alive.",
    "author": "Seneca",
    "length": "medium"
  },
  {
    "id": "quote-64",
    "text": "True happiness is to enjoy the present, without anxious dependence upon the future.",
    "author": "Seneca",
    "length": "medium"
  },
  {
    "id": "quote-65",
    "text": "To love and be loved is to feel the sun from both sides.",
    "author": "David Viscott",
    "length": "short"
  }
] as const;

export function getRandomQuote(lengthFilter?: 'short' | 'medium' | 'long'): QuoteItem {
  const pool = lengthFilter ? QUOTES.filter((q) => q.length === lengthFilter) : QUOTES;
  const quotesList = pool.length > 0 ? pool : QUOTES;
  return quotesList[Math.floor(Math.random() * quotesList.length)];
}
