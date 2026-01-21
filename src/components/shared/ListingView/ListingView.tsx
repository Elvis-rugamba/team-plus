import React, { useMemo, type ReactNode } from 'react';
import {
  Box,
  Grid,
  List,
  ListItem,
  Divider,
  Paper,
  TablePagination,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRowsProp } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import type { ViewMode } from '@/types';
import { EmptyState } from '@/components/shared/EmptyState';

export interface Column<T> {
  id: string;
  label: string;
  field?: keyof T;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  minWidth?: number;
  flex?: number;
  render?: (item: T) => ReactNode;
  valueGetter?: (item: T) => string | number;
  align?: 'left' | 'right' | 'center';
}

interface ListingViewProps<T> {
  items: T[];
  viewMode: ViewMode;
  columns: Column<T>[];
  getItemId: (item: T) => string;
  renderGridCard: (item: T) => ReactNode;
  renderListItem: (item: T) => ReactNode;
  emptyState: {
    title: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
      icon?: ReactNode;
    };
  };
  ariaLabel: string;
  page?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  loading?: boolean;
}

/**
 * Reusable Listing View Component
 * Supports Table (DataGrid), List, and Grid view modes with sorting and pagination
 */
export function ListingView<T>({
  items,
  viewMode,
  columns,
  getItemId,
  renderGridCard,
  renderListItem,
  emptyState,
  ariaLabel,
  page = 0,
  pageSize = 25,
  totalItems,
  onPageChange,
  onPageSizeChange,
  loading = false,
}: ListingViewProps<T>) {
  const { t } = useTranslation();

  // Calculate paginated items for list and grid views
  const paginatedItems = useMemo(() => {
    if (viewMode === 'table') {
      return items; // DataGrid handles its own pagination
    }
    const start = page * pageSize;
    const end = start + pageSize;
    return items.slice(start, end);
  }, [items, page, pageSize, viewMode]);

  // Convert items to DataGrid rows
  const rows: GridRowsProp = useMemo(() => {
    return items.map((item) => ({
      id: getItemId(item),
      ...item,
    }));
  }, [items, getItemId]);

  // Convert columns to DataGrid columns
  const gridColumns: GridColDef[] = useMemo(() => {
    return columns.map((col) => ({
      field: col.id,
      headerName: col.label,
      sortable: col.sortable !== false,
      filterable: col.filterable !== false,
      width: col.width,
      minWidth: col.minWidth || 100,
      flex: col.flex || 1,
      align: col.align || 'left',
      headerAlign: col.align || 'left',
      valueGetter: col.valueGetter
        ? (params) => {
            const item = items.find((i) => getItemId(i) === params.row.id);
            return item ? col.valueGetter!(item) : '';
          }
        : undefined,
      renderCell: col.render
        ? (params) => {
            const item = items.find((i) => getItemId(i) === params.row.id);
            return item ? col.render!(item) : null;
          }
        : undefined,
    }));
  }, [columns, items, getItemId]);

  // Handle pagination change for list and grid views
  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange?.(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onPageSizeChange?.(parseInt(event.target.value, 10));
  };

  if (items.length === 0 && !loading) {
    return (
      <EmptyState
        title={emptyState.title}
        description={emptyState.description}
        action={emptyState.action}
      />
    );
  }

  // Table View with DataGrid
  if (viewMode === 'table') {
    return (
      <Paper sx={{ width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={gridColumns}
          pagination
          page={page}
          pageSize={pageSize}
          rowsPerPageOptions={[10, 25, 50, 100]}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          rowCount={totalItems || items.length}
          paginationMode={totalItems ? 'server' : 'client'}
          loading={loading}
          disableSelectionOnClick
          autoHeight
          density="comfortable"
          sx={{
            border: 0,
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              cursor: 'pointer',
            },
          }}
          aria-label={ariaLabel}
        />
      </Paper>
    );
  }

  // Grid View with Pagination
  if (viewMode === 'grid') {
    return (
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ p: 2 }}>
          {paginatedItems.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {t('common.noData')}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {paginatedItems.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={getItemId(item)}>
                  {renderGridCard(item)}
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
        <Divider />
        <TablePagination
          component="div"
          count={totalItems || items.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage={t('common.rowsPerPage')}
          aria-label={`${ariaLabel} pagination`}
        />
      </Paper>
    );
  }

  // List View with Pagination
  return (
    <Paper sx={{ width: '100%' }}>
      <List>
        {paginatedItems.length === 0 ? (
          <ListItem>
            <Box sx={{ py: 4, width: '100%', textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {t('common.noData')}
              </Typography>
            </Box>
          </ListItem>
        ) : (
          paginatedItems.map((item, index) => (
            <React.Fragment key={getItemId(item)}>
              {index > 0 && <Divider />}
              {renderListItem(item)}
            </React.Fragment>
          ))
        )}
      </List>
      <Divider />
      <TablePagination
        component="div"
        count={totalItems || items.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={pageSize}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage={t('common.rowsPerPage')}
        aria-label={`${ariaLabel} pagination`}
      />
    </Paper>
  );
}
