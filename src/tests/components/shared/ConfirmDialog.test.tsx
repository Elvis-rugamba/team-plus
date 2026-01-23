import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
    },
  }),
}));

describe('ConfirmDialog', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog when open', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <ConfirmDialog
        open={false}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const confirmButton = screen.getByLabelText('common.confirm');
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByLabelText('common.cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should use custom confirm text when provided', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        confirmText="Delete"
      />
    );

    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should use custom cancel text when provided', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        cancelText="Go Back"
      />
    );

    expect(screen.getByText('Go Back')).toBeInTheDocument();
  });

  it('should use error color for confirm button when specified', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Delete Item"
        message="This action cannot be undone"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        confirmColor="error"
      />
    );

    const confirmButton = screen.getByLabelText('common.confirm');
    expect(confirmButton).toHaveClass('MuiButton-colorError');
  });
});
