import { useMemo, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { Team, TeamId, MemberId } from '@/types';
import { generateId } from '@/utils/idGenerator';

/**
 * Custom hook for team management operations
 */
export const useTeams = () => {
  const { state, dispatch } = useAppContext();

  const teams = useMemo(() => Object.values(state.teams), [state.teams]);

  const getTeamById = useCallback(
    (id: TeamId): Team | undefined => {
      return state.teams[id];
    },
    [state.teams]
  );

  const getTeamsByMember = useCallback(
    (memberId: MemberId): Team[] => {
      return teams.filter((team) => team.memberIds.includes(memberId));
    },
    [teams]
  );

  const addTeam = useCallback(
    (teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'memberIds'>): Team => {
      const now = new Date().toISOString();
      const newTeam: Team = {
        ...teamData,
        id: generateId(),
        memberIds: [],
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: 'ADD_TEAM', payload: newTeam });
      return newTeam;
    },
    [dispatch]
  );

  const updateTeam = useCallback(
    (team: Team): void => {
      const updatedTeam: Team = {
        ...team,
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: 'UPDATE_TEAM', payload: updatedTeam });
    },
    [dispatch]
  );

  const deleteTeam = useCallback(
    (id: TeamId): void => {
      dispatch({ type: 'DELETE_TEAM', payload: id });
    },
    [dispatch]
  );

  const assignMemberToTeam = useCallback(
    (memberId: MemberId, teamId: TeamId): void => {
      dispatch({
        type: 'ASSIGN_MEMBER_TO_TEAM',
        payload: { memberId, teamId },
      });
    },
    [dispatch]
  );

  const removeMemberFromTeam = useCallback(
    (memberId: MemberId, teamId: TeamId): void => {
      dispatch({
        type: 'REMOVE_MEMBER_FROM_TEAM',
        payload: { memberId, teamId },
      });
    },
    [dispatch]
  );

  const assignMembersToTeam = useCallback(
    (memberIds: MemberId[], teamId: TeamId): void => {
      dispatch({
        type: 'ASSIGN_MEMBERS_TO_TEAM',
        payload: { memberIds, teamId },
      });
    },
    [dispatch]
  );

  return {
    teams,
    getTeamById,
    getTeamsByMember,
    addTeam,
    updateTeam,
    deleteTeam,
    assignMemberToTeam,
    removeMemberFromTeam,
    assignMembersToTeam,
  };
};
