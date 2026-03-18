import { render, renderHook, waitFor } from '@testing-library/react';
import { RoomProvider, useRoom, RoomContext } from '../RoomContext';
import {
  subscribeToRoom,
  subscribeToParticipants,
  subscribeToVotes,
  subscribeToReactions,
} from '@/lib/firebase/firestore';
import { Room } from '@/types';
import { Timestamp } from 'firebase/firestore';
import { useContext } from 'react';

jest.mock('@/lib/firebase/firestore');

const mockSubscribeToRoom = subscribeToRoom as jest.MockedFunction<typeof subscribeToRoom>;
const mockSubscribeToParticipants = subscribeToParticipants as jest.MockedFunction<
  typeof subscribeToParticipants
>;
const mockSubscribeToVotes = subscribeToVotes as jest.MockedFunction<typeof subscribeToVotes>;
const mockSubscribeToReactions = subscribeToReactions as jest.MockedFunction<
  typeof subscribeToReactions
>;

describe('RoomContext', () => {
  const mockRoom: Room = {
    roomId: 'test-room',
    createdAt: Timestamp.fromMillis(Date.now()),
    lastActivity: Timestamp.fromMillis(Date.now()),
    state: 'waiting',
    currentRound: 1,
    moderatorId: 'user1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('RoomProvider', () => {
    it('should provide initial loading state', () => {
      mockSubscribeToRoom.mockReturnValue(() => {});
      mockSubscribeToParticipants.mockReturnValue(() => {});
      mockSubscribeToVotes.mockReturnValue(() => {});
      mockSubscribeToReactions.mockReturnValue(() => {});

      const TestComponent = () => {
        const context = useContext(RoomContext);
        return (
          <div>
            <span data-testid="loading">{context?.loading ? 'true' : 'false'}</span>
            <span data-testid="room">{context?.room ? 'exists' : 'null'}</span>
          </div>
        );
      };

      const { getByTestId } = render(
        <RoomProvider roomId="test-room">
          <TestComponent />
        </RoomProvider>
      );

      expect(getByTestId('loading').textContent).toBe('true');
      expect(getByTestId('room').textContent).toBe('null');
    });

    it('should update room data when subscription fires', async () => {
      let roomCallback: ((room: Room | null) => void) | null = null;

      mockSubscribeToRoom.mockImplementation((roomId, callback) => {
        roomCallback = callback;
        return () => {};
      });
      mockSubscribeToParticipants.mockReturnValue(() => {});
      mockSubscribeToVotes.mockReturnValue(() => {});
      mockSubscribeToReactions.mockReturnValue(() => {});

      const TestComponent = () => {
        const context = useContext(RoomContext);
        return (
          <div>
            <span data-testid="loading">{context?.loading ? 'true' : 'false'}</span>
            <span data-testid="room-id">{context?.room?.roomId || 'none'}</span>
          </div>
        );
      };

      const { getByTestId } = render(
        <RoomProvider roomId="test-room">
          <TestComponent />
        </RoomProvider>
      );

      await waitFor(() => {
        if (roomCallback) {
          roomCallback(mockRoom);
        }
        expect(getByTestId('loading').textContent).toBe('false');
        expect(getByTestId('room-id').textContent).toBe('test-room');
      });
    });

    it('should handle room not found error', async () => {
      let roomCallback: ((room: Room | null) => void) | null = null;

      mockSubscribeToRoom.mockImplementation((roomId, callback) => {
        roomCallback = callback;
        return () => {};
      });
      mockSubscribeToParticipants.mockReturnValue(() => {});
      mockSubscribeToVotes.mockReturnValue(() => {});
      mockSubscribeToReactions.mockReturnValue(() => {});

      const TestComponent = () => {
        const context = useContext(RoomContext);
        return (
          <div>
            <span data-testid="error">{context?.error || 'none'}</span>
          </div>
        );
      };

      const { getByTestId } = render(
        <RoomProvider roomId="test-room">
          <TestComponent />
        </RoomProvider>
      );

      await waitFor(() => {
        if (roomCallback) {
          roomCallback(null);
        }
        expect(getByTestId('error').textContent).toBe('Room not found');
      });
    });

    it('should cleanup subscriptions on unmount', () => {
      const unsubscribeRoom = jest.fn();
      const unsubscribeParticipants = jest.fn();
      const unsubscribeVotes = jest.fn();
      const unsubscribeReactions = jest.fn();

      mockSubscribeToRoom.mockReturnValue(unsubscribeRoom);
      mockSubscribeToParticipants.mockReturnValue(unsubscribeParticipants);
      mockSubscribeToVotes.mockReturnValue(unsubscribeVotes);
      mockSubscribeToReactions.mockReturnValue(unsubscribeReactions);

      const TestComponent = () => <div>Test</div>;

      const { unmount } = render(
        <RoomProvider roomId="test-room">
          <TestComponent />
        </RoomProvider>
      );

      unmount();

      expect(unsubscribeRoom).toHaveBeenCalledTimes(1);
      expect(unsubscribeParticipants).toHaveBeenCalledTimes(1);
      expect(unsubscribeVotes).toHaveBeenCalledTimes(1);
      expect(unsubscribeReactions).toHaveBeenCalledTimes(1);
    });
  });

  describe('useRoom hook', () => {
    it('should return initial loading state', () => {
      mockSubscribeToRoom.mockReturnValue(() => {});

      const { result } = renderHook(() => useRoom('test-room'));

      expect(result.current.loading).toBe(true);
      expect(result.current.room).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should update room data when subscription fires', async () => {
      let roomCallback: ((room: Room | null) => void) | null = null;

      mockSubscribeToRoom.mockImplementation((roomId, callback) => {
        roomCallback = callback;
        return () => {};
      });

      const { result } = renderHook(() => useRoom('test-room'));

      // Simulate room data arriving
      await waitFor(() => {
        if (roomCallback) {
          roomCallback(mockRoom);
        }
        expect(result.current.loading).toBe(false);
        expect(result.current.room).toEqual(mockRoom);
        expect(result.current.error).toBeNull();
      });
    });

    it('should handle room not found error', async () => {
      let roomCallback: ((room: Room | null) => void) | null = null;

      mockSubscribeToRoom.mockImplementation((roomId, callback) => {
        roomCallback = callback;
        return () => {};
      });

      const { result } = renderHook(() => useRoom('test-room'));

      await waitFor(() => {
        if (roomCallback) {
          roomCallback(null);
        }
        expect(result.current.loading).toBe(false);
        expect(result.current.room).toBeNull();
        expect(result.current.error).toBe('Room not found');
      });
    });

    it('should cleanup subscription on unmount', () => {
      const unsubscribe = jest.fn();
      mockSubscribeToRoom.mockReturnValue(unsubscribe);

      const { unmount } = renderHook(() => useRoom('test-room'));

      unmount();

      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
  });
});
