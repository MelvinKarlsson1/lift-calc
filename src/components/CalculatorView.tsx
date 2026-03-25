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
    <div className="flex flex-col h-[100dvh] bg-white text-gray-900">

      {/* Header — exercise name + back button */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-3">
        <button
          onClick={onBack}
          aria-label="Back to exercise list"
          className="text-gray-500 hover:text-gray-900 min-h-12 min-w-12 flex items-center justify-center text-xl"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-gray-900 truncate flex-1">
          {exercise?.name ?? 'Exercise'}
        </h1>
      </div>

      {/* Result area — flex-1 so it grows to push controls to bottom (UX-01 thumb zone) */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {result !== null ? (
          <p className="text-7xl font-black text-gray-900 tabular-nums">
            {result}{' '}
            <span className="text-3xl font-normal text-gray-400">kg</span>
          </p>
        ) : oneRepMax != null ? (
          <p className="text-gray-400 text-lg">Select a percentage</p>
        ) : (
          <p className="text-gray-400 text-lg text-center">
            No 1RM set.{'\n'}Enter one in the exercise list.
          </p>
        )}
      </div>

      {/* Controls — pinned at bottom via flex column order, not fixed position */}
      <div className="px-4 py-4 border-t border-gray-200 flex flex-col gap-3">

        {/* Preset percentage buttons (CALC-02) — 5 buttons in a row */}
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
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                }`}
            >
              {preset}%
            </button>
          ))}
        </div>

        {/* Manual percentage input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="decimal"
            pattern="[0-9]*\.?[0-9]*"
            value={customInput}
            onChange={(e) => handleCustomInput(e.target.value)}
            placeholder="Custom %"
            aria-label="Custom percentage"
            className="flex-1 bg-white text-gray-900 border border-gray-300 rounded px-3 py-3 min-h-12 placeholder:text-gray-400 text-center"
          />
          <span className="text-gray-400 text-sm w-4">%</span>
        </div>
      </div>
    </div>
  )
}
