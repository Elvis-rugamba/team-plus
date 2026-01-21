import React, { useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { useTranslation } from 'react-i18next';
import { useTeams } from '@/hooks/useTeams';
import { useMembers } from '@/hooks/useMembers';
import { useListingView } from '@/hooks/useListingView';
import { useSearch } from '@/hooks/useSearch';
import type { Team } from '@/types';
import { TeamForm } from './TeamForm';
import { TeamCard } from './TeamCard';
import { TeamListItem } from './TeamListItem';
import { TeamAssignment } from './TeamAssignment';
import { useTeamColumns } from '../hooks/useTeamColumns';
import { useTeamSearchConfig } from '../hooks/useTeamSearch';
import { ListingView } from '@/components/shared/ListingView';
import { ViewModeToggle } from '@/components/shared/ViewModeToggle';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { SearchBar } from '@/components/shared/SearchBar';

/**
 * Teams Page Component
 * Main page for team management with advanced search
 */
export const TeamsPage: React.FC = () => {
  const { t } = useTranslation();
  
  // Data hooks
  const {
    teams,
    addTeam,
    updateTeam,
    deleteTeam,
    assignMembersToTeam,
    removeMemberFromTeam,
  } = useTeams();
  const { getMembersByTeam, getUnassignedMembers } = useMembers();

  // UI state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | undefined>();
  const [deletingTeam, setDeletingTeam] = useState<Team | undefined>();
  const [assigningTeam, setAssigningTeam] = useState<Team | undefined>();

  // Business logic hooks
  const listingView = useListingView(teams, 'table', 25);
  const searchConfig = useTeamSearchConfig();
  const searchedTeams = useSearch(teams, listingView.searchTerm, searchConfig);

  // Define columns using business logic hook
  const columns = useTeamColumns(handleEdit, handleDelete, handleTeamClick, getMembersByTeam);

  // Event handlers
  function handleAdd() {
    setEditingTeam(undefined);
    setIsFormOpen(true);
  }

  function handleEdit(team: Team) {
    setEditingTeam(team);
    setIsFormOpen(true);
  }

  function handleDelete(team: Team) {
    setDeletingTeam(team);
  }

  function confirmDelete() {
    if (deletingTeam) {
      deleteTeam(deletingTeam.id);
      setDeletingTeam(undefined);
    }
  }

  function handleSave(teamData: Partial<Team>) {
    if (editingTeam) {
      updateTeam({ ...editingTeam, ...teamData });
    } else {
      addTeam(teamData as Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'memberIds'>);
    }
  }

  function handleTeamClick(team: Team) {
    setAssigningTeam(team);
  }

  function handleAssignMembers(memberIds: string[]) {
    if (assigningTeam) {
      assignMembersToTeam(memberIds, assigningTeam.id);
    }
  }

  function handleRemoveMember(memberId: string) {
    if (assigningTeam) {
      removeMemberFromTeam(memberId, assigningTeam.id);
    }
  }

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mb: 2,
          }}
        >
          <Typography variant="h4" component="h1">
            {t('teams.title')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <ViewModeToggle value={listingView.viewMode} onChange={listingView.setViewMode} />
            <Button
              variant="contained"
              color="primary"
              startIcon={<GroupAddIcon />}
              onClick={handleAdd}
              aria-label={t('teams.addTeam')}
            >
              {t('teams.addTeam')}
            </Button>
          </Box>
        </Box>

        {/* Search Bar */}
        <SearchBar
          value={listingView.searchTerm}
          onChange={listingView.setSearchTerm}
          fullWidth
        />
      </Paper>

      {/* Results Summary */}
      {listingView.searchTerm && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {searchedTeams.length} of {teams.length} teams
          </Typography>
        </Paper>
      )}

      {/* Listing */}
      <ListingView
        items={searchedTeams}
        viewMode={listingView.viewMode}
        columns={columns}
        getItemId={(team) => team.id}
        renderGridCard={(team) => (
          <TeamCard
            team={team}
            members={getMembersByTeam(team.id)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClick={handleTeamClick}
          />
        )}
        renderListItem={(team) => (
          <TeamListItem
            team={team}
            members={getMembersByTeam(team.id)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClick={handleTeamClick}
          />
        )}
        emptyState={{
          title: t('teams.noTeams'),
          action: {
            label: t('teams.addTeam'),
            onClick: handleAdd,
            icon: <GroupAddIcon />,
          },
        }}
        ariaLabel={t('teams.title')}
        page={listingView.page}
        pageSize={listingView.rowsPerPage}
        totalItems={searchedTeams.length}
        onPageChange={listingView.setPage}
        onPageSizeChange={listingView.setRowsPerPage}
      />

      {/* Dialogs */}
      <TeamForm
        open={isFormOpen}
        team={editingTeam}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
      />

      {assigningTeam && (
        <TeamAssignment
          open={!!assigningTeam}
          team={assigningTeam}
          teamMembers={getMembersByTeam(assigningTeam.id)}
          availableMembers={getUnassignedMembers()}
          onClose={() => setAssigningTeam(undefined)}
          onAssign={handleAssignMembers}
          onRemove={handleRemoveMember}
        />
      )}

      <ConfirmDialog
        open={!!deletingTeam}
        title={t('teams.deleteTeam')}
        message={t('teams.deleteConfirm')}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingTeam(undefined)}
        confirmColor="error"
      />
    </Box>
  );
};
