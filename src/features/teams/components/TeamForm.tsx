import React, { useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Team, RoleId, SkillId } from '@/types';
import { useForm, validators } from '@/hooks/useForm';
import { useRoles } from '@/hooks/useRoles';
import { useSkills } from '@/hooks/useSkills';
import { CreatableAutocomplete } from '@/components/shared/CreatableAutocomplete';

interface TeamFormData {
  name: string;
  description: string;
  color: string;
  targetRoles: string[];      // Role names for display
  targetSkills: string[];     // Skill names for display
  targetSize: string;         // String for form, will be converted to number
}

interface TeamFormProps {
  open: boolean;
  team?: Team;
  onClose: () => void;
  onSave: (team: Partial<Team>) => void;
}

/**
 * Team Form Component
 * Handles creating and editing teams
 */
export const TeamForm: React.FC<TeamFormProps> = ({ open, team, onClose, onSave }) => {
  const { t } = useTranslation();
  const { roles, getRoleName, getOrCreateRoleId } = useRoles();
  const { skills, getSkillName, getOrCreateSkillId } = useSkills();

  const roleNames = useMemo(() => roles.map(r => r.name), [roles]);
  const skillNames = useMemo(() => skills.map(s => s.name), [skills]);

  const initialValues: TeamFormData = {
    name: '',
    description: '',
    color: '#1976d2',
    targetRoles: [],
    targetSkills: [],
    targetSize: '',
  };

  const form = useForm<TeamFormData>({
    initialValues,
    validationRules: {
      name: [validators.required()],
      description: [validators.required()],
      targetSize: [
        validators.custom(
          (value) => {
            if (!value || (typeof value === 'string' && value.trim() === '')) return true; // Optional
            if (typeof value === 'string') {
              const num = parseInt(value, 10);
              return !isNaN(num) && num > 0;
            }
            return true; // Non-string values are not valid for targetSize
          },
          t('teams.invalidTargetSize')
        ),
      ],
    },
    validateOnChange: true,
    onSubmit: async (values) => {
      // Convert role/skill names to IDs, creating them if they don't exist
      const targetRoleIds: RoleId[] = values.targetRoles
        .map(name => getOrCreateRoleId(name))
        .filter(Boolean);
      
      const targetSkillIds: SkillId[] = values.targetSkills
        .map(name => getOrCreateSkillId(name))
        .filter(Boolean);

      const targetSize = values.targetSize.trim() 
        ? parseInt(values.targetSize, 10) 
        : undefined;

      onSave({
        name: values.name,
        description: values.description,
        color: values.color,
        targetRoles: targetRoleIds.length > 0 ? targetRoleIds : undefined,
        targetSkills: targetSkillIds.length > 0 ? targetSkillIds : undefined,
        targetSize,
      });
      onClose();
    },
  });

  // Reset form when dialog opens/closes or team changes
  useEffect(() => {
    if (open) {
      if (team) {
        // Convert role/skill IDs to names for display
        const targetRoleNames = (team.targetRoles || [])
          .map(id => getRoleName(id))
          .filter(Boolean);
        
        const targetSkillNames = (team.targetSkills || [])
          .map(id => getSkillName(id))
          .filter(Boolean);

        form.resetTo({
          name: team.name,
          description: team.description,
          color: team.color || '#1976d2',
          targetRoles: targetRoleNames,
          targetSkills: targetSkillNames,
          targetSize: team.targetSize?.toString() || '',
        });
      } else {
        form.reset();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, team]);

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
      aria-labelledby="team-form-dialog"
    >
      <DialogTitle id="team-form-dialog">
        {team ? t('teams.editTeam') : t('teams.addTeam')}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            {...form.getFieldProps('name')}
            label={t('teams.name')}
            fullWidth
            required
            inputProps={{ 'aria-label': t('teams.name'), 'aria-required': true }}
          />

          <TextField
            {...form.getFieldProps('description')}
            label={t('teams.description')}
            fullWidth
            required
            multiline
            rows={3}
            inputProps={{ 'aria-label': t('teams.description'), 'aria-required': true }}
          />

          <Box>
            <TextField
              value={form.values.color}
              onChange={(e) => form.handleChange('color')(e.target.value)}
              onBlur={form.handleBlur('color')}
              label="Color"
              type="color"
              fullWidth
              inputProps={{ 'aria-label': t('teams.color') }}
            />
          </Box>

          <Divider sx={{ my: 1 }} />

          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {t('teams.targetCriteria')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('teams.targetCriteriaDescription')}
          </Typography>

          <CreatableAutocomplete
            multiple
            value={form.values.targetRoles}
            onChange={form.handleChange('targetRoles')}
            options={roleNames}
            label={t('teams.targetRoles')}
            placeholder={t('teams.selectTargetRoles')}
            ariaLabel={t('teams.targetRoles')}
            addNewTitle={t('teams.addNewRole')}
            addNewMessage={t('teams.addNewRoleConfirm')}
            addButtonLabel={t('teams.addRole')}
            chipColor="primary"
            chipVariant="outlined"
            chipSize="small"
          />

          <CreatableAutocomplete
            multiple
            value={form.values.targetSkills}
            onChange={form.handleChange('targetSkills')}
            options={skillNames}
            label={t('teams.targetSkills')}
            placeholder={t('teams.selectTargetSkills')}
            ariaLabel={t('teams.targetSkills')}
            addNewTitle={t('teams.addNewSkill')}
            addNewMessage={t('teams.addNewSkillConfirm')}
            addButtonLabel={t('teams.addSkill')}
            chipColor="secondary"
            chipVariant="outlined"
            chipSize="small"
          />

          <TextField
            {...form.getFieldProps('targetSize')}
            label={t('teams.targetSize')}
            type="number"
            fullWidth
            inputProps={{ 
              'aria-label': t('teams.targetSize'),
              min: 1,
              step: 1,
            }}
            helperText={t('teams.targetSizeDescription')}
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
