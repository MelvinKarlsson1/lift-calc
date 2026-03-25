// Storage availability sentinel check
// Detects whether localStorage is available (fails in Safari private browsing).
// Source: MDN Window.localStorage + WebKit Blog storage policy
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__lift_calc_test__'
    localStorage.setItem(testKey, '1')
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}
