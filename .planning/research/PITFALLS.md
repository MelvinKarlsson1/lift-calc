# Pitfalls Research

**Domain:** Mobile-first single-page web app, local storage persistence, gym/fitness tool
**Researched:** 2026-03-25
**Confidence:** HIGH (core pitfalls well-documented, verified across multiple sources)

---

## Critical Pitfalls

### Pitfall 1: localStorage Throws in Safari Private Browsing

**What goes wrong:**
Safari in private browsing mode exposes `localStorage` as if it exists, but any call to `setItem` throws a `QuotaExceededError`. The app crashes silently or shows a blank screen the first time a user tries to save a 1RM or custom exercise.

**Why it happens:**
Private browsing assigns a quota of 0 bytes to `localStorage`. Developers test in normal browser mode, never catch this, and ship without a `try/catch` wrapper around storage writes.

**How to avoid:**
Wrap every `localStorage.setItem` in a try/catch. Write a single `storage.ts` abstraction module that all reads/writes go through. Detect availability at startup with a sentinel write and show a graceful warning if storage is unavailable.

```js
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn('Storage unavailable:', e);
    return false;
  }
}
```

**Warning signs:**
- No `try/catch` anywhere around `localStorage` calls
- Storage operations scattered across components rather than centralized
- No startup storage availability check

**Phase to address:**
Foundation phase (first phase of development) — the storage abstraction layer must be built before any feature that persists data.

---

### Pitfall 2: 100vh Cuts Off Content on iOS Safari

**What goes wrong:**
Setting `height: 100vh` on the app shell causes the bottom portion to be obscured by Safari's address bar and bottom toolbar. Buttons, calculated weight output, and percentage sliders in the lower area become unreachable or clipped. This is the most reported mobile web app layout bug.

**Why it happens:**
iOS Safari does not subtract its own UI chrome from `100vh`. The browser calculates `100vh` as the full screen height, then renders its toolbar on top of the app content. Developers who test on desktop or Android miss this entirely.

**How to avoid:**
Use `100dvh` (dynamic viewport height) instead of `100vh` everywhere. Add `-webkit-fill-available` as a fallback for older iOS versions:

```css
html { height: -webkit-fill-available; }
body { min-height: 100vh; min-height: 100dvh; }
```

Test on a real iPhone in Safari before any layout is considered done.

**Warning signs:**
- `100vh` used anywhere in CSS without `dvh` fallback
- Fixed bottom navigation bars or action buttons near the bottom of the screen
- Layout not tested on an actual iOS device with Safari

**Phase to address:**
Foundation phase — establish the viewport/layout shell correctly from the start. Retrofitting this after feature work is expensive.

---

### Pitfall 3: Virtual Keyboard Obscures Active Input Fields

**What goes wrong:**
When the user taps a weight input field (e.g., entering a 1RM), the virtual keyboard pops up and covers the input. The field scrolls out of view or the user cannot see what they are typing. On iOS Safari this is compounded by the viewport not resizing correctly.

**Why it happens:**
Browsers handle virtual keyboard display inconsistently. Safari does not shrink the layout viewport when the keyboard appears. Fixed-position elements (like a sticky header) also misbehave. `vh`-based layouts collapse unexpectedly.

**How to avoid:**
- Avoid fixed-position elements that interfere with scroll when keyboard is open
- Use `dvh` units rather than `vh`
- For iOS, use the `VisualViewport` API to detect keyboard appearance and scroll the focused element into view
- Place numeric inputs with sufficient screen space above the fold
- Use `inputmode="decimal"` on weight inputs to trigger a numeric keyboard without the alphabetic layout

**Warning signs:**
- Number inputs placed at the bottom of a long form
- `position: fixed` used for action areas without keyboard-open testing
- No use of `inputmode` or `type="number"` on weight fields

**Phase to address:**
Foundation phase for layout shell; weight input phase for the `inputmode` and scroll-into-view specifics.

---

### Pitfall 4: No Data Schema Version — Silent Corruption After Updates

**What goes wrong:**
The app ships with a data structure in localStorage (e.g., `{ exercises: [...], maxes: {...} }`). Later, the structure changes (e.g., exercises get an `id` field, or `maxes` moves to an array). The new code reads stale localStorage data, gets `undefined` where it expects values, and either silently produces wrong calculations or throws and breaks the whole app.

**Why it happens:**
Single-user local-only apps feel "too simple" to need migration logic. Developers add it as an afterthought after the first breaking structural change, by which point real data has already been corrupted.

**How to avoid:**
Store a `schemaVersion` integer in localStorage from day one. Write a migration runner that checks the version on startup and applies upgrade functions sequentially:

```js
const CURRENT_VERSION = 1;
const stored = JSON.parse(localStorage.getItem('lift-calc') || '{}');
if (!stored.schemaVersion || stored.schemaVersion < CURRENT_VERSION) {
  migrate(stored);
}
```

Even for v1, the pattern costs almost nothing and saves a painful rewrite later.

**Warning signs:**
- No `schemaVersion` field in the stored data shape
- Data structure changed mid-development without a migration path
- `JSON.parse` results consumed directly without shape validation

**Phase to address:**
Foundation phase — bake the version field into the initial data schema before any feature uses storage.

---

### Pitfall 5: Touch Targets Too Small for Gym Use

**What goes wrong:**
Buttons and interactive elements sized at 32px or smaller are fine on a desktop but fail badly in a gym environment: sweaty hands, gloves, one-handed use, limited attention. Users miss-tap, accidentally change percentages, or hit the wrong exercise. The app feels frustrating and gets abandoned.

**Why it happens:**
Developers size UI elements to look visually proportionate on screen rather than to be physically tappable. The problem is invisible in desktop browser dev tools.

**How to avoid:**
- Minimum touch target size: 48x48px (W3C WCAG 2.5.8), prefer 56px+ for primary actions
- Space targets at least 8px apart
- Place primary actions (the calculated weight display, percentage selector) in the bottom two-thirds of the screen — the natural thumb zone
- Make the percentage increment/decrement buttons generously large; this is the most-used control at the gym

**Warning signs:**
- Icon-only buttons smaller than 44px
- Percentage input using a text field instead of large +/- buttons or a slider
- Primary action area placed in the top third of the screen

**Phase to address:**
Core UI phase — establish a component sizing convention (CSS custom property or Tailwind config) before building interactive controls.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Scatter localStorage calls across components | Faster initial build | Hard to add error handling, migration, or swap storage backend | Never — centralize from day one |
| Hardcode exercise list as a JS array (no schema) | Simple MVP | Adding custom exercises requires data-shape redesign | Only if custom exercises are truly out of scope |
| Skip `inputmode` on number inputs | No extra work | Users get full alphabetic keyboard for weight entry | Never |
| Use `vh` instead of `dvh` | Familiar units | iOS Safari layout breaks on all users | Never on iOS-targeting apps |
| No loading/empty states | Faster to build | App looks broken on first install with no data | Acceptable in prototype, fix before real use |

---

## Integration Gotchas

This app has no external integrations. N/A.

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Parsing the full exercise list on every render | Slight jank on older phones | Parse once on app load, cache in memory | With 100+ exercises on a low-end Android |
| Writing full state to localStorage on every keystroke | Possible jank during number entry | Debounce storage writes by 300–500ms | Continuous typing in weight fields |
| Storing exercise images or large blobs in localStorage | QuotaExceededError, data loss | Keep localStorage to structured text only; never store binary | At ~5MB total storage limit |

---

## Security Mistakes

This is a single-user, no-backend, no-auth, personal tool. Security concerns are minimal. The one relevant note:

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing localStorage under a shared origin (e.g., GitHub Pages with other apps) | Another app at the same origin could read/overwrite data | Deploy to its own subdomain or path, or namespace all keys with a prefix like `lift-calc:` |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Deep search required to reach an exercise | User gives up and doesn't log | Show recently used exercises at the top; search is for discovery, not daily use |
| Percentage shown as integer only (e.g., 75%) | Can't do 72.5% for intermediate loading | Support 2.5% increments or free entry |
| Calculated weight shown in small text | User misreads weight, loads wrong plates | Make the calculated number the largest element on the screen — it's the whole point of the app |
| No visual confirmation when 1RM is saved | User taps save twice or wonders if it worked | Show a brief, non-blocking toast or state change on save |
| Exercise list with 200+ items and no grouping | Scrolling hell to find Romanian Deadlift | Group by muscle group or equipment type, plus text search |
| App requires multiple taps to change percentage during a set | User fumbles between sets | Keep percentage selector always visible for active exercises, not buried in a modal |

---

## "Looks Done But Isn't" Checklist

- [ ] **Storage persistence:** Verify data survives a full browser close and reopen — not just a page refresh
- [ ] **iOS Safari layout:** Test on a real iPhone in Safari; check that nothing is clipped by the address bar or home indicator
- [ ] **Private browsing:** Open in Safari private mode — app should show a warning, not crash
- [ ] **Numeric keyboard:** Tap a weight input on mobile — verify a numeric/decimal keyboard appears, not a full QWERTY
- [ ] **Empty state:** First install with no data — app should show a usable state, not a blank screen or JS error
- [ ] **Custom exercise persistence:** Add a custom exercise, close the browser, reopen — it should still be there
- [ ] **1RM calculation display:** Verify the calculated working weight rounds sensibly (e.g., to nearest 0.5kg or 1kg) — raw floating point output looks amateurish and is hard to act on in the gym
- [ ] **Deleted default exercise:** Remove a default exercise, close and reopen — it should remain removed

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| localStorage schema corruption | MEDIUM | Add a "Reset all data" option in settings; document that users can clear app data in browser settings |
| 100vh layout broken on iOS | LOW | Replace `vh` with `dvh` across all CSS; 30-minute fix if centralized in variables |
| Touch targets too small | MEDIUM | Audit all interactive elements and increase padding; may require layout rework |
| No storage error handling | MEDIUM | Wrap all storage calls in a centralized module; add try/catch and user-facing error message |
| Missing schema version | HIGH (after data exists) | Requires careful migration logic; real user data may be partially lost |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| localStorage throws in private browsing | Phase 1: Foundation & storage layer | Open app in Safari private browsing; confirm graceful fallback message appears |
| 100vh iOS Safari layout break | Phase 1: App shell / layout | Test on real iPhone in Safari; no clipped content |
| Virtual keyboard covers inputs | Phase 1: Layout shell + Phase 2: Weight input UI | Tap weight field on iPhone; confirm field stays visible |
| No schema version for migration | Phase 1: Data model definition | Inspect localStorage; confirm `schemaVersion` key present in stored JSON |
| Touch targets too small | Phase 2: Core UI components | Tap all controls with a gloved hand or without looking; no mis-taps |
| Search/browse UX too slow for gym use | Phase 2: Exercise list UI | Time from app open to starting weight entry — should be under 5 seconds |
| Floating point weight display | Phase 2: Calculation output | Enter 102.5kg 1RM at 72.5%; confirm display shows a clean, actionable number |

---

## Sources

- [Storage Quotas and Eviction Criteria — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [Updates to Storage Policy — WebKit Blog](https://webkit.org/blog/14403/updates-to-storage-policy/)
- [Using localStorage in Modern Applications — RxDB](https://rxdb.info/articles/localstorage.html)
- [CSS fix for 100vh in mobile WebKit — CSS-Tricks](https://css-tricks.com/css-fix-for-100vh-in-mobile-webkit/)
- [100dvh solution — HTMHell Advent Calendar 2024](https://www.htmhell.dev/adventcalendar/2024/4/)
- [Fix mobile keyboard overlap with VisualViewport — DEV Community](https://dev.to/franciscomoretti/fix-mobile-keyboard-overlap-with-visualviewport-3a4a)
- [Touch Targets on Touchscreens — Nielsen Norman Group](https://www.nngroup.com/articles/touch-target-size/)
- [Understanding WCAG 2.5.8: Target Size Minimum — W3C](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)
- [Design Mobile Apps for One-Hand Usage — Smashing Magazine](https://www.smashingmagazine.com/2020/02/design-mobile-apps-one-hand-usage/)
- [Common Mistakes to Avoid in PWA UX Design — Moldstud](https://moldstud.com/articles/p-common-mistakes-to-avoid-in-pwa-user-experience-design-enhance-your-progressive-web-app)
- [Best Fitness App Design: Typical Mistakes — MadAppGang](https://madappgang.com/blog/the-best-fitness-app-design-examples-and-typical-mistakes/)
- [PWA Best Practices — MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Best_practices)

---
*Pitfalls research for: Mobile-first weightlifting calculator (Lift Calc)*
*Researched: 2026-03-25*
