import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RoomHeader from '../RoomHeader';
import { RoomProvider } from '@/contexts/RoomContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Room, Participant } from '@/types';
import { Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import {
  subscribeToRoom,
  subscribeToParticipants,
  subscribeToVotes,
  subscribeToReactions,
} from '@/lib/firebase/firestore';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    user: { uid: 'user1', displayName: 'Test User', email: 'test@example.com' },
    loading: false,
  }),
}));

jest.mock('@/lib/firebase/firestore');
jest.mock('@/lib/utils/room', () => ({
  copyToClipboard: jest.fn(),
  generateRoomId: jest.fn(() => 'NEWROOM1'),
}));

const mockSubscribeToRoom = subscribeToRoom as jest.MockedFunction<typeof subscribeToRoom>;
const mockSubscribeToParticipants = subscribeToParticipants as jest.MockedFunction<
  typeof subscribeToParticipants
>;
const mockSubscribeToVotes = subscribeToVotes as jest.MockedFunction<typeof subscribeToVotes>;
const mockSubscribeToReactions = subscribeToReactions as jest.MockedFunction<
  typeof subscribeToReactions
>;

describe('RoomHeader', () => {
  const mockPush = jest.fn();

  const mockRoom: Room = {
    roomId: 'TEST1234',
    createdAt: Timestamp.fromMillis(Date.now()),
    lastActivity: Timestamp.fromMillis(Date.now()),
    state: 'voting',
    currentRound: 1,
    moderatorId: 'user1',
  };

  const mockParticipants: Participant[] = [
    {
      uid: 'user1',
      displayName: 'Test User',
      role: 'moderator',
      isOnline: true,
      joinedAt: Timestamp.fromMillis(Date.now()),
      lastSeen: Timestamp.fromMillis(Date.now()),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    mockSubscribeToRoom.mockImplementation((roomId, callback) => {
      callback(mockRoom);
      return () => {};
    });
    mockSubscribeToParticipants.mockImplementation((roomId, callback) => {
      callback(mockParticipants);
      return () => {};
    });
    mockSubscribeToVotes.mockImplementation((roomId, callback) => {
      callback([]);
      return () => {};
    });
    mockSubscribeToReactions.mockImplementation((roomId, callback) => {
      callback([]);
      return () => {};
    });
  });

  it('should render room code', () => {
    render(
      <AuthProvider>
        <RoomProvider roomId="TEST1234">
          <RoomHeader roomId="TEST1234" />
        </RoomProvider>
      </AuthProvider>
    );

    expect(screen.getByText('TEST1234')).toBeInTheDocument();
  });

  it('should render Fibonacho logo', () => {
    render(
      <AuthProvider>
        <RoomProvider roomId="TEST1234">
          <RoomHeader roomId="TEST1234" />
        </RoomProvider>
      </AuthProvider>
    );

    expect(screen.getByText('Fibo')).toBeInTheDocument();
    expect(screen.getByText('nacho')).toBeInTheDocument();
  });

  it('should show copy button', () => {
    render(
      <AuthProvider>
        <RoomProvider roomId="TEST1234">
          <RoomHeader roomId="TEST1234" />
        </RoomProvider>
      </AuthProvider>
    );

    const copyButton = screen.getByTitle('Copy room code');
    expect(copyButton).toBeInTheDocument();
  });

  it('should show check icon after copying', async () => {
    const roomUtils = await import('@/lib/utils/room');
    const copyToClipboard = roomUtils.copyToClipboard as jest.MockedFunction<
      typeof roomUtils.copyToClipboard
    >;
    copyToClipboard.mockResolvedValue(true);

    render(
      <AuthProvider>
        <RoomProvider roomId="TEST1234">
          <RoomHeader roomId="TEST1234" />
        </RoomProvider>
      </AuthProvider>
    );

    const copyButton = screen.getByTitle('Copy room code');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(copyToClipboard).toHaveBeenCalledWith('TEST1234');
    });
  });

  it('should show New Room button for room owner', () => {
    render(
      <AuthProvider>
        <RoomProvider roomId="TEST1234">
          <RoomHeader roomId="TEST1234" />
        </RoomProvider>
      </AuthProvider>
    );

    const newRoomButton = screen.getByTitle('Create new room');
    expect(newRoomButton).toBeInTheDocument();
  });

  it('should navigate to new room when New Room button is clicked', async () => {
    render(
      <AuthProvider>
        <RoomProvider roomId="TEST1234">
          <RoomHeader roomId="TEST1234" />
        </RoomProvider>
      </AuthProvider>
    );

    const newRoomButton = screen.getByTitle('Create new room');
    fireEvent.click(newRoomButton);

    expect(mockPush).toHaveBeenCalledWith('/room/NEWROOM1');
  });

  it('should navigate to home when logo is clicked', () => {
    render(
      <AuthProvider>
        <RoomProvider roomId="TEST1234">
          <RoomHeader roomId="TEST1234" />
        </RoomProvider>
      </AuthProvider>
    );

    const homeButton = screen.getByTitle('Go to home');
    fireEvent.click(homeButton);

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('should not show New Room button for non-owner', () => {
    const nonOwnerRoom = { ...mockRoom, moderatorId: 'otherUser' };
    mockSubscribeToRoom.mockImplementation((roomId, callback) => {
      callback(nonOwnerRoom);
      return () => {};
    });

    render(
      <AuthProvider>
        <RoomProvider roomId="TEST1234">
          <RoomHeader roomId="TEST1234" />
        </RoomProvider>
      </AuthProvider>
    );

    const newRoomButton = screen.queryByTitle('Create new room');
    expect(newRoomButton).not.toBeInTheDocument();
  });
});
