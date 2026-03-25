// src/data/seedExercises.ts
// Static seed list of common weightlifting exercises.
// Loaded into the store on first launch (when exercises array is empty at hydration).

import type { Exercise } from '../store/types'

export const SEED_EXERCISES: Exercise[] = [
  // Barbell compound
  { id: 'barbell-row',         name: 'Barbell Row',               isCustom: false },
  { id: 'bench-press',         name: 'Bench Press',               isCustom: false },
  { id: 'box-squat',           name: 'Box Squat',                 isCustom: false },
  { id: 'close-grip-bench',    name: 'Close-Grip Bench Press',    isCustom: false },
  { id: 'deadlift',            name: 'Deadlift',                  isCustom: false },
  { id: 'deficit-deadlift',    name: 'Deficit Deadlift',          isCustom: false },
  { id: 'floor-press',         name: 'Floor Press',               isCustom: false },
  { id: 'front-squat',         name: 'Front Squat',               isCustom: false },
  { id: 'good-morning',        name: 'Good Morning',              isCustom: false },
  { id: 'hang-clean',          name: 'Hang Clean',                isCustom: false },
  { id: 'hip-thrust',          name: 'Hip Thrust',                isCustom: false },
  { id: 'incline-bench-press', name: 'Incline Bench Press',       isCustom: false },
  { id: 'low-bar-squat',       name: 'Low Bar Squat',             isCustom: false },
  { id: 'overhead-press',      name: 'Overhead Press',            isCustom: false },
  { id: 'paused-squat',        name: 'Paused Squat',              isCustom: false },
  { id: 'pendlay-row',         name: 'Pendlay Row',               isCustom: false },
  { id: 'power-clean',         name: 'Power Clean',               isCustom: false },
  { id: 'push-press',          name: 'Push Press',                isCustom: false },
  { id: 'romanian-deadlift',   name: 'Romanian Deadlift',         isCustom: false },
  { id: 'squat',               name: 'Squat',                     isCustom: false },
  { id: 'sumo-deadlift',       name: 'Sumo Deadlift',             isCustom: false },
  { id: 'trap-bar-deadlift',   name: 'Trap Bar Deadlift',         isCustom: false },
  { id: 'zercher-squat',       name: 'Zercher Squat',             isCustom: false },
  // Dumbbell
  { id: 'dumbbell-curl',       name: 'Dumbbell Curl',             isCustom: false },
  { id: 'dumbbell-fly',        name: 'Dumbbell Fly',              isCustom: false },
  { id: 'dumbbell-lateral-raise',   name: 'Dumbbell Lateral Raise',    isCustom: false },
  { id: 'dumbbell-press',      name: 'Dumbbell Press',            isCustom: false },
  { id: 'dumbbell-row',        name: 'Dumbbell Row',              isCustom: false },
  { id: 'dumbbell-shoulder-press', name: 'Dumbbell Shoulder Press', isCustom: false },
  { id: 'goblet-squat',        name: 'Goblet Squat',              isCustom: false },
  { id: 'incline-dumbbell-press', name: 'Incline Dumbbell Press', isCustom: false },
  { id: 'romanian-deadlift-db', name: 'Romanian Deadlift (DB)',   isCustom: false },
  // Cable / Machine
  { id: 'cable-fly',           name: 'Cable Fly',                 isCustom: false },
  { id: 'cable-row',           name: 'Cable Row',                 isCustom: false },
  { id: 'face-pull',           name: 'Face Pull',                 isCustom: false },
  { id: 'lat-pulldown',        name: 'Lat Pulldown',              isCustom: false },
  { id: 'leg-curl',            name: 'Leg Curl',                  isCustom: false },
  { id: 'leg-extension',       name: 'Leg Extension',             isCustom: false },
  { id: 'leg-press',           name: 'Leg Press',                 isCustom: false },
  { id: 'tricep-pushdown',     name: 'Tricep Pushdown',           isCustom: false },
  // Bodyweight / loaded
  { id: 'chin-up',             name: 'Chin-Up',                   isCustom: false },
  { id: 'dip',                 name: 'Dip',                       isCustom: false },
  { id: 'pull-up',             name: 'Pull-Up',                   isCustom: false },
  { id: 'push-up',             name: 'Push-Up',                   isCustom: false },
]
