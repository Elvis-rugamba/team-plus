import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Stack,
  Avatar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import { useTranslation } from 'react-i18next';
import type { MemberWithNames } from '@/hooks/useMembers';

interface MemberCardProps {
  member: MemberWithNames;
  onEdit: (member: MemberWithNames) => void;
  onDelete: (member: MemberWithNames) => void;
  teamCount?: number;
}

/**
 * Member Card Component for Grid View
 */
export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onEdit,
  onDelete,
  teamCount = 0,
}) => {
  const { t } = useTranslation();

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'AVAILABLE':
        return 'success';
      case 'BUSY':
        return 'warning';
      case 'UNAVAILABLE':
        return 'error';
      default:
        return 'default';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 56,
                height: 56,
              }}
              aria-label={`${member.name} avatar`}
            >
              {getInitials(member.name)}
            </Avatar>
            <Box>
              <Typography variant="h6" component="h3" gutterBottom>
                {member.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {member.roleName}
              </Typography>
            </Box>
          </Box>
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
        </Box>

        <Stack spacing={1.5}>
          <Box>
            <Chip
              label={t(`members.${member.availability.toLowerCase()}`)}
              color={getAvailabilityColor(member.availability) as any}
              size="small"
              sx={{ mb: 1 }}
            />
            {teamCount > 0 && (
              <Chip label={`${teamCount} ${t('teams.teams')}`} size="small" sx={{ ml: 1 }} />
            )}
          </Box>

          {member.skillNames.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                {t('members.skills')}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {member.skillNames.map((skill) => (
                  <Chip key={skill} label={skill} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          )}

          {member.email && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <EmailIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary" noWrap>
                {member.email}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
