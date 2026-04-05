'use client';

import { useParams, notFound } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import JoinRoomModal from '@/components/room/modals/JoinRoomModal';
import VotingInterface from '@/components/room/voting/VotingInterface';
import { useAuth } from '@/contexts/AuthContext';
import { useRoom } from '@/contexts/RoomContext';
import { getParticipant } from '@/lib/firebase/firestore';

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const { user, loading: authLoading } = useAuth();
  const { room, loading: roomLoading } = useRoom(roomId);
  const [hasJoined, setHasJoined] = useState(false);
  const [checkingParticipant, setCheckingParticipant] = useState(true);
  const roomRef = useRef(room);

  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  // Check if user is already a participant on mount/user change
  useEffect(() => {
    const checkExistingParticipant = async () => {
      if (user && roomId && !authLoading) {
        try {
          const participant = await getParticipant(roomId, user.uid);
          if (participant) {
            setHasJoined(true);
          }
        } catch (error) {
          console.error('Error checking participant:', error);
        } finally {
          setCheckingParticipant(false);
        }
      } else if (!authLoading) {
        setCheckingParticipant(false);
      }
    };

    checkExistingParticipant();
  }, [user, roomId, authLoading]);

  useEffect(() => {
    if (!roomLoading && !room) {
      const timeout = setTimeout(() => {
        if (!roomRef.current) {
          notFound();
        }
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [room, roomLoading]);

  if (authLoading || roomLoading || checkingParticipant) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <div className="space-y-4 text-center">
          <div
            className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-t-transparent"
            aria-hidden="true"
          ></div>
          <p className="text-[var(--text-muted)]">Loading room...</p>
        </div>
      </div>
    );
  }

  if (!user || !hasJoined) {
    return <JoinRoomModal roomId={roomId} onJoin={() => setHasJoined(true)} />;
  }

  return <VotingInterface roomId={roomId} />;
}
