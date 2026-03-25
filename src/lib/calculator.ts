// src/lib/calculator.ts
// Pure function — no side effects, no imports.
// ROUNDING_STEP is 2.5 kg per REQUIREMENTS.md CALC-03 and STATE.md decisions.
// Do NOT expose ROUNDING_STEP as a user setting (per STATE.md: revisit only if finer control is requested).

const ROUNDING_STEP = 2.5 // kg, hardcoded per CALC-03

/**
 * Calculate working weight from a one-rep max and a percentage.
 * Returns 0 for any invalid input (missing 1RM, zero percentage, negative values).
 * Result is always rounded to the nearest 2.5 kg.
 *
 * @param oneRepMax - The stored 1RM in kg. Must be > 0.
 * @param percentage - The target percentage (e.g., 85 for 85%). Must be > 0.
 * @returns Working weight in kg, rounded to nearest 2.5 kg. Returns 0 for invalid input.
 */
export function calcWorkingWeight(oneRepMax: number, percentage: number): number {
  if (!oneRepMax || oneRepMax <= 0 || !percentage || percentage <= 0) return 0
  const raw = oneRepMax * (percentage / 100)
  return Math.round(raw / ROUNDING_STEP) * ROUNDING_STEP
}
