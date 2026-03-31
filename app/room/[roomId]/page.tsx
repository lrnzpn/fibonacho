'use client';

import { useParams, notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
import JoinRoomModal from '@/components/room/modals/JoinRoomModal';
import VotingInterface from '@/components/room/voting/VotingInterface';
import { useAuth } from '@/contexts/AuthContext';
import { useRoom } from '@/contexts/RoomContext';

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const { user, loading: authLoading } = useAuth();
  const { room, loading: roomLoading, error } = useRoom(roomId);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (error || (!roomLoading && !room)) {
      notFound();
    }
  }, [error, room, roomLoading]);

  if (authLoading || roomLoading) {
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
