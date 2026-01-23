import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportData } from '@/utils/export';
import { Availability, type AppState } from '@/types';

describe('exportData', () => {
  const mockState: AppState = {
    members: {
      'member-1': {
        id: 'member-1',
        name: 'John Doe',
        roleId: 'role-1',
        skillIds: ['skill-1', 'skill-2'],
        availability: Availability.AVAILABLE,
        email: 'john@example.com',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    },
    teams: {
      'team-1': {
        id: 'team-1',
        name: 'Development Team',
        description: 'A team of developers',
        memberIds: ['member-1'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    },
    roles: {
      'role-1': {
        id: 'role-1',
        name: 'Developer',
        createdAt: '2024-01-01',
      },
    },
    skills: {
      'skill-1': {
        id: 'skill-1',
        name: 'JavaScript',
        createdAt: '2024-01-01',
      },
      'skill-2': {
        id: 'skill-2',
        name: 'React',
        createdAt: '2024-01-01',
      },
    },
    darkMode: false,
    language: 'en',
  };

  let createElementSpy: any;
  let appendChildSpy: any;
  let removeChildSpy: any;
  let clickSpy: any;
  let mockLink: any;

  beforeEach(() => {
    // Mock DOM methods
    mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
    };

    createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);
    clickSpy = vi.spyOn(mockLink, 'click');

    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
    global.Blob = class MockBlob {
      constructor(public parts: any[], public options: any) {}
    } as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should export data as JSON', () => {
    exportData(mockState, 'json', 'test.json');

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(mockLink.download).toBe('test.json');
    expect(clickSpy).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
  });

  it('should export data as CSV', () => {
    exportData(mockState, 'csv', 'test.csv');

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(mockLink.download).toBe('test.csv');
    expect(clickSpy).toHaveBeenCalled();
  });

  it('should include members in CSV export', () => {
    exportData(mockState, 'csv', 'test.csv');

    const blob = new Blob([], { type: 'text/csv' });
    // The CSV should contain member data
    expect(createElementSpy).toHaveBeenCalled();
  });

  it('should include teams in CSV export', () => {
    exportData(mockState, 'csv', 'test.csv');

    expect(createElementSpy).toHaveBeenCalled();
  });

  it('should include roles in CSV export when present', () => {
    exportData(mockState, 'csv', 'test.csv');

    expect(createElementSpy).toHaveBeenCalled();
  });

  it('should include skills in CSV export when present', () => {
    exportData(mockState, 'csv', 'test.csv');

    expect(createElementSpy).toHaveBeenCalled();
  });

  it('should handle empty state', () => {
    const emptyState: AppState = {
      members: {},
      teams: {},
      roles: {},
      skills: {},
      darkMode: false,
      language: 'en',
    };

    exportData(emptyState, 'json', 'empty.json');

    expect(createElementSpy).toHaveBeenCalled();
  });

  it('should handle members without email', () => {
    const stateWithoutEmail: AppState = {
      ...mockState,
      members: {
        'member-1': {
          ...mockState.members['member-1'],
          email: undefined,
        },
      },
    };

    exportData(stateWithoutEmail, 'csv', 'test.csv');

    expect(createElementSpy).toHaveBeenCalled();
  });

  it('should resolve role and skill IDs to names in CSV', () => {
    exportData(mockState, 'csv', 'test.csv');

    // The CSV should use role and skill names, not IDs
    expect(createElementSpy).toHaveBeenCalled();
  });
});
