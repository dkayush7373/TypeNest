# KeyFlow (TypeNest)

> **Midnight Studio** — A calm, premium, focused typing speed and learning environment inspired by high-end mechanical keyboard design and Monkeytype.

---

## Tech Stack (Zero Bloat, Strictly Typed)

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 & CSS Custom Properties
- **Visuals & Charts**: Recharts & Lucide React
- **Audio**: Web Audio API (tactile mechanical switch clicks)
- **State & Persistence**: React Hooks, `useReducer`, Safe `localStorage`

---

## Design System: "Midnight Studio"

KeyFlow adopts a calm, tactile aesthetic without noisy gradients, purple schemes, glassmorphism, or generic template elements:

1. **Background Architecture**:
   - **Base**: Deep ink-teal/midnight blue (`#0b1118`).
   - **Depth**: Large, soft radial teal-blue light (`#12303a` at ~35% opacity) focused behind the typing canvas.
   - **Texture**: 1px grid pattern at 4% opacity with radial boundary fade.
   - **Grain**: SVG `feTurbulence` noise at ~3% opacity.
   - **Vignette**: Corner falloff focusing typist vision to the centre.
   - **Focus Calming**: Grid opacity dynamically dampens when active typing begins.
2. **Themes**:
   - **Midnight** (Default): Teal/Aqua accent (`#3dd6c6`), dark ink base (`#0b1118`).
   - **Ember**: Warm mechanical amber (`#ffb454`), espresso base (`#120f0d`).
   - **Paper**: High-contrast minimal desk light theme (`#0e8f86` on `#eef1f3`).
   - **Forest**: Deep moss green base (`#0c1410`), emerald accent (`#4ade80`), natural organic warmth.
3. **Typography**:
   - **Typing Canvas**: `JetBrains Mono` (28–32px, 1.8 line height, open tracking).
   - **Interface & Metrics**: `Inter` with tabular numerals (`tabular-nums`) for jitter-free WPM counts.
4. **Keycaps**:
   - 1px crisp borders, subtle inner top edge highlight (`inset 0 1px 0`), 6px border-radius, and 1px mechanical press depression.

---

## Modes & Features

- **Time & Words**: Flexible presets (15s, 30s, 60s, 120s / 10, 25, 50, 100 words) with punctuation and number toggles.
- **Difficulty Levels**: Standard (top 200 words), Advanced (top 1000 words), and Expert (300+ long, complex vocabulary).
- **Zen Mode**: Endless, peaceful typing without timers, counters, or error locks. Press `Shift + Enter` or finish prompt to wrap up.
- **Sudden Death**: Strict 1-life or 3-lives challenge. One typo fails the run, displaying the exact typed vs expected keycap.
- **Quotes**: 65 authentic, inspirational literary, philosophy, and tech quotes with cited authors.
- **Code Syntax Mode**: 70 code snippets across JavaScript, TypeScript, Python, HTML/CSS, C++, Java, and SQL.
- **Daily Challenge**: Seeded Mulberry32 daily challenge identical for all typists worldwide each calendar day.
- **Custom Text**: Paste up to 2,000 characters of practice text.
- **Daily Streak & Habit System**:
  - Customizable goals: 1 session, 3 sessions, or 5 minutes of practice.
  - Active and at-risk flame badges in the top bar.
  - 12-month GitHub-style calendar heatmap and 7-day week progression.
  - Milestone unlock track: 3, 7, 14, 30, 60, 100, and 365 days.
- **Custom Layout Builder**:
  - Drag-and-drop keycap swapping & keyboard-accessible swap mode.
  - Preset cloning (QWERTY, Colemak, Dvorak, Workman).
  - JSON import/export and interactive layout testing.
- **Result Screen & Sharing**:
  - Real-time animated counters (Net WPM, Raw WPM, Accuracy, Consistency).
  - Interactive Recharts velocity progression graph and missed-keys keyboard heatmap.
  - 1200x630px high-resolution canvas card PNG export and clipboard sharing.

---

## Getting Started

### Prerequisites
- Node.js 18.18+ or 20+ (tested on Node v24)
- npm 9+

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/dkayush7373/TypeNest.git
cd TypeNest

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Quality Verification

```bash
# Linting checks (0 errors, 0 warnings)
npm run lint

# Strict TypeScript verification
npx tsc --noEmit

# Full Vitest unit test suite
npm test

# Production build verification
npm run build
```

---

## Architecture & Versioning

- **Storage Schema**: Version 2 (`keyflow:v2`) with automatic migration engine from `keyflow:v1`, corrupted JSON safety fallbacks, and local timezone date reconstruction.
- **Metrics Hardening**: Zero NaN/Infinity division safeguards, bidirectional backspace word navigation, per-second consistency sampling rule (>=5 samples required).
- **Audio Synthesizer**: Web Audio API with 3 distinct sound profiles (Soft Cherry Red, Clicky Cherry Blue, Thock Topre).

