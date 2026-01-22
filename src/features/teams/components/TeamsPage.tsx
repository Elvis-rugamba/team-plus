import React, { useState, useMemo } from 'react';
import { Box, Button, Typography, Paper, Badge, Chip, IconButton, Tooltip } from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { useTranslation } from 'react-i18next';
import { useTeams } from '@/hooks/useTeams';
import { useMembers } from '@/hooks/useMembers';
import { useRoles } from '@/hooks/useRoles';
import { useSkills } from '@/hooks/useSkills';
import { useListingView } from '@/hooks/useListingView';
import { useSearch } from '@/hooks/useSearch';
import { useFilter, type FilterValue } from '@/hooks/useFilter';
import type { Team } from '@/types';
import { TeamForm } from './TeamForm';
import { TeamCard } from './TeamCard';
import { TeamListItem } from './TeamListItem';
import { TeamAssignment } from './TeamAssignment';
import { useTeamColumns } from '../hooks/useTeamColumns';
import { useTeamSearchConfig } from '../hooks/useTeamSearch';
import { useTeamFilters } from '../hooks/useTeamFilters';
import { ListingView } from '@/components/shared/ListingView';
import { ViewModeToggle } from '@/components/shared/ViewModeToggle';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { SearchBar } from '@/components/shared/SearchBar';
import { FilterModal } from '@/components/shared/FilterModal';

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
    getTeamById,
  } = useTeams();
  const { getMembersByTeam, membersWithNames } = useMembers();
  const { roleNames } = useRoles();
  const { skillNames } = useSkills();

  // UI state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | undefined>();
  const [deletingTeam, setDeletingTeam] = useState<Team | undefined>();
  const [assigningTeam, setAssigningTeam] = useState<Team | undefined>();

  // Business logic hooks
  const listingView = useListingView(teams, 'table', 25);
  const searchConfig = useTeamSearchConfig();
  const searchedTeams = useSearch(teams, listingView.searchTerm, searchConfig);
  
  // Prepare filter options
  const filterDefinitions = useTeamFilters(roleNames, skillNames);
  
  const {
    filteredItems,
    activeFilters,
    applyFilter,
    removeFilter,
    clearAllFilters,
    getFilterValue,
    hasActiveFilters,
  } = useFilter(searchedTeams, filterDefinitions);

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

  // Get filter chip labels for display
  const getFilterChipLabel = (filter: { id: string; value: FilterValue }) => {
    const definition = filterDefinitions.find((d) => d.id === filter.id);
    if (!definition) return filter.id;

    if (Array.isArray(filter.value)) {
      const count = filter.value.length;
      return `${definition.label}: ${count}`;
    }
    const option = definition.options?.find((o) => o.value === filter.value);
    return `${definition.label}: ${option?.label || filter.value}`;
  };

  // Get current team from state to ensure we have the latest memberIds
  // This ensures the availableMembers list updates when members are assigned/removed
  const currentAssigningTeam = useMemo(() => {
    if (!assigningTeam) return null;
    // Find the team in the current teams array to get the latest memberIds
    const currentTeam = teams.find(t => t.id === assigningTeam.id);
    return currentTeam || assigningTeam;
  }, [assigningTeam, teams]);

  const currentTeamMembers = useMemo(() => {
    if (!currentAssigningTeam) return [];
    return getMembersByTeam(currentAssigningTeam.id);
  }, [currentAssigningTeam, getMembersByTeam]);

  const currentAvailableMembers = useMemo(() => {
    if (!currentAssigningTeam) return [];
    return membersWithNames.filter(
      (member) => !currentAssigningTeam.memberIds.includes(member.id)
    );
  }, [membersWithNames, currentAssigningTeam]);

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

        {/* Search Bar and Filter Button */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <SearchBar
              value={listingView.searchTerm}
              onChange={listingView.setSearchTerm}
              fullWidth
            />
          </Box>
          <Tooltip title={t('filter.filterButton')}>
            <Badge 
              badgeContent={activeFilters.length} 
              color="primary"
              invisible={activeFilters.length === 0}
            >
              <Button
                variant={hasActiveFilters ? 'contained' : 'outlined'}
                color={hasActiveFilters ? 'primary' : 'inherit'}
                startIcon={<FilterListIcon />}
                onClick={() => setIsFilterOpen(true)}
                aria-label={t('filter.filterButton')}
                sx={{ minWidth: 120 }}
              >
                {t('filter.filterButton')}
              </Button>
            </Badge>
          </Tooltip>
        </Box>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, alignItems: 'center' }}>
            {activeFilters.map((filter) => (
              <Chip
                key={filter.id}
                label={getFilterChipLabel(filter)}
                onDelete={() => removeFilter(filter.id)}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
            <IconButton 
              size="small" 
              onClick={clearAllFilters}
              aria-label={t('filter.clearFilters')}
              sx={{ ml: 1 }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Paper>

      {/* Results Summary */}
      {(listingView.searchTerm || hasActiveFilters) && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredItems.length} of {teams.length} teams
          </Typography>
        </Paper>
      )}

      {/* Listing */}
      <ListingView
        items={filteredItems}
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
        totalItems={filteredItems.length}
        onPageChange={listingView.setPage}
        onPageSizeChange={listingView.setRowsPerPage}
      />

      {/* Filter Modal */}
      <FilterModal
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filterDefinitions={filterDefinitions}
        activeFilters={activeFilters}
        onApplyFilter={applyFilter}
        onRemoveFilter={removeFilter}
        onClearAll={clearAllFilters}
        getFilterValue={getFilterValue}
      />

      {/* Dialogs */}
      <TeamForm
        open={isFormOpen}
        team={editingTeam}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
      />

      {currentAssigningTeam && (
        <TeamAssignment
          open={!!assigningTeam}
          team={currentAssigningTeam}
          teamMembers={currentTeamMembers}
          availableMembers={currentAvailableMembers}
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
