import { calculateVoteAnalytics } from '../analytics';
import { Vote } from '@/types';
import { Timestamp } from 'firebase/firestore';

const createMockTimestamp = (): Timestamp => ({
  seconds: Math.floor(Date.now() / 1000),
  nanoseconds: 0,
  toDate: () => new Date(),
  toMillis: () => Date.now(),
  isEqual: () => false,
  valueOf: () => '',
  toJSON: () => ({ seconds: Math.floor(Date.now() / 1000), nanoseconds: 0, type: 'timestamp' }),
});

describe('Analytics Utilities', () => {
  const mockVotes: Vote[] = [
    {
      voteId: '1',
      userId: 'user1',
      roomId: 'room1',
      roundId: 'round1',
      value: 5,
      createdAt: createMockTimestamp(),
      updatedAt: createMockTimestamp(),
    },
    {
      voteId: '2',
      userId: 'user2',
      roomId: 'room1',
      roundId: 'round1',
      value: 8,
      createdAt: createMockTimestamp(),
      updatedAt: createMockTimestamp(),
    },
    {
      voteId: '3',
      userId: 'user3',
      roomId: 'room1',
      roundId: 'round1',
      value: 5,
      createdAt: createMockTimestamp(),
      updatedAt: createMockTimestamp(),
    },
  ];

  describe('calculateVoteAnalytics', () => {
    it('should calculate analytics for numeric votes', () => {
      const analytics = calculateVoteAnalytics(mockVotes);

      expect(analytics.totalVotes).toBe(3);
      expect(analytics.numericVotes).toBe(3);
      expect(analytics.median).toBe(5);
      expect(analytics.mode).toBe(5);
      expect(analytics.distribution).toEqual({
        5: 2,
        8: 1,
      });
      expect(analytics.hasConsensus).toBe(true);
      expect(analytics.consensusThreshold).toBe(0.75);
    });

    it('should handle empty votes', () => {
      const analytics = calculateVoteAnalytics([]);

      expect(analytics.totalVotes).toBe(0);
      expect(analytics.numericVotes).toBe(0);
      expect(analytics.median).toBeNull();
      expect(analytics.mode).toBeNull();
      expect(analytics.hasConsensus).toBe(false);
      expect(analytics.distribution).toEqual({});
    });

    it('should handle special cards', () => {
      const votes: Vote[] = [
        { ...mockVotes[0], value: '?' },
        { ...mockVotes[1], value: '☕' },
        { ...mockVotes[2], value: 5 },
      ];

      const analytics = calculateVoteAnalytics(votes);

      expect(analytics.totalVotes).toBe(3);
      expect(analytics.numericVotes).toBe(1);
      expect(analytics.specialCards.questions).toBe(1);
      expect(analytics.specialCards.breaks).toBe(1);
      expect(analytics.distribution).toEqual({
        '?': 1,
        '☕': 1,
        5: 1,
      });
    });

    it('should detect consensus when votes are within range', () => {
      const votes: Vote[] = [
        { ...mockVotes[0], value: 5 },
        { ...mockVotes[1], value: 5 },
        { ...mockVotes[2], value: 8 },
        {
          voteId: '4',
          userId: 'user4',
          roomId: 'room1',
          roundId: 'round1',
          value: 5,
          createdAt: createMockTimestamp(),
          updatedAt: createMockTimestamp(),
        },
      ];

      const analytics = calculateVoteAnalytics(votes);
      expect(analytics.hasConsensus).toBe(true);
    });

    it('should not detect consensus when votes are spread out', () => {
      const votes: Vote[] = [
        { ...mockVotes[0], value: 1 },
        { ...mockVotes[1], value: 13 },
        { ...mockVotes[2], value: 34 },
      ];

      const analytics = calculateVoteAnalytics(votes);
      expect(analytics.hasConsensus).toBe(false);
    });

    it('should calculate mode correctly', () => {
      const votes: Vote[] = [
        { ...mockVotes[0], value: 8 },
        { ...mockVotes[1], value: 8 },
        { ...mockVotes[2], value: 5 },
      ];

      const analytics = calculateVoteAnalytics(votes);
      expect(analytics.mode).toBe(8);
    });

    it('should handle only special cards', () => {
      const votes: Vote[] = [
        { ...mockVotes[0], value: '?' },
        { ...mockVotes[1], value: '☕' },
      ];

      const analytics = calculateVoteAnalytics(votes);
      expect(analytics.median).toBeNull();
      expect(analytics.mode).toBeNull();
      expect(analytics.numericVotes).toBe(0);
      expect(analytics.specialCards.questions).toBe(1);
      expect(analytics.specialCards.breaks).toBe(1);
    });
  });
});
