export function readStored<T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T,
): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;

    const value: unknown = JSON.parse(raw);
    if (isValid(value)) return value;

    console.warn(`Ignoring invalid saved data for "${key}".`);
  } catch (error) {
    console.error(`Could not read saved data for "${key}".`, error);
  }

  return fallback;
}

export function writeStored<T>(key: string, value: T): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Could not save data for "${key}".`, error);
    return false;
  }
}
