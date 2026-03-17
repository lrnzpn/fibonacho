import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  DocumentReference,
  CollectionReference,
} from 'firebase/firestore';
import { db } from './config';
import type { Room, Participant, Vote, Round, User } from '@/types';

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

export const createRoom = async (roomId: string, moderatorId: string): Promise<Room> => {
  const roomData: Room = {
    roomId,
    createdAt: Timestamp.now(),
    lastActivity: Timestamp.now(),
    state: 'waiting',
    currentRound: 1,
    moderatorId,
  };

  await setDoc(roomDoc(roomId), roomData);
  return roomData;
};

export const getRoom = async (roomId: string): Promise<Room | null> => {
  const roomSnapshot = await getDoc(roomDoc(roomId));
  return roomSnapshot.exists() ? roomSnapshot.data() : null;
};

export const updateRoom = async (roomId: string, data: Partial<Room>) => {
  await updateDoc(roomDoc(roomId), {
    ...data,
    lastActivity: serverTimestamp(),
  });
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

  await setDoc(participantDoc(roomId, participantId), participantData);
  return participantData;
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
  const deletePromises = votesSnapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

export const subscribeToRoom = (roomId: string, callback: (room: Room | null) => void) => {
  return onSnapshot(roomDoc(roomId), (snapshot) => {
    callback(snapshot.exists() ? snapshot.data() : null);
  });
};

export const subscribeToParticipants = (
  roomId: string,
  callback: (participants: Participant[]) => void
) => {
  const q = query(participantsCollection(roomId), orderBy('joinedAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const participants = snapshot.docs.map((doc) => doc.data());
    callback(participants);
  });
};

export const subscribeToVotes = (roomId: string, callback: (votes: Vote[]) => void) => {
  return onSnapshot(votesCollection(roomId), (snapshot) => {
    const votes = snapshot.docs.map((doc) => doc.data());
    callback(votes);
  });
};
