import { useCallback } from 'react';
import type { AppState } from '@/types';

/**
 * Custom hook for localStorage operations with error handling
 */
export const useLocalStorage = (key: string) => {
  const saveToStorage = useCallback(
    async (data: AppState): Promise<void> => {
      try {
        const serialized = JSON.stringify(data);
        localStorage.setItem(key, serialized);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
        throw error;
      }
    },
    [key]
  );

  const loadFromStorage = useCallback(async (): Promise<AppState | null> => {
    try {
      const serialized = localStorage.getItem(key);
      if (serialized === null) {
        return null;
      }
      return JSON.parse(serialized) as AppState;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  }, [key]);

  const clearStorage = useCallback(async (): Promise<void> => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      throw error;
    }
  }, [key]);

  return {
    saveToStorage,
    loadFromStorage,
    clearStorage,
  };
};
