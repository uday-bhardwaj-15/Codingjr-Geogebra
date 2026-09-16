import { StoredConstructionV1 } from '../../types/storage';

export const LocalStorageKeys = {
  LEGACY_ACTIVE_CONSTRUCTION: 'graphkit:construction:active',
  APP_CONSTRUCTION_PREFIX: 'graphkit:construction:',
  SETTINGS: 'graphkit:settings',
};

export function getAppStorageKey(appId: string): string {
  return `${LocalStorageKeys.APP_CONSTRUCTION_PREFIX}${appId}`;
}

export function migrateLegacyStorageIfNeeded(): void {
  if (typeof window === 'undefined') return;
  try {
    const graphingKey = getAppStorageKey('graphing');
    const existingGraphing = localStorage.getItem(graphingKey);
    const legacyData = localStorage.getItem(LocalStorageKeys.LEGACY_ACTIVE_CONSTRUCTION);

    if (!existingGraphing && legacyData) {
      localStorage.setItem(graphingKey, legacyData);
      localStorage.removeItem(LocalStorageKeys.LEGACY_ACTIVE_CONSTRUCTION);
    }
  } catch (e) {
    console.warn('Failed to migrate legacy storage', e);
  }
}

export const localStorageAdapter = {
  getConstruction(appId: string = 'graphing'): StoredConstructionV1 | null {
    if (typeof window === 'undefined') return null;
    try {
      migrateLegacyStorageIfNeeded();
      const key = getAppStorageKey(appId);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  saveConstruction(data: StoredConstructionV1, appId: string = 'graphing'): void {
    if (typeof window === 'undefined') return;
    try {
      const key = getAppStorageKey(appId);
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  },
  clearConstruction(appId: string = 'graphing'): void {
    if (typeof window === 'undefined') return;
    try {
      const key = getAppStorageKey(appId);
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Failed to clear localStorage', e);
    }
  },
};
