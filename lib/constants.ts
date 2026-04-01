import { APP_CONFIG } from '@/config';

export const LIMITS = {
  MAX_DISPLAY_NAME_LENGTH: APP_CONFIG.limits.maxDisplayNameLength,
  MAX_PARTICIPANTS_PER_ROOM: APP_CONFIG.limits.maxParticipantsPerRoom,
  MAX_ROOMS_PER_USER: APP_CONFIG.limits.maxRoomsPerUser,
  ROOM_CREATION_COOLDOWN_MS: APP_CONFIG.limits.roomCreationCooldownMs,
  ROOM_LIFE_DURATION_HOURS: APP_CONFIG.limits.roomLifeDurationHours,
} as const;
