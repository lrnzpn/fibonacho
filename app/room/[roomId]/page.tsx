'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import JoinRoomModal from '@/components/room/JoinRoomModal';
import VotingInterface from '@/components/room/VotingInterface';
import { useAuth } from '@/contexts/AuthContext';
import { useRoom } from '@/contexts/RoomContext';

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const { user, loading: authLoading } = useAuth();
  const { loading: roomLoading } = useRoom(roomId);
  const [hasJoined, setHasJoined] = useState(false);

  if (authLoading || roomLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-t-transparent"></div>
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
