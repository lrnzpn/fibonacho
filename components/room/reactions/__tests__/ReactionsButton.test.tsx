import { render, screen, fireEvent } from '@testing-library/react';
import ReactionsButton from '../ReactionsButton';
import { ReactionType } from '@/types';

describe('ReactionsButton', () => {
  const mockOnReaction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the main button', () => {
    render(<ReactionsButton onReaction={mockOnReaction} />);

    const button = screen.getByTitle('Send reaction');
    expect(button).toBeInTheDocument();
  });

  it('should not show reactions panel initially', () => {
    render(<ReactionsButton onReaction={mockOnReaction} />);

    const reactionButtons = screen.queryAllByTitle(/Send 🎉|Send 👍|Send 🤔|Send 🔥|Send ☕/);
    expect(reactionButtons.length).toBe(0);
  });

  it('should show reactions panel when button is clicked', () => {
    render(<ReactionsButton onReaction={mockOnReaction} />);

    const button = screen.getByTitle('Send reaction');
    fireEvent.click(button);

    expect(screen.getByTitle('Send 🎉')).toBeInTheDocument();
    expect(screen.getByTitle('Send 👍')).toBeInTheDocument();
    expect(screen.getByTitle('Send 🤔')).toBeInTheDocument();
    expect(screen.getByTitle('Send 🔥')).toBeInTheDocument();
    expect(screen.getByTitle('Send ☕')).toBeInTheDocument();
  });

  it('should hide reactions panel when button is clicked again', () => {
    render(<ReactionsButton onReaction={mockOnReaction} />);

    const button = screen.getByTitle('Send reaction');
    fireEvent.click(button);
    fireEvent.click(button);

    const reactionButtons = screen.queryAllByTitle(/Send 🎉|Send 👍|Send 🤔|Send 🔥|Send ☕/);
    expect(reactionButtons.length).toBe(0);
  });

  it('should call onReaction with correct reaction when reaction button is clicked', () => {
    render(<ReactionsButton onReaction={mockOnReaction} />);

    const button = screen.getByTitle('Send reaction');
    fireEvent.click(button);

    const partyReaction = screen.getByTitle('Send 🎉');
    fireEvent.click(partyReaction);

    expect(mockOnReaction).toHaveBeenCalledWith('🎉');
    expect(mockOnReaction).toHaveBeenCalledTimes(1);
  });

  it('should call onReaction for each reaction type', () => {
    const reactions: ReactionType[] = ['🎉', '👍', '🤔', '🔥', '☕'];

    reactions.forEach((reaction) => {
      mockOnReaction.mockClear();
      const { unmount } = render(<ReactionsButton onReaction={mockOnReaction} />);

      const button = screen.getByTitle('Send reaction');
      fireEvent.click(button);

      const reactionButton = screen.getByTitle(`Send ${reaction}`);
      fireEvent.click(reactionButton);

      expect(mockOnReaction).toHaveBeenCalledWith(reaction);
      unmount();
    });
  });

  it('should toggle button style when opened', () => {
    render(<ReactionsButton onReaction={mockOnReaction} />);

    const button = screen.getByTitle('Send reaction');
    expect(button).toHaveClass('bg-[var(--accent-primary)]');

    fireEvent.click(button);
    expect(button).toHaveClass('bg-[var(--accent-secondary)]');

    fireEvent.click(button);
    expect(button).toHaveClass('bg-[var(--accent-primary)]');
  });

  it('should render all 5 reaction options', () => {
    render(<ReactionsButton onReaction={mockOnReaction} />);

    const button = screen.getByTitle('Send reaction');
    fireEvent.click(button);

    const reactionButtons = screen.getAllByTitle(/Send/);
    expect(reactionButtons.length).toBe(6); // 5 reactions + 1 main button
  });

  it('should be positioned fixed at bottom center', () => {
    const { container } = render(<ReactionsButton onReaction={mockOnReaction} />);

    const wrapper = container.querySelector('.fixed.left-1\\/2');
    expect(wrapper).toBeInTheDocument();
  });
});
