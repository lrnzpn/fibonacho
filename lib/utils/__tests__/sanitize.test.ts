import {
  sanitizeInput,
  sanitizeRoomCode,
  sanitizeDisplayName,
  sanitizeTopic,
  sanitizeNumber,
  escapeHtml,
} from '../sanitize';

describe('sanitizeInput', () => {
  it('should remove HTML tags', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
    expect(sanitizeInput('Hello <b>World</b>')).toBe('Hello bWorld/b');
  });

  it('should remove javascript: protocol', () => {
    expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
    expect(sanitizeInput('JAVASCRIPT:alert(1)')).toBe('alert(1)');
  });

  it('should remove event handlers', () => {
    expect(sanitizeInput('onclick=alert(1)')).toBe('alert(1)');
    expect(sanitizeInput('onload=malicious()')).toBe('malicious()');
    expect(sanitizeInput('ONMOUSEOVER=attack()')).toBe('attack()');
  });

  it('should remove data:text/html protocol', () => {
    expect(sanitizeInput('data:text/html,<script>alert(1)</script>')).toBe(
      ',scriptalert(1)/script'
    );
  });

  it('should return empty string for null/undefined', () => {
    expect(sanitizeInput('')).toBe('');
    expect(sanitizeInput(null as unknown as string)).toBe('');
    expect(sanitizeInput(undefined as unknown as string)).toBe('');
  });

  it('should preserve safe text', () => {
    expect(sanitizeInput('Hello World')).toBe('Hello World');
    expect(sanitizeInput('Test 123')).toBe('Test 123');
  });
});

describe('sanitizeRoomCode', () => {
  it('should convert to uppercase', () => {
    expect(sanitizeRoomCode('abc123')).toBe('ABC123');
    expect(sanitizeRoomCode('test')).toBe('TEST');
  });

  it('should remove non-alphanumeric characters', () => {
    expect(sanitizeRoomCode('ABC-123')).toBe('ABC123');
    expect(sanitizeRoomCode('TEST@#$')).toBe('TEST');
    expect(sanitizeRoomCode('A B C')).toBe('ABC');
  });

  it('should limit to 8 characters', () => {
    expect(sanitizeRoomCode('ABCDEFGHIJK')).toBe('ABCDEFGH');
    expect(sanitizeRoomCode('123456789')).toBe('12345678');
  });

  it('should handle empty input', () => {
    expect(sanitizeRoomCode('')).toBe('');
    expect(sanitizeRoomCode(null as unknown as string)).toBe('');
  });

  it('should remove XSS attempts', () => {
    expect(sanitizeRoomCode('<script>alert(1)</script>')).toBe('SCRIPTAL');
    expect(sanitizeRoomCode('javascript:alert(1)')).toBe('JAVASCRI');
  });
});

describe('sanitizeDisplayName', () => {
  it('should trim whitespace', () => {
    expect(sanitizeDisplayName('  John  ', 50)).toBe('John');
    expect(sanitizeDisplayName('\nAlice\t', 50)).toBe('Alice');
  });

  it('should remove special characters except allowed ones', () => {
    expect(sanitizeDisplayName('John@Doe', 50)).toBe('JohnDoe');
    expect(sanitizeDisplayName('Alice_Smith', 50)).toBe('Alice_Smith');
    expect(sanitizeDisplayName('Bob-Jones', 50)).toBe('Bob-Jones');
    expect(sanitizeDisplayName('Test.User', 50)).toBe('Test.User');
  });

  it('should limit to max length', () => {
    expect(sanitizeDisplayName('VeryLongNameThatExceedsLimit', 10)).toBe('VeryLongNa');
    expect(sanitizeDisplayName('Test', 2)).toBe('Te');
  });

  it('should remove XSS attempts', () => {
    expect(sanitizeDisplayName('<script>alert(1)</script>', 50)).toBe('scriptalert1script');
    expect(sanitizeDisplayName('onclick=alert(1)', 50)).toBe('alert1');
  });

  it('should handle empty input', () => {
    expect(sanitizeDisplayName('', 50)).toBe('');
    expect(sanitizeDisplayName('   ', 50)).toBe('');
  });
});

describe('sanitizeTopic', () => {
  it('should trim whitespace', () => {
    expect(sanitizeTopic('  Story description  ', 500)).toBe('Story description');
  });

  it('should limit to max length', () => {
    const longText = 'a'.repeat(600);
    expect(sanitizeTopic(longText, 500)).toHaveLength(500);
  });

  it('should remove XSS attempts', () => {
    expect(sanitizeTopic('<script>alert(1)</script>', 500)).toBe('scriptalert(1)/script');
    expect(sanitizeTopic('javascript:void(0)', 500)).toBe('void(0)');
  });

  it('should preserve safe content', () => {
    const safeText = 'As a user, I want to be able to login';
    expect(sanitizeTopic(safeText, 500)).toBe(safeText);
  });

  it('should handle empty input', () => {
    expect(sanitizeTopic('', 500)).toBe('');
    expect(sanitizeTopic('   ', 500)).toBe('');
  });
});

describe('sanitizeNumber', () => {
  it('should parse valid numbers', () => {
    expect(sanitizeNumber('42', 0, 100)).toBe(42);
    expect(sanitizeNumber('0', 0, 100)).toBe(0);
    expect(sanitizeNumber('100', 0, 100)).toBe(100);
  });

  it('should enforce minimum value', () => {
    expect(sanitizeNumber('-5', 0, 100)).toBe(0);
    expect(sanitizeNumber('5', 10, 100)).toBe(10);
  });

  it('should enforce maximum value', () => {
    expect(sanitizeNumber('150', 0, 100)).toBe(100);
    expect(sanitizeNumber('999', 0, 100)).toBe(100);
  });

  it('should return null for invalid input', () => {
    expect(sanitizeNumber('abc', 0, 100)).toBeNull();
    expect(sanitizeNumber('', 0, 100)).toBeNull();
    expect(sanitizeNumber('12.5', 0, 100)).toBe(12);
  });

  it('should handle edge cases', () => {
    expect(sanitizeNumber('0', 0, 0)).toBe(0);
    expect(sanitizeNumber('1', 1, 1)).toBe(1);
  });
});

describe('escapeHtml', () => {
  it('should escape HTML entities', () => {
    expect(escapeHtml('<div>Test</div>')).toBe('&lt;div&gt;Test&lt;/div&gt;');
    expect(escapeHtml('A & B')).toBe('A &amp; B');
  });

  it('should escape quotes', () => {
    expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
    expect(escapeHtml("'single'")).toBe('&#039;single&#039;');
  });

  it('should handle XSS attempts', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  it('should handle empty input', () => {
    expect(escapeHtml('')).toBe('');
    expect(escapeHtml(null as unknown as string)).toBe('');
  });

  it('should preserve safe text', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });
});
