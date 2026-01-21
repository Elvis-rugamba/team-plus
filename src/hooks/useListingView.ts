import { useState, useMemo, useCallback, useEffect } from 'react';
import type { ViewMode } from '@/types';

/**
 * Business logic hook for listing views
 * Handles view mode, pagination, search, and filtering
 */
export function useListingView<T>(
  items: T[],
  defaultViewMode: ViewMode = 'table',
  pageSize: number = 25
) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [searchTerm, setSearchTerm] = useState('');

  // Reset page when items length changes (due to search/filter)
  useEffect(() => {
    setPage(0);
  }, [items.length]);

  // Pagination handlers
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setRowsPerPage(newPageSize);
    setPage(0);
  }, []);

  // Search handler
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    setPage(0); // Reset to first page on search
  }, []);

  // View mode handler
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    setPage(0);
  }, []);

  // Calculate paginated items (for non-DataGrid views)
  const paginatedItems = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return items.slice(start, end);
  }, [items, page, rowsPerPage]);

  return {
    // State
    viewMode,
    page,
    rowsPerPage,
    searchTerm,
    paginatedItems,
    totalItems: items.length,
    
    // Handlers
    setViewMode: handleViewModeChange,
    setPage: handlePageChange,
    setRowsPerPage: handlePageSizeChange,
    setSearchTerm: handleSearchChange,
  };
}
