import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  type SelectChangeEvent,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Availability, type MemberFormData } from '@/types';
import { CreatableAutocomplete } from '@/components/shared/CreatableAutocomplete';
import { useForm, validators } from '@/hooks/useForm';

interface MemberFormProps {
  open: boolean;
  /** Initial form data (for editing) - use role/skill names, not IDs */
  initialData?: MemberFormData;
  /** Whether we're editing an existing member */
  isEditing?: boolean;
  onClose: () => void;
  onSave: (data: MemberFormData) => void;
  existingSkills: string[];
  existingRoles: string[];
}

/**
 * Member Form Component
 * Handles creating and editing members
 */
export const MemberForm: React.FC<MemberFormProps> = ({
  open,
  initialData,
  isEditing = false,
  onClose,
  onSave,
  existingSkills,
  existingRoles,
}) => {
  const { t } = useTranslation();

  const initialValues: MemberFormData = {
    name: '',
    role: '',
    skills: [],
    availability: Availability.AVAILABLE,
    email: '',
  };

  const form = useForm<MemberFormData>({
    initialValues,
    validationRules: {
      name: [validators.required()],
      role: [validators.required()],
      email: [
        validators.custom(
          (value) => {
            // Email is optional, but if provided, must be valid
            if (!value || (typeof value === 'string' && value.trim() === '')) {
              return true; // Valid (optional)
            }
            if (typeof value === 'string') {
              // Simple email validation regex
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              return emailRegex.test(value);
            }
            return true; // Non-string values are not emails
          },
          t('errors.invalidEmail')
        ),
      ],
    },
    validateOnChange: true,
    onSubmit: async (values) => {
      onSave({
        name: values.name.trim(),
        role: values.role.trim(),
        skills: values.skills,
        availability: values.availability,
        email: values.email?.trim() || undefined,
      });
      onClose();
    },
  });

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.resetTo({
          name: initialData.name,
          role: initialData.role,
          skills: initialData.skills,
          availability: initialData.availability,
          email: initialData.email || '',
        });
      } else {
        form.reset();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  const handleClose = () => {
    form.reset();
    form.clearErrors();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="member-form-dialog"
    >
      <DialogTitle id="member-form-dialog">
        {isEditing ? t('members.editMember') : t('members.addMember')}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            {...form.getFieldProps('name')}
            label={t('members.name')}
            fullWidth
            required
            inputProps={{ 'aria-label': t('members.name'), 'aria-required': true }}
          />

          <CreatableAutocomplete
            value={form.values.role}
            onChange={form.handleChange('role')}
            options={existingRoles}
            label={t('members.role')}
            placeholder={t('members.selectRole')}
            required
            error={!!form.errors.role}
            helperText={form.errors.role}
            ariaLabel={t('members.role')}
            addNewTitle={t('members.addNewRole')}
            addNewMessage={t('members.addNewRoleConfirm')}
            addButtonLabel={t('members.addRole')}
          />

          <CreatableAutocomplete
            multiple
            value={form.values.skills}
            onChange={form.handleChange('skills')}
            options={existingSkills}
            label={t('members.skills')}
            placeholder={t('members.addSkill')}
            ariaLabel={t('members.skills')}
            addNewTitle={t('members.addNewSkill')}
            addNewMessage={t('members.addNewSkillConfirm')}
            addButtonLabel={t('members.addSkill')}
            chipColor="primary"
            chipVariant="filled"
            chipSize="small"
          />

          <FormControl fullWidth>
            <InputLabel id="availability-label">{t('members.availability')}</InputLabel>
            <Select
              labelId="availability-label"
              value={form.values.availability}
              label={t('members.availability')}
              onChange={(e: SelectChangeEvent) =>
                form.handleChange('availability')(e.target.value as Availability)
              }
              onBlur={form.handleBlur('availability')}
              inputProps={{ 'aria-label': t('members.availability') }}
            >
              <MenuItem value={Availability.AVAILABLE}>{t('members.available')}</MenuItem>
              <MenuItem value={Availability.BUSY}>{t('members.busy')}</MenuItem>
              <MenuItem value={Availability.UNAVAILABLE}>{t('members.unavailable')}</MenuItem>
            </Select>
          </FormControl>

          <TextField
            {...form.getFieldProps('email')}
            label={t('members.email')}
            type="email"
            fullWidth
            inputProps={{ 'aria-label': t('members.email') }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} aria-label={t('common.cancel')}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={form.handleSubmit}
          variant="contained"
          color="primary"
          disabled={form.isSubmitting}
          aria-label={t('common.save')}
        >
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
