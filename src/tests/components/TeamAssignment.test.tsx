import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TeamAssignment } from '@/features/teams/components/TeamAssignment';
import type { Team } from '@/types';
import type { MemberWithNames } from '@/hooks/useMembers';
import { Availability } from '@/types';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
    },
  }),
}));

// Mock AppContext
vi.mock('@/contexts/AppContext', () => ({
  useAppContext: () => ({
    state: {
      roles: {
        'role-1': { id: 'role-1', name: 'Developer', createdAt: '2024-01-01' },
      },
      skills: {
        'skill-1': { id: 'skill-1', name: 'JavaScript', createdAt: '2024-01-01' },
      },
    },
  }),
}));

// Mock dnd-kit
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  useDroppable: () => ({
    setNodeRef: vi.fn(),
  }),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  verticalListSortingStrategy: vi.fn(),
  sortableKeyboardCoordinates: vi.fn(),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn(() => ''),
    },
  },
}));

describe('TeamAssignment', () => {
  const mockTeam: Team = {
    id: 'team-1',
    name: 'Development Team',
    description: 'A team of developers',
    memberIds: ['member-1'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    targetRoles: ['role-1'],
    targetSkills: ['skill-1'],
    targetSize: 5,
  };

  const mockTeamMembers: MemberWithNames[] = [
    {
      id: 'member-1',
      name: 'John Doe',
      roleId: 'role-1',
      roleName: 'Developer',
      skillIds: ['skill-1'],
      skillNames: ['JavaScript'],
      availability: Availability.AVAILABLE,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  const mockAvailableMembers: MemberWithNames[] = [
    {
      id: 'member-2',
      name: 'Jane Smith',
      roleId: 'role-2',
      roleName: 'Designer',
      skillIds: [],
      skillNames: [],
      availability: Availability.AVAILABLE,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  const mockOnClose = vi.fn();
  const mockOnAssign = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render team assignment dialog', () => {
    render(
      <TeamAssignment
        open={true}
        team={mockTeam}
        teamMembers={mockTeamMembers}
        availableMembers={mockAvailableMembers}
        onClose={mockOnClose}
        onAssign={mockOnAssign}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText(/teams.assignMembers.*Development Team/)).toBeInTheDocument();
    expect(screen.getByText(/teams.unassignedMembers/)).toBeInTheDocument();
    expect(screen.getByText(/teams.members/)).toBeInTheDocument();
  });

  it('should display team members', () => {
    render(
      <TeamAssignment
        open={true}
        team={mockTeam}
        teamMembers={mockTeamMembers}
        availableMembers={mockAvailableMembers}
        onClose={mockOnClose}
        onAssign={mockOnAssign}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should display available members', () => {
    render(
      <TeamAssignment
        open={true}
        team={mockTeam}
        teamMembers={mockTeamMembers}
        availableMembers={mockAvailableMembers}
        onClose={mockOnClose}
        onAssign={mockOnAssign}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <TeamAssignment
        open={true}
        team={mockTeam}
        teamMembers={mockTeamMembers}
        availableMembers={mockAvailableMembers}
        onClose={mockOnClose}
        onAssign={mockOnAssign}
        onRemove={mockOnRemove}
      />
    );

    const closeButton = screen.getByText('common.close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display warning when team has irrelevant members', () => {
    const teamWithIrrelevant: Team = {
      ...mockTeam,
      targetRoles: ['role-1'],
    };

    const irrelevantMember: MemberWithNames = {
      ...mockTeamMembers[0],
      roleId: 'role-2', // Different role
    };

    render(
      <TeamAssignment
        open={true}
        team={teamWithIrrelevant}
        teamMembers={[irrelevantMember]}
        availableMembers={mockAvailableMembers}
        onClose={mockOnClose}
        onAssign={mockOnAssign}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText('teams.assignmentWarning')).toBeInTheDocument();
  });

  it('should display size warning when team size is below target', () => {
    const teamWithTarget: Team = {
      ...mockTeam,
      targetSize: 5,
      memberIds: ['member-1'], // Only 1 member, target is 5
    };

    render(
      <TeamAssignment
        open={true}
        team={teamWithTarget}
        teamMembers={mockTeamMembers}
        availableMembers={mockAvailableMembers}
        onClose={mockOnClose}
        onAssign={mockOnAssign}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText(/teams.sizeBelowTarget/)).toBeInTheDocument();
  });
});
