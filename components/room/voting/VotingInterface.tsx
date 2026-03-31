'use client';

import React, { useContext } from 'react';
import { RoomProvider, RoomContext } from '@/contexts/RoomContext';
import { useAuth } from '@/contexts/AuthContext';
import { addReaction } from '@/lib/firebase/firestore';
import { ReactionType } from '@/types';
import RoomHeader from '@/components/room/participants/RoomHeader';
import TopicEditor from '@/components/room/session/TopicEditor';
import VotingTimer from '@/components/room/voting/VotingTimer';
import SessionHistory from '@/components/room/session/SessionHistory';
import ParticipantsList from '@/components/room/participants/ParticipantsList';
import VotingCards from '@/components/room/voting/VotingCards';
import VotingResults from '@/components/room/voting/VotingResults';
import ReactionsButton from '@/components/room/reactions/ReactionsButton';
import ReactionOverlay from '@/components/room/reactions/ReactionOverlay';
import Footer from '@/components/Footer';

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

      <main className="container mx-auto max-w-7xl flex-1 space-y-6 px-4 py-6 md:space-y-8 md:px-6 md:py-10">
        {/* Topic/Timer and History - Side by Side */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6">
          <div className="flex w-full flex-col gap-4 lg:basis-7/12">
            <TopicEditor />
            <VotingTimer />
          </div>
          <div className="w-full lg:basis-5/12">
            <SessionHistory roomId={roomId} />
          </div>
        </div>

        {/* Participants - Full Width, Centered */}
        <div className="mx-auto w-full max-w-5xl">
          <ParticipantsList />
        </div>

        {/* Voting Cards - Centered */}
        <div className="mx-auto w-full max-w-4xl">
          <VotingCards />
        </div>

        {/* Results */}
        <VotingResults />
      </main>

      <Footer />

      <ReactionsButton onReaction={handleReaction} />
      <ReactionOverlay reactions={reactions} />
    </div>
  );
}
