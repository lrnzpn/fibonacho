import { Timestamp } from 'firebase/firestore';

export type RoomState = 'waiting' | 'voting' | 'revealed';

export type ParticipantRole = 'moderator' | 'voter' | 'spectator';

export type FibonacciValue = 0 | 1 | 2 | 3 | 5 | 8 | 13 | 21 | 34 | 55 | 89;

export type SpecialCard = '?' | '☕';

export type VoteValue = FibonacciValue | SpecialCard;

export type ReactionType = '🎉' | '🤔' | '👍' | '🔥' | '☕';

export interface Room {
  roomId: string;
  createdAt: Timestamp;
  lastActivity: Timestamp;
  state: RoomState;
  currentRound: number;
  moderatorId: string;
  currentTopic?: string;
  timerEndsAt?: Timestamp;
  timerDuration?: number;
}

export interface Participant {
  uid: string;
  displayName: string;
  role: ParticipantRole;
  isOnline: boolean;
  joinedAt: Timestamp;
  lastSeen: Timestamp;
  photoURL?: string;
  avatar?: string;
}

export interface Vote {
  voteId: string;
  userId: string;
  roomId: string;
  roundId: string;
  value: VoteValue;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Round {
  roundId: string;
  roomId: string;
  roundNumber: number;
  state: RoomState;
  createdAt: Timestamp;
  revealedAt?: Timestamp;
  story?: string;
  finalEstimate?: VoteValue;
}

export interface User {
  uid: string;
  displayName: string;
  photoURL?: string;
  email?: string;
  roomHistory: string[];
  createdAt: Timestamp;
}

export interface VoteAnalytics {
  median: number | null;
  mode: number | null;
  distribution: Record<VoteValue, number>;
  hasConsensus: boolean;
  consensusThreshold: number;
  specialCards: {
    questions: number;
    breaks: number;
  };
  totalVotes: number;
  numericVotes: number;
}

export interface Reaction {
  userId: string;
  type: ReactionType;
  timestamp: Timestamp;
  x?: number;
  y?: number;
}

export interface HistoryEntry {
  entryId: string;
  roomId: string;
  topic: string;
  finalEstimate: VoteValue | null;
  median: number | null;
  mode: number | null;
  totalVotes: number;
  completedAt: Timestamp;
  roundNumber: number;
}
