import { render, screen, waitFor, act } from '@testing-library/react';
import ReactionOverlay from '../ReactionOverlay';
import { Reaction } from '@/types';
import { Timestamp } from 'firebase/firestore';

describe('ReactionOverlay', () => {
  const mockReaction: Reaction = {
    userId: 'user1',
    type: '🎉',
    timestamp: Timestamp.fromMillis(Date.now()),
    x: 50,
    y: 50,
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('should render without reactions', () => {
    const { container } = render(<ReactionOverlay reactions={[]} />);
    const overlay = container.querySelector('.fixed.inset-0');
    expect(overlay).toBeInTheDocument();
  });

  it('should display reaction when added', async () => {
    const { rerender } = render(<ReactionOverlay reactions={[]} />);

    rerender(<ReactionOverlay reactions={[mockReaction]} />);

    await waitFor(() => {
      expect(screen.getByText('🎉')).toBeInTheDocument();
    });
  });

  it('should remove reaction after 3 seconds', async () => {
    const { rerender } = render(<ReactionOverlay reactions={[]} />);

    rerender(<ReactionOverlay reactions={[mockReaction]} />);

    await waitFor(() => {
      expect(screen.getByText('🎉')).toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(screen.queryByText('🎉')).not.toBeInTheDocument();
    });
  });

  it('should handle multiple reactions', async () => {
    const reaction1: Reaction = {
      ...mockReaction,
      type: '🎉',
      timestamp: Timestamp.fromMillis(Date.now()),
    };

    const reaction2: Reaction = {
      ...mockReaction,
      userId: 'user2',
      type: '👍',
      timestamp: Timestamp.fromMillis(Date.now() + 1000),
    };

    const { rerender } = render(<ReactionOverlay reactions={[]} />);

    rerender(<ReactionOverlay reactions={[reaction1]} />);
    await waitFor(() => {
      expect(screen.getByText('🎉')).toBeInTheDocument();
    });

    rerender(<ReactionOverlay reactions={[reaction2, reaction1]} />);
    await waitFor(() => {
      expect(screen.getByText('👍')).toBeInTheDocument();
    });
  });

  it('should position reaction at specified coordinates', async () => {
    const { rerender, container } = render(<ReactionOverlay reactions={[]} />);

    rerender(<ReactionOverlay reactions={[mockReaction]} />);

    await waitFor(() => {
      const reactionElement = container.querySelector('.absolute.animate-bounce');
      expect(reactionElement).toHaveStyle({ left: '50%', top: '50%' });
    });
  });

  it('should use random x position if not specified', async () => {
    const reactionWithoutX: Reaction = {
      ...mockReaction,
      x: undefined,
    };

    const { rerender, container } = render(<ReactionOverlay reactions={[]} />);

    rerender(<ReactionOverlay reactions={[reactionWithoutX]} />);

    await waitFor(() => {
      const reactionElement = container.querySelector('.absolute.animate-bounce');
      expect(reactionElement).toBeInTheDocument();
    });
  });

  it('should not duplicate reactions with same userId and timestamp', async () => {
    const { rerender } = render(<ReactionOverlay reactions={[mockReaction]} />);

    await waitFor(() => {
      expect(screen.getByText('🎉')).toBeInTheDocument();
    });

    rerender(<ReactionOverlay reactions={[mockReaction, mockReaction]} />);

    const reactions = screen.getAllByText('🎉');
    expect(reactions.length).toBe(1);
  });

  it('should have pointer-events-none class', () => {
    const { container } = render(<ReactionOverlay reactions={[]} />);
    const overlay = container.querySelector('.pointer-events-none');
    expect(overlay).toBeInTheDocument();
  });

  it('should render with correct z-index', () => {
    const { container } = render(<ReactionOverlay reactions={[]} />);
    const overlay = container.querySelector('.z-40');
    expect(overlay).toBeInTheDocument();
  });
});
