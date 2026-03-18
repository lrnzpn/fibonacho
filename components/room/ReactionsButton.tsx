'use client';

import { useState } from 'react';
import { Smile } from 'lucide-react';
import { ReactionType } from '@/types';

interface ReactionsButtonProps {
  onReaction: (reaction: ReactionType) => void;
}

const REACTIONS: ReactionType[] = ['🎉', '👍', '🤔', '🔥', '☕'];

export default function ReactionsButton({ onReaction }: ReactionsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleReaction = (reaction: ReactionType) => {
    onReaction(reaction);
    setIsOpen(false);
  };

  return (
    <div className="fixed right-8 bottom-8 z-50">
      {isOpen && (
        <div className="mb-3 flex flex-col items-center gap-2 rounded-2xl bg-[var(--surface)] shadow-2xl">
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
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-colors ${
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
