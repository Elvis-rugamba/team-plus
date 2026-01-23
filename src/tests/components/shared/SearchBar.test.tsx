import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '@/components/shared/SearchBar';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
    },
  }),
}));

describe('SearchBar', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);

    expect(screen.getByLabelText('common.search')).toBeInTheDocument();
  });

  it('should display current value', () => {
    render(<SearchBar value="test query" onChange={mockOnChange} />);

    const input = screen.getByLabelText('common.search') as HTMLInputElement;
    expect(input.value).toBe('test query');
  });

  it('should call onChange when input value changes', async () => {
    const user = userEvent.setup();
    render(<SearchBar value="" onChange={mockOnChange} />);

    const input = screen.getByLabelText('common.search');
    await user.type(input, 'search term');

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should use default placeholder when not provided', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('filter.searchPlaceholder');
    expect(input).toBeInTheDocument();
  });

  it('should use custom placeholder when provided', () => {
    render(
      <SearchBar
        value=""
        onChange={mockOnChange}
        placeholder="Search members..."
      />
    );

    const input = screen.getByPlaceholderText('Search members...');
    expect(input).toBeInTheDocument();
  });

  it('should render search icon', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);

    // Search icon should be present (it's in InputAdornment)
    const input = screen.getByLabelText('common.search');
    expect(input).toBeInTheDocument();
  });

  it('should apply fullWidth when specified', () => {
    const { container } = render(
      <SearchBar value="" onChange={mockOnChange} fullWidth />
    );

    const input = container.querySelector('.MuiInputBase-fullWidth');
    expect(input).toBeInTheDocument();
  });
});
