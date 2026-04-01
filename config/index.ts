import appConfig from './app.config.json';
import { FibonacciValue, SpecialCard, ReactionType } from '@/types';

export const APP_CONFIG = {
  timer: {
    maxSeconds: appConfig.timer.maxSeconds,
    defaultIncrementSeconds: appConfig.timer.defaultIncrementSeconds,
  },
  voting: {
    fibonacciValues: appConfig.voting.fibonacciValues as FibonacciValue[],
    specialCards: appConfig.voting.specialCards as SpecialCard[],
  },
  reactions: {
    availableReactions: appConfig.reactions.availableReactions as ReactionType[],
  },
  limits: {
    maxDisplayNameLength: appConfig.limits.maxDisplayNameLength,
    maxParticipantsPerRoom: appConfig.limits.maxParticipantsPerRoom,
    maxRoomsPerUser: appConfig.limits.maxRoomsPerUser,
    roomCreationCooldownMs: appConfig.limits.roomCreationCooldownMs,
    roomLifeDurationHours: appConfig.limits.roomLifeDurationHours,
  },
} as const;
