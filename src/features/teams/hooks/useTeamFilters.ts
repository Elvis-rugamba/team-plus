import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { FilterDefinition } from '@/hooks/useFilter';
import type { Team } from '@/types';
import { useAppContext } from '@/contexts/AppContext';

/**
 * Business logic hook for team filter definitions
 * Filters teams by target roles, target skills, and target size
 */
export function useTeamFilters(
  allRoles: string[],
  allSkills: string[]
): FilterDefinition<Team>[] {
  const { t } = useTranslation();
  const { state } = useAppContext();

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
        id: 'targetRoles',
        label: t('filter.targetRoles'),
        field: 'targetRoles' as keyof Team,
        condition: (team, value) => {
          if (!value || (Array.isArray(value) && value.length === 0)) return true;
          if (!team.targetRoles || team.targetRoles.length === 0) return false;
          
          // Convert role IDs to role names for comparison
          const teamTargetRoleNames = team.targetRoles
            .map(roleId => state.roles[roleId]?.name)
            .filter((name): name is string => name !== undefined);
          
          if (Array.isArray(value)) {
            // Team must have at least one of the selected target roles
            return value.some((roleName) => teamTargetRoleNames.includes(roleName as string));
          }
          return teamTargetRoleNames.includes(value as string);
        },
        options: roleOptions,
      },
      {
        id: 'targetSkills',
        label: t('filter.targetSkills'),
        field: 'targetSkills' as keyof Team,
        condition: (team, value) => {
          if (!value || (Array.isArray(value) && value.length === 0)) return true;
          if (!team.targetSkills || team.targetSkills.length === 0) return false;
          
          // Convert skill IDs to skill names for comparison
          const teamTargetSkillNames = team.targetSkills
            .map(skillId => state.skills[skillId]?.name)
            .filter((name): name is string => name !== undefined);
          
          if (Array.isArray(value)) {
            // Use Set for O(1) lookups when checking multiple skills
            const teamSkillsSet = new Set(teamTargetSkillNames);
            return value.some((skill) => teamSkillsSet.has(skill as string));
          }
          return teamTargetSkillNames.includes(value as string);
        },
        options: skillOptions,
      },
      {
        id: 'targetSize',
        label: t('filter.targetSize'),
        field: 'targetSize' as keyof Team,
        condition: (team, value) => {
          if (!value || (Array.isArray(value) && value.length === 0)) return true;
          
          const currentSize = team.memberIds.length;
          const targetSize = team.targetSize;
          
          if (Array.isArray(value)) {
            return value.some((sizeStatus) => {
              if (sizeStatus === 'NO_TARGET') {
                return targetSize === undefined;
              }
              if (sizeStatus === 'BELOW_TARGET') {
                return targetSize !== undefined && currentSize < targetSize;
              }
              if (sizeStatus === 'AT_TARGET') {
                return targetSize !== undefined && currentSize === targetSize;
              }
              if (sizeStatus === 'ABOVE_TARGET') {
                return targetSize !== undefined && currentSize > targetSize;
              }
              return false;
            });
          }
          
          // Single value
          if (value === 'NO_TARGET') {
            return targetSize === undefined;
          }
          if (value === 'BELOW_TARGET') {
            return targetSize !== undefined && currentSize < targetSize;
          }
          if (value === 'AT_TARGET') {
            return targetSize !== undefined && currentSize === targetSize;
          }
          if (value === 'ABOVE_TARGET') {
            return targetSize !== undefined && currentSize > targetSize;
          }
          
          return false;
        },
        options: [
          { value: 'NO_TARGET', label: t('filter.noTargetSize') },
          { value: 'BELOW_TARGET', label: t('filter.belowTargetSize') },
          { value: 'AT_TARGET', label: t('filter.atTargetSize') },
          { value: 'ABOVE_TARGET', label: t('filter.aboveTargetSize') },
        ],
      },
    ],
    [t, roleOptions, skillOptions, state.roles, state.skills]
  );
}
