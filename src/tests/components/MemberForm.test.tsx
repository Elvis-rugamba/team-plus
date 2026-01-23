import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberForm } from '@/features/members/components/MemberForm';
import { Availability } from '@/types';
import type { MemberFormData } from '@/types';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
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

describe('MemberForm', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();
  const mockExistingRoles = ['Developer', 'Designer'];
  const mockExistingSkills = ['JavaScript', 'React', 'TypeScript'];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form fields', () => {
    render(
      <MemberForm
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        existingRoles={mockExistingRoles}
        existingSkills={mockExistingSkills}
      />
    );

    expect(screen.getByLabelText(/members.name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/members.role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/members.skills/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/members.availability/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/members.email/i)).toBeInTheDocument();
  });

  it('should populate form when editing', () => {
    const initialData: MemberFormData = {
      name: 'John Doe',
      role: 'Developer',
      skills: ['JavaScript', 'React'],
      availability: Availability.AVAILABLE,
      email: 'john@example.com',
    };

    render(
      <MemberForm
        open={true}
        initialData={initialData}
        isEditing={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        existingRoles={mockExistingRoles}
        existingSkills={mockExistingSkills}
      />
    );

    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(
      <MemberForm
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        existingRoles={mockExistingRoles}
        existingSkills={mockExistingSkills}
      />
    );

    const saveButton = screen.getByText('common.save');
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  it('should call onSave with form data when valid', async () => {
    const user = userEvent.setup();
    render(
      <MemberForm
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        existingRoles={mockExistingRoles}
        existingSkills={mockExistingSkills}
      />
    );

    const nameInput = screen.getByLabelText(/members.name/i);
    const roleInput = screen.getByLabelText(/members.role/i);

    await user.type(nameInput, 'John Doe');
    await user.type(roleInput, 'Developer');

    const saveButton = screen.getByText('common.save');
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    render(
      <MemberForm
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        existingRoles={mockExistingRoles}
        existingSkills={mockExistingSkills}
      />
    );

    const nameInput = screen.getByLabelText(/members.name/i);
    const roleInput = screen.getByLabelText(/members.role/i);
    const emailInput = screen.getByLabelText(/members.email/i);

    await user.type(nameInput, 'John Doe');
    await user.type(roleInput, 'Developer');
    await user.type(emailInput, 'invalid-email');

    const saveButton = screen.getByText('common.save');
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  it('should call onClose when cancel is clicked', () => {
    render(
      <MemberForm
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        existingRoles={mockExistingRoles}
        existingSkills={mockExistingSkills}
      />
    );

    const cancelButton = screen.getByText('common.cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
