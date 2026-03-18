'use client';

import { useState, useContext } from 'react';
import { RoomContext } from '@/contexts/RoomContext';
import { useAuth } from '@/contexts/AuthContext';
import { updateRoom } from '@/lib/firebase/firestore';
import { Edit2, Check, X } from 'lucide-react';

export default function TopicEditor() {
  const context = useContext(RoomContext);
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [topic, setTopic] = useState('');

  if (!context || !user) return null;

  const { room, participants } = context;
  const currentParticipant = participants.find((p) => p.uid === user.uid);
  const isModerator = currentParticipant?.role === 'moderator';

  if (!room) return null;

  const currentTopic = room.currentTopic || 'No topic set';

  const handleEdit = () => {
    setTopic(room.currentTopic || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!topic.trim()) return;
    await updateRoom(room.roomId, { currentTopic: topic.trim() });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTopic('');
  };

  return (
    <div className="rounded-xl bg-[var(--surface)] p-5 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="mb-2 text-sm font-semibold tracking-wide text-[var(--text-muted)] uppercase">
            Current Topic
          </h3>
          {isEditing ? (
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter the story or task to estimate..."
              className="w-full resize-none rounded-xl border-2 border-[var(--accent-primary)] bg-[var(--background)] px-4 py-2 text-sm text-[var(--text)] transition-all placeholder:text-[var(--text-muted)] focus:outline-none"
              rows={2}
              autoFocus
              maxLength={500}
            />
          ) : (
            <p className="text-base leading-relaxed text-[var(--text)]">{currentTopic}</p>
          )}
        </div>

        {isModerator && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={!topic.trim()}
                  className="rounded-lg bg-[var(--accent-secondary)] p-2 text-[var(--background)] transition-all hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
                  title="Save topic"
                >
                  <Check className="h-5 w-5" />
                </button>
                <button
                  onClick={handleCancel}
                  className="rounded-lg bg-[var(--surface)] p-2 text-[var(--text)] transition-all hover:scale-110 hover:bg-[var(--background)]"
                  title="Cancel"
                >
                  <X className="h-5 w-5" />
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="rounded-lg bg-[var(--background)] p-2 text-[var(--text-muted)] transition-all hover:scale-110 hover:text-[var(--accent-primary)]"
                title="Edit topic"
              >
                <Edit2 className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
