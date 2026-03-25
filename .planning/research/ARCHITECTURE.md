# Architecture Research

**Domain:** Mobile-first single-page calculator web app with local storage
**Researched:** 2026-03-25
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
├──────────────────────┬──────────────────┬───────────────────┤
│  ExerciseList        │  SessionView     │  SettingsView     │
│  (browse/search/add) │  (active workout)│  (manage 1RM)     │
│                      │                  │                   │
│  ExerciseCard        │  WorkoutSlot     │  ExerciseEditor   │
│  SearchBar           │  PercentSlider   │  WeightInput      │
└──────────┬───────────┴────────┬─────────┴─────────┬─────────┘
           │                   │                   │
           ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                     State / Logic Layer                      │
├─────────────────────────────────────────────────────────────┤
│  AppState (in-memory object, single source of truth)        │
│   - exercises[]     (id, name, category, isDefault)         │
│   - maxWeights{}    (exerciseId -> kg)                       │
│   - session[]       (selected exercises + chosen %)         │
│   - ui{}            (activeView, searchQuery, etc.)         │
├─────────────────────────────────────────────────────────────┤
│  Calculator (pure function)                                  │
│   workingWeight = maxWeight * (percentage / 100)            │
│   → rounds to nearest 0.5 kg                                │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Persistence Layer                         │
├─────────────────────────────────────────────────────────────┤
│  StorageService                                             │
│   - load()  → reads localStorage, hydrates AppState        │
│   - save()  → serializes AppState to localStorage          │
│   - key: "lift-calc-v1"                                     │
│                                                             │
│  Default Exercise Seed (bundled static data)                │
│   - loaded once on first launch if storage is empty        │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| AppState | Single source of truth for all data | Plain JS object, module-level singleton |
| StorageService | Read/write localStorage, hydrate state on load | Module with load() and save() functions |
| Calculator | Pure math — working weight from max + percentage | Pure function, no side effects |
| ExerciseList | Display, search, and filter exercises | Renders from AppState.exercises |
| ExerciseEditor | Add custom exercise, set/edit 1RM | Form that dispatches state updates |
| SessionView | Active workout — select exercises, pick %, see result | Reads session[], writes session[] |
| WorkoutSlot | One exercise in a session — shows % slider and result | Child of SessionView |
| Default Seed | Bundled list of common exercises (compounds, isolation) | Static JS array, loaded once |

## Recommended Project Structure

```
lift-calc/
├── index.html            # App shell, single HTML entry point
├── style.css             # Global styles, mobile-first CSS
├── src/
│   ├── main.js           # App boot: load storage, mount views, bind events
│   ├── state.js          # AppState object, state mutation functions
│   ├── storage.js        # StorageService: load() / save() / clear()
│   ├── calculator.js     # Pure calculation functions (workingWeight, round)
│   ├── seed.js           # Default exercise list (static data)
│   ├── views/
│   │   ├── exerciseList.js   # Browse/search/add exercises view
│   │   ├── sessionView.js    # Active workout view
│   │   └── settingsView.js   # Manage 1RM per exercise
│   └── components/
│       ├── exerciseCard.js   # Reusable exercise display card
│       ├── workoutSlot.js    # Single exercise in session (% + result)
│       └── searchBar.js      # Search input with filtering logic
```

### Structure Rationale

- **src/state.js:** Centralizing state mutations here prevents scattered localStorage calls and makes the data flow easy to trace.
- **src/storage.js:** Isolating persistence means the rest of the app works with plain JS objects; swapping storage backends later requires changing only this file.
- **src/calculator.js:** Pure functions are trivially testable and have no side effects — keep math separate from DOM code.
- **src/seed.js:** Static data lives in its own file so it can be updated independently of logic.
- **src/views/ vs src/components/:** Views own a full screen; components are reusable pieces within views. This split prevents views from becoming monolithic.

## Architectural Patterns

### Pattern 1: Single State Object + Re-render

**What:** All application data lives in one plain JS object (`AppState`). Every user action mutates that object, then triggers a targeted DOM update (or full re-render of the affected view).
**When to use:** Small to medium apps where full React/Vue is overkill. This app qualifies — single user, limited data, no server.
**Trade-offs:** Simple to reason about, zero dependencies. Manual DOM diffing becomes tedious at scale, but this app won't reach that scale.

**Example:**
```javascript
// state.js
export const state = {
  exercises: [],
  maxWeights: {},
  session: [],
  ui: { activeView: 'exercises', searchQuery: '' }
}

export function setMaxWeight(exerciseId, kg) {
  state.maxWeights[exerciseId] = kg
  storage.save(state)
  renderSettingsView()  // targeted re-render
}
```

### Pattern 2: Persistence on Every Mutation (Write-Through)

**What:** Every state mutation function calls `storage.save()` before returning. The app never has unsaved state.
**When to use:** Single-user apps where data loss (phone lock, tab close) would be frustrating. Gym context makes this critical — losing your 1RM mid-session is bad UX.
**Trade-offs:** Slightly more writes to localStorage, but localStorage writes are synchronous and fast for this data volume (a few KB at most). No "save button" needed.

**Example:**
```javascript
// storage.js
const KEY = 'lift-calc-v1'

export function save(state) {
  localStorage.setItem(KEY, JSON.stringify({
    exercises: state.exercises,
    maxWeights: state.maxWeights
    // session is intentionally NOT persisted — starts fresh each visit
  }))
}

export function load() {
  const raw = localStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : null
}
```

### Pattern 3: Seed + Override for Exercise List

**What:** Ship a bundled default exercise list (seed.js). On first load, populate storage from the seed. User mutations (delete, add custom) layer on top. Never overwrite user changes with seed data.
**When to use:** Apps with a useful starting dataset where users customize over time. Exercises list is exactly this.
**Trade-offs:** Must version the seed carefully — a schema change requires a migration strategy (see Pitfalls).

## Data Flow

### Request Flow

```
User Action (e.g., sets percentage slider to 80%)
    ↓
WorkoutSlot event handler
    ↓
state.setSessionPercentage(exerciseId, 80)
    ├── mutates state.session
    ├── calls storage.save(state)  [persists exercises + maxWeights, not session]
    └── calls renderWorkoutSlot(exerciseId)  [targeted DOM update]
        ↓
calculator.workingWeight(state.maxWeights[id], 80)
        ↓
Display result: "96 kg"
```

### State Management

```
AppState (module singleton)
    ↓ read
Views + Components ──→ mutation functions (state.js) ──→ AppState
                                  ↓
                           storage.save()
                                  ↓
                           localStorage
```

### Key Data Flows

1. **App boot:** `storage.load()` → hydrates `AppState` (or seeds from seed.js if empty) → `renderActiveView()`
2. **Set 1RM:** User enters weight in ExerciseEditor → `state.setMaxWeight(id, kg)` → `storage.save()` → re-render SessionView slots (if exercise is in session)
3. **Workout calculation:** User moves % slider → `state.setSessionPercentage(id, pct)` → `calculator.workingWeight()` → update slot DOM
4. **Add custom exercise:** User submits form → `state.addExercise(name, category)` → `storage.save()` → re-render ExerciseList
5. **Delete exercise:** `state.removeExercise(id)` → removes from `exercises` and `maxWeights` and `session` → `storage.save()` → re-render

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Single user (this app) | Plain JS object state, localStorage, no build tooling required |
| Multi-user (not in scope) | Would need backend + auth + per-user storage — full architecture change |
| More exercise data | Static seed is fine up to thousands of exercises; filter/search is client-side |

### Scaling Priorities

1. **First bottleneck:** Search/filter performance if exercise list grows very large — solve with simple client-side fuzzy filter before reaching for Fuse.js.
2. **Second bottleneck:** localStorage 5MB cap — not a real concern here (exercise data is a few KB max).

## Anti-Patterns

### Anti-Pattern 1: Storing Session State in localStorage

**What people do:** Persist the active workout session (selected exercises, chosen percentages) to localStorage so it survives page reloads.
**Why it's wrong:** The session represents a transient, in-progress workout. Persisting it creates stale-session problems: user opens the app two days later and sees last week's session, which is confusing. This is a calculator, not a log.
**Do this instead:** Keep session in memory only. Load it as an empty array on every app boot. Persist only exercises and maxWeights.

### Anti-Pattern 2: Direct localStorage Calls Scattered Across Components

**What people do:** Call `localStorage.setItem(...)` directly inside UI components wherever data changes.
**Why it's wrong:** Storage logic becomes scattered, keys are duplicated, serialization errors appear in random places, and changing the storage schema requires finding every call site.
**Do this instead:** All localStorage access goes through `storage.js` exclusively. Components call state mutation functions, which call storage.save(). One file owns the persistence contract.

### Anti-Pattern 3: Re-rendering the Entire DOM on Every State Change

**What people do:** On any state change, wipe `document.body.innerHTML` and re-render everything from scratch.
**Why it's wrong:** Causes jarring visual resets, loses input focus, resets scroll position, and feels slow on mobile even for a small app.
**Do this instead:** Targeted re-renders — update only the DOM nodes that changed. For this app, each view has its own render function and each WorkoutSlot can re-render independently when its percentage or max weight changes.

### Anti-Pattern 4: No Schema Version on localStorage Key

**What people do:** Store data under a generic key like `"lift-calc"` with no version.
**Why it's wrong:** When the data shape changes (e.g., adding a `category` field to exercises), the app silently loads stale data and breaks or shows wrong values.
**Do this instead:** Key the storage with a version: `"lift-calc-v1"`. When the schema changes, bump to `"lift-calc-v2"` and write a one-time migration that reads v1, transforms it, writes v2.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| None | — | This app is fully offline, no external calls |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Views ↔ AppState | Direct import + function calls | Views read state, call mutation functions from state.js |
| state.js ↔ storage.js | Direct import | state.js calls storage.save() after every mutation |
| Views ↔ Calculator | Direct import | Views call calculator.workingWeight() for display, no state side effects |
| state.js ↔ seed.js | Direct import, one-time load | Seed is read during app boot only if storage is empty |

## Build Order Implications

Dependencies between components determine a natural build sequence:

1. **calculator.js** — Pure function, no dependencies. Build and verify math first.
2. **seed.js** — Static data, no dependencies. Can be authored in parallel with calculator.
3. **storage.js** — Depends only on the data schema design. Build after schema is stable.
4. **state.js** — Depends on storage.js and seed.js. All mutation logic lives here.
5. **index.html + style.css** — App shell and mobile layout. Can be roughed in early.
6. **ExerciseList view** — First real UI. Depends on state.js. Browse/search exercises.
7. **ExerciseEditor** — Depends on ExerciseList being rendered. Add/edit/delete + set 1RM.
8. **SessionView + WorkoutSlot** — Depends on state having exercises with maxWeights. The core calculator UX.
9. **Polish** — Transitions, loading states, empty states, PWA manifest.

## Sources

- [Frontend Masters: Vanilla JS TodoMVC Architecture](https://frontendmasters.com/blog/vanilla-javascript-todomvc/)
- [Frontend Masters: Architecture Through Component Colocation](https://frontendmasters.com/blog/architecture-through-component-colocation/)
- [MDN: Client-side Storage](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Client-side_storage)
- [MDN: Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [RxDB: Using localStorage in Modern Applications](https://rxdb.info/articles/localstorage.html)
- [love2dev: Use Local Storage to Make Your SPA Rock](https://love2dev.com/blog/use-local-storage-to-make-your-single-page-web-application-rock/)
- [The Vanilla JavaScript Component Pattern — DEV Community](https://dev.to/megazear7/the-vanilla-javascript-component-pattern-37la)

---
*Architecture research for: Mobile-first weightlifting calculator web app (Lift Calc)*
*Researched: 2026-03-25*
