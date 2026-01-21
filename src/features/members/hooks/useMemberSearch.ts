import { useMemo } from 'react';
import type { MemberWithNames } from '@/hooks/useMembers';
import type { SearchConfig } from '@/hooks/useSearch';

/**
 * Business logic hook for member search configuration
 * Searches by name or email
 */
export function useMemberSearchConfig(): SearchConfig<MemberWithNames> {
  return useMemo(
    () => ({
      searchableFields: ['name', 'email'] as (keyof MemberWithNames)[],
      customSearchFn: (member: MemberWithNames, searchTerm: string) => {
        const term = searchTerm.toLowerCase();

        // Search in name
        if (member.name.toLowerCase().includes(term)) return true;
        
        // Search in email
        if (member.email && member.email.toLowerCase().includes(term)) return true;
        
        return false;
      },
    }),
    []
  );
}
