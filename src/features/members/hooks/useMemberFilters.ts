import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { FilterDefinition } from '@/hooks/useFilter';
import type { MemberWithNames } from '@/hooks/useMembers';
import type { Team, MemberId, TeamId } from '@/types';

/**
 * Pre-compute member to teams mapping for O(1) lookups
 * This inverted index is much more efficient than searching all teams for each member
 * 
 * Time complexity: O(T * M) where T = teams, M = avg members per team (one-time computation)
 * Lookup complexity: O(1) per member
 */
function buildMemberTeamsIndex(teams: Team[]): Map<MemberId, Set<TeamId>> {
  const index = new Map<MemberId, Set<TeamId>>();
  
  for (const team of teams) {
    for (const memberId of team.memberIds) {
      if (!index.has(memberId)) {
        index.set(memberId, new Set());
      }
      index.get(memberId)!.add(team.id);
    }
  }
  
  return index;
}

/**
 * Business logic hook for member filter definitions
 * Filters use resolved role and skill names (not IDs)
 * 
 * Performance optimizations:
 * - Pre-computed member-to-teams index for O(1) team membership lookups
 * - Memoized filter definitions to prevent unnecessary recalculations
 * - Memoized team options separately from filter logic
 */
export function useMemberFilters(
  allRoles: string[],
  allSkills: string[],
  teams: Team[]
): FilterDefinition<MemberWithNames>[] {
  const { t } = useTranslation();

  // Pre-compute member to teams mapping - only recomputes when teams change
  // This is O(T * M) once, but makes filtering O(1) per member
  const memberTeamsIndex = useMemo(() => {
    return buildMemberTeamsIndex(teams);
  }, [teams]);

  // Memoize team options separately - only recomputes when teams change
  const teamOptions = useMemo(() => {
    return teams.map((team) => ({ value: team.id, label: team.name }));
  }, [teams]);

  // Memoize role options
  const roleOptions = useMemo(() => {
    return allRoles.map((role) => ({ value: role, label: role }));
  }, [allRoles]);

  // Memoize skill options
  const skillOptions = useMemo(() => {
    return allSkills.map((skill) => ({ value: skill, label: skill }));
  }, [allSkills]);

  return useMemo(
    () => [
      {
        id: 'role',
        label: t('filter.roles'),
        field: 'roleName',
        condition: (member, value) => {
          if (!value || (Array.isArray(value) && value.length === 0)) return true;
          if (Array.isArray(value)) {
            return value.includes(member.roleName);
          }
          return member.roleName === value;
        },
        options: roleOptions,
      },
      {
        id: 'skills',
        label: t('filter.skills'),
        field: 'skillNames',
        condition: (member, value) => {
          if (!value || (Array.isArray(value) && value.length === 0)) return true;
          if (Array.isArray(value)) {
            // Use Set for O(1) lookups when checking multiple skills
            const memberSkillsSet = new Set(member.skillNames);
            return value.some((skill) => memberSkillsSet.has(skill as string));
          }
          return member.skillNames.includes(value as string);
        },
        options: skillOptions,
      },
      {
        id: 'availability',
        label: t('filter.availability'),
        field: 'availability',
        condition: (member, value) => {
          if (!value || (Array.isArray(value) && value.length === 0)) return true;
          if (Array.isArray(value)) {
            return value.includes(member.availability);
          }
          return member.availability === value;
        },
        options: [
          { value: 'AVAILABLE', label: t('members.available') },
          { value: 'BUSY', label: t('members.busy') },
          { value: 'UNAVAILABLE', label: t('members.unavailable') },
        ],
      },
      {
        id: 'teams',
        label: t('filter.teams'),
        field: 'id',
        condition: (member, value) => {
          if (!value || (Array.isArray(value) && value.length === 0)) return true;
          
          // O(1) lookup using pre-computed index instead of O(T) iteration
          const memberTeamIds = memberTeamsIndex.get(member.id);
          
          // Member is not in any team
          if (!memberTeamIds || memberTeamIds.size === 0) {
            return false;
          }
          
          if (Array.isArray(value)) {
            // O(V) where V = selected values, with O(1) per check
            return value.some((teamId) => memberTeamIds.has(teamId as string));
          }
          
          return memberTeamIds.has(value as string);
        },
        options: teamOptions,
      },
    ],
    [t, roleOptions, skillOptions, teamOptions, memberTeamsIndex]
  );
}
