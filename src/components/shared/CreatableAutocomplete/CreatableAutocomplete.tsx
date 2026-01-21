import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  Button,
  Box,
  Chip,
  Autocomplete,
  Typography,
  createFilterOptions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';

// Custom type for option with inputValue for new items
interface CreatableOption {
  inputValue?: string;
  title: string;
  isNew?: boolean;
}

const filter = createFilterOptions<CreatableOption>();

// Base props shared between single and multiple modes
interface BaseCreatableAutocompleteProps {
  /** List of existing options to choose from */
  options: string[];
  /** Label for the input field */
  label: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Error state */
  error?: boolean;
  /** Helper text to display below the input */
  helperText?: string;
  /** Aria label for accessibility */
  ariaLabel?: string;
  /** Title for the "Add New" modal */
  addNewTitle?: string;
  /** Confirmation message for the "Add New" modal */
  addNewMessage?: string;
  /** Label for the "Add" button text (shown as "Add [value]") */
  addButtonLabel?: string;
  /** Callback when a new item is added (optional, for external tracking) */
  onNewItemAdded?: (item: string) => void;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Chip color for multi-select mode */
  chipColor?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  /** Chip variant for multi-select mode */
  chipVariant?: 'filled' | 'outlined';
  /** Chip size for multi-select mode */
  chipSize?: 'small' | 'medium';
}

// Props for single select mode
interface SingleSelectProps extends BaseCreatableAutocompleteProps {
  /** Enable multiple selection */
  multiple?: false;
  /** Current selected value (single) */
  value: string;
  /** Callback when value changes (single) */
  onChange: (value: string) => void;
}

// Props for multiple select mode
interface MultipleSelectProps extends BaseCreatableAutocompleteProps {
  /** Enable multiple selection */
  multiple: true;
  /** Current selected values (multiple) */
  value: string[];
  /** Callback when values change (multiple) */
  onChange: (value: string[]) => void;
}

export type CreatableAutocompleteProps = SingleSelectProps | MultipleSelectProps;

/**
 * CreatableAutocomplete Component
 * 
 * A reusable autocomplete component that allows users to:
 * - Select from existing options (single or multiple)
 * - Create new options with a confirmation modal
 * - Edit the new option before adding
 * - Display selected items as chips (in multiple mode)
 * 
 * @example
 * ```tsx
 * // Single select (e.g., role)
 * <CreatableAutocomplete
 *   value={role}
 *   onChange={setRole}
 *   options={existingRoles}
 *   label="Role"
 *   placeholder="Select or type a role"
 *   required
 * />
 * 
 * // Multiple select (e.g., skills)
 * <CreatableAutocomplete
 *   multiple
 *   value={skills}
 *   onChange={setSkills}
 *   options={existingSkills}
 *   label="Skills"
 *   placeholder="Add skills"
 *   chipColor="primary"
 *   chipVariant="filled"
 * />
 * ```
 */
export const CreatableAutocomplete: React.FC<CreatableAutocompleteProps> = (props) => {
  const {
    options,
    label,
    placeholder,
    required = false,
    error = false,
    helperText,
    ariaLabel,
    addNewTitle,
    addNewMessage,
    addButtonLabel,
    onNewItemAdded,
    disabled = false,
    fullWidth = true,
    chipColor = 'primary',
    chipVariant = 'filled',
    chipSize = 'small',
  } = props;

  const { t } = useTranslation();
  const isMultiple = 'multiple' in props && props.multiple === true;
  
  // State for new item modal
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingNewItem, setPendingNewItem] = useState('');
  const [sessionItems, setSessionItems] = useState<string[]>([]);
  
  // Combine existing options with session-added items
  const allOptions = useMemo(() => {
    const combined = [...options, ...sessionItems];
    return [...new Set(combined)].sort();
  }, [options, sessionItems]);
  
  // Convert options to CreatableOption format
  const optionsList: CreatableOption[] = useMemo(() => {
    return allOptions.map(item => ({ title: item }));
  }, [allOptions]);
  
  // Default texts with translations
  const defaultAddNewTitle = addNewTitle || t('common.addNew');
  const defaultAddNewMessage = addNewMessage || t('common.addNewConfirm');
  const defaultAddButtonLabel = addButtonLabel || t('common.add');
  
  // Get current value based on mode
  const getCurrentValue = () => {
    if (isMultiple) {
      const multiProps = props as MultipleSelectProps;
      return multiProps.value.map(v => ({ title: v }));
    } else {
      const singleProps = props as SingleSelectProps;
      return singleProps.value ? { title: singleProps.value } : null;
    }
  };
  
  // Handle adding a new item
  const handleAddNewItem = () => {
    if (pendingNewItem.trim()) {
      const trimmedItem = pendingNewItem.trim();
      setSessionItems(prev => [...prev, trimmedItem]);
      
      if (isMultiple) {
        const multiProps = props as MultipleSelectProps;
        multiProps.onChange([...multiProps.value, trimmedItem]);
      } else {
        const singleProps = props as SingleSelectProps;
        singleProps.onChange(trimmedItem);
      }
      
      onNewItemAdded?.(trimmedItem);
      setModalOpen(false);
      setPendingNewItem('');
    }
  };
  
  const handleCancelNewItem = () => {
    setModalOpen(false);
    setPendingNewItem('');
  };
  
  // Handle change for both modes
  const handleChange = (_e: React.SyntheticEvent, newValue: CreatableOption | CreatableOption[] | string | null) => {
    if (isMultiple) {
      const multiProps = props as MultipleSelectProps;
      const values = newValue as (CreatableOption | string)[];
      
      if (!values) {
        multiProps.onChange([]);
        return;
      }
      
      // Check if the last item is a new item request
      const lastItem = values[values.length - 1];
      
      if (typeof lastItem === 'string') {
        // Direct input (pressing enter on a new value)
        const trimmedValue = lastItem.trim();
        if (trimmedValue && !allOptions.some(opt => opt.toLowerCase() === trimmedValue.toLowerCase())) {
          setPendingNewItem(trimmedValue);
          setModalOpen(true);
        } else if (trimmedValue && !multiProps.value.includes(trimmedValue)) {
          // Add existing item
          multiProps.onChange([...multiProps.value, trimmedValue]);
        }
      } else if (lastItem && lastItem.inputValue) {
        // "Add [item]" option selected
        setPendingNewItem(lastItem.inputValue);
        setModalOpen(true);
      } else {
        // Regular selection - convert all items to strings
        const stringValues = values
          .map(v => typeof v === 'string' ? v : v.title)
          .filter(v => !v.startsWith(defaultAddButtonLabel)); // Filter out "Add" options
        multiProps.onChange(stringValues);
      }
    } else {
      const singleProps = props as SingleSelectProps;
      
      if (typeof newValue === 'string') {
        // Direct input (pressing enter on a new value)
        const trimmedValue = newValue.trim();
        if (trimmedValue && !allOptions.some(opt => opt.toLowerCase() === trimmedValue.toLowerCase())) {
          setPendingNewItem(trimmedValue);
          setModalOpen(true);
        } else {
          singleProps.onChange(trimmedValue);
        }
      } else if (newValue && 'inputValue' in newValue && newValue.inputValue) {
        // "Add [item]" option selected
        setPendingNewItem(newValue.inputValue);
        setModalOpen(true);
      } else if (newValue && 'title' in newValue) {
        // Existing item selected
        singleProps.onChange(newValue.title);
      } else {
        singleProps.onChange('');
      }
    }
  };

  // Filter options - exclude already selected items in multiple mode
  const filterOptions = (opts: CreatableOption[], params: { inputValue: string }) => {
    let filtered = filter(opts, params);
    const { inputValue } = params;
    
    // In multiple mode, filter out already selected options
    if (isMultiple) {
      const multiProps = props as MultipleSelectProps;
      filtered = filtered.filter(opt => !multiProps.value.includes(opt.title));
    }
    
    // Check if the input matches any existing option (case-insensitive)
    const isExisting = allOptions.some(
      (opt) => opt.toLowerCase() === inputValue.toLowerCase()
    );
    
    // Check if already selected (in multiple mode)
    const isAlreadySelected = isMultiple && (props as MultipleSelectProps).value.some(
      v => v.toLowerCase() === inputValue.toLowerCase()
    );
    
    // Add "Add [item]" option if input is not empty, doesn't exist, and not already selected
    if (inputValue !== '' && !isExisting && !isAlreadySelected) {
      filtered.push({
        inputValue,
        title: `${defaultAddButtonLabel} "${inputValue}"`,
        isNew: true,
      });
    }
    
    return filtered;
  };

  return (
    <>
      <Autocomplete
        multiple={isMultiple}
        freeSolo
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        disabled={disabled}
        fullWidth={fullWidth}
        options={optionsList}
        value={getCurrentValue()}
        onChange={handleChange}
        filterOptions={filterOptions}
        getOptionLabel={(option) => {
          if (typeof option === 'string') {
            return option;
          }
          if (option.inputValue) {
            return option.inputValue;
          }
          return option.title;
        }}
        renderOption={(optionProps, option) => {
          const { key, ...otherProps } = optionProps;
          if (option.isNew) {
            return (
              <Box
                component="li"
                key={key}
                {...otherProps}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: 'primary.main',
                  fontWeight: 500,
                }}
              >
                <AddIcon fontSize="small" />
                <Typography variant="body2" color="primary">
                  {option.title}
                </Typography>
              </Box>
            );
          }
          return (
            <li key={key} {...otherProps}>
              {option.title}
            </li>
          );
        }}
        isOptionEqualToValue={(option, val) => {
          if (typeof val === 'string') {
            return option.title === val;
          }
          return option.title === val.title;
        }}
        renderTags={isMultiple ? (value, getTagProps) =>
          value.map((option, index) => {
            const label = typeof option === 'string' ? option : option.title;
            return (
              <Chip
                label={label}
                {...getTagProps({ index })}
                key={label}
                size={chipSize}
                color={chipColor}
                variant={chipVariant}
              />
            );
          })
        : undefined}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            error={error}
            helperText={helperText}
            required={required}
            inputProps={{
              ...params.inputProps,
              'aria-label': ariaLabel || label,
              'aria-required': required,
            }}
          />
        )}
      />

      {/* Add New Item Confirmation Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCancelNewItem}
        maxWidth="xs"
        fullWidth
        aria-labelledby="add-item-dialog-title"
      >
        <DialogTitle id="add-item-dialog-title">
          {defaultAddNewTitle}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {defaultAddNewMessage}
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            label={label}
            value={pendingNewItem}
            onChange={(e) => setPendingNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && pendingNewItem.trim()) {
                handleAddNewItem();
              }
            }}
            error={!pendingNewItem.trim()}
            helperText={!pendingNewItem.trim() ? t('errors.required') : ''}
            inputProps={{ 'aria-label': label }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelNewItem}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleAddNewItem}
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            disabled={!pendingNewItem.trim()}
          >
            {defaultAddButtonLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
