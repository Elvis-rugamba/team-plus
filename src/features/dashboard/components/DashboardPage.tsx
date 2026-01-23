import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import PeopleIcon from '@mui/icons-material/People';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '@/contexts/AppContext';
import { useMembers } from '@/hooks/useMembers';
import { useTeams } from '@/hooks/useTeams';
import { exportData } from '@/utils/export';
import type { ExportFormat } from '@/types';

/**
 * Dashboard Page Component
 * Main landing page with overview and quick actions
 */
export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { state } = useAppContext();
  const { membersWithNames } = useMembers();
  const { teams } = useTeams();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setAnchorEl(null);
  };

  const handleExport = (format: ExportFormat) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `team-plus-export-${timestamp}.${format}`;
    exportData(state, format, filename);
    handleExportClose();
  };

  const recentMembers = membersWithNames.slice(0, 5);
  const recentTeams = teams.slice(0, 5);

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {t('app.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('app.subtitle')}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportClick}
            aria-label={t('common.export')}
            aria-controls="export-menu"
            aria-haspopup="true"
          >
            {t('common.export')}
          </Button>
          <Menu
            id="export-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleExportClose}
          >
            <MenuItem onClick={() => handleExport('json')}>
              {t('export.json')}
            </MenuItem>
            <MenuItem onClick={() => handleExport('csv')}>
              {t('export.csv')}
            </MenuItem>
          </Menu>
        </Box>
      </Paper>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} aria-hidden="true" />
                <Box>
                  <Typography variant="h3" component="div">
                    {membersWithNames.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('statistics.totalMembers')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small" href="/members">
                {t('nav.members')}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <GroupIcon sx={{ fontSize: 40, mr: 2, color: 'secondary.main' }} aria-hidden="true" />
                <Box>
                  <Typography variant="h3" component="div">
                    {teams.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('statistics.totalTeams')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small" href="/teams">
                {t('nav.teams')}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.recentMembers')}
            </Typography>
            {recentMembers.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                {t('members.noMembers')}
              </Typography>
            ) : (
              <Box sx={{ mt: 2 }}>
                {recentMembers.map((member) => (
                  <Box
                    key={member.id}
                    sx={{
                      py: 1.5,
                      borderBottom: 1,
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 0 },
                    }}
                  >
                    <Typography variant="subtitle2">{member.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {member.roleName}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
            <Button size="small" sx={{ mt: 2 }} href="/members">
              {t('dashboard.viewAllMembers')}
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.recentTeams')}
            </Typography>
            {recentTeams.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                {t('teams.noTeams')}
              </Typography>
            ) : (
              <Box sx={{ mt: 2 }}>
                {recentTeams.map((team) => (
                  <Box
                    key={team.id}
                    sx={{
                      py: 1.5,
                      borderBottom: 1,
                      borderColor: 'divider',
                      borderLeft: 4,
                      borderLeftColor: team.color || 'primary.main',
                      pl: 2,
                      '&:last-child': { borderBottom: 0 },
                    }}
                  >
                    <Typography variant="subtitle2">{team.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {team.memberIds.length} members
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
            <Button size="small" sx={{ mt: 2 }} href="/teams">
              {t('dashboard.viewAllTeams')}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
