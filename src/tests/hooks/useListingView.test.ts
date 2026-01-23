import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useListingView } from '@/hooks/useListingView';

interface TestItem {
  id: string;
  name: string;
}

describe('useListingView', () => {
  const items: TestItem[] = Array.from({ length: 50 }, (_, i) => ({
    id: `item-${i}`,
    name: `Item ${i}`,
  }));

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useListingView(items));

    expect(result.current.viewMode).toBe('table');
    expect(result.current.page).toBe(0);
    expect(result.current.rowsPerPage).toBe(25);
    expect(result.current.searchTerm).toBe('');
    expect(result.current.totalItems).toBe(50);
  });

  it('should initialize with custom default view mode', () => {
    const { result } = renderHook(() => useListingView(items, 'grid'));

    expect(result.current.viewMode).toBe('grid');
  });

  it('should initialize with custom page size', () => {
    const { result } = renderHook(() => useListingView(items, 'table', 10));

    expect(result.current.rowsPerPage).toBe(10);
  });

  it('should change view mode', () => {
    const { result } = renderHook(() => useListingView(items));

    act(() => {
      result.current.setViewMode('list');
    });

    expect(result.current.viewMode).toBe('list');
  });

  it('should reset page when view mode changes', () => {
    const { result } = renderHook(() => useListingView(items));

    act(() => {
      result.current.setPage(2);
    });

    expect(result.current.page).toBe(2);

    act(() => {
      result.current.setViewMode('grid');
    });

    expect(result.current.page).toBe(0);
  });

  it('should change page', () => {
    const { result } = renderHook(() => useListingView(items));

    act(() => {
      result.current.setPage(1);
    });

    expect(result.current.page).toBe(1);
  });

  it('should change rows per page and reset to first page', () => {
    const { result } = renderHook(() => useListingView(items));

    act(() => {
      result.current.setPage(2);
      result.current.setRowsPerPage(10);
    });

    expect(result.current.rowsPerPage).toBe(10);
    expect(result.current.page).toBe(0);
  });

  it('should change search term and reset to first page', () => {
    const { result } = renderHook(() => useListingView(items));

    act(() => {
      result.current.setPage(2);
      result.current.setSearchTerm('test');
    });

    expect(result.current.searchTerm).toBe('test');
    expect(result.current.page).toBe(0);
  });

  it('should calculate paginated items correctly', () => {
    const { result } = renderHook(() => useListingView(items, 'list', 10));

    expect(result.current.paginatedItems).toHaveLength(10);
    expect(result.current.paginatedItems[0].id).toBe('item-0');

    act(() => {
      result.current.setPage(1);
    });

    expect(result.current.paginatedItems).toHaveLength(10);
    expect(result.current.paginatedItems[0].id).toBe('item-10');
  });

  it('should reset page when items length changes', () => {
    const { result, rerender } = renderHook(
      ({ items }) => useListingView(items),
      { initialProps: { items } }
    );

    act(() => {
      result.current.setPage(2);
    });

    expect(result.current.page).toBe(2);

    const newItems = items.slice(0, 10);
    rerender({ items: newItems });

    expect(result.current.page).toBe(0);
  });

  it('should handle empty items array', () => {
    const { result } = renderHook(() => useListingView([]));

    expect(result.current.paginatedItems).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
  });

  it('should handle last page with fewer items than page size', () => {
    const smallItems = items.slice(0, 5);
    const { result } = renderHook(() => useListingView(smallItems, 'list', 10));

    expect(result.current.paginatedItems).toHaveLength(5);
  });
});
