import React, { useState, useMemo } from 'react';
import { Box, Button, Typography, Paper, Badge, Chip, IconButton, Tooltip } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { useTranslation } from 'react-i18next';
import { useMembers, type MemberWithNames } from '@/hooks/useMembers';
import { useTeams } from '@/hooks/useTeams';
import { useListingView } from '@/hooks/useListingView';
import { useSearch } from '@/hooks/useSearch';
import { useFilter, type FilterValue } from '@/hooks/useFilter';
import type { MemberFormData, MemberId } from '@/types';
import { MemberForm } from './MemberForm';
import { MemberCard } from './MemberCard';
import { MemberListItem } from './MemberListItem';
import { useMemberColumns } from '../hooks/useMemberColumns';
import { useMemberFilters } from '../hooks/useMemberFilters';
import { useMemberSearchConfig } from '../hooks/useMemberSearch';
import { ListingView } from '@/components/shared/ListingView';
import { ViewModeToggle } from '@/components/shared/ViewModeToggle';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { SearchBar } from '@/components/shared/SearchBar';
import { FilterModal } from '@/components/shared/FilterModal';

/**
 * Members Page Component
 * Main page for member management with advanced search and filtering
 */
export const MembersPage: React.FC = () => {
  const { t } = useTranslation();
  
  // Data hooks
  const { 
    membersWithNames, 
    addMember, 
    updateMemberFromForm, 
    deleteMember, 
    getMemberFormData,
    getAllSkills, 
    getAllRoles 
  } = useMembers();
  const { getTeamsByMember, teams } = useTeams();

  // UI state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<MemberId | undefined>();
  const [deletingMember, setDeletingMember] = useState<MemberWithNames | undefined>();

  // Get form data for editing member
  const editingFormData = useMemo(() => {
    if (!editingMemberId) return undefined;
    return getMemberFormData(editingMemberId);
  }, [editingMemberId, getMemberFormData]);

  // Business logic hooks
  const listingView = useListingView(membersWithNames, 'table', 25);
  const searchConfig = useMemberSearchConfig();
  const searchedMembers = useSearch(membersWithNames, listingView.searchTerm, searchConfig);
  
  // Prepare filter options
  const allRoles = getAllRoles();
  const allSkills = getAllSkills();
  const filterDefinitions = useMemberFilters(allRoles, allSkills, teams);
  
  const {
    filteredItems,
    activeFilters,
    applyFilter,
    removeFilter,
    clearAllFilters,
    getFilterValue,
    hasActiveFilters,
  } = useFilter(searchedMembers, filterDefinitions);

  // Get team count for a member
  const getTeamCount = (memberId: string): number => {
    return getTeamsByMember(memberId).length;
  };

  // Define columns using business logic hook
  const columns = useMemberColumns(handleEdit, handleDelete, getTeamCount);

  // Event handlers
  function handleAdd() {
    setEditingMemberId(undefined);
    setIsFormOpen(true);
  }

  function handleEdit(member: MemberWithNames) {
    setEditingMemberId(member.id);
    setIsFormOpen(true);
  }

  function handleDelete(member: MemberWithNames) {
    setDeletingMember(member);
  }

  function confirmDelete() {
    if (deletingMember) {
      deleteMember(deletingMember.id);
      setDeletingMember(undefined);
    }
  }

  function handleSave(formData: MemberFormData) {
    if (editingMemberId) {
      updateMemberFromForm(editingMemberId, formData);
    } else {
      addMember(formData);
    }
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingMemberId(undefined);
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
            {t('members.title')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <ViewModeToggle value={listingView.viewMode} onChange={listingView.setViewMode} />
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={handleAdd}
              aria-label={t('members.addMember')}
            >
              {t('members.addMember')}
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
            Showing {filteredItems.length} of {membersWithNames.length} members
          </Typography>
        </Paper>
      )}

      {/* Listing */}
      <ListingView
        items={filteredItems}
        viewMode={listingView.viewMode}
        columns={columns}
        getItemId={(member) => member.id}
        renderGridCard={(member) => (
          <MemberCard
            member={member}
            onEdit={handleEdit}
            onDelete={handleDelete}
            teamCount={getTeamCount(member.id)}
          />
        )}
        renderListItem={(member) => (
          <MemberListItem
            member={member}
            onEdit={handleEdit}
            onDelete={handleDelete}
            teamCount={getTeamCount(member.id)}
          />
        )}
        emptyState={{
          title: t('members.noMembers'),
          action: {
            label: t('members.addMember'),
            onClick: handleAdd,
            icon: <PersonAddIcon />,
          },
        }}
        ariaLabel={t('members.title')}
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

      {/* Member Form Dialog */}
      <MemberForm
        open={isFormOpen}
        initialData={editingFormData}
        isEditing={!!editingMemberId}
        onClose={handleCloseForm}
        onSave={handleSave}
        existingSkills={getAllSkills()}
        existingRoles={getAllRoles()}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingMember}
        title={t('members.deleteMember')}
        message={t('members.deleteConfirm')}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingMember(undefined)}
        confirmColor="error"
      />
    </Box>
  );
};
