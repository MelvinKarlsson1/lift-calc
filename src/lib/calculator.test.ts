import { describe, it, expect } from 'vitest'
import { calcWorkingWeight } from './calculator'

describe('calcWorkingWeight', () => {
  it('returns exact value when already on 2.5 boundary', () => {
    expect(calcWorkingWeight(100, 85)).toBe(85)
  })

  it('rounds down to nearest 2.5 when closer to lower', () => {
    expect(calcWorkingWeight(100, 83)).toBe(82.5)
  })

  it('rounds up to nearest 2.5 when closer to upper', () => {
    expect(calcWorkingWeight(100, 84)).toBe(85)
  })

  it('returns 0 for missing 1RM (zero)', () => {
    expect(calcWorkingWeight(0, 85)).toBe(0)
  })

  it('returns 0 for zero percentage', () => {
    expect(calcWorkingWeight(100, 0)).toBe(0)
  })

  it('returns 0 for negative 1RM', () => {
    expect(calcWorkingWeight(-10, 85)).toBe(0)
  })

  it('rounds correctly for 140 * 90%', () => {
    // 140 * 0.9 = 126 → nearest 2.5 = 125
    expect(calcWorkingWeight(140, 90)).toBe(125)
  })
})
