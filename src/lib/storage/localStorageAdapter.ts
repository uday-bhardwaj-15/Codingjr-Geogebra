import { StoredConstructionV1, StoredSettingsV1 } from '../../types/storage';

export const LocalStorageKeys = {
  ACTIVE_CONSTRUCTION: 'graphkit:construction:active',
  SETTINGS: 'graphkit:settings',
};

export const localStorageAdapter = {
  getConstruction(): StoredConstructionV1 | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(LocalStorageKeys.ACTIVE_CONSTRUCTION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  saveConstruction(data: StoredConstructionV1): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LocalStorageKeys.ACTIVE_CONSTRUCTION, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  },
};
