import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TeamCard } from '@/features/teams/components/TeamCard';
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

// Mock hooks
vi.mock('@/hooks/useRoles', () => ({
  useRoles: () => ({
    getRoleName: (id: string) => {
      const roles: Record<string, string> = {
        'role-1': 'Developer',
        'role-2': 'Designer',
      };
      return roles[id] || '';
    },
  }),
}));

vi.mock('@/hooks/useSkills', () => ({
  useSkills: () => ({
    getSkillName: (id: string) => {
      const skills: Record<string, string> = {
        'skill-1': 'JavaScript',
        'skill-2': 'React',
        'skill-3': 'TypeScript',
      };
      return skills[id] || '';
    },
  }),
}));

// Mock MemberAvatar
vi.mock('@/components/shared/MemberAvatar', () => ({
  MemberAvatar: ({ member }: { member: MemberWithNames }) => (
    <div data-testid={`avatar-${member.id}`}>{member.name}</div>
  ),
}));

describe('TeamCard', () => {
  const mockTeam: Team = {
    id: 'team-1',
    name: 'Development Team',
    description: 'A team of developers',
    memberIds: ['member-1', 'member-2'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    color: '#1976d2',
    targetRoles: ['role-1'],
    targetSkills: ['skill-1', 'skill-2'],
    targetSize: 5,
  };

  const mockMembers: MemberWithNames[] = [
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
    {
      id: 'member-2',
      name: 'Jane Smith',
      roleId: 'role-2',
      roleName: 'Designer',
      skillIds: ['skill-2'],
      skillNames: ['React'],
      availability: Availability.AVAILABLE,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render team information', () => {
    render(
      <TeamCard
        team={mockTeam}
        members={mockMembers}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('Development Team')).toBeInTheDocument();
    expect(screen.getByText('A team of developers')).toBeInTheDocument();
  });

  it('should display member count with target size', () => {
    render(
      <TeamCard
        team={mockTeam}
        members={mockMembers}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText(/2.*5.*teams.members/)).toBeInTheDocument();
  });

  it('should display target roles and skills', () => {
    render(
      <TeamCard
        team={mockTeam}
        members={mockMembers}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('teams.targetCriteria')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    render(
      <TeamCard
        team={mockTeam}
        members={mockMembers}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onClick={mockOnClick}
      />
    );

    const editButton = screen.getByLabelText(/common.edit/);
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockTeam);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <TeamCard
        team={mockTeam}
        members={mockMembers}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onClick={mockOnClick}
      />
    );

    const deleteButton = screen.getByLabelText(/common.delete/);
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockTeam);
  });

  it('should call onClick when card is clicked', () => {
    render(
      <TeamCard
        team={mockTeam}
        members={mockMembers}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onClick={mockOnClick}
      />
    );

    const card = screen.getByText('Development Team').closest('div[class*="MuiCard"]');
    if (card) {
      fireEvent.click(card);
      expect(mockOnClick).toHaveBeenCalledWith(mockTeam);
    }
  });

  it('should display assign members button when no members', () => {
    const teamWithoutMembers: Team = {
      ...mockTeam,
      memberIds: [],
    };

    render(
      <TeamCard
        team={teamWithoutMembers}
        members={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('teams.assignMembers')).toBeInTheDocument();
  });

  it('should display member avatars when members exist', () => {
    render(
      <TeamCard
        team={mockTeam}
        members={mockMembers}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByTestId('avatar-member-1')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-member-2')).toBeInTheDocument();
  });
});
