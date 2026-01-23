import { describe, it, expect } from 'vitest';
import { calculateStatistics } from '@/utils/statistics';
import { Availability, type AppState } from '@/types';

describe('calculateStatistics', () => {
  it('should calculate statistics for empty state', () => {
    const state: AppState = {
      members: {},
      teams: {},
      roles: {},
      skills: {},
      darkMode: false,
      language: 'en',
    };

    const stats = calculateStatistics(state);

    expect(stats.totalMembers).toBe(0);
    expect(stats.totalTeams).toBe(0);
    expect(stats.averageTeamSize).toBe(0);
    expect(Object.keys(stats.skillDistribution).length).toBe(0);
  });

  it('should calculate correct member and team counts', () => {
    const state: AppState = {
      members: {
        '1': {
          id: '1',
          name: 'John Doe',
          roleId: 'role-1',
          skillIds: ['skill-1', 'skill-2'],
          availability: Availability.AVAILABLE,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        '2': {
          id: '2',
          name: 'Jane Smith',
          roleId: 'role-2',
          skillIds: ['skill-3', 'skill-4'],
          availability: Availability.BUSY,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      },
      teams: {
        '1': {
          id: '1',
          name: 'Team A',
          description: 'Description',
          memberIds: ['1', '2'],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      },
      roles: {
        'role-1': { id: 'role-1', name: 'Developer', createdAt: '2024-01-01' },
        'role-2': { id: 'role-2', name: 'Designer', createdAt: '2024-01-01' },
      },
      skills: {
        'skill-1': { id: 'skill-1', name: 'JavaScript', createdAt: '2024-01-01' },
        'skill-2': { id: 'skill-2', name: 'React', createdAt: '2024-01-01' },
        'skill-3': { id: 'skill-3', name: 'UI/UX', createdAt: '2024-01-01' },
        'skill-4': { id: 'skill-4', name: 'Figma', createdAt: '2024-01-01' },
      },
      darkMode: false,
      language: 'en',
    };

    const stats = calculateStatistics(state);

    expect(stats.totalMembers).toBe(2);
    expect(stats.totalTeams).toBe(1);
    expect(stats.averageTeamSize).toBe(2);
  });

  it('should calculate skill distribution correctly', () => {
    const state: AppState = {
      members: {
        '1': {
          id: '1',
          name: 'John Doe',
          roleId: 'role-1',
          skillIds: ['skill-1', 'skill-2'],
          availability: Availability.AVAILABLE,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        '2': {
          id: '2',
          name: 'Jane Smith',
          roleId: 'role-1',
          skillIds: ['skill-1', 'skill-3'],
          availability: Availability.AVAILABLE,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      },
      teams: {},
      roles: {
        'role-1': { id: 'role-1', name: 'Developer', createdAt: '2024-01-01' },
      },
      skills: {
        'skill-1': { id: 'skill-1', name: 'JavaScript', createdAt: '2024-01-01' },
        'skill-2': { id: 'skill-2', name: 'React', createdAt: '2024-01-01' },
        'skill-3': { id: 'skill-3', name: 'Vue', createdAt: '2024-01-01' },
      },
      darkMode: false,
      language: 'en',
    };

    const stats = calculateStatistics(state);

    expect(stats.skillDistribution['JavaScript']).toBe(2);
    expect(stats.skillDistribution['React']).toBe(1);
    expect(stats.skillDistribution['Vue']).toBe(1);
  });

  it('should calculate availability distribution correctly', () => {
    const state: AppState = {
      members: {
        '1': {
          id: '1',
          name: 'John',
          roleId: 'role-1',
          skillIds: [],
          availability: Availability.AVAILABLE,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        '2': {
          id: '2',
          name: 'Jane',
          roleId: 'role-2',
          skillIds: [],
          availability: Availability.AVAILABLE,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        '3': {
          id: '3',
          name: 'Bob',
          roleId: 'role-3',
          skillIds: [],
          availability: Availability.BUSY,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      },
      teams: {},
      roles: {
        'role-1': { id: 'role-1', name: 'Developer', createdAt: '2024-01-01' },
        'role-2': { id: 'role-2', name: 'Designer', createdAt: '2024-01-01' },
        'role-3': { id: 'role-3', name: 'Manager', createdAt: '2024-01-01' },
      },
      skills: {},
      darkMode: false,
      language: 'en',
    };

    const stats = calculateStatistics(state);

    expect(stats.availabilityDistribution[Availability.AVAILABLE]).toBe(2);
    expect(stats.availabilityDistribution[Availability.BUSY]).toBe(1);
    expect(stats.availabilityDistribution[Availability.UNAVAILABLE]).toBe(0);
  });
});
