import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  DocumentReference,
  CollectionReference,
  QueryDocumentSnapshot,
  type FieldValue,
  type UpdateData,
} from 'firebase/firestore';
import { db } from './config';
import type {
  Room,
  Participant,
  Vote,
  Round,
  User,
  Reaction,
  HistoryEntry,
  VoteValue,
} from '@/types';

export const roomsCollection = () => collection(db, 'rooms') as CollectionReference<Room>;
export const roomDoc = (roomId: string) => doc(db, 'rooms', roomId) as DocumentReference<Room>;

export const participantsCollection = (roomId: string) =>
  collection(db, 'rooms', roomId, 'participants') as CollectionReference<Participant>;
export const participantDoc = (roomId: string, participantId: string) =>
  doc(db, 'rooms', roomId, 'participants', participantId) as DocumentReference<Participant>;

export const votesCollection = (roomId: string) =>
  collection(db, 'rooms', roomId, 'votes') as CollectionReference<Vote>;
export const voteDoc = (roomId: string, voteId: string) =>
  doc(db, 'rooms', roomId, 'votes', voteId) as DocumentReference<Vote>;

export const roundsCollection = (roomId: string) =>
  collection(db, 'rooms', roomId, 'rounds') as CollectionReference<Round>;
export const roundDoc = (roomId: string, roundId: string) =>
  doc(db, 'rooms', roomId, 'rounds', roundId) as DocumentReference<Round>;

export const usersCollection = () => collection(db, 'users') as CollectionReference<User>;
export const userDoc = (userId: string) => doc(db, 'users', userId) as DocumentReference<User>;

export const historyCollection = (roomId: string) =>
  collection(db, 'rooms', roomId, 'history') as CollectionReference<HistoryEntry>;
export const historyDoc = (roomId: string, entryId: string) =>
  doc(db, 'rooms', roomId, 'history', entryId) as DocumentReference<HistoryEntry>;

export const createRoom = async (roomId: string, moderatorId: string): Promise<Room> => {
  const roomData: Room = {
    roomId,
    createdAt: Timestamp.now(),
    lastActivity: Timestamp.now(),
    state: 'waiting',
    currentRound: 1,
    moderatorId,
  };

  // Use setDoc without merge to ensure atomic creation
  // This will fail if the document already exists, preventing duplicate rooms
  try {
    await setDoc(roomDoc(roomId), roomData);
    return roomData;
  } catch (error) {
    console.error('Failed to create room:', error);
    throw error;
  }
};

export const getRoom = async (roomId: string): Promise<Room | null> => {
  const roomSnapshot = await getDoc(roomDoc(roomId));
  return roomSnapshot.exists() ? roomSnapshot.data() : null;
};

// Type that allows FieldValue for deletable fields
type RoomUpdate = Partial<Omit<Room, 'timerEndsAt' | 'timerDuration'>> & {
  timerEndsAt?: Timestamp | FieldValue;
  timerDuration?: number | FieldValue;
};

export const updateRoom = async (roomId: string, data: RoomUpdate) => {
  await updateDoc(roomDoc(roomId), {
    ...data,
    lastActivity: serverTimestamp(),
  } as UpdateData<Room>);
};

export const deleteRoom = async (roomId: string) => {
  await deleteDoc(roomDoc(roomId));
};

export const addParticipant = async (
  roomId: string,
  participantId: string,
  data: Omit<Participant, 'uid' | 'joinedAt' | 'lastSeen' | 'isOnline'>
) => {
  const participantData: Participant = {
    ...data,
    uid: participantId,
    isOnline: true,
    joinedAt: Timestamp.now(),
    lastSeen: Timestamp.now(),
  };

  try {
    await setDoc(participantDoc(roomId, participantId), participantData);
    return participantData;
  } catch (error) {
    console.error('Error adding participant:', error);
    throw error;
  }
};

export const updateParticipant = async (
  roomId: string,
  participantId: string,
  data: Partial<Participant>
) => {
  await updateDoc(participantDoc(roomId, participantId), {
    ...data,
    lastSeen: serverTimestamp(),
  });
};

export const removeParticipant = async (roomId: string, participantId: string) => {
  await deleteDoc(participantDoc(roomId, participantId));
};

export const getParticipant = async (
  roomId: string,
  participantId: string
): Promise<Participant | null> => {
  const participantSnapshot = await getDoc(participantDoc(roomId, participantId));
  return participantSnapshot.exists() ? participantSnapshot.data() : null;
};

export const getParticipantCount = async (roomId: string): Promise<number> => {
  const participantsSnapshot = await getDocs(participantsCollection(roomId));
  return participantsSnapshot.size;
};

export const submitVote = async (
  roomId: string,
  voteId: string,
  userId: string,
  roundId: string,
  value: Vote['value']
) => {
  const voteData: Vote = {
    voteId,
    userId,
    roomId,
    roundId,
    value,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await setDoc(voteDoc(roomId, voteId), voteData);
  return voteData;
};

export const updateVote = async (roomId: string, voteId: string, value: Vote['value']) => {
  await updateDoc(voteDoc(roomId, voteId), {
    value,
    updatedAt: serverTimestamp(),
  });
};

export const clearVotes = async (roomId: string) => {
  const votesSnapshot = await getDocs(votesCollection(roomId));
  const deletePromises = votesSnapshot.docs.map((doc: QueryDocumentSnapshot) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

export const subscribeToRoom = (roomId: string, callback: (room: Room | null) => void) => {
  return onSnapshot(
    roomDoc(roomId),
    (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null);
    },
    (error) => {
      console.error('Error subscribing to room:', error);
      callback(null);
    }
  );
};

export const subscribeToParticipants = (
  roomId: string,
  callback: (participants: Participant[]) => void
) => {
  const q = query(participantsCollection(roomId), orderBy('joinedAt', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const participants = snapshot.docs.map((doc) => doc.data());
      callback(participants);
    },
    (error) => {
      console.error('Error subscribing to participants:', error);
      callback([]);
    }
  );
};

export const subscribeToVotes = (roomId: string, callback: (votes: Vote[]) => void) => {
  return onSnapshot(
    votesCollection(roomId),
    (snapshot) => {
      const votes = snapshot.docs.map((doc) => doc.data());
      callback(votes);
    },
    (error) => {
      console.error('Error subscribing to votes:', error);
      callback([]);
    }
  );
};

export const reactionsCollection = (roomId: string) =>
  collection(db, 'rooms', roomId, 'reactions') as CollectionReference;

export const addReaction = async (
  roomId: string,
  userId: string,
  type: string,
  x?: number,
  y?: number
) => {
  const reactionData = {
    userId,
    type,
    timestamp: Timestamp.now(),
    x,
    y,
  };

  await setDoc(doc(reactionsCollection(roomId)), reactionData);
  return reactionData;
};

export const subscribeToReactions = (roomId: string, callback: (reactions: Reaction[]) => void) => {
  const q = query(reactionsCollection(roomId), orderBy('timestamp', 'desc'), limit(50));
  return onSnapshot(
    q,
    (snapshot) => {
      const reactions = snapshot.docs.map((doc) => doc.data() as Reaction);
      callback(reactions);
    },
    (error) => {
      console.error('Error subscribing to reactions:', error);
      callback([]);
    }
  );
};

export const saveHistoryEntry = async (
  roomId: string,
  entryId: string,
  topic: string,
  finalEstimate: VoteValue | null,
  median: number | null,
  mode: number | null,
  totalVotes: number,
  roundNumber: number
): Promise<HistoryEntry> => {
  const historyData: HistoryEntry = {
    entryId,
    roomId,
    topic,
    finalEstimate,
    median,
    mode,
    totalVotes,
    completedAt: Timestamp.now(),
    roundNumber,
  };

  await setDoc(historyDoc(roomId, entryId), historyData);
  return historyData;
};

export const subscribeToHistory = (roomId: string, callback: (history: HistoryEntry[]) => void) => {
  const q = query(historyCollection(roomId), orderBy('completedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const history = snapshot.docs.map((doc) => doc.data() as HistoryEntry);
    callback(history);
  });
};

export const getHistory = async (roomId: string): Promise<HistoryEntry[]> => {
  const q = query(historyCollection(roomId), orderBy('completedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as HistoryEntry);
};
