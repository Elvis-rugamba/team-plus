import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemberDetailsCard } from '@/components/shared/MemberDetailsCard';
import { Availability } from '@/types';
import type { MemberWithNames } from '@/hooks/useMembers';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
    },
  }),
}));

describe('MemberDetailsCard', () => {
  const mockMember: MemberWithNames = {
    id: '1',
    name: 'John Doe',
    roleId: 'role-1',
    roleName: 'Developer',
    skillIds: ['skill-1', 'skill-2'],
    skillNames: ['JavaScript', 'React'],
    availability: Availability.AVAILABLE,
    email: 'john@example.com',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render member name and role', () => {
    render(<MemberDetailsCard member={mockMember} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
  });

  it('should render avatar with initials', () => {
    render(<MemberDetailsCard member={mockMember} />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should render availability chip', () => {
    render(<MemberDetailsCard member={mockMember} />);

    expect(screen.getByText('members.available')).toBeInTheDocument();
  });

  it('should render skills when provided', () => {
    render(<MemberDetailsCard member={mockMember} />);

    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('should not render skills section when no skills', () => {
    const memberWithoutSkills: MemberWithNames = {
      ...mockMember,
      skillIds: [],
      skillNames: [],
    };

    render(<MemberDetailsCard member={memberWithoutSkills} />);

    expect(screen.queryByText('members.skills')).not.toBeInTheDocument();
  });

  it('should render email when provided', () => {
    render(<MemberDetailsCard member={mockMember} />);

    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should not render email section when no email', () => {
    const memberWithoutEmail: MemberWithNames = {
      ...mockMember,
      email: undefined,
    };

    render(<MemberDetailsCard member={memberWithoutEmail} />);

    expect(screen.queryByText('members.email')).not.toBeInTheDocument();
  });

  it('should render team count when provided', () => {
    render(<MemberDetailsCard member={mockMember} teamCount={3} />);

    expect(screen.getByText(/3.*teams/)).toBeInTheDocument();
  });

  it('should not render team count section when not provided', () => {
    render(<MemberDetailsCard member={mockMember} />);

    expect(screen.queryByText('teams.teams')).not.toBeInTheDocument();
  });

  it('should handle different availability statuses', () => {
    const busyMember: MemberWithNames = {
      ...mockMember,
      availability: Availability.BUSY,
    };

    const { rerender } = render(<MemberDetailsCard member={busyMember} />);
    expect(screen.getByText('members.busy')).toBeInTheDocument();

    const unavailableMember: MemberWithNames = {
      ...mockMember,
      availability: Availability.UNAVAILABLE,
    };

    rerender(<MemberDetailsCard member={unavailableMember} />);
    expect(screen.getByText('members.unavailable')).toBeInTheDocument();
  });
});
