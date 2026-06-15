const STORAGE_PREFIX = "hfhf_";

export function loadState<T>(key: string, defaultValue: T): T {
  try {
    const serialized = localStorage.getItem(STORAGE_PREFIX + key);
    if (serialized === null) {
      return defaultValue;
    }
    return JSON.parse(serialized) as T;
  } catch (err) {
    console.error(`[persist] load ${key} failed:`, err);
    return defaultValue;
  }
}

export function saveState<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(STORAGE_PREFIX + key, serialized);
  } catch (err) {
    console.error(`[persist] save ${key} failed:`, err);
  }
}

export function clearState(key: string): void {
  localStorage.removeItem(STORAGE_PREFIX + key);
}

export function clearAll(): void {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      keys.push(key);
    }
  }
  keys.forEach((k) => localStorage.removeItem(k));
}
