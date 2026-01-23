import React from 'react';
import type { AppState } from '@/types';

/**
 * Mock translation function
 */
export const mockT = (key: string, options?: Record<string, any>): string => {
  if (options) {
    let result = key;
    Object.entries(options).forEach(([k, v]) => {
      result = result.replace(`{{${k}}}`, String(v));
    });
    return result;
  }
  return key;
};

/**
 * Create mock app state
 */
export const createMockAppState = (overrides?: Partial<AppState>): AppState => {
  return {
    members: {},
    teams: {},
    roles: {},
    skills: {},
    darkMode: false,
    language: 'en',
    ...overrides,
  };
};
