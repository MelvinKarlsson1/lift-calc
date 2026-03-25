# Phase 3: Calculator - Research

**Researched:** 2026-03-25
**Domain:** React single-page navigation, pure calculator logic, mobile thumb-zone UI
**Confidence:** HIGH

## Summary

Phase 3 is the last phase and delivers the core value proposition of Lift Calc: select an exercise, tap a percentage, see the working weight. The technical work is straightforward — a pure calculation function, a new CalculatorView component, and a navigation mechanism to switch between ExerciseList and the calculator. No new libraries are needed. No new persistent state is needed beyond what already exists (exercises and maxWeights are already in Zustand).

The main design decision is navigation. App.tsx currently hard-renders ExerciseList. Phase 3 needs a way to move between the list view and the calculator view. The CLAUDE.md STACK section explicitly warns against adding React Router for this app — use `React.useState` for the current view instead. This is the correct call: two screens, no deep-linking needed, no URL routing overhead.

The UX requirement (UX-01) — one-thumb usability — is the only non-trivial design challenge. The calculator result (the big number) and the preset percentage buttons must sit in the bottom half of the screen. The exercise selector (which exercise are you lifting?) sits at the top as a read-only label navigated to from the list. This bottom-heavy layout mirrors gym app conventions and is implementable purely with Tailwind flex-column layout.

**Primary recommendation:** Build a CalculatorView component using the same flex-column h-[100dvh] pattern as ExerciseList. Add a `currentView` state to App.tsx with a `selectedExerciseId` to pass the selection from list to calculator.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CALC-01 | User can select an exercise and enter a percentage to see the calculated working weight | Exercise selection via navigation from ExerciseList; percentage input with inputMode="decimal"; result derived from maxWeights[id] * (pct/100) |
| CALC-02 | User can tap preset percentage buttons (70%, 80%, 85%, 90%, 95%) instead of typing | Five preset buttons set percentage state directly; replaces or complements free-text input |
| CALC-03 | Calculated weights are rounded to the nearest 2.5kg | Pure function: Math.round(raw / 2.5) * 2.5; handles 0 and null 1RM gracefully |
| UX-01 | Primary actions are in the thumb zone (bottom of screen), usable one-handed | flex-col layout with result + presets pinned to bottom; exercise name label at top; same dvh pattern as ExerciseList |
</phase_requirements>

## Standard Stack

No new dependencies required. Phase 3 uses only what is already installed.

### Core (already installed)
| Library | Version | Purpose | Phase 3 Use |
|---------|---------|---------|-------------|
| React | 19.2.4 | UI framework | CalculatorView component, useState for view/percentage/selection |
| Zustand | 5.0.12 | State management | Read exercises and maxWeights — no new store additions needed |
| Tailwind CSS | 4.2.2 | Styling | Thumb-zone layout, preset button sizing, result typography |
| TypeScript | 5.x | Type safety | Calculator function type safety (number inputs/outputs) |

### No New Installs
Phase 3 requires zero `npm install` steps. All required capabilities are in the existing stack.

## Architecture Patterns

### Navigation: useState View Switcher (no React Router)

App.tsx manages two pieces of state: which view is active, and which exercise is selected. This avoids URL routing entirely and keeps the app a true single-page experience.

```typescript
// Source: CLAUDE.md STACK section — "React useState for current view"
// Confirmed pattern from Phase 2 research decisions

type View = 'list' | 'calculator'

export default function App() {
  const [storageAvailable] = useState(() => isStorageAvailable())
  const [view, setView] = useState<View>('list')
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)

  if (!storageAvailable) return <StorageWarning />

  if (view === 'calculator' && selectedExerciseId) {
    return (
      <CalculatorView
        exerciseId={selectedExerciseId}
        onBack={() => setView('list')}
      />
    )
  }

  return (
    <ExerciseList
      onSelectExercise={(id) => {
        setSelectedExerciseId(id)
        setView('calculator')
      }}
    />
  )
}
```

### ExerciseList Change: Add onSelectExercise prop

ExerciseList needs an `onSelectExercise` callback prop so rows can trigger navigation. The row tap (or a dedicated "calculate" button per row) calls this.

```typescript
interface ExerciseListProps {
  onSelectExercise: (exerciseId: string) => void
}
```

The ExerciseRow must show a tap target to navigate to the calculator. Options:
- Make the exercise name/row itself tappable (simplest, lowest friction)
- Add a small calculator icon button per row

Recommendation: make the exercise name span tappable. Wrap it in a `<button>` or give the row an `onClick`. This is the lowest-friction gym interaction — tap the exercise, see the weight.

### CalculatorView Layout: Bottom-Heavy Thumb Zone

The CalculatorView uses the same `flex flex-col h-[100dvh]` shell as ExerciseList. Content is divided into:

1. **Header** (top, ~15% height): exercise name + back button
2. **Result display** (middle-to-bottom, grows with flex-1): large calculated weight number
3. **Controls** (bottom, pinned): preset percentage buttons + optional manual input

```
┌─────────────────────┐
│ ← Squat             │  ← header: back + exercise name
├─────────────────────┤
│                     │
│       120 kg        │  ← result: large, centered, flex-1
│                     │
├─────────────────────┤
│  70%  80%  85%  90%  95%  │  ← preset buttons: min-h-14, full width
│  [  enter % manually  ]   │  ← optional text input
└─────────────────────┘
```

Both the preset buttons AND the result must be in the bottom half of the screen on a standard phone (~667px viewport). With `flex-1` on the result area and a fixed-height bottom controls section, this is guaranteed by the layout without media queries.

### Calculator Pure Function

```typescript
// src/lib/calculator.ts
// Pure function — no side effects, no imports.

const ROUNDING_STEP = 2.5 // kg, hardcoded per REQUIREMENTS.md CALC-03

export function calcWorkingWeight(oneRepMax: number, percentage: number): number {
  if (!oneRepMax || oneRepMax <= 0 || !percentage || percentage <= 0) return 0
  const raw = oneRepMax * (percentage / 100)
  return Math.round(raw / ROUNDING_STEP) * ROUNDING_STEP
}
```

**Rounding note:** The STATE.md decision log says "2.5 kg hardcoded — revisit only if finer control is requested." Use 2.5 kg. Do not expose as a user setting.

**Edge cases handled:**
- 0 or missing 1RM → return 0, display "Set a 1RM first" message
- percentage = 0 → return 0
- Floating point: `Math.round(raw / 2.5) * 2.5` eliminates IEEE 754 drift

### Preset Percentage Buttons

Five preset buttons: 70, 80, 85, 90, 95. These set `percentage` state directly. No typing required for the common gym use case.

```typescript
const PRESETS = [70, 80, 85, 90, 95]

// Each button:
<button
  onClick={() => setPercentage(preset)}
  className={`flex-1 min-h-14 rounded-lg font-bold text-lg
    ${percentage === preset
      ? 'bg-blue-600 text-white'
      : 'bg-gray-800 text-gray-300'
    }`}
>
  {preset}%
</button>
```

Active preset is highlighted (bg-blue-600). Manual input also allowed alongside presets — they share the same `percentage` state.

### CalculatorView Component Signature

```typescript
// src/components/CalculatorView.tsx

interface CalculatorViewProps {
  exerciseId: string
  onBack: () => void
}

export function CalculatorView({ exerciseId, onBack }: CalculatorViewProps) {
  const exercises = useAppStore((s) => s.exercises)
  const maxWeights = useAppStore((s) => s.maxWeights)
  const [percentage, setPercentage] = useState<number | null>(null)

  const exercise = exercises.find((e) => e.id === exerciseId)
  const oneRepMax = maxWeights[exerciseId] ?? null
  const result = oneRepMax && percentage
    ? calcWorkingWeight(oneRepMax, percentage)
    : null

  // ... render
}
```

Percentage state is local (ephemeral) — not persisted to Zustand. Per the research summary: "session state is intentionally ephemeral."

### Anti-Patterns to Avoid

- **Do not add React Router** — confirmed no-go from CLAUDE.md STACK: "React Router: The app is a single-page experience with no deep-linking requirement."
- **Do not persist percentage to localStorage** — percentage is session state, not user data. Persisting it creates stale-state confusion on next open.
- **Do not use position: fixed for the bottom controls** — use flex-col layout instead. Fixed elements behave incorrectly when the virtual keyboard opens on mobile (they stay fixed to the visual viewport, not the layout viewport).
- **Do not render a floating-point result** — always pass through `calcWorkingWeight` before display. Raw `oneRepMax * 0.85` output like "106.25000001" destroys trust.
- **Do not make the result font small** — it is the primary output. Use text-6xl or text-7xl minimum.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rounding to 2.5 kg | Custom rounding utility | `Math.round(raw / 2.5) * 2.5` — one line | Zero dependencies, IEEE 754 safe when step is a power of 0.5 |
| View navigation | React Router, history API, hash routing | `useState<'list' \| 'calculator'>` in App.tsx | App has exactly two screens. Router adds 3KB+ and URL management. |
| Percentage input validation | Custom parser | `parseFloat` + range check (1-100) | Same pattern already in ExerciseRow for 1RM input |
| Touch target sizing | Custom CSS min-size enforcement | Tailwind `min-h-14` (56px) — already in use in ExerciseRow | Consistent with Phase 2 touch target decisions |

**Key insight:** The calculator itself is 4 lines of math. The entire phase is a UI composition challenge, not a logic challenge.

## Common Pitfalls

### Pitfall 1: Virtual Keyboard Pushes Preset Buttons Off Screen
**What goes wrong:** If the user taps the manual percentage input, iOS Safari's virtual keyboard resizes the visual viewport. Fixed-position bottom elements appear to jump or get covered.
**Why it happens:** `position: fixed` is anchored to the visual viewport on iOS, which shrinks when the keyboard opens.
**How to avoid:** Use flex-col layout (not fixed positioning) for the bottom controls. The keyboard resizes the window; a flex layout shrinks proportionally and keeps controls visible. This is the same reason ExerciseList uses `flex flex-col h-[100dvh]` with no fixed elements.
**Warning signs:** During testing, if the Add button in ExerciseList stays visible when keyboard opens, the same approach is safe for CalculatorView.

### Pitfall 2: No 1RM Set — Silent Zero Result
**What goes wrong:** User navigates to calculator for an exercise with no 1RM set. `maxWeights[id]` is undefined. Calculator returns 0. User sees "0 kg" and doesn't understand why.
**Why it happens:** Exercises can exist without a 1RM (seed exercises are added without weights).
**How to avoid:** Check for null/undefined 1RM explicitly. Display a prompt: "Enter a 1RM in the exercise list first" instead of showing 0 kg.
**Warning signs:** Any exercise in the seed list that hasn't had a weight entered.

### Pitfall 3: Result Shows Before Percentage Selected
**What goes wrong:** CalculatorView opens with no percentage selected. Displaying "0 kg" or showing a stale number is confusing.
**Why it happens:** `percentage` state initializes to null.
**How to avoid:** Show placeholder text ("Select a percentage") when `percentage === null`. Only show the result number once a percentage is active.

### Pitfall 4: Preset Buttons Too Narrow on Small Phones
**What goes wrong:** Five buttons in a row on a 375px screen = 75px each before gaps, which is tight.
**Why it happens:** `flex-1` on five items in a row with padding can produce 60-65px effective tap width.
**How to avoid:** Use `min-h-14` (56px tall) on all preset buttons. Width is handled by flex. If five buttons are too narrow, use two rows (3+2 or all 5 stacked). Verify on 375px viewport (iPhone SE size).
**Warning signs:** Any button narrower than 44px effective tap width during browser dev tools testing.

### Pitfall 5: ExerciseList Rows Need a Visual Affordance for Navigation
**What goes wrong:** Making rows tappable without a visual cue causes users to not discover the navigation.
**Why it happens:** A styled `<div>` row looks non-interactive by default.
**How to avoid:** Either (a) add a right-chevron icon on each row, or (b) use `cursor-pointer` and a hover/active state on the row. Option (a) is clearer on mobile. This is a small addition to ExerciseRow.

## Code Examples

Verified patterns from existing codebase and official TypeScript/React docs.

### Calculator Function
```typescript
// src/lib/calculator.ts
const ROUNDING_STEP = 2.5

export function calcWorkingWeight(oneRepMax: number, percentage: number): number {
  if (!oneRepMax || oneRepMax <= 0 || !percentage || percentage <= 0) return 0
  const raw = oneRepMax * (percentage / 100)
  return Math.round(raw / ROUNDING_STEP) * ROUNDING_STEP
}
```

### App.tsx Navigation Pattern
```typescript
// Extends existing App.tsx
// Source: CLAUDE.md confirmed pattern — useState, no React Router

type View = 'list' | 'calculator'

export default function App() {
  const [storageAvailable] = useState(() => isStorageAvailable())
  const [view, setView] = useState<View>('list')
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)

  if (!storageAvailable) return <StorageWarning />

  if (view === 'calculator' && selectedExerciseId) {
    return (
      <CalculatorView
        exerciseId={selectedExerciseId}
        onBack={() => { setView('list'); setSelectedExerciseId(null) }}
      />
    )
  }

  return (
    <ExerciseList
      onSelectExercise={(id) => { setSelectedExerciseId(id); setView('calculator') }}
    />
  )
}
```

### ExerciseRow Navigation Trigger
```typescript
// Add to ExerciseRow — tap the name to navigate to calculator
// Only show navigation affordance when a 1RM is set (otherwise calculator is useless)

<button
  onClick={() => onSelect?.()}
  className="flex-1 text-left text-white text-base py-1"
  aria-label={`Calculate working weight for ${exercise.name}`}
>
  {exercise.name}
  {weight && <span className="ml-2 text-gray-400 text-sm">→</span>}
</button>
```

### Result Display
```typescript
// The big number — primary output, must be visually dominant
{result !== null ? (
  <p className="text-7xl font-black text-white tabular-nums">
    {result} <span className="text-3xl font-normal text-gray-400">kg</span>
  </p>
) : oneRepMax ? (
  <p className="text-gray-500 text-lg">Select a percentage</p>
) : (
  <p className="text-gray-500 text-lg text-center px-6">
    No 1RM set. Enter one in the exercise list.
  </p>
)}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React Router for multi-screen SPAs | useState view switcher for simple 2-screen apps | Always valid — Router is overkill for <3 screens | Zero dependency added, simpler mental model |
| position: fixed bottom controls | flex-col layout with natural bottom positioning | iOS Safari VirtualViewport API insights (2021+) | Controls stay visible when keyboard opens |
| Raw floating point display | Round to nearest increment before display | Standard gym app UX | User sees actionable numbers, not 106.25000001 |

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — phase is pure React/TypeScript component work, no new tools, services, or CLIs required beyond the existing Vite dev server).

## Validation Architecture

Step skipped — `workflow.nyquist_validation` is explicitly `false` in `.planning/config.json`.

## Open Questions

1. **Exercise row navigation affordance**
   - What we know: Row needs to be tappable to navigate to calculator
   - What's unclear: Whether to tap the whole row, just the name, or add an explicit "calculate" button per row
   - Recommendation: Make the exercise name a button with a subtle right-arrow "→" indicator. Only show the arrow when a 1RM is set (no arrow = no weight to calculate from). This preserves the existing 1RM input and remove button in the row.

2. **Manual percentage input alongside presets**
   - What we know: CALC-02 requires preset buttons; CALC-01 requires entering a percentage
   - What's unclear: Whether a manual text input field is needed alongside presets, or if presets alone satisfy CALC-01
   - Recommendation: Include a small numeric input below the presets. Satisfies both requirements cleanly. Use `inputMode="decimal"` consistent with Phase 2 pattern.

3. **Back navigation: clear percentage on back?**
   - What we know: Percentage state is local to CalculatorView
   - What's unclear: Should returning to the list and re-entering the same exercise restore the last percentage?
   - Recommendation: Do not restore. Ephemeral is correct — start fresh each time. The user can tap a preset in under a second.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/App.tsx`, `src/components/ExerciseList.tsx`, `src/store/store.ts`, `src/store/types.ts` — direct inspection of live code
- `lift-calc/CLAUDE.md` — confirmed: no React Router, useState for view switching, dvh layout
- `.planning/STATE.md` — confirmed decisions: rounding step 2.5 kg hardcoded, type=text inputMode=decimal pattern
- `.planning/REQUIREMENTS.md` — CALC-01, CALC-02, CALC-03, UX-01 confirmed
- `.planning/research/SUMMARY.md` — session state ephemeral, thumb-zone UX, pure calculator function

### Secondary (MEDIUM confidence)
- MDN: Math.round — IEEE 754 behavior for `Math.round(x / step) * step` rounding pattern is standard

## Metadata

**Confidence breakdown:**
- Navigation pattern: HIGH — confirmed by CLAUDE.md directives and existing App.tsx structure
- Calculator math: HIGH — trivial pure function, 2.5 rounding step confirmed in STATE.md decisions
- Thumb-zone layout: HIGH — same flex-col dvh pattern as ExerciseList, confirmed working in Phase 2
- ExerciseRow navigation affordance: MEDIUM — specific UI choice (which element is tappable) left to planner to decide from options documented above

**Research date:** 2026-03-25
**Valid until:** Stable until requirements change — no external dependencies or versioned APIs involved
