import React from 'react';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import TableRowsIcon from '@mui/icons-material/TableRows';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useTranslation } from 'react-i18next';
import type { ViewMode } from '@/types';

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

/**
 * Toggle component for switching between table, list, and grid views
 */
export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  const handleChange = (_event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      onChange(newMode);
    }
  };

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={handleChange}
      aria-label={t('common.viewMode')}
      size="small"
    >
      <ToggleButton value="table" aria-label={t('common.table')}>
        <TableRowsIcon />
      </ToggleButton>
      <ToggleButton value="list" aria-label={t('common.list')}>
        <ViewListIcon />
      </ToggleButton>
      <ToggleButton value="grid" aria-label={t('common.grid')}>
        <ViewModuleIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};
