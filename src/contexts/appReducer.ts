import type { AppState, Action } from '@/types';

/**
 * Initial application state
 */
export const initialState: AppState = {
  members: {},
  teams: {},
  roles: {},
  skills: {},
  darkMode: false,
  language: 'en',
};

/**
 * Application reducer
 * Handles all state mutations based on dispatched actions
 */
export const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    // Member actions
    case 'ADD_MEMBER':
      return {
        ...state,
        members: {
          ...state.members,
          [action.payload.id]: action.payload,
        },
      };

    case 'UPDATE_MEMBER':
      return {
        ...state,
        members: {
          ...state.members,
          [action.payload.id]: action.payload,
        },
      };

    case 'DELETE_MEMBER': {
      const { [action.payload]: _, ...remainingMembers } = state.members;
      // Also remove member from all teams
      const updatedTeams = Object.values(state.teams).reduce(
        (acc, team) => {
          acc[team.id] = {
            ...team,
            memberIds: team.memberIds.filter((id) => id !== action.payload),
            updatedAt: new Date().toISOString(),
          };
          return acc;
        },
        {} as AppState['teams']
      );
      return {
        ...state,
        members: remainingMembers,
        teams: updatedTeams,
      };
    }

    // Team actions
    case 'ADD_TEAM':
      return {
        ...state,
        teams: {
          ...state.teams,
          [action.payload.id]: action.payload,
        },
      };

    case 'UPDATE_TEAM':
      return {
        ...state,
        teams: {
          ...state.teams,
          [action.payload.id]: action.payload,
        },
      };

    case 'DELETE_TEAM': {
      const { [action.payload]: _, ...remainingTeams } = state.teams;
      return {
        ...state,
        teams: remainingTeams,
      };
    }

    // Role actions
    case 'ADD_ROLE':
      return {
        ...state,
        roles: {
          ...state.roles,
          [action.payload.id]: action.payload,
        },
      };

    case 'UPDATE_ROLE':
      return {
        ...state,
        roles: {
          ...state.roles,
          [action.payload.id]: action.payload,
        },
      };

    case 'DELETE_ROLE': {
      const { [action.payload]: _, ...remainingRoles } = state.roles;
      // Note: Members with this role will have an orphaned roleId
      // The UI should handle this gracefully
      return {
        ...state,
        roles: remainingRoles,
      };
    }

    // Skill actions
    case 'ADD_SKILL':
      return {
        ...state,
        skills: {
          ...state.skills,
          [action.payload.id]: action.payload,
        },
      };

    case 'UPDATE_SKILL':
      return {
        ...state,
        skills: {
          ...state.skills,
          [action.payload.id]: action.payload,
        },
      };

    case 'DELETE_SKILL': {
      const { [action.payload]: _, ...remainingSkills } = state.skills;
      // Remove skill from all members who have it
      const updatedMembers = Object.values(state.members).reduce(
        (acc, member) => {
          acc[member.id] = {
            ...member,
            skillIds: member.skillIds.filter((id) => id !== action.payload),
            updatedAt: new Date().toISOString(),
          };
          return acc;
        },
        {} as AppState['members']
      );
      return {
        ...state,
        skills: remainingSkills,
        members: updatedMembers,
      };
    }

    // Assignment actions
    case 'ASSIGN_MEMBER_TO_TEAM': {
      const team = state.teams[action.payload.teamId];
      if (!team) return state;

      const memberAlreadyAssigned = team.memberIds.includes(action.payload.memberId);
      if (memberAlreadyAssigned) return state;

      return {
        ...state,
        teams: {
          ...state.teams,
          [action.payload.teamId]: {
            ...team,
            memberIds: [...team.memberIds, action.payload.memberId],
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }

    case 'REMOVE_MEMBER_FROM_TEAM': {
      const team = state.teams[action.payload.teamId];
      if (!team) return state;

      return {
        ...state,
        teams: {
          ...state.teams,
          [action.payload.teamId]: {
            ...team,
            memberIds: team.memberIds.filter((id) => id !== action.payload.memberId),
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }

    case 'ASSIGN_MEMBERS_TO_TEAM': {
      const team = state.teams[action.payload.teamId];
      if (!team) return state;

      // Add only members that aren't already assigned
      const newMemberIds = action.payload.memberIds.filter(
        (id) => !team.memberIds.includes(id)
      );

      return {
        ...state,
        teams: {
          ...state.teams,
          [action.payload.teamId]: {
            ...team,
            memberIds: [...team.memberIds, ...newMemberIds],
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }

    // UI actions
    case 'TOGGLE_DARK_MODE':
      return {
        ...state,
        darkMode: !state.darkMode,
      };

    case 'SET_LANGUAGE':
      return {
        ...state,
        language: action.payload,
      };

    // Data actions
    case 'LOAD_STATE':
      // Ensure backward compatibility - add empty roles/skills if not present
      return {
        ...action.payload,
        roles: action.payload.roles || {},
        skills: action.payload.skills || {},
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
};
