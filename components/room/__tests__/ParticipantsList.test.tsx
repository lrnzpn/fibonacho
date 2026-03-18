import { render, screen } from '@testing-library/react';
import ParticipantsList from '../ParticipantsList';
import { RoomProvider } from '@/contexts/RoomContext';
import { Participant, Room, Vote } from '@/types';
import { Timestamp } from 'firebase/firestore';
import {
  subscribeToRoom,
  subscribeToParticipants,
  subscribeToVotes,
  subscribeToReactions,
} from '@/lib/firebase/firestore';

jest.mock('@/lib/firebase/firestore');

const mockSubscribeToRoom = subscribeToRoom as jest.MockedFunction<typeof subscribeToRoom>;
const mockSubscribeToParticipants = subscribeToParticipants as jest.MockedFunction<
  typeof subscribeToParticipants
>;
const mockSubscribeToVotes = subscribeToVotes as jest.MockedFunction<typeof subscribeToVotes>;
const mockSubscribeToReactions = subscribeToReactions as jest.MockedFunction<
  typeof subscribeToReactions
>;

describe('ParticipantsList', () => {
  const mockRoom: Room = {
    roomId: 'test-room',
    createdAt: Timestamp.fromMillis(Date.now()),
    lastActivity: Timestamp.fromMillis(Date.now()),
    state: 'voting',
    currentRound: 1,
    moderatorId: 'user1',
  };

  const mockParticipants: Participant[] = [
    {
      uid: 'user1',
      displayName: 'Alice',
      role: 'moderator',
      isOnline: true,
      joinedAt: Timestamp.fromMillis(Date.now()),
      lastSeen: Timestamp.fromMillis(Date.now()),
    },
    {
      uid: 'user2',
      displayName: 'Bob',
      role: 'voter',
      isOnline: true,
      joinedAt: Timestamp.fromMillis(Date.now()),
      lastSeen: Timestamp.fromMillis(Date.now()),
    },
    {
      uid: 'user3',
      displayName: 'Charlie',
      role: 'spectator',
      isOnline: false,
      joinedAt: Timestamp.fromMillis(Date.now()),
      lastSeen: Timestamp.fromMillis(Date.now()),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockSubscribeToRoom.mockImplementation((roomId, callback) => {
      callback(mockRoom);
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

  it('should render participants list title with count', () => {
    mockSubscribeToParticipants.mockImplementation((roomId, callback) => {
      callback(mockParticipants);
      return () => {};
    });

    render(
      <RoomProvider roomId="test-room">
        <ParticipantsList />
      </RoomProvider>
    );

    expect(screen.getByText(/Participants \(3\)/)).toBeInTheDocument();
  });

  it('should render all participants', () => {
    mockSubscribeToParticipants.mockImplementation((roomId, callback) => {
      callback(mockParticipants);
      return () => {};
    });

    render(
      <RoomProvider roomId="test-room">
        <ParticipantsList />
      </RoomProvider>
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('should display moderator badge', () => {
    mockSubscribeToParticipants.mockImplementation((roomId, callback) => {
      callback(mockParticipants);
      return () => {};
    });

    render(
      <RoomProvider roomId="test-room">
        <ParticipantsList />
      </RoomProvider>
    );

    expect(screen.getByText('Moderator')).toBeInTheDocument();
  });

  it('should show waiting status for voters who have not voted', () => {
    mockSubscribeToParticipants.mockImplementation((roomId, callback) => {
      callback(mockParticipants);
      return () => {};
    });

    render(
      <RoomProvider roomId="test-room">
        <ParticipantsList />
      </RoomProvider>
    );

    expect(screen.getByText('Waiting...')).toBeInTheDocument();
  });

  it('should show voted status when participant has voted', () => {
    const mockVotes: Vote[] = [
      {
        voteId: 'vote1',
        userId: 'user2',
        roomId: 'test-room',
        roundId: 'round1',
        value: 5,
        createdAt: Timestamp.fromMillis(Date.now()),
        updatedAt: Timestamp.fromMillis(Date.now()),
      },
    ];

    mockSubscribeToParticipants.mockImplementation((roomId, callback) => {
      callback(mockParticipants);
      return () => {};
    });
    mockSubscribeToVotes.mockImplementation((roomId, callback) => {
      callback(mockVotes);
      return () => {};
    });

    render(
      <RoomProvider roomId="test-room">
        <ParticipantsList />
      </RoomProvider>
    );

    expect(screen.getByText('✓ Voted')).toBeInTheDocument();
  });

  it('should render empty state when no participants', () => {
    mockSubscribeToParticipants.mockImplementation((roomId, callback) => {
      callback([]);
      return () => {};
    });

    render(
      <RoomProvider roomId="test-room">
        <ParticipantsList />
      </RoomProvider>
    );

    expect(screen.getByText(/No participants yet/)).toBeInTheDocument();
  });

  it('should display participant avatars with first letter', () => {
    mockSubscribeToParticipants.mockImplementation((roomId, callback) => {
      callback(mockParticipants);
      return () => {};
    });

    render(
      <RoomProvider roomId="test-room">
        <ParticipantsList />
      </RoomProvider>
    );

    expect(screen.getByText('A')).toBeInTheDocument(); // Alice
    expect(screen.getByText('B')).toBeInTheDocument(); // Bob
    expect(screen.getByText('C')).toBeInTheDocument(); // Charlie
  });
});
