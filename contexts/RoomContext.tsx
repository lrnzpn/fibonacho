'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { Room, Participant, Vote, Reaction } from '@/types';
import {
  subscribeToRoom,
  subscribeToParticipants,
  subscribeToVotes,
  subscribeToReactions,
} from '@/lib/firebase/firestore';

interface RoomContextType {
  room: Room | null;
  participants: Participant[];
  votes: Vote[];
  reactions: Reaction[];
  loading: boolean;
  error: string | null;
}

export const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({ roomId, children }: { roomId: string; children: ReactNode }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeRoom = subscribeToRoom(roomId, (roomData) => {
      if (!roomData) {
        setError('Room not found');
        setLoading(false);
        return;
      }
      setRoom(roomData);
      setLoading(false);
    });

    const unsubscribeParticipants = subscribeToParticipants(roomId, setParticipants);

    const unsubscribeVotes = subscribeToVotes(roomId, setVotes);

    const unsubscribeReactions = subscribeToReactions(roomId, setReactions);

    return () => {
      unsubscribeRoom();
      unsubscribeParticipants();
      unsubscribeVotes();
      unsubscribeReactions();
    };
  }, [roomId]);

  return (
    <RoomContext.Provider value={{ room, participants, votes, reactions, loading, error }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom(roomId: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = subscribeToRoom(roomId, (roomData) => {
      if (!isMounted) return;

      if (roomData) {
        setRoom(roomData);
        setError(null);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [roomId]);

  return { room, loading, error };
}
