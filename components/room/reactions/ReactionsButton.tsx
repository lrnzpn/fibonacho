'use client';

import { useState } from 'react';
import { Smile } from 'lucide-react';
import { ReactionType } from '@/types';
import { APP_CONFIG } from '@/config';

interface ReactionsButtonProps {
  onReaction: (reaction: ReactionType) => void;
}

const REACTIONS = APP_CONFIG.reactions.availableReactions;

export default function ReactionsButton({ onReaction }: ReactionsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleReaction = (reaction: ReactionType) => {
    onReaction(reaction);
  };

  return (
    <div className="fixed bottom-[200px] left-1/2 z-50 -translate-x-1/2 md:bottom-[220px]">
      {isOpen && (
        <div className="mb-3 flex items-center justify-center gap-2 rounded-2xl bg-[var(--surface)] p-2 shadow-2xl">
          {REACTIONS.map((reaction) => (
            <button
              key={reaction}
              onClick={() => handleReaction(reaction)}
              className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-all hover:scale-125 hover:bg-[var(--background)]"
              title={`Send ${reaction}`}
            >
              {reaction}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-colors ${
          isOpen
            ? 'bg-[var(--accent-secondary)] text-[var(--background)]'
            : 'bg-[var(--accent-primary)] text-[var(--background)]'
        }`}
        title="Send reaction"
      >
        <Smile className="h-6 w-6" />
      </button>
    </div>
  );
}
