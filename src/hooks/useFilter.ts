import { useMemo, useState, useCallback } from 'react';

export type FilterValue = string | string[] | number | boolean | null;
export type FilterCondition<T> = (item: T, value: FilterValue) => boolean;

export interface FilterDefinition<T> {
  id: string;
  label: string;
  field: keyof T;
  condition: FilterCondition<T>;
  options?: Array<{ value: FilterValue; label: string }>;
}

export interface ActiveFilter {
  id: string;
  value: FilterValue;
}

/**
 * Business logic hook for advanced filtering
 * Supports multiple filters with different conditions
 */
export function useFilter<T>(
  items: T[],
  filterDefinitions: FilterDefinition<T>[]
) {
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

  // Apply filter
  const applyFilter = useCallback((filterId: string, value: FilterValue) => {
    setActiveFilters((prev) => {
      const existing = prev.find((f) => f.id === filterId);
      if (existing) {
        // Update existing filter
        return prev.map((f) => (f.id === filterId ? { id: filterId, value } : f));
      } else {
        // Add new filter
        return [...prev, { id: filterId, value }];
      }
    });
  }, []);

  // Remove filter
  const removeFilter = useCallback((filterId: string) => {
    setActiveFilters((prev) => prev.filter((f) => f.id !== filterId));
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setActiveFilters([]);
  }, []);

  // Check if a filter is active
  const isFilterActive = useCallback(
    (filterId: string): boolean => {
      return activeFilters.some((f) => f.id === filterId);
    },
    [activeFilters]
  );

  // Get filter value
  const getFilterValue = useCallback(
    (filterId: string): FilterValue | undefined => {
      return activeFilters.find((f) => f.id === filterId)?.value;
    },
    [activeFilters]
  );

  // Apply all active filters to items
  const filteredItems = useMemo(() => {
    if (activeFilters.length === 0) {
      return items;
    }

    return items.filter((item) => {
      // Item must pass all active filters
      return activeFilters.every((activeFilter) => {
        const definition = filterDefinitions.find((d) => d.id === activeFilter.id);
        if (!definition) return true;

        return definition.condition(item, activeFilter.value);
      });
    });
  }, [items, activeFilters, filterDefinitions]);

  return {
    filteredItems,
    activeFilters,
    applyFilter,
    removeFilter,
    clearAllFilters,
    isFilterActive,
    getFilterValue,
    hasActiveFilters: activeFilters.length > 0,
  };
}
