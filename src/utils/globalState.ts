/**
 * Global State Persistence
 * Persists user state across pages and reloads.
 */

const STATE_KEY = 'cinemax_global_state';

export interface GlobalState {
  // Player preferences
  preferredSource: number;
  preferredQuality: string;
  preferredAspectRatio: string;
  volume: number;
  autoplay: boolean;

  // Watch state
  lastWatchedContentId: string | null;
  lastWatchedTimestamp: number;

  // Device
  deviceFingerprint: string | null;

  // UI preferences
  theme: string;
  sidebarCollapsed: boolean;
}

const DEFAULT_STATE: GlobalState = {
  preferredSource: 1,
  preferredQuality: '1080p',
  preferredAspectRatio: 'fit',
  volume: 100,
  autoplay: true,
  lastWatchedContentId: null,
  lastWatchedTimestamp: 0,
  deviceFingerprint: null,
  theme: 'dark',
  sidebarCollapsed: false,
};

let cachedState: GlobalState | null = null;

/**
 * Load global state from localStorage
 */
export const loadGlobalState = (): GlobalState => {
  if (cachedState) return cachedState;
  try {
    const stored = localStorage.getItem(STATE_KEY);
    if (stored) {
      cachedState = { ...DEFAULT_STATE, ...JSON.parse(stored) };
      return cachedState!;
    }
  } catch { /* ignore */ }
  cachedState = { ...DEFAULT_STATE };
  return cachedState;
};

/**
 * Save global state to localStorage
 */
export const saveGlobalState = (state: Partial<GlobalState>): void => {
  const current = loadGlobalState();
  cachedState = { ...current, ...state };
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(cachedState));
  } catch { /* ignore */ }
};

/**
 * Get a single state value
 */
export const getStateValue = <K extends keyof GlobalState>(key: K): GlobalState[K] => {
  return loadGlobalState()[key];
};

/**
 * Set a single state value
 */
export const setStateValue = <K extends keyof GlobalState>(key: K, value: GlobalState[K]): void => {
  saveGlobalState({ [key]: value });
};

/**
 * Reset state to defaults
 */
export const resetGlobalState = (): void => {
  cachedState = { ...DEFAULT_STATE };
  try { localStorage.setItem(STATE_KEY, JSON.stringify(cachedState)); } catch { /* ignore */ }
};
