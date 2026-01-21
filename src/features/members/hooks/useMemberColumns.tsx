import React, { useMemo } from 'react';
import { Box, Chip, IconButton, Avatar, Typography, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import type { Column } from '@/components/shared/ListingView';
import type { MemberWithNames } from '@/hooks/useMembers';

/**
 * Get initials from a name
 */
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Business logic hook for member table columns
 */
export function useMemberColumns(
  onEdit: (member: MemberWithNames) => void,
  onDelete: (member: MemberWithNames) => void,
  getTeamCount: (memberId: string) => number
): Column<MemberWithNames>[] {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        id: 'name',
        label: t('members.name'),
        field: 'name',
        sortable: true,
        filterable: true,
        minWidth: 200,
        flex: 1.2,
        render: (member) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 32,
                height: 32,
                fontSize: '0.875rem',
              }}
              aria-label={`${member.name} avatar`}
            >
              {getInitials(member.name)}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {member.name}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'role',
        label: t('members.role'),
        field: 'roleName',
        sortable: true,
        filterable: true,
        minWidth: 130,
        flex: 0.8,
        render: (member) => <Chip label={member.roleName} size="small" />,
      },
      {
        id: 'skills',
        label: t('members.skills'),
        sortable: false,
        filterable: false,
        minWidth: 200,
        flex: 1.5,
        render: (member) => {
          const extraCount = member.skillNames.length - 3;
          const extraSkills = member.skillNames.slice(3).join(', ');
          return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {member.skillNames.slice(0, 3).map((skill) => (
                <Chip key={skill} label={skill} size="small" variant="outlined" />
              ))}
              {extraCount > 0 && (
                <Tooltip title={extraSkills} arrow>
                  <Chip label={`+${extraCount}`} size="small" variant="outlined" />
                </Tooltip>
              )}
            </Box>
          );
        },
      },
      {
        id: 'availability',
        label: t('members.availability'),
        field: 'availability',
        sortable: true,
        filterable: true,
        minWidth: 130,
        flex: 0.8,
        render: (member) => (
          <Chip
            label={t(`members.${member.availability.toLowerCase()}`)}
            size="small"
            color={
              member.availability === 'AVAILABLE'
                ? 'success'
                : member.availability === 'BUSY'
                  ? 'warning'
                  : 'error'
            }
          />
        ),
      },
      {
        id: 'email',
        label: t('members.email'),
        field: 'email',
        sortable: true,
        filterable: true,
        minWidth: 180,
        flex: 1,
        render: (member) => member.email || '-',
      },
      {
        id: 'teams',
        label: t('teams.teams'),
        sortable: false,
        filterable: false,
        width: 100,
        render: (member) => getTeamCount(member.id),
      },
      {
        id: 'actions',
        label: t('common.actions'),
        sortable: false,
        filterable: false,
        width: 120,
        align: 'right',
        render: (member) => (
          <Box>
            <IconButton
              size="small"
              onClick={() => onEdit(member)}
              aria-label={`${t('common.edit')} ${member.name}`}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(member)}
              color="error"
              aria-label={`${t('common.delete')} ${member.name}`}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    [t, onEdit, onDelete, getTeamCount]
  );
}
