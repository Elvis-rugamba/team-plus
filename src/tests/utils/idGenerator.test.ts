import { describe, it, expect } from 'vitest';
import { generateId } from '@/utils/idGenerator';

describe('idGenerator', () => {
  it('should generate a unique ID', () => {
    const id1 = generateId();
    const id2 = generateId();
    
    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
  });

  it('should generate an ID with correct format', () => {
    const id = generateId();
    expect(id).toMatch(/^\d+-[a-z0-9]+$/);
  });

  it('should generate unique IDs in rapid succession', () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(100);
  });
});
