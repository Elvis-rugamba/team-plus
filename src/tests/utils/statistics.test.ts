import { describe, it, expect } from 'vitest';
import { calculateStatistics } from '@/utils/statistics';
import { Availability, type AppState } from '@/types';

describe('calculateStatistics', () => {
  it('should calculate statistics for empty state', () => {
    const state: AppState = {
      members: {},
      teams: {},
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
          role: 'Developer',
          skills: ['JavaScript', 'React'],
          availability: Availability.AVAILABLE,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        '2': {
          id: '2',
          name: 'Jane Smith',
          role: 'Designer',
          skills: ['UI/UX', 'Figma'],
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
          role: 'Developer',
          skills: ['JavaScript', 'React'],
          availability: Availability.AVAILABLE,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        '2': {
          id: '2',
          name: 'Jane Smith',
          role: 'Developer',
          skills: ['JavaScript', 'Vue'],
          availability: Availability.AVAILABLE,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      },
      teams: {},
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
          role: 'Developer',
          skills: [],
          availability: Availability.AVAILABLE,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        '2': {
          id: '2',
          name: 'Jane',
          role: 'Designer',
          skills: [],
          availability: Availability.AVAILABLE,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        '3': {
          id: '3',
          name: 'Bob',
          role: 'Manager',
          skills: [],
          availability: Availability.BUSY,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      },
      teams: {},
      darkMode: false,
      language: 'en',
    };

    const stats = calculateStatistics(state);

    expect(stats.availabilityDistribution[Availability.AVAILABLE]).toBe(2);
    expect(stats.availabilityDistribution[Availability.BUSY]).toBe(1);
    expect(stats.availabilityDistribution[Availability.UNAVAILABLE]).toBe(0);
  });
});
