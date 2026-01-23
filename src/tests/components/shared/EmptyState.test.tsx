import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '@/components/shared/EmptyState';
import AddIcon from '@mui/icons-material/Add';

describe('EmptyState', () => {
  const mockAction = {
    label: 'Add Item',
    onClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render title', () => {
    render(<EmptyState title="No items found" />);

    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('should render description when provided', () => {
    render(
      <EmptyState
        title="No items found"
        description="Try adding a new item to get started"
      />
    );

    expect(screen.getByText('Try adding a new item to get started')).toBeInTheDocument();
  });

  it('should not render description when not provided', () => {
    render(<EmptyState title="No items found" />);

    expect(screen.queryByText(/Try adding/)).not.toBeInTheDocument();
  });

  it('should render action button when provided', () => {
    render(
      <EmptyState
        title="No items found"
        action={mockAction}
      />
    );

    const button = screen.getByLabelText('Add Item');
    expect(button).toBeInTheDocument();
    expect(screen.getByText('Add Item')).toBeInTheDocument();
  });

  it('should call action onClick when button is clicked', () => {
    render(
      <EmptyState
        title="No items found"
        action={mockAction}
      />
    );

    const button = screen.getByLabelText('Add Item');
    fireEvent.click(button);

    expect(mockAction.onClick).toHaveBeenCalledTimes(1);
  });

  it('should render action icon when provided', () => {
    render(
      <EmptyState
        title="No items found"
        action={{
          ...mockAction,
          icon: <AddIcon data-testid="add-icon" />,
        }}
      />
    );

    expect(screen.getByTestId('add-icon')).toBeInTheDocument();
  });

  it('should render custom icon when provided', () => {
    const CustomIcon = () => <div data-testid="custom-icon">Custom</div>;

    render(
      <EmptyState
        title="No items found"
        icon={<CustomIcon />}
      />
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('should render default icon when no icon provided', () => {
    const { container } = render(<EmptyState title="No items found" />);

    // The default InboxIcon should be rendered in an element with aria-hidden="true"
    const iconContainer = container.querySelector('[aria-hidden="true"]');
    expect(iconContainer).toBeInTheDocument();
  });
});
