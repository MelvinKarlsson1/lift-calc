// src/components/CalculatorView.tsx
// Calculator screen: select percentage, see working weight for chosen exercise.
// Layout mirrors ExerciseList: flex flex-col h-[100dvh] — NO position:fixed elements.
// Per research anti-patterns: no fixed positioning (virtual keyboard pitfall), no raw float output.

import { useState } from 'react'
import { useAppStore } from '../store/store'
import { calcWorkingWeight } from '../lib/calculator'

// Preset percentages per CALC-02: 70, 80, 85, 90, 95
const PRESETS = [70, 80, 85, 90, 95]

interface CalculatorViewProps {
  exerciseId: string
  onBack: () => void
}

export function CalculatorView({ exerciseId, onBack }: CalculatorViewProps) {
  const exercises = useAppStore((s) => s.exercises)
  const maxWeights = useAppStore((s) => s.maxWeights)
  const [percentage, setPercentage] = useState<number | null>(null)
  const [customInput, setCustomInput] = useState('')

  const exercise = exercises.find((e) => e.id === exerciseId)
  const oneRepMax = maxWeights[exerciseId] ?? null

  // Calculate result only when both 1RM and percentage are available (CALC-01, CALC-03)
  const result =
    oneRepMax != null && percentage != null
      ? calcWorkingWeight(oneRepMax, percentage)
      : null

  function handlePreset(preset: number) {
    setPercentage(preset)
    setCustomInput(String(preset))
  }

  function handleCustomInput(value: string) {
    setCustomInput(value)
    const parsed = parseFloat(value)
    if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
      setPercentage(parsed)
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-950 text-white">

      {/* Header — exercise name + back button */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-3">
        <button
          onClick={onBack}
          aria-label="Back to exercise list"
          className="text-gray-400 hover:text-white min-h-12 min-w-12 flex items-center justify-center text-xl"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-white truncate flex-1">
          {exercise?.name ?? 'Exercise'}
        </h1>
      </div>

      {/* Result area — flex-1 so it grows to push controls to bottom (UX-01 thumb zone) */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {result !== null ? (
          // Per research: text-7xl minimum, tabular-nums for stable number width
          <p className="text-7xl font-black text-white tabular-nums">
            {result}{' '}
            <span className="text-3xl font-normal text-gray-400">kg</span>
          </p>
        ) : oneRepMax != null ? (
          // 1RM set but no percentage chosen yet (Pitfall 3 fix)
          <p className="text-gray-500 text-lg">Select a percentage</p>
        ) : (
          // No 1RM set — guide user back to exercise list (Pitfall 2 fix)
          <p className="text-gray-500 text-lg text-center">
            No 1RM set.{'\n'}Enter one in the exercise list.
          </p>
        )}
      </div>

      {/* Controls — pinned at bottom via flex column order, not fixed position */}
      {/* Per research anti-pattern: do NOT use position:fixed here */}
      <div className="px-4 py-4 border-t border-gray-800 flex flex-col gap-3">

        {/* Preset percentage buttons (CALC-02) — 5 buttons in a row */}
        {/* min-h-14 = 56px tap target per UX-01 and research Pitfall 4 */}
        <div className="flex gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => handlePreset(preset)}
              aria-label={`${preset} percent`}
              aria-pressed={percentage === preset}
              className={`flex-1 min-h-14 rounded-lg font-bold text-base
                ${percentage === preset
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 active:bg-gray-700'
                }`}
            >
              {preset}%
            </button>
          ))}
        </div>

        {/* Manual percentage input (CALC-01) — same inputMode pattern as ExerciseRow */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="decimal"
            pattern="[0-9]*\.?[0-9]*"
            value={customInput}
            onChange={(e) => handleCustomInput(e.target.value)}
            placeholder="Custom %"
            aria-label="Custom percentage"
            className="flex-1 bg-gray-800 text-white rounded px-3 py-3 min-h-12 placeholder:text-gray-500 text-center"
          />
          <span className="text-gray-400 text-sm w-4">%</span>
        </div>
      </div>
    </div>
  )
}
