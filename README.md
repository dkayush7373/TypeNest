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
3. **Typography**:
   - **Typing Canvas**: `JetBrains Mono` (28–32px, 1.8 line height, open tracking).
   - **Interface & Metrics**: `Inter` with tabular numerals (`tabular-nums`) for jitter-free WPM counts.
4. **Keycaps**:
   - 1px crisp borders, subtle inner top edge highlight (`inset 0 1px 0`), 6px border-radius, and 1px mechanical press depression.

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
# Linting checks
npm run lint

# TypeScript verification
npx tsc --noEmit

# Unit tests
npm test

# Production build
npm run build
```

---

## Development Roadmap

- [x] **Stage 1**: Setup, design tokens, 3 themes, `BackgroundLayers`, layout, and `TopBar`.
- [ ] **Stage 2**: Typing engine hook (`useTypingEngine`), memoized `TypingArea`, and lit-up `VirtualKeyboard`.
- [ ] **Stage 3**: Real-time metrics calculations, result report screen, Recharts progression line chart, and keyboard miss heatmap.
- [ ] **Stage 4**: Versioned `localStorage` history, beginner lessons with finger guides, and comprehensive settings panel.
- [ ] **Stage 5**: Interaction polish, edge-case audit, and accessibility verification.
