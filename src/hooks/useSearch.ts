import { useMemo } from 'react';

export interface SearchConfig<T> {
  searchableFields: (keyof T)[];
  customSearchFn?: (item: T, searchTerm: string) => boolean;
}

/**
 * Business logic hook for search functionality
 * Filters items based on search term and searchable fields
 */
export function useSearch<T>(
  items: T[],
  searchTerm: string,
  config: SearchConfig<T>
): T[] {
  return useMemo(() => {
    if (!searchTerm.trim()) {
      return items;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();

    return items.filter((item) => {
      // Use custom search function if provided
      if (config.customSearchFn) {
        return config.customSearchFn(item, lowerSearchTerm);
      }

      // Default search: check if any searchable field contains the search term
      return config.searchableFields.some((field) => {
        const value = item[field];
        if (value === null || value === undefined) return false;

        if (Array.isArray(value)) {
          // Handle array fields (like skills)
          return value.some((v) =>
            String(v).toLowerCase().includes(lowerSearchTerm)
          );
        }

        return String(value).toLowerCase().includes(lowerSearchTerm);
      });
    });
  }, [items, searchTerm, config]);
}
