import { render, screen } from '@testing-library/react';
import VoteChart from '../VoteChart';
import { VoteValue } from '@/types';

describe('VoteChart', () => {
  it('should render "No votes yet" when totalVotes is 0', () => {
    render(<VoteChart distribution={{}} totalVotes={0} />);
    expect(screen.getByText('No votes yet')).toBeInTheDocument();
  });

  it('should render Vote Distribution title', () => {
    const distribution = { '5': 2, '8': 1 };
    render(<VoteChart distribution={distribution} totalVotes={3} />);

    expect(screen.getByText('Vote Distribution')).toBeInTheDocument();
  });

  it('should display vote values in legend', () => {
    const distribution: Partial<Record<VoteValue, number>> = {
      '5': 2,
      '8': 1,
      '13': 3,
    };

    render(<VoteChart distribution={distribution} totalVotes={6} />);

    expect(screen.getAllByText('5').length).toBeGreaterThan(0);
    expect(screen.getAllByText('8').length).toBeGreaterThan(0);
    expect(screen.getAllByText('13').length).toBeGreaterThan(0);
  });

  it('should display vote counts in parentheses', () => {
    const distribution = { '5': 2, '8': 1 };
    render(<VoteChart distribution={distribution} totalVotes={3} />);

    expect(screen.getByText('(2)')).toBeInTheDocument();
    expect(screen.getByText('(1)')).toBeInTheDocument();
  });

  it('should handle special cards', () => {
    const distribution = { '5': 2, '?': 1, '☕': 1 };
    render(<VoteChart distribution={distribution} totalVotes={4} />);

    expect(screen.getAllByText('?').length).toBeGreaterThan(0);
    expect(screen.getAllByText('☕').length).toBeGreaterThan(0);
  });

  it('should sort numeric values correctly', () => {
    const distribution = { '13': 1, '5': 1, '8': 1, '3': 1 };
    const { container } = render(<VoteChart distribution={distribution} totalVotes={4} />);

    const legendItems = container.querySelectorAll('.font-mono.text-sm.font-bold');
    const values = Array.from(legendItems).map((item) => item.textContent);

    expect(values).toEqual(['3', '5', '8', '13']);
  });

  it('should sort numbers and special cards correctly', () => {
    const distribution = { '13': 1, '5': 1, '8': 1, '3': 1, '?': 1, '☕': 1 };
    const { container } = render(<VoteChart distribution={distribution} totalVotes={6} />);

    const legendItems = container.querySelectorAll('.font-mono.text-sm.font-bold');
    const values = Array.from(legendItems).map((item) => item.textContent);

    // Numbers should be sorted numerically
    const numericValues = values.filter((v) => !isNaN(parseFloat(v)));
    expect(numericValues).toEqual(['3', '5', '8', '13']);

    // Special cards should be present
    expect(values).toContain('?');
    expect(values).toContain('☕');
  });

  it('should render ResponsiveContainer for chart', () => {
    const distribution = { '5': 2, '8': 1 };
    const { container } = render(<VoteChart distribution={distribution} totalVotes={3} />);

    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeInTheDocument();
  });

  it('should display legend items with color indicators', () => {
    const distribution = { '5': 1 };
    const { container } = render(<VoteChart distribution={distribution} totalVotes={1} />);

    const colorIndicator = container.querySelector('.h-4.w-4.flex-shrink-0.rounded');
    expect(colorIndicator).toBeInTheDocument();
  });
});
