export const sanitizeInput = (input: string): string => {
  if (!input) return '';

  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:text\/html/gi, '');
};

export const sanitizeRoomCode = (code: string): string => {
  if (!code) return '';

  return code.replace(/[^A-Za-z0-9]/g, '').slice(0, 8);
};

export const sanitizeDisplayName = (name: string, maxLength: number = 50): string => {
  if (!name) return '';

  const sanitized = sanitizeInput(name.trim());

  return sanitized.replace(/[^\w\s\-_.]/g, '').slice(0, maxLength);
};

export const sanitizeTopic = (topic: string, maxLength: number = 500): string => {
  if (!topic) return '';

  const sanitized = sanitizeInput(topic.trim());

  return sanitized.slice(0, maxLength);
};

export const sanitizeNumber = (
  value: string,
  min: number = 0,
  max: number = Number.MAX_SAFE_INTEGER
): number | null => {
  const num = parseInt(value, 10);

  if (isNaN(num)) return null;
  if (num < min) return min;
  if (num > max) return max;

  return num;
};

export const escapeHtml = (unsafe: string): string => {
  if (!unsafe) return '';

  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};
