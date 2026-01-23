import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemberListItem } from '@/features/members/components/MemberListItem';
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

describe('MemberListItem', () => {
  const mockMember: MemberWithNames = {
    id: '1',
    name: 'John Doe',
    roleId: 'role-1',
    roleName: 'Developer',
    skillIds: ['skill-1', 'skill-2', 'skill-3'],
    skillNames: ['JavaScript', 'React', 'TypeScript'],
    availability: Availability.AVAILABLE,
    email: 'john@example.com',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render member information', () => {
    render(
      <MemberListItem
        member={mockMember}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        teamCount={2}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should display skills', () => {
    render(
      <MemberListItem
        member={mockMember}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        teamCount={2}
      />
    );

    // Skills are displayed as a comma-separated string
    expect(screen.getByText(/JavaScript.*React.*TypeScript/)).toBeInTheDocument();
  });

  it('should display team count', () => {
    render(
      <MemberListItem
        member={mockMember}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        teamCount={3}
      />
    );

    expect(screen.getByText(/3.*teams.teams/)).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    render(
      <MemberListItem
        member={mockMember}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        teamCount={2}
      />
    );

    const editButton = screen.getByLabelText(/common.edit/);
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockMember);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <MemberListItem
        member={mockMember}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        teamCount={2}
      />
    );

    const deleteButton = screen.getByLabelText(/common.delete/);
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockMember);
  });

  it('should display availability chip', () => {
    render(
      <MemberListItem
        member={mockMember}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        teamCount={2}
      />
    );

    expect(screen.getByText('members.available')).toBeInTheDocument();
  });

  it('should display avatar with initials', () => {
    render(
      <MemberListItem
        member={mockMember}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        teamCount={2}
      />
    );

    const avatar = screen.getByText('JD');
    expect(avatar).toBeInTheDocument();
  });
});
