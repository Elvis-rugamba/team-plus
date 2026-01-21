/**
 * Generates a unique ID using timestamp and random string
 * @returns Unique identifier string
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
