import { render, screen } from '@testing-library/react';
import VoteChart from '../VoteChart';
import { VoteValue } from '@/types';

describe('VoteChart', () => {
  it('should render nothing when totalVotes is 0', () => {
    const { container } = render(<VoteChart distribution={{}} totalVotes={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render Vote Distribution title', () => {
    const distribution = { '5': 2, '8': 1 };
    render(<VoteChart distribution={distribution} totalVotes={3} />);

    expect(screen.getByText('Vote Distribution')).toBeInTheDocument();
  });

  it('should display total votes in center', () => {
    const distribution = { '5': 2, '8': 1 };
    render(<VoteChart distribution={distribution} totalVotes={3} />);

    expect(screen.getAllByText('Total').length).toBeGreaterThan(0);
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
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

  it('should display vote counts in legend', () => {
    const distribution = { '5': 2, '8': 1 };
    render(<VoteChart distribution={distribution} totalVotes={3} />);

    expect(screen.getAllByText('2 votes').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1 vote').length).toBeGreaterThan(0);
    expect(screen.getByText('2 votes')).toBeInTheDocument();
    expect(screen.getByText('1 vote')).toBeInTheDocument();
  });

  it('should display percentages in legend', () => {
    const distribution = { '5': 2, '8': 1 };
    render(<VoteChart distribution={distribution} totalVotes={3} />);

    expect(screen.getByText('66.7%')).toBeInTheDocument();
    expect(screen.getByText('33.3%')).toBeInTheDocument();
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

    const legendItems = container.querySelectorAll('.font-mono.text-lg');
    const values = Array.from(legendItems).map((item) => item.textContent);

    expect(values).toEqual(['3', '5', '8', '13']);
  });

  it('should place special cards at the end', () => {
    const distribution = { '?': 1, '5': 1, '☕': 1, '8': 1 };
    const { container } = render(<VoteChart distribution={distribution} totalVotes={4} />);

    const legendItems = container.querySelectorAll('.font-mono.text-lg');
    const values = Array.from(legendItems).map((item) => item.textContent);

    expect(values[0]).toBe('5');
    expect(values[1]).toBe('8');
    expect(values.slice(2)).toContain('?');
    expect(values.slice(2)).toContain('☕');
  });

  it('should render SVG pie chart', () => {
    const distribution = { '5': 2, '8': 1 };
    const { container } = render(<VoteChart distribution={distribution} totalVotes={3} />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 200 200');
  });

  it('should render pie slices as paths', () => {
    const distribution = { '5': 2, '8': 1 };
    const { container } = render(<VoteChart distribution={distribution} totalVotes={3} />);

    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
  });

  it('should display singular "vote" for count of 1', () => {
    const distribution = { '5': 1 };
    render(<VoteChart distribution={distribution} totalVotes={1} />);

    expect(screen.getByText('1 vote')).toBeInTheDocument();
  });

  it('should display plural "votes" for count greater than 1', () => {
    const distribution = { '5': 3 };
    render(<VoteChart distribution={distribution} totalVotes={3} />);

    expect(screen.getByText('3 votes')).toBeInTheDocument();
  });
});
