import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz', 8);

export const generateRoomId = (): string => {
  return nanoid();
};

export const getRoomUrl = (roomId: string): string => {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/room/${roomId}`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

export const getSessionStorage = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(key);
};

export const setSessionStorage = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(key, value);
};

export const clearSessionStorage = (): void => {
  if (typeof window === 'undefined') return;
  sessionStorage.clear();
};
