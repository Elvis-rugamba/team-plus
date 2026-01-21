import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
}

/**
 * Reusable Search Bar Component
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder,
  fullWidth = false,
}) => {
  const { t } = useTranslation();

  return (
    <TextField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || t('filter.searchPlaceholder')}
      fullWidth={fullWidth}
      size="small"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
      inputProps={{
        'aria-label': t('common.search'),
      }}
    />
  );
};
