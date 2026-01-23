import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  AvatarGroup,
  Tooltip,
  Button,
  Divider,
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

interface TeamCardProps {
  team: Team;
  members: MemberWithNames[];
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
  onClick?: (team: Team) => void;
}

/**
 * Team Card Component for Grid View
 */
export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  members,
  onEdit,
  onDelete,
  onClick,
}) => {
  const { t } = useTranslation();
  const { getRoleName } = useRoles();
  const { getSkillName } = useSkills();

  // Resolve target roles and skills to names (memoized for performance)
  const targetRoleNames = useMemo(() => {
    return team.targetRoles
      ?.map(id => getRoleName(id))
      .filter(Boolean) || [];
  }, [team.targetRoles, getRoleName]);

  const targetSkillNames = useMemo(() => {
    return team.targetSkills
      ?.map(id => getSkillName(id))
      .filter(Boolean) || [];
  }, [team.targetSkills, getSkillName]);

  const hasTargetCriteria = useMemo(() => {
    return targetRoleNames.length > 0 || targetSkillNames.length > 0 || team.targetSize;
  }, [targetRoleNames.length, targetSkillNames.length, team.targetSize]);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
        borderTop: 4,
        borderColor: team.color || 'primary.main',
      }}
      onClick={() => onClick?.(team)}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              {team.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {team.description}
            </Typography>
          </Box>
          <Box onClick={(e) => e.stopPropagation()}>
            <Tooltip title={t('teams.assignMembers')} arrow>
              <IconButton
                size="small"
                onClick={() => onClick?.(team)}
                color="primary"
                aria-label={`${t('teams.assignMembers')} - ${team.name}`}
              >
                <GroupAddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.edit')} arrow>
              <IconButton
                size="small"
                onClick={() => onEdit(team)}
                aria-label={`${t('common.edit')} ${team.name}`}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.delete')} arrow>
              <IconButton
                size="small"
                onClick={() => onDelete(team)}
                color="error"
                aria-label={`${t('common.delete')} ${team.name}`}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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

        {/* Target Criteria */}
        {hasTargetCriteria && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                {t('teams.targetCriteria')}
              </Typography>
              {targetRoleNames.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <WorkIcon sx={{ fontSize: 14 }} color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {t('teams.targetRoles')}:
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {targetRoleNames.slice(0, 4).map((role) => (
                      <Chip key={role} label={role} size="small" variant="outlined" color="primary" />
                    ))}
                    {targetRoleNames.length > 4 && (
                      <Tooltip title={targetRoleNames.slice(4).join(', ')} arrow>
                        <Chip label={`+${targetRoleNames.length - 4}`} size="small" variant="outlined" />
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              )}
              {targetSkillNames.length > 0 && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <EmojiObjectsIcon sx={{ fontSize: 14 }} color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {t('teams.targetSkills')}:
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {targetSkillNames.slice(0, 4).map((skill) => (
                      <Chip key={skill} label={skill} size="small" variant="outlined" color="secondary" />
                    ))}
                    {targetSkillNames.length > 4 && (
                      <Tooltip title={targetSkillNames.slice(4).join(', ')} arrow>
                        <Chip label={`+${targetSkillNames.length - 4}`} size="small" variant="outlined" />
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </>
        )}

        {members.length > 0 ? (
          <Box sx={{ mt: 2 }}>
            <AvatarGroup max={5} sx={{ justifyContent: 'flex-start' }}>
              {members.map((member) => (
                <MemberAvatar
                  key={member.id}
                  member={member}
                  size="medium"
                  bgcolor={team.color || 'primary.main'}
                />
              ))}
            </AvatarGroup>
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<GroupAddIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onClick?.(team);
              }}
              fullWidth
            >
              {t('teams.assignMembers')}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
