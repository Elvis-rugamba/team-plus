import React from 'react';
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Box,
  Typography,
  Chip,
  Avatar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import type { MemberWithNames } from '@/hooks/useMembers';

interface MemberListItemProps {
  member: MemberWithNames;
  onEdit: (member: MemberWithNames) => void;
  onDelete: (member: MemberWithNames) => void;
  teamCount: number;
}

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
 * Member List Item Component for List View
 */
export const MemberListItem: React.FC<MemberListItemProps> = ({
  member,
  onEdit,
  onDelete,
  teamCount,
}) => {
  const { t } = useTranslation();

  return (
    <ListItem sx={{ alignItems: 'flex-start', py: 1.5 }}>
      <ListItemAvatar sx={{ mt: 0.5 }}>
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: 40,
            height: 40,
          }}
          aria-label={`${member.name} avatar`}
        >
          {getInitials(member.name)}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="subtitle1" component="span" sx={{ fontWeight: 500 }}>
              {member.name}
            </Typography>
            <Chip label={member.roleName} size="small" />
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
          </Box>
        }
        secondary={
          <Box sx={{ mt: 1 }}>
            {member.skillNames.length > 0 && (
              <Typography variant="body2" component="span">
                {t('members.skills')}: {member.skillNames.join(', ')}
              </Typography>
            )}
            {member.email && (
              <Typography variant="body2" component="span" sx={{ display: 'block' }}>
                {member.email}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" component="span">
              {teamCount} {t('teams.teams')}
            </Typography>
          </Box>
        }
      />
      <ListItemSecondaryAction sx={{ top: 16, transform: 'none' }}>
        <IconButton
          edge="end"
          onClick={() => onEdit(member)}
          aria-label={`${t('common.edit')} ${member.name}`}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          edge="end"
          onClick={() => onDelete(member)}
          color="error"
          aria-label={`${t('common.delete')} ${member.name}`}
        >
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};
