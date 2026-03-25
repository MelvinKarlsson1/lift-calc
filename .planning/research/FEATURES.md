# Feature Research

**Domain:** Mobile-friendly weightlifting percentage calculator web app
**Researched:** 2026-03-25
**Confidence:** HIGH (core features well-established by market; UX patterns verified by multiple sources)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| 1RM storage per exercise | The entire app premise — if you can't save your max, there's nothing to calculate from | LOW | Simple key/value in localStorage; one number per exercise |
| Percentage calculation | Core value prop — the reason anyone opens the app | LOW | Pure math: `weight = 1RM * (percentage / 100)` |
| Preloaded exercise list | Users expect common exercises to already be there (squat, bench, deadlift, OHP, row, etc.) | MEDIUM | Curated list of ~30–50 common barbell/dumbbell/cable movements; not exhaustive |
| Add custom exercises | Any power user has exercises the preloaded list won't cover | LOW | Free-text name + optional category; stored in localStorage |
| Remove / hide unused exercises | Cluttered lists kill mobile usability; users need a trimmed personal list | LOW | Soft-delete or hide flag; keeps the list manageable |
| Offline functionality | Gym WiFi is unreliable; if it breaks at the rack, it's useless | LOW | localStorage already handles data; static assets work offline by default |
| Mobile-friendly layout | Used on a phone, often one-handed, between sets — desktop layout fails entirely | MEDIUM | Bottom navigation, large tap targets (min 44px), thumb-zone controls |
| Display calculated weight clearly | The output (kg number) must be instantly readable — no squinting, no math | LOW | Large font, high contrast, no clutter around the result |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Multi-exercise session view | Lets you set percentages for all exercises in today's workout simultaneously and see all working weights at once — competitors typically show one exercise at a time | MEDIUM | A "session" is a temporary selected set of exercises with a percentage each; no persistence needed |
| Per-exercise percentage presets | Store a default percentage per exercise (e.g. squat is always 80%, bench is 75%) so returning to an exercise doesn't require re-entering the percentage | LOW | Single value persisted per exercise alongside the 1RM |
| Rounding to nearest practical weight | Output 82.5 kg not 82.3 kg — gyms have fixed plate denominations (1.25kg increments typically) | LOW | Simple rounding function; configurable rounding step (0.5, 1.25, 2.5 kg) |
| Immediate feedback on 1RM input | When user updates their max, the calculated weight updates inline in real time — no submit button | LOW | Reactive binding; standard in modern web frameworks |
| Dark mode / gym-optimized display | Gyms are often bright fluorescent or dimly lit; dark mode reduces glare in both environments | LOW | CSS custom properties + prefers-color-scheme media query |
| Search/filter the exercise list | With 30–50 exercises, scrolling to find one is slow between sets; a search input cuts navigation to 1–2 taps | LOW | Client-side filter on exercise name; no backend needed |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Workout history / logging | "While I'm here, I'll log my sets" — natural scope creep from a calculator | Doubles the complexity and turns a fast calculator into a tracker; fundamentally different UX job | Stay focused: this app tells you what weight to use, not what you did. Keep a separate log app (Strong, Hevy) |
| Plate calculator (which plates to load) | Useful for beginners who can't do mental plate math | Different mental model — requires knowing available plates inventory per gym, bar weight, collar weight; complex edge cases | Show the target weight clearly. The user can figure out the plates. Plate calculators are a separate app (RackMath) |
| Rep/set tracking during workout | Seems adjacent to weight calculation | Again a fundamentally different tool — a workout tracker — with complex state management, timers, history | Use Strong or Hevy for that; this is a calculator |
| Cloud sync / user accounts | "What if I switch phones?" | Adds auth, backend, sessions, privacy concerns, cost — kills the "simple personal tool" premise entirely | localStorage export/import as JSON is a simpler escape hatch if needed |
| Multiple units (lbs + kg) | Many apps support both | Adds UI surface area, conversion logic, and copy; Melvin uses kg only — this is a personal tool | kg only; no unit toggle |
| RPE (Rate of Perceived Exertion) input | Used in advanced programming (RIR, RPE-based percentages) | Requires understanding of Autoregulatory training concepts; adds a second input mode that complicates the UI for a beginner/intermediate use case | Percentage-only for v1; RPE can be added later if ever needed |
| 1RM estimation from reps x weight (Epley/Brzycki) | Useful if you don't know your true 1RM | Feature discovery is poor — users don't expect it in a "calculator" app; adds a secondary calculator that requires explanation | If added later, make it a separate "Estimate 1RM" screen; don't mix it with the main flow |
| Social / strength standards comparison | "How do I compare to others?" | Entirely different product — requires user data, backend, benchmarks by bodyweight/gender/age | Use Strength Level for that |

---

## Feature Dependencies

```
[Exercise List]
    └──requires──> [Add/Remove Custom Exercise]
                       (no functional dep, but UX dep — preloaded list alone feels rigid)

[Percentage Calculator]
    └──requires──> [1RM Storage]
                       └──requires──> [Exercise List]

[Session View]
    └──requires──> [Percentage Calculator]
    └──requires──> [Exercise List]
    └──enhances──> [Per-Exercise Percentage Presets]

[Rounding to Practical Weight]
    └──enhances──> [Percentage Calculator]

[Search/Filter]
    └──enhances──> [Exercise List]

[Dark Mode]
    └──enhances──> [Mobile UX] (independent of all data features)
```

### Dependency Notes

- **Percentage Calculator requires 1RM Storage:** Without a stored max, the user must re-enter it every session — that's a different (worse) UX pattern and makes the app feel stateless.
- **Session View requires Exercise List + Percentage Calculator:** It's a composition of those two features into a simultaneous view. Build them independently first.
- **Per-Exercise Percentage Presets enhances Session View:** Presets make the session view load faster (no re-entry required), but the session view works fine without them.
- **Add/Remove Custom Exercise depends on Exercise List existing first:** Customization is layered on top of defaults; build the defaults first.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the core loop.

- [ ] Preloaded exercise list (~30–50 common movements, filterable) — without this, user must build from scratch which kills first-use experience
- [ ] Add custom exercises — preloaded list will always have gaps; critical for personal use
- [ ] Remove/hide exercises — a cluttered list destroys mobile usability
- [ ] Store 1RM per exercise in localStorage — data must persist between sessions
- [ ] Calculate and display working weight at a given percentage — the core value prop
- [ ] Mobile-friendly layout with large tap targets and bottom-accessible controls — the app is used at the gym on a phone

### Add After Validation (v1.x)

Features to add once core loop is proven useful.

- [ ] Per-exercise percentage presets — trigger: user reports re-entering percentage every session is tedious
- [ ] Session view (multiple exercises + percentages at once) — trigger: user wants to reference all of today's working weights simultaneously
- [ ] Weight rounding to nearest 1.25 kg increment — trigger: user reports calculated weight isn't directly achievable with available plates
- [ ] Search/filter exercise list — trigger: exercise list grows large enough that scrolling becomes slow

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Dark mode — low priority since this is a personal tool; browser/OS dark mode already helps
- [ ] PWA installability (add to home screen manifest) — useful for gym use but adds build step complexity; defer until core is solid
- [ ] JSON export of exercise list + 1RM data — a backup escape hatch; not critical at v1 since it's a single-user personal tool

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| 1RM storage per exercise | HIGH | LOW | P1 |
| Percentage calculation + display | HIGH | LOW | P1 |
| Preloaded exercise list | HIGH | MEDIUM | P1 |
| Mobile-friendly layout | HIGH | MEDIUM | P1 |
| Add custom exercises | HIGH | LOW | P1 |
| Remove/hide exercises | MEDIUM | LOW | P1 |
| Offline functionality | HIGH | LOW | P1 (free with localStorage + static hosting) |
| Search/filter exercise list | MEDIUM | LOW | P2 |
| Per-exercise percentage presets | MEDIUM | LOW | P2 |
| Session view (multi-exercise) | HIGH | MEDIUM | P2 |
| Weight rounding to nearest increment | MEDIUM | LOW | P2 |
| Dark mode | LOW | LOW | P3 |
| PWA installability | MEDIUM | MEDIUM | P3 |
| JSON data export | LOW | LOW | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | Strength Level | 1RM Calculator (MaxLift) | RackMath | Our Approach |
|---------|---------------|--------------------------|----------|--------------|
| Preloaded exercises | Limited (big lifts only) | Yes, basic list | Barbell-focused | Broad list: barbell, dumbbell, cable, machine |
| Custom exercises | No | Yes | Limited | Yes — full add/remove |
| Percentage calculation | % chart output | Yes | Yes (5/3/1 focused) | Yes — interactive, per exercise |
| Store 1RM | No (session only) | Yes | Yes | Yes — localStorage |
| Session/workout view | No | No | No | Yes (P2 differentiator) |
| Plate calculator | No | Some versions | Core feature | Deliberately excluded — scope creep |
| Mobile UX | OK | App (native) | App (native) | PWA-quality mobile web, thumb-zone design |
| Offline | Yes (static) | Yes (native) | Yes (native) | Yes — localStorage + static |
| Unit support | lbs + kg | lbs + kg | lbs + kg | kg only (personal tool) |
| Auth / accounts | Yes | Yes | Yes | Deliberately excluded |

---

## Sources

- [Strength Level](https://strengthlevel.com/) — feature analysis, exercise scope
- [StrengthLog 1RM Calculator](https://www.strengthlog.com/1rm-calculator/) — formula approaches (Epley, Brzycki)
- [MaxLift 1RM Calculator (App Store)](https://apps.apple.com/us/app/maxlift-1rm-calculator/id6447921919) — mobile app feature set
- [RackMath Barbell Calculator (App Store)](https://apps.apple.com/us/app/rackmath-barbell-calculator/id1095054017) — plate calculator scope analysis
- [1RM Percentage Calculator (App Store)](https://apps.apple.com/us/app/1rm-percentage-calculator/id6451496905) — % table UX
- [Setgraph: Best App for Tracking Workouts](https://setgraph.app/ai-blog/best-app-for-tracking-workouts) — competitive overview, offline requirement
- [Smashing Magazine: Design Mobile Apps for One-Hand Usage](https://www.smashingmagazine.com/2020/02/design-mobile-apps-one-hand-usage/) — thumb-zone UX patterns
- [Stormotion: Fitness App UX](https://stormotion.io/blog/fitness-app-ux/) — mobile fitness UX best practices
- [Liftosaur](https://www.liftosaur.com/) — workout session patterns, % of 1RM UX
- [WeightLifted (App Store)](https://apps.apple.com/us/app/weightlifted/id6478405595) — multi-tool weightlifting app scope

---
*Feature research for: weightlifting percentage calculator (mobile web app)*
*Researched: 2026-03-25*
