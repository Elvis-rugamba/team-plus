import React, { useMemo } from 'react';
import { Box, Chip, IconButton, AvatarGroup, Tooltip, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import WorkIcon from '@mui/icons-material/Work';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import { useTranslation } from 'react-i18next';
import { MemberAvatar } from '@/components/shared/MemberAvatar';
import type { Column } from '@/components/shared/ListingView';
import type { Team } from '@/types';
import type { MemberWithNames } from '@/hooks/useMembers';
import { useRoles } from '@/hooks/useRoles';
import { useSkills } from '@/hooks/useSkills';

/**
 * Business logic hook for team table columns
 */
export function useTeamColumns(
  onEdit: (team: Team) => void,
  onDelete: (team: Team) => void,
  onTeamClick: (team: Team) => void,
  getTeamMembers: (teamId: string) => MemberWithNames[]
): Column<Team>[] {
  const { t } = useTranslation();
  const { getRoleName } = useRoles();
  const { getSkillName } = useSkills();

  return useMemo(
    () => [
      {
        id: 'name',
        label: t('teams.name'),
        field: 'name',
        sortable: true,
        filterable: true,
        minWidth: 150,
        flex: 1,
        render: (team) => (
          <Tooltip title={t('teams.clickToAssign')} arrow>
            <Box
              onClick={() => onTeamClick(team)}
              sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              <Typography variant="subtitle2">{team.name}</Typography>
            </Box>
          </Tooltip>
        ),
      },
      {
        id: 'description',
        label: t('teams.description'),
        field: 'description',
        sortable: true,
        filterable: true,
        minWidth: 200,
        flex: 2,
        render: (team) => team.description,
      },
      {
        id: 'memberCount',
        label: t('teams.members'),
        sortable: true,
        filterable: false,
        width: 140,
        valueGetter: (team) => team.memberIds.length,
        render: (team) => {
          const currentSize = team.memberIds.length;
          const targetSize = team.targetSize;
          const sizeColor = targetSize
            ? currentSize === targetSize
              ? 'success'
              : currentSize < targetSize
                ? 'warning'
                : 'error'
            : 'primary';

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Chip
                icon={<GroupIcon />}
                label={targetSize ? `${currentSize} / ${targetSize}` : currentSize}
                size="small"
                color={sizeColor}
                variant="outlined"
              />
            </Box>
          );
        },
      },
      {
        id: 'targetRoles',
        label: t('teams.targetRoles'),
        sortable: false,
        filterable: false,
        minWidth: 150,
        flex: 1,
        render: (team) => {
          const targetRoleNames = team.targetRoles
            ?.map(id => getRoleName(id))
            .filter(Boolean) || [];

          if (targetRoleNames.length === 0) {
            return <Typography variant="caption" color="text.secondary">-</Typography>;
          }

          return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {targetRoleNames.slice(0, 2).map((role) => (
                <Chip
                  key={role}
                  icon={<WorkIcon sx={{ fontSize: 14 }} />}
                  label={role}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              ))}
              {targetRoleNames.length > 2 && (
                <Tooltip title={targetRoleNames.slice(2).join(', ')} arrow>
                  <Chip label={`+${targetRoleNames.length - 2}`} size="small" variant="outlined" />
                </Tooltip>
              )}
            </Box>
          );
        },
      },
      {
        id: 'targetSkills',
        label: t('teams.targetSkills'),
        sortable: false,
        filterable: false,
        minWidth: 180,
        flex: 1.2,
        render: (team) => {
          const targetSkillNames = team.targetSkills
            ?.map(id => getSkillName(id))
            .filter(Boolean) || [];

          if (targetSkillNames.length === 0) {
            return <Typography variant="caption" color="text.secondary">-</Typography>;
          }

          return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {targetSkillNames.slice(0, 3).map((skill) => (
                <Chip
                  key={skill}
                  icon={<EmojiObjectsIcon sx={{ fontSize: 14 }} />}
                  label={skill}
                  size="small"
                  variant="outlined"
                  color="secondary"
                />
              ))}
              {targetSkillNames.length > 3 && (
                <Tooltip title={targetSkillNames.slice(3).join(', ')} arrow>
                  <Chip label={`+${targetSkillNames.length - 3}`} size="small" variant="outlined" />
                </Tooltip>
              )}
            </Box>
          );
        },
      },
      {
        id: 'teamMembers',
        label: t('teams.members'),
        sortable: false,
        filterable: false,
        minWidth: 200,
        flex: 1.5,
        render: (team) => {
          const members = getTeamMembers(team.id);
          return members.length > 0 ? (
            <AvatarGroup max={5}>
              {members.map((member) => (
                <MemberAvatar key={member.id} member={member} size="medium" />
              ))}
            </AvatarGroup>
          ) : (
            <Typography variant="caption" color="text.secondary">
              {t('teams.noMembersInTeam')}
            </Typography>
          );
        },
      },
      {
        id: 'actions',
        label: t('common.actions'),
        sortable: false,
        filterable: false,
        width: 160,
        align: 'right',
        render: (team) => (
          <Box>
            <Tooltip title={t('teams.assignMembers')} arrow>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onTeamClick(team);
                }}
                color="primary"
                aria-label={`${t('teams.assignMembers')} - ${team.name}`}
              >
                <GroupAddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.edit')} arrow>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(team);
                }}
                aria-label={`${t('common.edit')} ${team.name}`}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.delete')} arrow>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(team);
                }}
                color="error"
                aria-label={`${t('common.delete')} ${team.name}`}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [t, onEdit, onDelete, onTeamClick, getTeamMembers, getRoleName, getSkillName]
  );
}
