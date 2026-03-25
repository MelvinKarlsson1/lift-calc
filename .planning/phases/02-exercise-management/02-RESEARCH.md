# Phase 2: Exercise Management - Research

**Researched:** 2026-03-25
**Domain:** React CRUD UI on Zustand store — exercise list, seed data, 1RM input with numeric keyboard
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| EXER-01 | User sees a preloaded list of ~50 common weightlifting exercises on first launch | Seed data pattern: static array loaded into Zustand `exercises` state when store first hydrates and array is empty |
| EXER-02 | User can remove default exercises they don't use | `removeExercise` action on Zustand store; removal persists automatically via `persist` middleware |
| EXER-03 | User can add custom exercises with a name | `addExercise` action already stubbed in store; controlled form input with `isCustom: true` flag |
| EXER-04 | User can record their 1RM (max weight in kg) for any exercise | `setMaxWeight` action already present in store; `inputmode="decimal"` numeric input for mobile keyboard |
</phase_requirements>

---

## Summary

Phase 2 builds directly on the foundation from Phase 1. The Zustand store already has all needed fields (`exercises: Exercise[]`, `maxWeights: Record<string, number>`) and two stub actions (`addExercise`, `setMaxWeight`). The data model is complete — this phase is purely UI + store actions.

The work breaks into three independent slices: (1) seed data loading on first launch, (2) the exercise list view with add/remove, and (3) the 1RM editor. All three use standard React patterns on the existing Zustand store. No new libraries are required. The only meaningful decision is the exercise list content (flagged as a Phase 2 authoring task in the research summary) — a curated list of ~50 exercises covering the major barbell/dumbbell/cable movements.

The one mobile UX pitfall specific to this phase is the virtual keyboard covering the 1RM input. The fix is `inputmode="decimal"` on the `<input>` element plus ensuring the input is positioned well above the bottom of the screen when the keyboard is open. This is a layout concern, not a data concern.

**Primary recommendation:** Add `removeExercise` to the Zustand store, write a seed data file as a static TypeScript array, load it once on first launch (empty-exercises guard), then build `ExerciseList` and `ExerciseEditor` components. No new packages needed.

---

## Project Constraints (from CLAUDE.md)

| Directive | Constraint |
|-----------|------------|
| No fixed stack | Stack is locked by prior research: React 19 + Vite 7.3.1 + Tailwind v4 + Zustand 5. Do not introduce new libraries unless unavoidable. |
| Simple, focused implementations | Phase 2 is CRUD on a Zustand store — keep components minimal and direct. No animation libraries, no complex state machines. |
| Each experiment in its own subfolder | Project lives at `lift-calc/` — no structural changes to project location. |
| GSD workflow enforcement | All file changes go through GSD `/gsd:execute-phase`. No direct repo edits outside workflow. |

---

## Standard Stack

No new packages needed for this phase. Everything required is already installed.

### Core (installed, already in use)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | ^19.2.0 | UI components | Already installed; component model maps directly to ExerciseList + ExerciseEditor |
| Zustand | ^5.0.12 | State + persistence | Already installed; `exercises` and `maxWeights` fields already in store shape |
| TypeScript | ~5.8.3 | Type safety | Already installed; Exercise type already defined in `src/store/types.ts` |
| Tailwind CSS | ^4.2.2 | Utility styling | Already installed; touch-target sizing (`h-12`, `min-h-12`, `p-4`) and dark theme ready |

### No New Dependencies

Phase 2 does not require any new npm packages. The seed data is a static TypeScript array (no import). The numeric input uses native HTML `inputmode` attribute. List rendering uses React. No icon library, no animation library, no form library.

**If a component library is considered:** Reject it. The app has a tight dark-gym aesthetic and touch-target requirements that are easier to control with Tailwind utilities than to override from a component library's defaults. Hand-rolled components with Tailwind are the right call here.

---

## Architecture Patterns

### Recommended Project Structure (after Phase 2)

```
src/
├── components/
│   ├── ExerciseList.tsx       # Scrollable list of exercises, add/remove controls
│   └── ExerciseEditor.tsx     # 1RM input for a single exercise (inline or modal)
├── data/
│   └── seedExercises.ts       # Static array of ~50 Exercise objects, imported once
├── store/
│   ├── store.ts               # Add removeExercise action; load seed on first hydrate
│   └── types.ts               # Exercise, AppState, AppStore — no changes needed
├── lib/
│   └── storage.ts             # Unchanged from Phase 1
├── App.tsx                    # Replace placeholder with <ExerciseList />
├── index.css                  # Unchanged from Phase 1
└── main.tsx                   # Unchanged from Phase 1
```

### Pattern 1: Seed Data Loading on First Launch (EXER-01)

**What:** A static array of Exercise objects in `src/data/seedExercises.ts`. On first hydration, if `exercises` is empty, the store populates itself from this array.

**When to use:** Only once — when the persisted exercises array is empty (i.e., first launch). Never overwrites user modifications.

**Where to load it:** Inside the Zustand `persist` `merge` function that already exists in `store.ts`, or in an `onRehydrateStorage` callback. The merge callback is the cleaner location because it runs after rehydration and has access to both the persisted state and the store defaults.

```typescript
// src/data/seedExercises.ts
import type { Exercise } from '../store/types'

export const SEED_EXERCISES: Exercise[] = [
  { id: 'squat',           name: 'Squat',              isCustom: false },
  { id: 'bench-press',     name: 'Bench Press',         isCustom: false },
  { id: 'deadlift',        name: 'Deadlift',            isCustom: false },
  { id: 'overhead-press',  name: 'Overhead Press',      isCustom: false },
  { id: 'barbell-row',     name: 'Barbell Row',         isCustom: false },
  // ... ~45 more
]
```

```typescript
// In store.ts persist merge callback — seed if exercises is empty after hydration
merge: (persisted, current) => {
  const migratedState = migrateIfNeeded(persisted as AppState)
  const merged = { ...current, ...migratedState }
  // Seed on first launch: if exercises array is empty, populate from seed data
  if (!merged.exercises || merged.exercises.length === 0) {
    merged.exercises = SEED_EXERCISES
  }
  return merged
},
```

**Why merge callback, not onRehydrateStorage:** The `merge` callback is synchronous and returns the final merged state object. `onRehydrateStorage` fires after the store is already set — using `set()` there is a second write and can cause a render flicker. Using `merge` is the correct Zustand pattern for initial state augmentation.

**Alternative approach — hydration guard in component:** Some apps detect empty state in the component (`if (exercises.length === 0) useEffect(loadSeed)`) — avoid this. It requires an extra render cycle, causes a flash of empty state, and couples data-loading logic to a UI component.

### Pattern 2: removeExercise Action (EXER-02)

**What:** Add `removeExercise(id: string)` to the Zustand store. Filters the `exercises` array by id and persists automatically.

**When to use:** Called from the ExerciseList component when the user taps a remove/delete control.

```typescript
// Addition to store.ts (set function):
removeExercise: (id) =>
  set((state) => ({
    exercises: state.exercises.filter((ex) => ex.id !== id),
  })),
```

```typescript
// Addition to types.ts AppStore interface:
removeExercise: (id: string) => void
```

**Persistence is automatic:** Because the store is wrapped in Zustand `persist`, the updated exercises array is written to localStorage immediately after `set()` is called. No manual localStorage write needed.

**Note:** EXER-02 says "remove exercises they don't use" — the requirement does not say restore them. A removed exercise is simply gone from the list. If the user removes all exercises, the seed list does NOT reload (it loads only when exercises is empty on startup, not when exercises becomes empty at runtime). This is the correct behavior — a user who removed everything intentionally should see an empty list, not have seed data silently restored.

### Pattern 3: Add Custom Exercise (EXER-03)

**What:** A controlled text input + submit button. On submit, calls `addExercise` (already in the store) with `isCustom: true` and a generated id.

**ID generation:** Use `crypto.randomUUID()` — available in all modern browsers including iOS Safari 15.4+. Do not use `Date.now()` or Math.random() — collision-prone. Do not import a UUID library — the Web Crypto API is sufficient.

```typescript
// In the add-exercise form submit handler:
const newExercise: Exercise = {
  id: crypto.randomUUID(),
  name: inputValue.trim(),
  isCustom: true,
}
addExercise(newExercise)
setInputValue('')
```

**Validation:** Require non-empty name after trim. A duplicate name is acceptable — the id is always unique, so two exercises can share a name without breaking the store.

### Pattern 4: 1RM Input with Numeric Keyboard (EXER-04)

**What:** A numeric `<input>` on each exercise for entering the 1RM value in kg. Calls `setMaxWeight` (already in the store) on change or blur.

**Mobile keyboard:** Use `inputmode="decimal"` — triggers the decimal numeric keyboard on iOS and Android. Do NOT use `type="number"` for primary input — it adds browser-native increment/decrement spinners that look wrong on mobile and behave differently across browsers. Use `type="text"` with `inputmode="decimal"` and `pattern="[0-9]*\.?[0-9]*"` for combined semantics.

```tsx
<input
  type="text"
  inputMode="decimal"
  pattern="[0-9]*\.?[0-9]*"
  placeholder="0"
  value={localWeight}
  onChange={(e) => setLocalWeight(e.target.value)}
  onBlur={() => {
    const parsed = parseFloat(localWeight)
    if (!isNaN(parsed) && parsed > 0) {
      setMaxWeight(exerciseId, parsed)
    }
  }}
  className="w-20 text-right bg-gray-800 rounded px-3 py-2 text-white"
/>
```

**Local state for the input:** The input should maintain local controlled state (`useState`) for the current typing value, and commit to the Zustand store on `onBlur`. This avoids persisting every keystroke and allows the user to clear the field and retype without saving an invalid intermediate value.

**Why onBlur not onChange for store write:** Writing to the store on every keystroke would persist "1", "15", "155" as the user types "155". Using `onBlur` persists only the final value when the user leaves the field.

### Anti-Patterns to Avoid

- **Loading seed data inside a React component:** Puts data logic in UI code. Load in the Zustand merge callback instead.
- **Using `type="number"` for 1RM input on mobile:** Browser spinners are tiny and hard to hit at the gym. Use `type="text"` + `inputMode="decimal"`.
- **Writing to Zustand store on every keystroke:** Use local `useState` for the input value; commit to store on `onBlur`.
- **Using `Math.random()` or `Date.now()` for exercise IDs:** Use `crypto.randomUUID()`.
- **Reloading seed data when exercises becomes empty at runtime:** Seed should only load when `exercises` is empty on startup (merge callback), not in response to user deletions.
- **Putting remove button and 1RM input on the same tap target:** Each interactive element needs its own 48px+ hit area. Keep them visually separated.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| localStorage persistence of exercises | Manual `JSON.stringify`/`parse` in useEffect | Zustand `persist` middleware (already configured) | Already wired; adding exercises to the store automatically persists them |
| UUID / unique IDs | `Date.now()`, `Math.random()`, nanoid library | `crypto.randomUUID()` | Web standard, collision-free, zero install, available in all target browsers |
| Form state management | Custom form reducer, formik, react-hook-form | React `useState` + `onBlur` | This is a single text field and a single number field — full form library is massive overkill |
| Numeric keyboard on mobile | Custom numeric keypad UI | HTML `inputMode="decimal"` attribute | Native OS keyboard is more ergonomic; no custom UI needed |
| Animated list transitions | CSS keyframes or Framer Motion | Plain `Array.filter` + React re-render | No animations in this phase — keep it simple |

**Key insight:** Every data concern in Phase 2 is handled by Zustand store actions. Every input concern is handled by standard HTML attributes. There is nothing to build from scratch.

---

## Exercise Seed List (EXER-01 — Authoring Task)

The prior research summary identified the seed list content as a Phase 2 authoring decision. The following ~50 exercises cover the major barbell, dumbbell, cable, and bodyweight movements used in standard strength training. This is prescriptive — use this list exactly to close the EXER-01 open question.

**Barbell (compound):**
Squat, Front Squat, Low Bar Squat, Bench Press, Incline Bench Press, Close-Grip Bench Press, Deadlift, Romanian Deadlift, Sumo Deadlift, Overhead Press, Push Press, Barbell Row, Pendlay Row, Power Clean, Hang Clean

**Dumbbell:**
Dumbbell Press, Incline Dumbbell Press, Dumbbell Row, Dumbbell Shoulder Press, Dumbbell Curl, Dumbbell Lateral Raise, Dumbbell Fly, Romanian Deadlift (DB), Goblet Squat

**Cable / Machine:**
Lat Pulldown, Cable Row, Cable Fly, Tricep Pushdown, Face Pull, Leg Press, Leg Curl, Leg Extension

**Bodyweight / Bodyweight-loaded:**
Pull-Up, Chin-Up, Dip, Push-Up

**Other barbell movements:**
Hip Thrust, Good Morning, Zercher Squat, Paused Squat, Box Squat, Floor Press, Deficit Deadlift, Trap Bar Deadlift

Total: ~50 exercises. IDs should be kebab-case of the name (e.g., `"front-squat"`, `"dumbbell-press"`). All `isCustom: false`.

---

## Common Pitfalls

### Pitfall 1: Virtual Keyboard Covers the 1RM Input (EXER-04)

**What goes wrong:** When a numeric input near the bottom of the screen gains focus, the iOS virtual keyboard slides up and completely covers the input. The user cannot see what they are typing.

**Why it happens:** The browser resizes the viewport when the keyboard opens. Elements with `position: fixed` at the bottom can end up behind the keyboard. Elements near the bottom of a long scroll container may not auto-scroll into view.

**How to avoid:** Position the 1RM input within the exercise list row (not at the bottom of the screen in a sticky bar). When the input is inline with the exercise row, scrolling the list brings the focused row above the keyboard naturally. Do not use `position: fixed` for any element that contains or is near a numeric input.

**Warning signs:** `position: fixed` footer containing inputs; inputs within `overflow: hidden` containers that prevent scroll-into-view.

### Pitfall 2: Seed Data Reloads After User Removes All Exercises

**What goes wrong:** Developer puts the seed-loading guard inside a `useEffect` triggered when `exercises.length === 0`. User removes all exercises. App immediately reloads the seed list — overriding the user's intentional action.

**Why it happens:** The empty-list check is run reactively rather than only at startup.

**How to avoid:** Load seed data only in the Zustand `merge` callback (runs once at hydration time). After that, the store is the user's data. An empty `exercises` array is a valid state the user can intentionally create.

### Pitfall 3: `type="number"` Input Behavior on Mobile

**What goes wrong:** `<input type="number">` on iOS shows a numeric keyboard but also adds browser-native up/down steppers. The step defaults to 1, meaning fractional values (e.g., 102.5 kg) can appear to round when the user taps the stepper. In Firefox, `type="number"` returns an empty string from `.value` when the input contains a non-numeric character — breaking validation logic.

**Why it happens:** Developers reach for `type="number"` because it semantically describes the input. The browser behavior diverges from expectations.

**How to avoid:** Use `type="text"` with `inputMode="decimal"` and `pattern="[0-9]*\.?[0-9]*"`. Parse with `parseFloat()` on blur with an explicit `isNaN` guard.

### Pitfall 4: Non-Unique Exercise IDs Break maxWeights Record

**What goes wrong:** If two exercises have the same `id`, the `maxWeights` record uses only one slot for both. One exercise's 1RM overwrites the other. Filtering by id to remove an exercise removes both.

**Why it happens:** Developers use sequential integers (`1`, `2`, `3`) or timestamps for IDs, which can collide if exercises are added rapidly or across sessions.

**How to avoid:** Use `crypto.randomUUID()` for all custom exercise IDs. Use stable kebab-case string IDs for seed exercises (e.g., `"bench-press"`) — these never collide because they are defined statically.

### Pitfall 5: Overly Small Touch Targets on Remove and Save Controls

**What goes wrong:** A small `×` icon or a tiny "Save" button is nearly impossible to tap accurately with a thumb in a gym setting (hands may be chalked, sweaty, or wearing gloves).

**Why it happens:** Desktop design sensibilities translate poorly to mobile. A 20px icon looks fine on screen but has a 20px hit area.

**How to avoid:** Wrap all interactive elements in containers with `min-h-12` (48px) and `min-w-12` (48px) minimum. For the remove button, use a full-height swipe-or-tap pattern OR a clearly-sized button. Prefer explicit `p-3` or `p-4` on buttons to expand their hit area without changing their visual size.

---

## Code Examples

### Exercise type (already in types.ts — no changes needed)

```typescript
// src/store/types.ts — current, no changes needed for Phase 2
export interface Exercise {
  id: string
  name: string
  isCustom: boolean
}
```

### Store additions for Phase 2

```typescript
// src/store/store.ts — add removeExercise action and seed loading in merge

import { SEED_EXERCISES } from '../data/seedExercises'

// Inside persist merge callback:
merge: (persisted, current) => {
  const migratedState = migrateIfNeeded(persisted as AppState)
  const merged = { ...current, ...migratedState }
  if (!merged.exercises || merged.exercises.length === 0) {
    merged.exercises = SEED_EXERCISES
  }
  return merged
},

// Inside create() factory (add alongside addExercise):
removeExercise: (id) =>
  set((state) => ({
    exercises: state.exercises.filter((ex) => ex.id !== id),
  })),
```

### AppStore interface addition

```typescript
// src/store/types.ts — add removeExercise to AppStore
export interface AppStore extends AppState {
  setMaxWeight: (exerciseId: string, weight: number) => void
  addExercise: (exercise: Exercise) => void
  removeExercise: (id: string) => void   // NEW in Phase 2
}
```

### ExerciseList component pattern

```tsx
// src/components/ExerciseList.tsx
import { useState } from 'react'
import { useAppStore } from '../store/store'
import type { Exercise } from '../store/types'

export function ExerciseList() {
  const exercises = useAppStore((s) => s.exercises)
  const addExercise = useAppStore((s) => s.addExercise)
  const removeExercise = useAppStore((s) => s.removeExercise)
  const maxWeights = useAppStore((s) => s.maxWeights)
  const setMaxWeight = useAppStore((s) => s.setMaxWeight)

  const [newName, setNewName] = useState('')

  function handleAdd() {
    const name = newName.trim()
    if (!name) return
    addExercise({ id: crypto.randomUUID(), name, isCustom: true })
    setNewName('')
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      {exercises.map((ex) => (
        <ExerciseRow
          key={ex.id}
          exercise={ex}
          weight={maxWeights[ex.id] ?? null}
          onRemove={() => removeExercise(ex.id)}
          onWeightChange={(w) => setMaxWeight(ex.id, w)}
        />
      ))}
      {/* Add custom exercise row */}
      <div className="flex gap-2 mt-4">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Exercise name"
          className="flex-1 bg-gray-800 text-white rounded px-3 py-3 min-h-12"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white rounded px-4 min-h-12 min-w-12 font-semibold"
        >
          Add
        </button>
      </div>
    </div>
  )
}
```

### ExerciseRow with 1RM input pattern (EXER-04)

```tsx
// Inline within ExerciseList.tsx or extracted to ExerciseRow.tsx
interface ExerciseRowProps {
  exercise: Exercise
  weight: number | null
  onRemove: () => void
  onWeightChange: (weight: number) => void
}

function ExerciseRow({ exercise, weight, onRemove, onWeightChange }: ExerciseRowProps) {
  const [localWeight, setLocalWeight] = useState(weight != null ? String(weight) : '')

  function handleBlur() {
    const parsed = parseFloat(localWeight)
    if (!isNaN(parsed) && parsed > 0) {
      onWeightChange(parsed)
    }
  }

  return (
    <div className="flex items-center gap-3 bg-gray-900 rounded-lg px-4 py-3 min-h-[56px]">
      <span className="flex-1 text-white text-base">{exercise.name}</span>
      <input
        type="text"
        inputMode="decimal"
        pattern="[0-9]*\.?[0-9]*"
        placeholder="kg"
        value={localWeight}
        onChange={(e) => setLocalWeight(e.target.value)}
        onBlur={handleBlur}
        className="w-20 text-right bg-gray-800 text-white rounded px-3 py-2 min-h-10"
        aria-label={`1RM for ${exercise.name} in kg`}
      />
      <button
        onClick={onRemove}
        className="text-gray-500 hover:text-red-400 min-h-12 min-w-12 flex items-center justify-center"
        aria-label={`Remove ${exercise.name}`}
      >
        ×
      </button>
    </div>
  )
}
```

---

## Runtime State Inventory

> Phase 2 adds seed data to localStorage on first launch. No external systems are involved.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `lift-calc-v1` key in localStorage — `exercises: []` and `maxWeights: {}` written by Phase 1 | Seed loading logic must detect empty array and populate; existing Phase 1 data is compatible (schemaVersion: 1 unchanged) |
| Live service config | None — no external services | None |
| OS-registered state | None | None |
| Secrets/env vars | None — no backend, no secrets | None |
| Build artifacts | None new in this phase | None |

**Schema version:** Phase 2 does NOT bump the schema version. The `exercises` and `maxWeights` fields were already present in the Phase 1 schema (just empty). Loading seed data is not a schema change — it is initial data population. `schemaVersion` stays at 1.

---

## Environment Availability

> Step 2.6: No new external dependencies. All tools from Phase 1 remain available. `crypto.randomUUID()` is a browser API — no install required.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm run dev | Yes | v24.14.1 (from Phase 1) | — |
| npm | Package management | Yes | 11.11.0 (from Phase 1) | — |
| crypto.randomUUID() | Custom exercise IDs | Yes (browser API) | Web standard — all targets | — |
| inputMode="decimal" | Mobile numeric keyboard | Yes (HTML attribute) | All modern browsers | type="number" (worse UX but functional) |

**Missing dependencies with no fallback:** None.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `type="number"` for numeric inputs on mobile | `type="text"` + `inputMode="decimal"` + `pattern` | Widely recommended since 2020 | Avoids browser spinner inconsistencies; consistent cross-browser numeric keyboard |
| `Math.random()` for IDs | `crypto.randomUUID()` | crypto.randomUUID() broadly available since 2021 | Collision-free, no library dependency |
| Seeding data in useEffect | Seeding in Zustand `persist` merge callback | Zustand 4+ | Avoids flash of empty state; runs synchronously during hydration |

**Deprecated / outdated:**
- `uuid` npm package for simple client-side ID generation: No longer needed — `crypto.randomUUID()` is a Web standard.
- `type="number"` for gym inputs: Replace with `type="text"` + `inputMode="decimal"`.

---

## Open Questions

1. **Seed exercises: should isCustom=true exercises show a different visual indicator?**
   - What we know: `isCustom: boolean` is on the Exercise type. The requirements do not specify visual differentiation.
   - What's unclear: Whether a "custom" badge or icon adds value in this phase.
   - Recommendation: Defer visual differentiation to Phase 4 polish. For Phase 2, treat all exercises identically in the list UI. The `isCustom` flag is data — useful for Phase 3 filtering if added later.

2. **Should removed exercises be recoverable (soft delete vs hard delete)?**
   - What we know: EXER-02 says "user can remove" — no mention of restore. Soft delete (hide flag) would allow re-enabling from settings.
   - What's unclear: Whether a "reset to defaults" feature is desired.
   - Recommendation: Hard delete (filter from array) for Phase 2. Aligns with the minimum viable requirement. A "reset exercises" option is a natural Phase 4 enhancement if users want it.

3. **Exercise list scroll order: alphabetical vs. insertion order?**
   - What we know: Zustand stores exercises as an array. Seed data can be written in any order. Custom exercises are appended.
   - What's unclear: Whether users expect alpha sort or the order they added exercises.
   - Recommendation: Render in insertion order (array order) for Phase 2 — simpler, predictable, no sorting logic. Seed data should be pre-sorted alphabetically so the initial list feels organized. Phase 3/4 can add sort controls if needed.

---

## Sources

### Primary (HIGH confidence)

- Existing codebase — `src/store/store.ts`, `src/store/types.ts`, `src/App.tsx`, `src/lib/storage.ts` — direct inspection confirms current store shape, available actions, and Phase 1 deliverables
- Zustand persist middleware docs — https://zustand.docs.pmnd.rs/reference/middlewares/persist — `merge` callback behavior for initial state augmentation
- MDN: inputmode attribute — https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode — `decimal` value triggers numeric keyboard on iOS/Android
- MDN: Crypto.randomUUID() — https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID — browser-native UUID generation, availability
- Phase 1 RESEARCH.md — `.planning/phases/01-foundation/01-RESEARCH.md` — confirmed store shape, installed versions, architecture decisions
- Project REQUIREMENTS.md — `.planning/REQUIREMENTS.md` — EXER-01 through EXER-04 verbatim
- Project STATE.md — `.planning/STATE.md` — confirmed seed list is a Phase 2 authoring task, schemaVersion watch item

### Secondary (MEDIUM confidence)

- Project SUMMARY.md — `.planning/research/SUMMARY.md` — architecture recommendation (seed in static array, load on first launch), touch-target pitfall documentation
- NNG Touch Target Size — https://www.nngroup.com/articles/touch-target-size/ — 48px minimum for gym one-handed use

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all installed packages confirmed from package.json; no new packages needed; store shape confirmed from source files
- Architecture: HIGH — Zustand persist merge callback pattern verified against official docs; seed loading approach is standard; all patterns derived from existing codebase
- Pitfalls: HIGH — virtual keyboard pitfall documented in Phase 1 research summary with verified fix; other pitfalls are well-known React/HTML patterns

**Research date:** 2026-03-25
**Valid until:** 2026-06-25 (90 days — stable stack, no fast-moving dependencies)
