import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VotingTimer from '../VotingTimer';
import { RoomProvider } from '@/contexts/RoomContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Room, Participant } from '@/types';
import { Timestamp } from 'firebase/firestore';
import {
  subscribeToRoom,
  subscribeToParticipants,
  subscribeToVotes,
  subscribeToReactions,
  updateRoom,
} from '@/lib/firebase/firestore';

jest.mock('@/lib/firebase/firestore');

jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  deleteField: jest.fn(() => 'DELETE_FIELD_SENTINEL'),
}));

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

const mockSubscribeToRoom = subscribeToRoom as jest.MockedFunction<typeof subscribeToRoom>;
const mockSubscribeToParticipants = subscribeToParticipants as jest.MockedFunction<
  typeof subscribeToParticipants
>;
const mockSubscribeToVotes = subscribeToVotes as jest.MockedFunction<typeof subscribeToVotes>;
const mockSubscribeToReactions = subscribeToReactions as jest.MockedFunction<
  typeof subscribeToReactions
>;
const mockUpdateRoom = updateRoom as jest.MockedFunction<typeof updateRoom>;

describe('VotingTimer', () => {
  const mockModerator: Participant = {
    uid: 'user1',
    displayName: 'Test User',
    role: 'moderator',
    isOnline: true,
    joinedAt: Timestamp.fromMillis(Date.now()),
    lastSeen: Timestamp.fromMillis(Date.now()),
  };

  const mockRoom: Room = {
    roomId: 'test-room',
    createdAt: Timestamp.fromMillis(Date.now()),
    lastActivity: Timestamp.fromMillis(Date.now()),
    state: 'voting',
    currentRound: 1,
    moderatorId: 'user1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSubscribeToVotes.mockImplementation((roomId, callback) => {
      callback([]);
      return () => {};
    });
    mockSubscribeToReactions.mockImplementation((roomId, callback) => {
      callback([]);
      return () => {};
    });
    mockUpdateRoom.mockResolvedValue();
  });

  it('should render Timer label', () => {
    mockSubscribeToRoom.mockImplementation((roomId, callback) => {
      callback(mockRoom);
      return () => {};
    });
    mockSubscribeToParticipants.mockImplementation((roomId, callback) => {
      callback([mockModerator]);
      return () => {};
    });

    render(
      <AuthProvider>
        <RoomProvider roomId="test-room">
          <VotingTimer />
        </RoomProvider>
      </AuthProvider>
    );

    expect(screen.getByText('Timer')).toBeInTheDocument();
  });

  it('should show "Not started" when timer is not active', () => {
    const roomWithoutTimer = { ...mockRoom, timerEndsAt: undefined };
    mockSubscribeToRoom.mockImplementation((roomId, callback) => {
      callback(roomWithoutTimer);
      return () => {};
    });

    render(
      <AuthProvider>
        <RoomProvider roomId="test-room">
          <VotingTimer />
        </RoomProvider>
      </AuthProvider>
    );

    expect(screen.getByText('Not started')).toBeInTheDocument();
  });

  it('should show Set Timer button for moderator', () => {
    const roomWithoutTimer = { ...mockRoom, timerEndsAt: undefined };
    mockSubscribeToRoom.mockImplementation((roomId, callback) => {
      callback(roomWithoutTimer);
      return () => {};
    });

    render(
      <AuthProvider>
        <RoomProvider roomId="test-room">
          <VotingTimer />
        </RoomProvider>
      </AuthProvider>
    );

    expect(screen.getByText('Set Timer')).toBeInTheDocument();
  });

  it('should not show Set Timer button for non-moderator', () => {
    const roomWithoutTimer = { ...mockRoom, timerEndsAt: undefined, moderatorId: 'otherUser' };
    const nonModeratorParticipant = { ...mockModerator, role: 'voter' as const };

    mockSubscribeToRoom.mockImplementation((roomId, callback) => {
      callback(roomWithoutTimer);
      return () => {};
    });
    mockSubscribeToParticipants.mockImplementation((roomId, callback) => {
      callback([nonModeratorParticipant]);
      return () => {};
    });

    render(
      <AuthProvider>
        <RoomProvider roomId="test-room">
          <VotingTimer />
        </RoomProvider>
      </AuthProvider>
    );

    expect(screen.queryByText('Set Timer')).not.toBeInTheDocument();
  });

  it('should show input field when Set Timer is clicked', () => {
    const roomWithoutTimer = { ...mockRoom, timerEndsAt: undefined };
    mockSubscribeToRoom.mockImplementation((roomId, callback) => {
      callback(roomWithoutTimer);
      return () => {};
    });
    mockSubscribeToParticipants.mockImplementation((roomId, callback) => {
      callback([mockModerator]);
      return () => {};
    });

    render(
      <AuthProvider>
        <RoomProvider roomId="test-room">
          <VotingTimer />
        </RoomProvider>
      </AuthProvider>
    );

    const setTimerButton = screen.getByText('Set Timer');
    fireEvent.click(setTimerButton);

    expect(screen.getByPlaceholderText('Sec')).toBeInTheDocument();
  });

  it('should display active timer countdown', () => {
    const futureTime = Timestamp.fromMillis(Date.now() + 60000);
    const roomWithTimer = {
      ...mockRoom,
      timerEndsAt: futureTime,
      timerDuration: 60,
    };

    mockSubscribeToRoom.mockImplementation((roomId, callback) => {
      callback(roomWithTimer);
      return () => {};
    });

    render(
      <AuthProvider>
        <RoomProvider roomId="test-room">
          <VotingTimer />
        </RoomProvider>
      </AuthProvider>
    );

    expect(screen.getByText(/[01]:([0-5]\d)/)).toBeInTheDocument();
  });

  it('should show stop and reset buttons when timer is active', () => {
    const futureTime = Timestamp.fromMillis(Date.now() + 60000);
    const roomWithTimer = {
      ...mockRoom,
      timerEndsAt: futureTime,
      timerDuration: 60,
    };

    mockSubscribeToRoom.mockImplementation((roomId, callback) => {
      callback(roomWithTimer);
      return () => {};
    });

    render(
      <AuthProvider>
        <RoomProvider roomId="test-room">
          <VotingTimer />
        </RoomProvider>
      </AuthProvider>
    );

    expect(screen.getByTitle('Stop timer')).toBeInTheDocument();
    expect(screen.getByTitle('Reset timer')).toBeInTheDocument();
  });

  it('should call updateRoom when stop button is clicked', async () => {
    const futureTime = Timestamp.fromMillis(Date.now() + 60000);
    const roomWithTimer = {
      ...mockRoom,
      timerEndsAt: futureTime,
      timerDuration: 60,
    };

    mockSubscribeToRoom.mockImplementation((roomId, callback) => {
      callback(roomWithTimer);
      return () => {};
    });
    mockSubscribeToParticipants.mockImplementation((roomId, callback) => {
      callback([mockModerator]);
      return () => {};
    });

    render(
      <AuthProvider>
        <RoomProvider roomId="test-room">
          <VotingTimer />
        </RoomProvider>
      </AuthProvider>
    );

    const stopButton = screen.getByTitle('Stop timer');
    fireEvent.click(stopButton);

    await waitFor(() => {
      expect(mockUpdateRoom).toHaveBeenCalledWith('test-room', {
        timerEndsAt: 'DELETE_FIELD_SENTINEL',
        timerDuration: 'DELETE_FIELD_SENTINEL',
      });
    });
  });

  it('should format time correctly', () => {
    const futureTime = Timestamp.fromMillis(Date.now() + 125000);
    const roomWithTimer = {
      ...mockRoom,
      timerEndsAt: futureTime,
      timerDuration: 125,
    };

    mockSubscribeToRoom.mockImplementation((roomId, callback) => {
      callback(roomWithTimer);
      return () => {};
    });

    render(
      <AuthProvider>
        <RoomProvider roomId="test-room">
          <VotingTimer />
        </RoomProvider>
      </AuthProvider>
    );

    expect(screen.getByText(/2:0\d/)).toBeInTheDocument();
  });
});
