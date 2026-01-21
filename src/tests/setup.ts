import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock localStorage
const localStorageMock = {
  getItem: (key: string): string | null => {
    return localStorageMock[key as keyof typeof localStorageMock] || null;
  },
  setItem: (key: string, value: string): void => {
    localStorageMock[key as keyof typeof localStorageMock] = value;
  },
  removeItem: (key: string): void => {
    delete localStorageMock[key as keyof typeof localStorageMock];
  },
  clear: (): void => {
    Object.keys(localStorageMock).forEach((key) => {
      if (key !== 'getItem' && key !== 'setItem' && key !== 'removeItem' && key !== 'clear') {
        delete localStorageMock[key as keyof typeof localStorageMock];
      }
    });
  },
};

global.localStorage = localStorageMock as Storage;
