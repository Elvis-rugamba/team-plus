import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Divider,
  type SelectChangeEvent,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { useTranslation } from 'react-i18next';
import type { FilterDefinition, ActiveFilter, FilterValue } from '@/hooks/useFilter';

interface FilterModalProps<T> {
  open: boolean;
  onClose: () => void;
  filterDefinitions: FilterDefinition<T>[];
  activeFilters: ActiveFilter[];
  onApplyFilter: (filterId: string, value: FilterValue) => void;
  onRemoveFilter: (filterId: string) => void;
  onClearAll: () => void;
  getFilterValue: (filterId: string) => FilterValue | undefined;
}

/**
 * Reusable Filter Modal Component
 * Displays filters in a dialog for cleaner UI
 */
export function FilterModal<T>({
  open,
  onClose,
  filterDefinitions,
  activeFilters,
  onApplyFilter,
  onRemoveFilter,
  onClearAll,
  getFilterValue,
}: FilterModalProps<T>) {
  const { t } = useTranslation();

  const handleSelectChange = (filterId: string) => (event: SelectChangeEvent<any>) => {
    const value = event.target.value;
    if (value === '' || (Array.isArray(value) && value.length === 0)) {
      onRemoveFilter(filterId);
    } else {
      onApplyFilter(filterId, value);
    }
  };

  if (filterDefinitions.length === 0) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="filter-modal-title"
    >
      <DialogTitle id="filter-modal-title">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon />
            <Typography variant="h6" component="span">
              {t('filter.title')}
            </Typography>
          </Box>
          {activeFilters.length > 0 && (
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={onClearAll}
              aria-label={t('filter.clearFilters')}
            >
              {t('filter.clearFilters')}
            </Button>
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {filterDefinitions.map((filterDef) => {
            const currentValue = getFilterValue(filterDef.id);
            const isMultiple = true; // Enable multi-select for all filters

            return (
              <FormControl key={filterDef.id} fullWidth size="small">
                <InputLabel id={`filter-${filterDef.id}-label`}>{filterDef.label}</InputLabel>
                <Select
                  labelId={`filter-${filterDef.id}-label`}
                  id={`filter-${filterDef.id}`}
                  value={currentValue ?? []}
                  onChange={handleSelectChange(filterDef.id)}
                  label={filterDef.label}
                  multiple={isMultiple}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => {
                        const option = filterDef.options?.find((o) => o.value === value);
                        return <Chip key={value} label={option?.label || value} size="small" />;
                      })}
                    </Box>
                  )}
                  inputProps={{
                    'aria-label': `Filter by ${filterDef.label}`,
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                      },
                    },
                  }}
                >
                  {filterDef.options?.map((option) => (
                    <MenuItem key={String(option.value)} value={option.value as any}>
                      <Checkbox
                        checked={
                          Array.isArray(currentValue) && currentValue.includes(option.value as any)
                        }
                      />
                      <ListItemText primary={option.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          })}
        </Box>

        {activeFilters.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('filter.activeFilters')} ({activeFilters.length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {activeFilters.map((filter) => {
                const definition = filterDefinitions.find((d) => d.id === filter.id);
                if (!definition) return null;

                const getLabel = () => {
                  if (Array.isArray(filter.value)) {
                    const labels = filter.value.map((v) => {
                      const option = definition.options?.find((o) => o.value === v);
                      return option?.label || v;
                    });
                    return `${definition.label}: ${labels.join(', ')}`;
                  }
                  const option = definition.options?.find((o) => o.value === filter.value);
                  return `${definition.label}: ${option?.label || filter.value}`;
                };

                return (
                  <Chip
                    key={filter.id}
                    label={getLabel()}
                    onDelete={() => onRemoveFilter(filter.id)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                );
              })}
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} aria-label={t('common.close')}>
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
