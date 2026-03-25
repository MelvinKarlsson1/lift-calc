# Lift Calc

A mobile-friendly web app for tracking 1RM weights and calculating working weights at any percentage of your max.

Built for personal use at the gym — no backend, no accounts, no complexity.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 on mobile or desktop.

## Stack

- React 19 + Vite 7 + TypeScript
- Tailwind CSS v4 (Vite plugin — no PostCSS)
- Zustand 5 with persist middleware (localStorage)

## What This Is

Enter your one-rep max (1RM) for each exercise. Pick a percentage. See the exact weight to load.

Data lives in your browser's localStorage — nothing leaves your device.

## Notes

- Vite is pinned to 7.3.1 (vite-plugin-pwa peer dep constraint — see `.planning/STATE.md`)
- iOS Safari viewport bug prevented from day one via `100dvh` + `-webkit-fill-available`
- localStorage schema is versioned (`schemaVersion: 1`) for safe future migrations
