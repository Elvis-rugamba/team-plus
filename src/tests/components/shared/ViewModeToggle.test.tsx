import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ViewModeToggle } from '@/components/shared/ViewModeToggle';
import type { ViewMode } from '@/types';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
    },
  }),
}));

describe('ViewModeToggle', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all three view mode buttons', () => {
    render(<ViewModeToggle value="table" onChange={mockOnChange} />);

    expect(screen.getByLabelText('common.table')).toBeInTheDocument();
    expect(screen.getByLabelText('common.list')).toBeInTheDocument();
    expect(screen.getByLabelText('common.grid')).toBeInTheDocument();
  });

  it('should highlight the selected view mode', () => {
    const { rerender } = render(
      <ViewModeToggle value="table" onChange={mockOnChange} />
    );

    let tableButton = screen.getByLabelText('common.table');
    expect(tableButton).toHaveAttribute('aria-pressed', 'true');

    rerender(<ViewModeToggle value="list" onChange={mockOnChange} />);
    let listButton = screen.getByLabelText('common.list');
    expect(listButton).toHaveAttribute('aria-pressed', 'true');

    rerender(<ViewModeToggle value="grid" onChange={mockOnChange} />);
    let gridButton = screen.getByLabelText('common.grid');
    expect(gridButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should call onChange when a different view mode is clicked', () => {
    render(<ViewModeToggle value="table" onChange={mockOnChange} />);

    const listButton = screen.getByLabelText('common.list');
    fireEvent.click(listButton);

    expect(mockOnChange).toHaveBeenCalledWith('list');
  });

  it('should not call onChange when the same view mode is clicked', () => {
    render(<ViewModeToggle value="table" onChange={mockOnChange} />);

    const tableButton = screen.getByLabelText('common.table');
    fireEvent.click(tableButton);

    // ToggleButtonGroup doesn't call onChange if the same value is clicked
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should have correct aria-label', () => {
    render(<ViewModeToggle value="table" onChange={mockOnChange} />);

    const toggleGroup = screen.getByLabelText('common.viewMode');
    expect(toggleGroup).toBeInTheDocument();
  });
});
