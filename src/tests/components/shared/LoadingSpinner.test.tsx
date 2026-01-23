import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render loading spinner', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toBeInTheDocument();
  });

  it('should render with default size', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toBeInTheDocument();
  });

  it('should render with custom size', () => {
    render(<LoadingSpinner size={60} />);

    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toBeInTheDocument();
  });

  it('should render message when provided', () => {
    render(<LoadingSpinner message="Loading data..." />);

    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('should not render message when not provided', () => {
    render(<LoadingSpinner />);

    expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
  });

  it('should have correct accessibility attributes', () => {
    render(<LoadingSpinner message="Loading..." />);

    const container = screen.getByRole('status');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('aria-live', 'polite');
  });
});
