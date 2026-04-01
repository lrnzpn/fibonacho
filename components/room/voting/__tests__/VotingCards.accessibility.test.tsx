import { render, screen } from '@testing-library/react';
import VotingCards from '../VotingCards';
import { RoomContext } from '@/contexts/RoomContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Room, Participant, Vote } from '@/types';
import { Timestamp } from 'firebase/firestore';

jest.mock('@/lib/firebase/firestore');
jest.mock('@/lib/firebase/config', () => ({
  app: {},
  auth: {},
  db: {},
}));

jest.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    user: { uid: 'user1', displayName: 'Test User', email: 'test@example.com' },
    loading: false,
  }),
}));

describe('VotingCards Accessibility', () => {
  const mockRoom: Room = {
    roomId: 'test-room',
    createdAt: Timestamp.fromMillis(Date.now()),
    lastActivity: Timestamp.fromMillis(Date.now()),
    state: 'voting',
    currentRound: 1,
    moderatorId: 'user1',
  };

  const mockParticipant: Participant = {
    uid: 'user1',
    displayName: 'Test User',
    role: 'voter',
    isOnline: true,
    joinedAt: Timestamp.fromMillis(Date.now()),
    lastSeen: Timestamp.fromMillis(Date.now()),
  };

  const mockContextValue = {
    room: mockRoom,
    participants: [mockParticipant],
    votes: [] as Vote[],
    reactions: [],
    loading: false,
    error: null,
  };

  const renderWithContext = (contextValue = mockContextValue) => {
    return render(
      <AuthProvider>
        <RoomContext.Provider value={contextValue}>
          <VotingCards />
        </RoomContext.Provider>
      </AuthProvider>
    );
  };

  describe('ARIA Labels and Roles', () => {
    it('should have proper heading with id', () => {
      renderWithContext();
      const heading = screen.getByRole('heading', { name: /select your estimate/i });
      expect(heading).toHaveAttribute('id', 'voting-cards-heading');
    });

    it('should have group role on cards container', () => {
      renderWithContext();
      const group = screen.getByRole('group', { name: /select your estimate/i });
      expect(group).toBeInTheDocument();
    });

    it('should have aria-labelledby on group', () => {
      renderWithContext();
      const group = screen.getByRole('group');
      expect(group).toHaveAttribute('aria-labelledby', 'voting-cards-heading');
    });

    it('should have descriptive aria-label on number cards', () => {
      renderWithContext();
      const card5 = screen.getByRole('button', { name: 'Vote 5 story points' });
      expect(card5).toBeInTheDocument();
    });

    it('should have descriptive aria-label on question mark card', () => {
      renderWithContext();
      const questionCard = screen.getByRole('button', {
        name: /unknown or need more information/i,
      });
      expect(questionCard).toBeInTheDocument();
    });

    it('should have descriptive aria-label on coffee card', () => {
      renderWithContext();
      const coffeeCard = screen.getByRole('button', { name: /coffee break needed/i });
      expect(coffeeCard).toBeInTheDocument();
    });

    it('should have aria-pressed on selected card', () => {
      const now = Timestamp.fromMillis(Date.now());
      const mockVote: Vote = {
        voteId: 'vote1',
        userId: 'user1',
        roomId: 'test-room',
        roundId: 'round-1',
        value: 5,
        createdAt: now,
        updatedAt: now,
      };

      const contextWithVote = {
        ...mockContextValue,
        votes: [mockVote],
      };

      renderWithContext(contextWithVote);
      const card5 = screen.getByRole('button', { name: 'Vote 5 story points' });
      expect(card5).toHaveAttribute('aria-pressed', 'true');
    });

    it('should have aria-pressed false on unselected cards', () => {
      renderWithContext();
      const card5 = screen.getByRole('button', { name: 'Vote 5 story points' });
      expect(card5).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have focus ring classes on all cards', () => {
      renderWithContext();
      const votingButtons = screen
        .getAllByRole('button')
        .filter(
          (btn) =>
            btn.getAttribute('aria-label')?.includes('Vote') ||
            btn.getAttribute('aria-label')?.includes('story points') ||
            btn.getAttribute('aria-label')?.includes('Unknown') ||
            btn.getAttribute('aria-label')?.includes('Coffee')
        );
      votingButtons.forEach((button) => {
        expect(button.className).toContain('focus:outline-none');
        expect(button.className).toContain('focus:ring-2');
        expect(button.className).toContain('focus:ring-[var(--accent-primary)]');
      });
    });

    it('should be keyboard accessible', () => {
      renderWithContext();
      const card5 = screen.getByRole('button', { name: 'Vote 5 story points' });
      expect(card5).not.toBeDisabled();
      expect(card5.tabIndex).not.toBe(-1);
    });
  });

  describe('Screen Reader Support', () => {
    it('should announce vote confirmation with aria-live', () => {
      const now = Timestamp.fromMillis(Date.now());
      const mockVote: Vote = {
        voteId: 'vote1',
        userId: 'user1',
        roomId: 'test-room',
        roundId: 'round-1',
        value: 5,
        createdAt: now,
        updatedAt: now,
      };

      const contextWithVote = {
        ...mockContextValue,
        votes: [mockVote],
      };

      renderWithContext(contextWithVote);
      const confirmation = screen.getByRole('status');
      expect(confirmation).toHaveAttribute('aria-live', 'polite');
    });

    it('should hide checkmark icon from screen readers', () => {
      const now = Timestamp.fromMillis(Date.now());
      const mockVote: Vote = {
        voteId: 'vote1',
        userId: 'user1',
        roomId: 'test-room',
        roundId: 'round-1',
        value: 5,
        createdAt: now,
        updatedAt: now,
      };

      const contextWithVote = {
        ...mockContextValue,
        votes: [mockVote],
      };

      renderWithContext(contextWithVote);
      const checkmarkText = screen.getByText('✓');
      expect(checkmarkText).toBeInTheDocument();
      expect(checkmarkText).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have role="status" on spectator message', () => {
      const spectatorParticipant = { ...mockParticipant, role: 'spectator' as const };
      const contextWithSpectator = {
        ...mockContextValue,
        participants: [spectatorParticipant],
      };

      renderWithContext(contextWithSpectator);
      const status = screen.getByRole('status');
      expect(status).toHaveTextContent(/you are spectating/i);
    });

    it('should have role="status" and aria-live on revealed state', () => {
      const revealedRoom = { ...mockRoom, state: 'revealed' as const };
      const contextWithRevealed = {
        ...mockContextValue,
        room: revealedRoom,
      };

      renderWithContext(contextWithRevealed);
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');
      expect(status).toHaveTextContent(/votes have been revealed/i);
    });
  });

  describe('Visual Indicators', () => {
    it('should have visual indication of selected card', () => {
      const now = Timestamp.fromMillis(Date.now());
      const mockVote: Vote = {
        voteId: 'vote1',
        userId: 'user1',
        roomId: 'test-room',
        roundId: 'round-1',
        value: 5,
        createdAt: now,
        updatedAt: now,
      };

      const contextWithVote = {
        ...mockContextValue,
        votes: [mockVote],
      };

      renderWithContext(contextWithVote);
      const card5 = screen.getByRole('button', { name: 'Vote 5 story points' });
      expect(card5.className).toContain('bg-[var(--accent-primary)]');
      expect(card5.className).toContain('scale-110');
    });

    it('should show vote confirmation text', () => {
      const now = Timestamp.fromMillis(Date.now());
      const mockVote: Vote = {
        voteId: 'vote1',
        userId: 'user1',
        roomId: 'test-room',
        roundId: 'round-1',
        value: 5,
        createdAt: now,
        updatedAt: now,
      };

      const contextWithVote = {
        ...mockContextValue,
        votes: [mockVote],
      };

      renderWithContext(contextWithVote);
      expect(screen.getByText(/your vote:/i)).toBeInTheDocument();
      const voteValue = screen.getByText(/your vote:/i).parentElement?.querySelector('.font-mono');
      expect(voteValue).toHaveTextContent('5');
    });
  });

  describe('Interactive States', () => {
    it('should have hover states on cards', () => {
      renderWithContext();
      const card5 = screen.getByRole('button', { name: 'Vote 5 story points' });
      expect(card5.className).toContain('hover:scale-110');
      expect(card5.className).toContain('hover:bg-[var(--accent-primary)]');
    });

    it('should maintain accessibility during state changes', () => {
      const { rerender } = renderWithContext();

      // Initial state
      let card5 = screen.getByRole('button', { name: 'Vote 5 story points' });
      expect(card5).toHaveAttribute('aria-pressed', 'false');

      // After voting
      const now = Timestamp.fromMillis(Date.now());
      const mockVote: Vote = {
        voteId: 'vote1',
        userId: 'user1',
        roomId: 'test-room',
        roundId: 'round-1',
        value: 5,
        createdAt: now,
        updatedAt: now,
      };

      const contextWithVote = {
        ...mockContextValue,
        votes: [mockVote],
      };

      rerender(
        <AuthProvider>
          <RoomContext.Provider value={contextWithVote}>
            <VotingCards />
          </RoomContext.Provider>
        </AuthProvider>
      );

      card5 = screen.getByRole('button', { name: 'Vote 5 story points' });
      expect(card5).toHaveAttribute('aria-pressed', 'true');
    });
  });
});
