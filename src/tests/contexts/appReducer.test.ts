import { describe, it, expect } from 'vitest';
import { appReducer, initialState } from '@/contexts/appReducer';
import { Availability, type Member, type Team, type Role, type Skill } from '@/types';

describe('appReducer', () => {
  it('should return initial state', () => {
    expect(initialState).toEqual({
      members: {},
      teams: {},
      roles: {},
      skills: {},
      darkMode: false,
      language: 'en',
    });
  });

  describe('Member actions', () => {
    it('should add a member', () => {
      const member: Member = {
        id: '1',
        name: 'John Doe',
        roleId: 'role-1',
        skillIds: ['skill-1'],
        availability: Availability.AVAILABLE,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      const newState = appReducer(initialState, {
        type: 'ADD_MEMBER',
        payload: member,
      });

      expect(newState.members['1']).toEqual(member);
    });

    it('should update a member', () => {
      const member: Member = {
        id: '1',
        name: 'John Doe',
        roleId: 'role-1',
        skillIds: ['skill-1'],
        availability: Availability.AVAILABLE,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      const state = appReducer(initialState, {
        type: 'ADD_MEMBER',
        payload: member,
      });

      const updatedMember = { ...member, name: 'John Smith' };
      const newState = appReducer(state, {
        type: 'UPDATE_MEMBER',
        payload: updatedMember,
      });

      expect(newState.members['1'].name).toBe('John Smith');
    });

    it('should delete a member', () => {
      const member: Member = {
        id: '1',
        name: 'John Doe',
        roleId: 'role-1',
        skillIds: ['skill-1'],
        availability: Availability.AVAILABLE,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      const state = appReducer(initialState, {
        type: 'ADD_MEMBER',
        payload: member,
      });

      const newState = appReducer(state, {
        type: 'DELETE_MEMBER',
        payload: '1',
      });

      expect(newState.members['1']).toBeUndefined();
    });
  });

  describe('Team actions', () => {
    it('should add a team', () => {
      const team: Team = {
        id: '1',
        name: 'Team A',
        description: 'Description',
        memberIds: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      const newState = appReducer(initialState, {
        type: 'ADD_TEAM',
        payload: team,
      });

      expect(newState.teams['1']).toEqual(team);
    });

    it('should update a team', () => {
      const team: Team = {
        id: '1',
        name: 'Team A',
        description: 'Description',
        memberIds: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      const state = appReducer(initialState, {
        type: 'ADD_TEAM',
        payload: team,
      });

      const updatedTeam = { ...team, name: 'Team B' };
      const newState = appReducer(state, {
        type: 'UPDATE_TEAM',
        payload: updatedTeam,
      });

      expect(newState.teams['1'].name).toBe('Team B');
    });

    it('should delete a team', () => {
      const team: Team = {
        id: '1',
        name: 'Team A',
        description: 'Description',
        memberIds: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      const state = appReducer(initialState, {
        type: 'ADD_TEAM',
        payload: team,
      });

      const newState = appReducer(state, {
        type: 'DELETE_TEAM',
        payload: '1',
      });

      expect(newState.teams['1']).toBeUndefined();
    });
  });

  describe('Role actions', () => {
    it('should add a role', () => {
      const role: Role = {
        id: 'role-1',
        name: 'Developer',
        createdAt: '2024-01-01',
      };

      const newState = appReducer(initialState, {
        type: 'ADD_ROLE',
        payload: role,
      });

      expect(newState.roles['role-1']).toEqual(role);
    });

    it('should update a role', () => {
      const role: Role = {
        id: 'role-1',
        name: 'Developer',
        createdAt: '2024-01-01',
      };

      const state = appReducer(initialState, {
        type: 'ADD_ROLE',
        payload: role,
      });

      const updatedRole = { ...role, name: 'Senior Developer' };
      const newState = appReducer(state, {
        type: 'UPDATE_ROLE',
        payload: updatedRole,
      });

      expect(newState.roles['role-1'].name).toBe('Senior Developer');
    });

    it('should delete a role', () => {
      const role: Role = {
        id: 'role-1',
        name: 'Developer',
        createdAt: '2024-01-01',
      };

      const state = appReducer(initialState, {
        type: 'ADD_ROLE',
        payload: role,
      });

      const newState = appReducer(state, {
        type: 'DELETE_ROLE',
        payload: 'role-1',
      });

      expect(newState.roles['role-1']).toBeUndefined();
    });
  });

  describe('Skill actions', () => {
    it('should add a skill', () => {
      const skill: Skill = {
        id: 'skill-1',
        name: 'JavaScript',
        createdAt: '2024-01-01',
      };

      const newState = appReducer(initialState, {
        type: 'ADD_SKILL',
        payload: skill,
      });

      expect(newState.skills['skill-1']).toEqual(skill);
    });

    it('should update a skill', () => {
      const skill: Skill = {
        id: 'skill-1',
        name: 'JavaScript',
        createdAt: '2024-01-01',
      };

      const state = appReducer(initialState, {
        type: 'ADD_SKILL',
        payload: skill,
      });

      const updatedSkill = { ...skill, name: 'TypeScript' };
      const newState = appReducer(state, {
        type: 'UPDATE_SKILL',
        payload: updatedSkill,
      });

      expect(newState.skills['skill-1'].name).toBe('TypeScript');
    });

    it('should delete a skill and remove from members', () => {
      const skill: Skill = {
        id: 'skill-1',
        name: 'JavaScript',
        createdAt: '2024-01-01',
      };

      const member: Member = {
        id: '1',
        name: 'John Doe',
        roleId: 'role-1',
        skillIds: ['skill-1', 'skill-2'],
        availability: Availability.AVAILABLE,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      let state = appReducer(initialState, {
        type: 'ADD_SKILL',
        payload: skill,
      });

      state = appReducer(state, {
        type: 'ADD_MEMBER',
        payload: member,
      });

      const newState = appReducer(state, {
        type: 'DELETE_SKILL',
        payload: 'skill-1',
      });

      expect(newState.skills['skill-1']).toBeUndefined();
      expect(newState.members['1'].skillIds).not.toContain('skill-1');
      expect(newState.members['1'].skillIds).toContain('skill-2');
    });
  });

  describe('Assignment actions', () => {
    it('should assign a member to a team', () => {
      const team: Team = {
        id: '1',
        name: 'Team A',
        description: 'Description',
        memberIds: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      const state = appReducer(initialState, {
        type: 'ADD_TEAM',
        payload: team,
      });

      const newState = appReducer(state, {
        type: 'ASSIGN_MEMBER_TO_TEAM',
        payload: { memberId: 'member1', teamId: '1' },
      });

      expect(newState.teams['1'].memberIds).toContain('member1');
    });

    it('should not add duplicate member to team', () => {
      const team: Team = {
        id: '1',
        name: 'Team A',
        description: 'Description',
        memberIds: ['member1'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      const state = appReducer(initialState, {
        type: 'ADD_TEAM',
        payload: team,
      });

      const newState = appReducer(state, {
        type: 'ASSIGN_MEMBER_TO_TEAM',
        payload: { memberId: 'member1', teamId: '1' },
      });

      expect(newState.teams['1'].memberIds.length).toBe(1);
    });

    it('should remove a member from a team', () => {
      const team: Team = {
        id: '1',
        name: 'Team A',
        description: 'Description',
        memberIds: ['member1', 'member2'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      const state = appReducer(initialState, {
        type: 'ADD_TEAM',
        payload: team,
      });

      const newState = appReducer(state, {
        type: 'REMOVE_MEMBER_FROM_TEAM',
        payload: { memberId: 'member1', teamId: '1' },
      });

      expect(newState.teams['1'].memberIds).not.toContain('member1');
      expect(newState.teams['1'].memberIds).toContain('member2');
    });
  });

  describe('UI actions', () => {
    it('should toggle dark mode', () => {
      const newState = appReducer(initialState, {
        type: 'TOGGLE_DARK_MODE',
      });

      expect(newState.darkMode).toBe(true);

      const toggledState = appReducer(newState, {
        type: 'TOGGLE_DARK_MODE',
      });

      expect(toggledState.darkMode).toBe(false);
    });

    it('should set language', () => {
      const newState = appReducer(initialState, {
        type: 'SET_LANGUAGE',
        payload: 'de',
      });

      expect(newState.language).toBe('de');
    });
  });

  describe('Data actions', () => {
    it('should load state with backward compatibility', () => {
      const legacyState = {
        members: {},
        teams: {},
        darkMode: true,
        language: 'de' as const,
      };

      const newState = appReducer(initialState, {
        type: 'LOAD_STATE',
        payload: legacyState as any,
      });

      // Should add empty roles and skills for backward compatibility
      expect(newState.roles).toEqual({});
      expect(newState.skills).toEqual({});
      expect(newState.darkMode).toBe(true);
      expect(newState.language).toBe('de');
    });
  });
});
