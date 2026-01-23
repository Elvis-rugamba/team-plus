import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSearch, type SearchConfig } from '@/hooks/useSearch';

interface TestItem {
  id: string;
  name: string;
  email: string;
  skills: string[];
}

describe('useSearch', () => {
  const items: TestItem[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', skills: ['JavaScript', 'React'] },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', skills: ['TypeScript', 'Vue'] },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', skills: ['Python', 'Django'] },
  ];

  it('should return all items when search term is empty', () => {
    const config: SearchConfig<TestItem> = {
      searchableFields: ['name', 'email'],
    };

    const { result } = renderHook(() => useSearch(items, '', config));

    expect(result.current).toEqual(items);
  });

  it('should return all items when search term is only whitespace', () => {
    const config: SearchConfig<TestItem> = {
      searchableFields: ['name', 'email'],
    };

    const { result } = renderHook(() => useSearch(items, '   ', config));

    expect(result.current).toEqual(items);
  });

  it('should filter items by name', () => {
    const config: SearchConfig<TestItem> = {
      searchableFields: ['name', 'email'],
    };

    const { result } = renderHook(() => useSearch(items, 'John Doe', config));

    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('John Doe');
  });

  it('should filter items by email', () => {
    const config: SearchConfig<TestItem> = {
      searchableFields: ['name', 'email'],
    };

    const { result } = renderHook(() => useSearch(items, 'jane@example.com', config));

    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('Jane Smith');
  });

  it('should be case insensitive', () => {
    const config: SearchConfig<TestItem> = {
      searchableFields: ['name', 'email'],
    };

    const { result } = renderHook(() => useSearch(items, 'JANE', config));

    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('Jane Smith');
  });

  it('should search in multiple fields', () => {
    const config: SearchConfig<TestItem> = {
      searchableFields: ['name', 'email'],
    };

    const { result } = renderHook(() => useSearch(items, 'example', config));

    expect(result.current).toHaveLength(3);
  });

  it('should handle array fields', () => {
    const config: SearchConfig<TestItem> = {
      searchableFields: ['skills'],
    };

    const { result } = renderHook(() => useSearch(items, 'React', config));

    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('John Doe');
  });

  it('should use custom search function when provided', () => {
    const config: SearchConfig<TestItem> = {
      searchableFields: ['name'],
      customSearchFn: (item, searchTerm) => {
        return item.name.toLowerCase().startsWith(searchTerm);
      },
    };

    const { result } = renderHook(() => useSearch(items, 'jane', config));

    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('Jane Smith');
  });

  it('should handle null and undefined values', () => {
    const itemsWithNulls: TestItem[] = [
      { id: '1', name: 'John', email: 'john@example.com', skills: [] },
      { id: '2', name: 'Jane', email: null as any, skills: [] },
    ];

    const config: SearchConfig<TestItem> = {
      searchableFields: ['email'],
    };

    const { result } = renderHook(() => useSearch(itemsWithNulls, 'john', config));

    expect(result.current).toHaveLength(1);
  });

  it('should return empty array when no matches found', () => {
    const config: SearchConfig<TestItem> = {
      searchableFields: ['name', 'email'],
    };

    const { result } = renderHook(() => useSearch(items, 'NonExistent', config));

    expect(result.current).toHaveLength(0);
  });
});
