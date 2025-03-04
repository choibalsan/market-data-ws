export interface WindowEntry {
  id: string;
  timestamp: number;
  updatesPaused: boolean;
}

const STORAGE_KEY = 'binance-app-windows';

export function getRegisteredWindows(): WindowEntry[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data) as WindowEntry[];
    } catch {
      return [];
    }
  }
  return [];
}

export function registerWindow(id: string) {
  const windows = getRegisteredWindows();
  windows.push({ id, timestamp: Date.now(), updatesPaused: false });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(windows));
}

export function unregisterWindow(id: string) {
  const windows = getRegisteredWindows().filter((w) => w.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(windows));
}

export function updateWindowEntry(id: string, partial: Partial<WindowEntry>) {
  const windows = getRegisteredWindows();
  const index = windows.findIndex((w) => w.id === id);
  if (index !== -1) {
    windows[index] = { ...windows[index], ...partial };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(windows));
  }
}
