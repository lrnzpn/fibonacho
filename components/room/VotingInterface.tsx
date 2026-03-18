'use client';

import React, { useContext } from 'react';
import { RoomProvider, RoomContext } from '@/contexts/RoomContext';
import { useAuth } from '@/contexts/AuthContext';
import { addReaction } from '@/lib/firebase/firestore';
import { ReactionType } from '@/types';
import RoomHeader from './RoomHeader';
import TopicEditor from './TopicEditor';
import VotingTimer from './VotingTimer';
import ParticipantsList from './ParticipantsList';
import VotingCards from './VotingCards';
import VotingResults from './VotingResults';
import ReactionsButton from './ReactionsButton';
import ReactionOverlay from './ReactionOverlay';

interface VotingInterfaceProps {
  roomId: string;
}

export default function VotingInterface({ roomId }: VotingInterfaceProps) {
  return (
    <RoomProvider roomId={roomId}>
      <VotingInterfaceContent roomId={roomId} />
    </RoomProvider>
  );
}

function VotingInterfaceContent({ roomId }: VotingInterfaceProps) {
  const context = useContext(RoomContext);
  const { user } = useAuth();

  if (!context) return null;

  const { reactions } = context;

  const handleReaction = async (type: ReactionType) => {
    if (!user) return;

    const x = Math.random() * 80 + 10;
    const y = Math.random() * 60 + 20;

    await addReaction(roomId, user.uid, type, x, y);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <RoomHeader roomId={roomId} />

      <main className="container mx-auto max-w-7xl flex-1 space-y-8 px-6 py-10">
        <ParticipantsList />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TopicEditor />
          <VotingTimer />
        </div>

        <VotingCards />
        <VotingResults />
      </main>

      <ReactionsButton onReaction={handleReaction} />
      <ReactionOverlay reactions={reactions} />
    </div>
  );
}
