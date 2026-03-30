import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TopicEditor from '../TopicEditor';
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

describe('TopicEditor', () => {
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
    currentTopic: 'Test story to estimate',
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

  it('should render Current Topic label', () => {
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
          <TopicEditor />
        </RoomProvider>
      </AuthProvider>
    );

    expect(screen.getByText('Current Topic')).toBeInTheDocument();
  });

  it('should display current topic', () => {
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
          <TopicEditor />
        </RoomProvider>
      </AuthProvider>
    );

    expect(screen.getByText('Test story to estimate')).toBeInTheDocument();
  });

  it('should display "No topic set" when topic is not defined', () => {
    const roomWithoutTopic = { ...mockRoom, currentTopic: undefined };
    mockSubscribeToRoom.mockImplementation((roomId, callback) => {
      callback(roomWithoutTopic);
      return () => {};
    });
    mockSubscribeToParticipants.mockImplementation((roomId, callback) => {
      callback([mockModerator]);
      return () => {};
    });

    render(
      <AuthProvider>
        <RoomProvider roomId="test-room">
          <TopicEditor />
        </RoomProvider>
      </AuthProvider>
    );

    expect(screen.getByText('No topic set')).toBeInTheDocument();
  });

  it('should show edit button for moderator', () => {
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
          <TopicEditor />
        </RoomProvider>
      </AuthProvider>
    );

    expect(screen.getByTitle('Edit topic')).toBeInTheDocument();
  });

  it('should not show edit button for non-moderator', () => {
    const nonModeratorParticipant = { ...mockModerator, role: 'voter' as const };
    const roomWithDifferentModerator = { ...mockRoom, moderatorId: 'otherUser' };

    mockSubscribeToRoom.mockImplementation((roomId, callback) => {
      callback(roomWithDifferentModerator);
      return () => {};
    });
    mockSubscribeToParticipants.mockImplementation((roomId, callback) => {
      callback([nonModeratorParticipant]);
      return () => {};
    });

    render(
      <AuthProvider>
        <RoomProvider roomId="test-room">
          <TopicEditor />
        </RoomProvider>
      </AuthProvider>
    );

    expect(screen.queryByTitle('Edit topic')).not.toBeInTheDocument();
  });

  it('should show textarea when edit button is clicked', () => {
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
          <TopicEditor />
        </RoomProvider>
      </AuthProvider>
    );

    const editButton = screen.getByTitle('Edit topic');
    fireEvent.click(editButton);

    expect(
      screen.getByPlaceholderText('Enter the story or task to estimate...')
    ).toBeInTheDocument();
  });

  it('should populate textarea with current topic when editing', () => {
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
          <TopicEditor />
        </RoomProvider>
      </AuthProvider>
    );

    const editButton = screen.getByTitle('Edit topic');
    fireEvent.click(editButton);

    const textarea = screen.getByPlaceholderText(
      'Enter the story or task to estimate...'
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe('Test story to estimate');
  });

  it('should call updateRoom when save button is clicked', async () => {
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
          <TopicEditor />
        </RoomProvider>
      </AuthProvider>
    );

    const editButton = screen.getByTitle('Edit topic');
    fireEvent.click(editButton);

    const textarea = screen.getByPlaceholderText('Enter the story or task to estimate...');
    fireEvent.change(textarea, { target: { value: 'New topic' } });

    const saveButton = screen.getByTitle('Save topic');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateRoom).toHaveBeenCalledWith('test-room', { currentTopic: 'New topic' });
    });
  });

  it('should not save empty topic', async () => {
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
          <TopicEditor />
        </RoomProvider>
      </AuthProvider>
    );

    const editButton = screen.getByTitle('Edit topic');
    fireEvent.click(editButton);

    const textarea = screen.getByPlaceholderText('Enter the story or task to estimate...');
    fireEvent.change(textarea, { target: { value: '   ' } });

    const saveButton = screen.getByTitle('Save topic');
    expect(saveButton).toBeDisabled();
  });

  it('should cancel editing when cancel button is clicked', () => {
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
          <TopicEditor />
        </RoomProvider>
      </AuthProvider>
    );

    const editButton = screen.getByTitle('Edit topic');
    fireEvent.click(editButton);

    const cancelButton = screen.getByTitle('Cancel');
    fireEvent.click(cancelButton);

    expect(
      screen.queryByPlaceholderText('Enter the story or task to estimate...')
    ).not.toBeInTheDocument();
    expect(screen.getByText('Test story to estimate')).toBeInTheDocument();
  });

  it('should trim whitespace from topic before saving', async () => {
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
          <TopicEditor />
        </RoomProvider>
      </AuthProvider>
    );

    const editButton = screen.getByTitle('Edit topic');
    fireEvent.click(editButton);

    const textarea = screen.getByPlaceholderText('Enter the story or task to estimate...');
    fireEvent.change(textarea, { target: { value: '  Trimmed topic  ' } });

    const saveButton = screen.getByTitle('Save topic');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateRoom).toHaveBeenCalledWith('test-room', { currentTopic: 'Trimmed topic' });
    });
  });
});
