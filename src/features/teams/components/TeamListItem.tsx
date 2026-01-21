import React from 'react';
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Box,
  Typography,
  Chip,
  AvatarGroup,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import WorkIcon from '@mui/icons-material/Work';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import { useTranslation } from 'react-i18next';
import { MemberAvatar } from '@/components/shared/MemberAvatar';
import type { Team } from '@/types';
import type { MemberWithNames } from '@/hooks/useMembers';
import { useRoles } from '@/hooks/useRoles';
import { useSkills } from '@/hooks/useSkills';

interface TeamListItemProps {
  team: Team;
  members: MemberWithNames[];
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
  onClick?: (team: Team) => void;
}

/**
 * Team List Item Component for List View
 */
export const TeamListItem: React.FC<TeamListItemProps> = ({
  team,
  members,
  onEdit,
  onDelete,
  onClick,
}) => {
  const { t } = useTranslation();
  const { getRoleName } = useRoles();
  const { getSkillName } = useSkills();

  // Resolve target roles and skills to names
  const targetRoleNames = team.targetRoles
    ?.map(id => getRoleName(id))
    .filter(Boolean) || [];
  
  const targetSkillNames = team.targetSkills
    ?.map(id => getSkillName(id))
    .filter(Boolean) || [];
  
  const hasTargetCriteria = targetRoleNames.length > 0 || targetSkillNames.length > 0 || team.targetSize;

  return (
    <ListItem
      button={onClick ? true : false}
      onClick={() => onClick?.(team)}
      sx={{ borderLeft: 4, borderColor: team.color || 'primary.main' }}
    >
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="subtitle1" component="span">
              {team.name}
            </Typography>
            <Chip
              icon={<GroupIcon />}
              label={`${members.length}${team.targetSize ? ` / ${team.targetSize}` : ''} ${t('teams.members')}`}
              size="small"
              color="primary"
              variant="outlined"
            />
            {team.targetSize && (
              <Chip
                label={t('teams.target')}
                size="small"
                variant="outlined"
                color={members.length === team.targetSize ? 'success' : members.length < team.targetSize ? 'warning' : 'error'}
              />
            )}
          </Box>
        }
        secondary={
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" component="span" display="block">
              {team.description}
            </Typography>
            {hasTargetCriteria && (
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                {targetRoleNames.length > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <WorkIcon sx={{ fontSize: 14 }} color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {targetRoleNames.join(', ')}
                    </Typography>
                  </Box>
                )}
                {targetSkillNames.length > 0 && (() => {
                  const shown = targetSkillNames.slice(0, 3).join(', ');
                  const extraCount = targetSkillNames.length - 3;
                  const extra = targetSkillNames.slice(3).join(', ');
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <EmojiObjectsIcon sx={{ fontSize: 14 }} color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {shown}
                      </Typography>
                      {extraCount > 0 && (
                        <Tooltip title={extra} arrow>
                          <Chip
                            label={`+${extraCount}`}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20 }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                  );
                })()}
              </Box>
            )}
            {members.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <AvatarGroup max={8} sx={{ justifyContent: 'flex-start' }}>
                  {members.map((member) => (
                    <MemberAvatar key={member.id} member={member} size="small" />
                  ))}
                </AvatarGroup>
              </Box>
            )}
          </Box>
        }
      />
      <ListItemSecondaryAction>
        <Tooltip title={t('teams.assignMembers')} arrow>
          <IconButton
            edge="end"
            onClick={() => onClick?.(team)}
            color="primary"
            aria-label={`${t('teams.assignMembers')} - ${team.name}`}
          >
            <GroupAddIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('common.edit')} arrow>
          <IconButton
            edge="end"
            onClick={() => onEdit(team)}
            aria-label={`${t('common.edit')} ${team.name}`}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('common.delete')} arrow>
          <IconButton
            edge="end"
            onClick={() => onDelete(team)}
            color="error"
            aria-label={`${t('common.delete')} ${team.name}`}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </ListItemSecondaryAction>
    </ListItem>
  );
};
