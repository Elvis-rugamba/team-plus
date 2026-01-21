import { useMemo, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { Member, MemberId, FilterOptions, MemberFormData, RoleId, SkillId } from '@/types';
import { generateId } from '@/utils/idGenerator';
import { useRoles } from './useRoles';
import { useSkills } from './useSkills';

/**
 * Extended member with resolved role and skill names for display
 */
export interface MemberWithNames extends Member {
  roleName: string;
  skillNames: string[];
}

/**
 * Custom hook for member management operations
 */
export const useMembers = () => {
  const { state, dispatch } = useAppContext();
  const { getRoleName, getOrCreateRoleId, roleNames } = useRoles();
  const { getSkillNames, getOrCreateSkillIds, skillNames } = useSkills();

  // Get all members as array
  const members = useMemo(() => Object.values(state.members), [state.members]);

  // Get all members with resolved names (for display)
  const membersWithNames = useMemo((): MemberWithNames[] => {
    return members.map(member => ({
      ...member,
      roleName: getRoleName(member.roleId),
      skillNames: getSkillNames(member.skillIds),
    }));
  }, [members, getRoleName, getSkillNames]);

  const getMemberById = useCallback(
    (id: MemberId): Member | undefined => {
      return state.members[id];
    },
    [state.members]
  );

  // Get member with resolved names
  const getMemberWithNames = useCallback(
    (id: MemberId): MemberWithNames | undefined => {
      const member = state.members[id];
      if (!member) return undefined;
      return {
        ...member,
        roleName: getRoleName(member.roleId),
        skillNames: getSkillNames(member.skillIds),
      };
    },
    [state.members, getRoleName, getSkillNames]
  );

  const getMembersByTeam = useCallback(
    (teamId: string): MemberWithNames[] => {
      const team = state.teams[teamId];
      if (!team) return [];
      return team.memberIds
        .map((id) => state.members[id])
        .filter(Boolean)
        .map(member => ({
          ...member,
          roleName: getRoleName(member.roleId),
          skillNames: getSkillNames(member.skillIds),
        }));
    },
    [state.members, state.teams, getRoleName, getSkillNames]
  );

  const getUnassignedMembers = useCallback((): MemberWithNames[] => {
    const assignedMemberIds = new Set(
      Object.values(state.teams).flatMap((team) => team.memberIds)
    );
    return members
      .filter((member) => !assignedMemberIds.has(member.id))
      .map(member => ({
        ...member,
        roleName: getRoleName(member.roleId),
        skillNames: getSkillNames(member.skillIds),
      }));
  }, [members, state.teams, getRoleName, getSkillNames]);

  const filterMembers = useCallback(
    (filters: FilterOptions): MemberWithNames[] => {
      return membersWithNames.filter((member) => {
        // Search term - search in name and resolved names
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          const matchesName = member.name.toLowerCase().includes(searchLower);
          const matchesRole = member.roleName.toLowerCase().includes(searchLower);
          const matchesSkill = member.skillNames.some(s => s.toLowerCase().includes(searchLower));
          const matchesEmail = member.email?.toLowerCase().includes(searchLower);
          
          if (!matchesName && !matchesRole && !matchesSkill && !matchesEmail) {
            return false;
          }
        }

        // Roles filter (by ID)
        if (filters.roles.length > 0 && !filters.roles.includes(member.roleId)) {
          return false;
        }

        // Skills filter (by ID) - member must have at least one matching skill
        if (
          filters.skills.length > 0 &&
          !filters.skills.some((skillId) => member.skillIds.includes(skillId))
        ) {
          return false;
        }

        // Availability filter
        if (
          filters.availability.length > 0 &&
          !filters.availability.includes(member.availability)
        ) {
          return false;
        }

        // Teams filter
        if (filters.teams.length > 0) {
          const memberTeams = Object.values(state.teams).filter((team) =>
            team.memberIds.includes(member.id)
          );
          if (!memberTeams.some((team) => filters.teams.includes(team.id))) {
            return false;
          }
        }

        return true;
      });
    },
    [membersWithNames, state.teams]
  );

  /**
   * Add a new member from form data
   * Automatically creates roles/skills if they don't exist
   */
  const addMember = useCallback(
    (formData: MemberFormData): Member => {
      const now = new Date().toISOString();
      
      // Resolve role name to ID (creates if not exists)
      const roleId = getOrCreateRoleId(formData.role);
      
      // Resolve skill names to IDs (creates if not exists)
      const skillIds = getOrCreateSkillIds(formData.skills);
      
      const newMember: Member = {
        id: generateId(),
        name: formData.name,
        roleId,
        skillIds,
        availability: formData.availability,
        email: formData.email,
        createdAt: now,
        updatedAt: now,
      };
      
      dispatch({ type: 'ADD_MEMBER', payload: newMember });
      return newMember;
    },
    [dispatch, getOrCreateRoleId, getOrCreateSkillIds]
  );

  /**
   * Update a member from form data
   * Automatically creates roles/skills if they don't exist
   */
  const updateMemberFromForm = useCallback(
    (memberId: MemberId, formData: MemberFormData): Member | undefined => {
      const existingMember = state.members[memberId];
      if (!existingMember) return undefined;
      
      // Resolve role name to ID (creates if not exists)
      const roleId = getOrCreateRoleId(formData.role);
      
      // Resolve skill names to IDs (creates if not exists)
      const skillIds = getOrCreateSkillIds(formData.skills);
      
      const updatedMember: Member = {
        ...existingMember,
        name: formData.name,
        roleId,
        skillIds,
        availability: formData.availability,
        email: formData.email,
        updatedAt: new Date().toISOString(),
      };
      
      dispatch({ type: 'UPDATE_MEMBER', payload: updatedMember });
      return updatedMember;
    },
    [state.members, dispatch, getOrCreateRoleId, getOrCreateSkillIds]
  );

  /**
   * Update member directly (for internal use)
   */
  const updateMember = useCallback(
    (member: Member): void => {
      const updatedMember: Member = {
        ...member,
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: 'UPDATE_MEMBER', payload: updatedMember });
    },
    [dispatch]
  );

  const deleteMember = useCallback(
    (id: MemberId): void => {
      dispatch({ type: 'DELETE_MEMBER', payload: id });
    },
    [dispatch]
  );

  /**
   * Convert member to form data (for editing)
   */
  const getMemberFormData = useCallback(
    (memberId: MemberId): MemberFormData | undefined => {
      const member = state.members[memberId];
      if (!member) return undefined;
      
      return {
        name: member.name,
        role: getRoleName(member.roleId),
        skills: getSkillNames(member.skillIds),
        availability: member.availability,
        email: member.email,
      };
    },
    [state.members, getRoleName, getSkillNames]
  );

  // Get all unique role names (now from roles collection - O(n) where n is roles, not members)
  const getAllRoles = useCallback((): string[] => {
    return roleNames;
  }, [roleNames]);

  // Get all unique skill names (now from skills collection - O(n) where n is skills, not members)
  const getAllSkills = useCallback((): string[] => {
    return skillNames;
  }, [skillNames]);

  return {
    members,
    membersWithNames,
    getMemberById,
    getMemberWithNames,
    getMembersByTeam,
    getUnassignedMembers,
    filterMembers,
    addMember,
    updateMember,
    updateMemberFromForm,
    deleteMember,
    getMemberFormData,
    getAllRoles,
    getAllSkills,
  };
};
