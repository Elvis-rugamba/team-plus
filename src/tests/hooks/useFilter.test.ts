import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilter, type FilterDefinition } from '@/hooks/useFilter';

interface TestItem {
  id: string;
  name: string;
  role: string;
  status: string;
}

describe('useFilter', () => {
  const items: TestItem[] = [
    { id: '1', name: 'John', role: 'Developer', status: 'active' },
    { id: '2', name: 'Jane', role: 'Designer', status: 'active' },
    { id: '3', name: 'Bob', role: 'Developer', status: 'inactive' },
  ];

  const filterDefinitions: FilterDefinition<TestItem>[] = [
    {
      id: 'role',
      label: 'Role',
      field: 'role',
      condition: (item, value) => item.role === value,
      options: [
        { value: 'Developer', label: 'Developer' },
        { value: 'Designer', label: 'Designer' },
      ],
    },
    {
      id: 'status',
      label: 'Status',
      field: 'status',
      condition: (item, value) => item.status === value,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
  ];

  it('should return all items when no filters are active', () => {
    const { result } = renderHook(() => useFilter(items, filterDefinitions));

    expect(result.current.filteredItems).toEqual(items);
    expect(result.current.activeFilters).toEqual([]);
  });

  it('should filter items by single filter', () => {
    const { result } = renderHook(() => useFilter(items, filterDefinitions));

    act(() => {
      result.current.applyFilter('role', 'Developer');
    });

    expect(result.current.filteredItems).toHaveLength(2);
    expect(result.current.filteredItems.every((item) => item.role === 'Developer')).toBe(true);
    expect(result.current.activeFilters).toHaveLength(1);
  });

  it('should filter items by multiple filters', () => {
    const { result } = renderHook(() => useFilter(items, filterDefinitions));

    act(() => {
      result.current.applyFilter('role', 'Developer');
      result.current.applyFilter('status', 'active');
    });

    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0].name).toBe('John');
    expect(result.current.activeFilters).toHaveLength(2);
  });

  it('should update existing filter when applied again', () => {
    const { result } = renderHook(() => useFilter(items, filterDefinitions));

    act(() => {
      result.current.applyFilter('role', 'Developer');
    });

    expect(result.current.filteredItems).toHaveLength(2);

    act(() => {
      result.current.applyFilter('role', 'Designer');
    });

    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0].role).toBe('Designer');
    expect(result.current.activeFilters).toHaveLength(1);
  });

  it('should remove filter when removeFilter is called', () => {
    const { result } = renderHook(() => useFilter(items, filterDefinitions));

    act(() => {
      result.current.applyFilter('role', 'Developer');
      result.current.applyFilter('status', 'active');
    });

    expect(result.current.activeFilters).toHaveLength(2);

    act(() => {
      result.current.removeFilter('role');
    });

    expect(result.current.activeFilters).toHaveLength(1);
    expect(result.current.activeFilters[0].id).toBe('status');
  });

  it('should clear all filters when clearAllFilters is called', () => {
    const { result } = renderHook(() => useFilter(items, filterDefinitions));

    act(() => {
      result.current.applyFilter('role', 'Developer');
      result.current.applyFilter('status', 'active');
    });

    expect(result.current.activeFilters).toHaveLength(2);

    act(() => {
      result.current.clearAllFilters();
    });

    expect(result.current.activeFilters).toHaveLength(0);
    expect(result.current.filteredItems).toEqual(items);
  });

  it('should handle array filter values', () => {
    const arrayFilterDefinitions: FilterDefinition<TestItem>[] = [
      {
        id: 'role',
        label: 'Role',
        field: 'role',
        condition: (item, value) => {
          if (Array.isArray(value)) {
            return value.includes(item.role);
          }
          return item.role === value;
        },
        options: [
          { value: 'Developer', label: 'Developer' },
          { value: 'Designer', label: 'Designer' },
        ],
      },
    ];

    const { result } = renderHook(() => useFilter(items, arrayFilterDefinitions));

    act(() => {
      result.current.applyFilter('role', ['Developer', 'Designer']);
    });

    // The condition should handle array values
    expect(result.current.activeFilters[0].value).toEqual(['Developer', 'Designer']);
    expect(result.current.filteredItems.length).toBeGreaterThan(0);
  });

  it('should return correct hasActiveFilters value', () => {
    const { result } = renderHook(() => useFilter(items, filterDefinitions));

    expect(result.current.hasActiveFilters).toBe(false);

    act(() => {
      result.current.applyFilter('role', 'Developer');
    });

    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.clearAllFilters();
    });

    expect(result.current.hasActiveFilters).toBe(false);
  });
});
