import { useMemo } from 'react';
import type { Team } from '@/types';
import type { SearchConfig } from '@/hooks/useSearch';

/**
 * Business logic hook for team search configuration
 */
export function useTeamSearchConfig(): SearchConfig<Team> {
  return useMemo(
    () => ({
      searchableFields: ['name', 'description'] as (keyof Team)[],
      customSearchFn: (team: Team, searchTerm: string) => {
        // Search in name
        if (team.name.toLowerCase().includes(searchTerm)) return true;
        
        // Search in description
        if (team.description.toLowerCase().includes(searchTerm)) return true;
        
        return false;
      },
    }),
    []
  );
}
