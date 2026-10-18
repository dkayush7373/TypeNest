/**
 * Safe local storage helper with SSR safety and corrupted JSON fallback.
 */

export function getSafeStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }
  try {
    const item = window.localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`[storage] Failed to parse stored item for key "${key}", falling back.`, error);
    return fallback;
  }
}

export function setSafeStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[storage] Failed to set storage item for key "${key}".`, error);
  }
}

export function removeSafeStorage(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`[storage] Failed to remove storage item for key "${key}".`, error);
  }
}
