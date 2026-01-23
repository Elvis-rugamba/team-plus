import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberAvatar } from '@/components/shared/MemberAvatar';
import { Availability } from '@/types';
import type { MemberWithNames } from '@/hooks/useMembers';

// Mock MemberDetailsCard
vi.mock('@/components/shared/MemberDetailsCard', () => ({
  MemberDetailsCard: ({ member }: { member: MemberWithNames }) => (
    <div data-testid="member-details-card">{member.name}</div>
  ),
}));

describe('MemberAvatar', () => {
  const mockMember: MemberWithNames = {
    id: '1',
    name: 'John Doe',
    roleId: 'role-1',
    roleName: 'Developer',
    skillIds: ['skill-1'],
    skillNames: ['JavaScript'],
    availability: Availability.AVAILABLE,
    email: 'john@example.com',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render avatar with initials', () => {
    render(<MemberAvatar member={mockMember} />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should display correct initials for different names', () => {
    const memberWithLongName: MemberWithNames = {
      ...mockMember,
      name: 'Alice Bob Charlie',
    };

    render(<MemberAvatar member={memberWithLongName} />);

    expect(screen.getByText('AB')).toBeInTheDocument();
  });

  it('should have correct aria-label', () => {
    render(<MemberAvatar member={mockMember} />);

    const avatar = screen.getByLabelText('John Doe - Developer');
    expect(avatar).toBeInTheDocument();
  });

  it('should show popover on hover', async () => {
    const user = userEvent.setup();
    render(<MemberAvatar member={mockMember} />);

    const avatar = screen.getByLabelText('John Doe - Developer');
    await user.hover(avatar);

    expect(screen.getByTestId('member-details-card')).toBeInTheDocument();
  });

  it('should accept custom background color', () => {
    render(<MemberAvatar member={mockMember} bgcolor="#ff0000" />);

    const avatar = screen.getByLabelText('John Doe - Developer');
    expect(avatar).toBeInTheDocument();
  });

  it('should handle different sizes', () => {
    const { rerender } = render(<MemberAvatar member={mockMember} size="small" />);
    expect(screen.getByText('JD')).toBeInTheDocument();

    rerender(<MemberAvatar member={mockMember} size="medium" />);
    expect(screen.getByText('JD')).toBeInTheDocument();

    rerender(<MemberAvatar member={mockMember} size="large" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });
});
