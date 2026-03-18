import { generateRoomId, getRoomUrl, copyToClipboard } from '../room';

describe('Room Utilities', () => {
  describe('generateRoomId', () => {
    it('should generate an 8-character room ID', () => {
      const roomId = generateRoomId();
      expect(roomId).toHaveLength(8);
    });

    it('should return the mocked room ID', () => {
      const roomId = generateRoomId();
      expect(roomId).toBe('ABC12345');
    });

    it('should only contain alphanumeric characters', () => {
      const roomId = generateRoomId();
      expect(roomId).toMatch(/^[a-zA-Z0-9]+$/);
    });
  });

  describe('getRoomUrl', () => {
    it('should generate correct room URL format', () => {
      const roomId = 'ABC12345';
      const url = getRoomUrl(roomId);
      expect(url).toContain('/room/ABC12345');
      expect(url).toMatch(/^https?:\/\/.+\/room\/ABC12345$/);
    });
  });

  describe('copyToClipboard', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should return true when clipboard API is available', async () => {
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      const result = await copyToClipboard('test text');
      expect(result).toBe(true);
      expect(mockWriteText).toHaveBeenCalledWith('test text');
    });

    it('should return false when clipboard API fails', async () => {
      const mockWriteText = jest.fn().mockRejectedValue(new Error('Failed'));
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      const result = await copyToClipboard('test text');
      expect(result).toBe(false);
    });
  });
});
