import React, { createContext, useReducer, useContext, useEffect, type ReactNode } from 'react';
import type { AppState, Action } from '@/types';
import { appReducer, initialState } from './appReducer';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Application Context Provider
 * Manages global state with useReducer and persists to localStorage
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { saveToStorage, loadFromStorage } = useLocalStorage('team-plus-state');

  // Load state from localStorage on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const savedState = await loadFromStorage();
        if (savedState) {
          dispatch({ type: 'LOAD_STATE', payload: savedState });
        }
      } catch (error) {
        console.error('Failed to load state:', error);
      }
    };
    loadState();
  }, [loadFromStorage]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const saveState = async () => {
      try {
        await saveToStorage(state);
      } catch (error) {
        console.error('Failed to save state:', error);
      }
    };
    saveState();
  }, [state, saveToStorage]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

/**
 * Custom hook to access app context
 */
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
