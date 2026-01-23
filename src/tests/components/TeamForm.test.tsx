import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeamForm } from '@/features/teams/components/TeamForm';
import type { Team } from '@/types';
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
    roles: [
      { id: 'role-1', name: 'Developer', createdAt: '2024-01-01' },
      { id: 'role-2', name: 'Designer', createdAt: '2024-01-01' },
    ],
    roleNames: ['Developer', 'Designer'],
    getRoleName: (id: string) => {
      const roles: Record<string, string> = {
        'role-1': 'Developer',
        'role-2': 'Designer',
      };
      return roles[id] || '';
    },
    getOrCreateRoleId: (name: string) => {
      const roleMap: Record<string, string> = {
        'Developer': 'role-1',
        'Designer': 'role-2',
      };
      return roleMap[name] || 'role-new';
    },
  }),
}));

vi.mock('@/hooks/useSkills', () => ({
  useSkills: () => ({
    skills: [
      { id: 'skill-1', name: 'JavaScript', createdAt: '2024-01-01' },
      { id: 'skill-2', name: 'React', createdAt: '2024-01-01' },
    ],
    skillNames: ['JavaScript', 'React'],
    getSkillName: (id: string) => {
      const skills: Record<string, string> = {
        'skill-1': 'JavaScript',
        'skill-2': 'React',
      };
      return skills[id] || '';
    },
    getOrCreateSkillId: (name: string) => {
      const skillMap: Record<string, string> = {
        'JavaScript': 'skill-1',
        'React': 'skill-2',
      };
      return skillMap[name] || 'skill-new';
    },
  }),
}));

// Mock CreatableAutocomplete
vi.mock('@/components/shared/CreatableAutocomplete', () => ({
  CreatableAutocomplete: ({ value, onChange, label, error, helperText, ...props }: any) => (
    <div>
      <label>{label}</label>
      <input
        data-testid={props['data-testid'] || `autocomplete-${label}`}
        value={Array.isArray(value) ? value.join(', ') : value}
        onChange={(e) => {
          if (props.multiple) {
            onChange(e.target.value.split(', ').filter(Boolean));
          } else {
            onChange(e.target.value);
          }
        }}
        aria-label={props.ariaLabel}
      />
      {error && <div data-testid="error">{helperText}</div>}
    </div>
  ),
}));

describe('TeamForm', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form fields', () => {
    render(<TeamForm open={true} onClose={mockOnClose} onSave={mockOnSave} />);

    expect(screen.getByLabelText(/teams.name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teams.description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teams.targetRoles/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teams.targetSkills/i)).toBeInTheDocument();
  });

  it('should populate form when editing', () => {
    const mockTeam: Team = {
      id: 'team-1',
      name: 'Development Team',
      description: 'A team of developers',
      memberIds: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      targetRoles: ['role-1'],
      targetSkills: ['skill-1'],
      targetSize: 5,
    };

    render(<TeamForm open={true} team={mockTeam} onClose={mockOnClose} onSave={mockOnSave} />);

    expect(screen.getByDisplayValue('Development Team')).toBeInTheDocument();
    expect(screen.getByDisplayValue('A team of developers')).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<TeamForm open={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const saveButton = screen.getByText('common.save');
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  it('should call onSave with form data when valid', async () => {
    const user = userEvent.setup();
    render(<TeamForm open={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const nameInput = screen.getByLabelText(/teams.name/i);
    const descriptionInput = screen.getByLabelText(/teams.description/i);

    await user.type(nameInput, 'New Team');
    await user.type(descriptionInput, 'Team description');

    const saveButton = screen.getByText('common.save');
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it('should call onClose when cancel is clicked', () => {
    render(<TeamForm open={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const cancelButton = screen.getByText('common.cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should validate target size as positive number', async () => {
    const user = userEvent.setup();
    render(<TeamForm open={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const nameInput = screen.getByLabelText(/teams.name/i);
    const descriptionInput = screen.getByLabelText(/teams.description/i);
    const targetSizeInput = screen.getByLabelText(/teams.targetSize/i);

    await user.type(nameInput, 'New Team');
    await user.type(descriptionInput, 'Team description');
    await user.type(targetSizeInput, '-5');

    const saveButton = screen.getByText('common.save');
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });
});
