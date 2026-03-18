'use client';

import { useEffect, useState, useRef } from 'react';
import { Reaction } from '@/types';

interface ReactionOverlayProps {
  reactions: Reaction[];
}

interface AnimatedReaction extends Reaction {
  id: string;
}

export default function ReactionOverlay({ reactions }: ReactionOverlayProps) {
  const [animatedReactions, setAnimatedReactions] = useState<AnimatedReaction[]>([]);
  const processedReactionsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (reactions.length === 0) return;

    const latestReaction = reactions[0];
    const reactionKey = `${latestReaction.userId}-${latestReaction.timestamp.seconds}`;

    if (processedReactionsRef.current.has(reactionKey)) return;

    processedReactionsRef.current.add(reactionKey);

    const id = `${reactionKey}-${Math.random()}`;
    const newReaction: AnimatedReaction = {
      ...latestReaction,
      id,
      x: latestReaction.x ?? Math.random() * 80,
    };

    queueMicrotask(() => {
      setAnimatedReactions((prev) => [...prev, newReaction]);
    });

    const timer = setTimeout(() => {
      setAnimatedReactions((prev) => prev.filter((r) => r.id !== id));
    }, 3000);

    return () => clearTimeout(timer);
  }, [reactions]);

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      {animatedReactions.map((reaction) => (
        <div
          key={reaction.id}
          className="absolute animate-bounce text-6xl opacity-0"
          style={{
            left: `${reaction.x}%`,
            top: `${reaction.y}%`,
            animation: 'reactionFloat 3s ease-out forwards',
          }}
        >
          {reaction.type}
        </div>
      ))}
      <style jsx>{`
        @keyframes reactionFloat {
          0% {
            opacity: 0;
            transform: translateY(0) scale(0.5);
          }
          20% {
            opacity: 1;
            transform: translateY(-20px) scale(1.2);
          }
          80% {
            opacity: 1;
            transform: translateY(-60px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-100px) scale(0.8);
          }
        }
      `}</style>
    </div>
  );
}
