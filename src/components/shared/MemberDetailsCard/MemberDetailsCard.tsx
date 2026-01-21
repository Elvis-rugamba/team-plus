import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Stack,
  Avatar,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import { useTranslation } from 'react-i18next';
import type { MemberWithNames } from '@/hooks/useMembers';

interface MemberDetailsCardProps {
  member: MemberWithNames;
  teamCount?: number;
}

/**
 * Member Details Card Component
 * Shows detailed member information in a hover card
 */
export const MemberDetailsCard: React.FC<MemberDetailsCardProps> = ({ member, teamCount }) => {
  const { t } = useTranslation();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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

  return (
    <Card
      elevation={8}
      sx={{
        minWidth: 280,
        maxWidth: 320,
        pointerEvents: 'none', // Prevent card from blocking hover
      }}
    >
      <CardContent>
        {/* Header with Avatar and Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: 'primary.main',
              fontSize: '1.25rem',
            }}
          >
            {getInitials(member.name)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              {member.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <WorkIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {member.roleName}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Availability Status */}
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              {t('members.availability')}
            </Typography>
            <Chip
              label={t(`members.${member.availability.toLowerCase()}`)}
              color={getAvailabilityColor(member.availability) as any}
              size="small"
              sx={{ fontWeight: 'medium' }}
            />
          </Box>

          {/* Skills */}
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

          {/* Email */}
          {member.email && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                {t('members.email')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="body2" noWrap>
                  {member.email}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Team Count */}
          {teamCount !== undefined && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                {t('teams.teams')}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {teamCount} {teamCount === 1 ? 'team' : 'teams'}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
