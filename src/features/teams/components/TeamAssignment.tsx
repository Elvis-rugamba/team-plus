import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Divider,
  Chip,
  Avatar,
  Alert,
  AlertTitle,
  Tooltip,
} from '@mui/material';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';
import type { Team, AppState } from '@/types';
import type { MemberWithNames } from '@/hooks/useMembers';
import { useAppContext } from '@/contexts/AppContext';

interface TeamAssignmentProps {
  open: boolean;
  team: Team;
  teamMembers: MemberWithNames[];
  availableMembers: MemberWithNames[];
  onClose: () => void;
  onAssign: (memberIds: string[]) => void;
  onRemove: (memberId: string) => void;
}

interface DraggableMemberProps {
  member: MemberWithNames;
  isInTeam: boolean;
  isRelevant?: boolean; // Whether member matches target criteria
}

/**
 * Calculate relevance score for a member based on team's target criteria
 * Higher score = more relevant
 */
const calculateRelevanceScore = (member: MemberWithNames, team: Team): number => {
  let score = 0;
  
  // Check role match
  if (team.targetRoles && team.targetRoles.length > 0) {
    if (team.targetRoles.includes(member.roleId)) {
      score += 10; // High weight for role match
    }
  }
  
  // Check skill matches
  if (team.targetSkills && team.targetSkills.length > 0) {
    const matchingSkills = member.skillIds.filter(skillId => 
      team.targetSkills!.includes(skillId)
    );
    score += matchingSkills.length * 2; // 2 points per matching skill
  }
  
  return score;
};

/**
 * Check if a member matches the team's target criteria
 */
const isMemberRelevant = (member: MemberWithNames, team: Team): boolean => {
  if (!team.targetRoles && !team.targetSkills) {
    return true; // No criteria = all members are relevant
  }
  
  const hasMatchingRole = !team.targetRoles || team.targetRoles.length === 0 || 
    team.targetRoles.includes(member.roleId);
  
  const hasMatchingSkills = !team.targetSkills || team.targetSkills.length === 0 ||
    member.skillIds.some(skillId => team.targetSkills!.includes(skillId));
  
  return hasMatchingRole || hasMatchingSkills;
};

/**
 * Check if team has members that don't match target criteria
 */
const hasIrrelevantMembers = (teamMembers: MemberWithNames[], team: Team): boolean => {
  if (!team.targetRoles && !team.targetSkills) {
    return false; // No criteria = no irrelevant members
  }
  
  return teamMembers.some(member => !isMemberRelevant(member, team));
};

/**
 * Check if team size is outside target range
 */
const getSizeWarning = (currentSize: number, targetSize?: number): string | null => {
  if (!targetSize) return null;
  
  if (currentSize < targetSize) {
    return 'teams.sizeBelowTarget';
  } else if (currentSize > targetSize) {
    return 'teams.sizeAboveTarget';
  }
  
  return null;
};

/**
 * Generate tooltip text explaining why a member doesn't match target criteria
 * Shows specific details about what's expected vs what the member has
 */
const getIrrelevantMemberTooltip = (
  member: MemberWithNames, 
  team: Team, 
  state: AppState,
  t: (key: string, options?: Record<string, unknown>) => string
): string => {
  if (!team.targetRoles && !team.targetSkills) {
    return '';
  }
  
  const issues: string[] = [];
  
  // Check role mismatch
  if (team.targetRoles && team.targetRoles.length > 0) {
    if (!team.targetRoles.includes(member.roleId)) {
      const targetRoleNames = team.targetRoles
        .map(roleId => state.roles[roleId]?.name)
        .filter(Boolean)
        .join(', ');
      
      issues.push(
        t('teams.memberRoleMismatch', {
          memberRole: member.roleName,
          targetRoles: targetRoleNames || t('teams.unknownRoles')
        })
      );
    }
  }
  
  // Check skill mismatches
  if (team.targetSkills && team.targetSkills.length > 0) {
    const matchingSkills = member.skillIds.filter(skillId => 
      team.targetSkills!.includes(skillId)
    );
    
    if (matchingSkills.length === 0) {
      // Member has no matching skills
      const targetSkillNames = team.targetSkills
        .map(skillId => state.skills[skillId]?.name)
        .filter(Boolean)
        .join(', ');
      
      const memberSkillNames = member.skillNames.length > 0 
        ? member.skillNames.join(', ')
        : t('teams.noSkills');
      
      issues.push(
        t('teams.memberSkillsMismatch', {
          memberSkills: memberSkillNames,
          targetSkills: targetSkillNames || t('teams.unknownSkills')
        })
      );
    } else if (matchingSkills.length < team.targetSkills.length) {
      // Member has some matching skills but not all
      const missingSkillIds = team.targetSkills.filter(skillId => !member.skillIds.includes(skillId));
      const missingSkillNames = missingSkillIds
        .map(skillId => state.skills[skillId]?.name)
        .filter(Boolean)
        .join(', ');
      
      issues.push(
        t('teams.memberMissingSkills', {
          missingSkills: missingSkillNames || t('teams.unknownSkills')
        })
      );
    }
  }
  
  if (issues.length === 0) {
    return t('teams.memberDoesNotMatchCriteria');
  }
  
  return issues.join('\n');
};

interface DraggableMemberWithTeamProps extends DraggableMemberProps {
  team: Team;
}

const DraggableMember: React.FC<DraggableMemberWithTeamProps> = ({ member, isInTeam, isRelevant = true, team }) => {
  const { t } = useTranslation();
  const { state } = useAppContext();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: member.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const tooltipText = !isRelevant ? getIrrelevantMemberTooltip(member, team, state, t) : '';

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        cursor: 'grab',
        '&:active': { cursor: 'grabbing' },
        backgroundColor: isInTeam ? 'action.selected' : 'background.paper',
        mb: 0.5,
        borderRadius: 1,
        border: 1,
        borderColor: isRelevant ? 'divider' : 'warning.main',
        borderLeft: isRelevant ? 1 : 4,
        opacity: isRelevant ? 1 : 0.9,
      }}
    >
      <Avatar sx={{ mr: 2, width: 32, height: 32, fontSize: '0.875rem' }}>
        {getInitials(member.name)}
      </Avatar>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2">{member.name}</Typography>
            {!isRelevant && (
              <Tooltip 
                title={
                  <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-line' }}>
                    {tooltipText}
                  </Typography>
                } 
                arrow
                placement="top"
              >
                <Chip 
                  label="⚠️" 
                  size="small" 
                  sx={{ height: 16, fontSize: '0.7rem', p: 0, cursor: 'help' }}
                />
              </Tooltip>
            )}
          </Box>
        }
        secondary={member.roleName}
        primaryTypographyProps={{ variant: 'body2' }}
        secondaryTypographyProps={{ variant: 'caption' }}
      />
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {member.skillNames.slice(0, 2).map((skill) => (
          <Chip key={skill} label={skill} size="small" variant="outlined" />
        ))}
        {member.skillNames.length > 2 && (
          <Tooltip title={member.skillNames.slice(2).join(', ')} arrow>
            <Chip label={`+${member.skillNames.length - 2}`} size="small" variant="outlined" />
          </Tooltip>
        )}
      </Box>
    </ListItem>
  );
};

/**
 * Team Assignment Component with Drag & Drop
 * Allows assigning members to teams using drag and drop or checkboxes
 * Sorts members by relevance to team's target criteria
 */
export const TeamAssignment: React.FC<TeamAssignmentProps> = ({
  open,
  team,
  teamMembers,
  availableMembers,
  onClose,
  onAssign,
  onRemove,
}) => {
  const { t } = useTranslation();
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sort available members by relevance (most relevant first)
  const sortedAvailableMembers = useMemo(() => {
    return [...availableMembers].sort((a, b) => {
      const scoreA = calculateRelevanceScore(a, team);
      const scoreB = calculateRelevanceScore(b, team);
      return scoreB - scoreA; // Higher score first
    });
  }, [availableMembers, team]);

  // Sort team members by relevance (most relevant first)
  const sortedTeamMembers = useMemo(() => {
    return [...teamMembers].sort((a, b) => {
      const scoreA = calculateRelevanceScore(a, team);
      const scoreB = calculateRelevanceScore(b, team);
      return scoreB - scoreA; // Higher score first
    });
  }, [teamMembers, team]);

  // Check for warnings
  const hasIrrelevant = hasIrrelevantMembers(teamMembers, team);
  const sizeWarning = getSizeWarning(teamMembers.length, team.targetSize);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const memberId = active.id as string;
    const isInTeam = team.memberIds.includes(memberId);

    // If dropped on available members area and currently in team, remove
    if (!isInTeam && over.id === 'available-members') {
      return;
    }

    // If dropped on team area and not in team, add
    if (!isInTeam && over.id === 'team-members') {
      onAssign([memberId]);
    }

    // If already in team and dropped elsewhere, remove
    if (isInTeam && over.id === 'available-members') {
      onRemove(memberId);
    }
  };

  const handleToggleSelect = (memberId: string) => {
    setSelectedMembers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) {
        newSet.delete(memberId);
      } else {
        newSet.add(memberId);
      }
      return newSet;
    });
  };

  const handleAssignSelected = () => {
    if (selectedMembers.size > 0) {
      onAssign(Array.from(selectedMembers));
      setSelectedMembers(new Set());
    }
  };

  const activeMember = [...teamMembers, ...availableMembers].find((m) => m.id === activeId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth aria-labelledby="team-assignment-dialog">
      <DialogTitle id="team-assignment-dialog">
        {t('teams.assignMembers')} - {team.name}
      </DialogTitle>
      <DialogContent>
        {/* Warning Banner */}
        {(hasIrrelevant || sizeWarning) && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>{t('teams.assignmentWarning')}</AlertTitle>
            {hasIrrelevant && (
              <Typography variant="body2">
                {t('teams.hasIrrelevantMembers')}
              </Typography>
            )}
            {sizeWarning && (
              <Typography variant="body2">
                {t(sizeWarning, { current: teamMembers.length, target: team.targetSize })}
              </Typography>
            )}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" paragraph>
          {t('teams.dragToAssign')}
          {team.targetRoles || team.targetSkills ? (
            <Typography component="span" variant="caption" display="block" sx={{ mt: 0.5 }}>
              {t('teams.relevantMembersFirst')}
            </Typography>
          ) : null}
        </Typography>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Box sx={{ display: 'flex', gap: 2, minHeight: 400 }}>
            {/* Available Members */}
            <Paper sx={{ flex: 1, p: 2 }} id="available-members">
              <Typography variant="h6" gutterBottom>
                {t('teams.unassignedMembers')} ({sortedAvailableMembers.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <SortableContext
                items={sortedAvailableMembers.map((m) => m.id)}
                strategy={verticalListSortingStrategy}
              >
                <List dense sx={{ maxHeight: 350, overflow: 'auto' }}>
                  {sortedAvailableMembers.map((member) => {
                    const isRelevant = isMemberRelevant(member, team);
                    return (
                      <Box key={member.id} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Checkbox
                          checked={selectedMembers.has(member.id)}
                          onChange={() => handleToggleSelect(member.id)}
                          size="small"
                          inputProps={{ 'aria-label': `Select ${member.name}` }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <DraggableMember member={member} isInTeam={false} isRelevant={isRelevant} team={team} />
                        </Box>
                      </Box>
                    );
                  })}
                  {sortedAvailableMembers.length === 0 && (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                      {t('common.noData')}
                    </Typography>
                  )}
                </List>
              </SortableContext>
              {selectedMembers.size > 0 && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAssignSelected}
                  fullWidth
                  sx={{ mt: 2 }}
                  aria-label={`${t('teams.assignMembers')} ${selectedMembers.size} members`}
                >
                  {t('teams.assignMembers')} ({selectedMembers.size})
                </Button>
              )}
            </Paper>

            {/* Team Members */}
            <Paper
              sx={{
                flex: 1,
                p: 2,
                bgcolor: 'action.hover',
                border: 2,
                borderColor: team.color || 'primary.main',
              }}
              id="team-members"
            >
              <Typography variant="h6" gutterBottom>
                {t('teams.members')} ({sortedTeamMembers.length}
                {team.targetSize ? ` / ${team.targetSize} ${t('teams.target')}` : ''})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <SortableContext
                items={sortedTeamMembers.map((m) => m.id)}
                strategy={verticalListSortingStrategy}
              >
                <List dense sx={{ maxHeight: 350, overflow: 'auto' }}>
                  {sortedTeamMembers.map((member) => {
                    const isRelevant = isMemberRelevant(member, team);
                    return (
                      <DraggableMember key={member.id} member={member} isInTeam={true} isRelevant={isRelevant} team={team} />
                    );
                  })}
                  {sortedTeamMembers.length === 0 && (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                      {t('teams.noMembersInTeam')}
                    </Typography>
                  )}
                </List>
              </SortableContext>
            </Paper>
          </Box>

          <DragOverlay>
            {activeMember ? (
              <Paper sx={{ p: 1, opacity: 0.9 }}>
                <Typography variant="body2">{activeMember.name}</Typography>
              </Paper>
            ) : null}
          </DragOverlay>
        </DndContext>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} aria-label={t('common.close')}>
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
