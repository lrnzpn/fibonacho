import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { onAuthChange, signInAsGuest } from '@/lib/firebase/auth';
import { User } from 'firebase/auth';

jest.mock('@/lib/firebase/auth');

const mockOnAuthChange = onAuthChange as jest.MockedFunction<typeof onAuthChange>;
const mockSignInAsGuest = signInAsGuest as jest.MockedFunction<typeof signInAsGuest>;

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AuthProvider', () => {
    it('should provide initial loading state', () => {
      mockOnAuthChange.mockReturnValue(() => {});

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBeNull();
    });

    it('should update user state when auth changes', async () => {
      const mockUser = { uid: 'test-user-id', email: 'test@example.com' } as User;
      let authCallback: ((user: User | null) => void) | null = null;

      mockOnAuthChange.mockImplementation((callback) => {
        authCallback = callback;
        return () => {};
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        if (authCallback) {
          authCallback(mockUser);
        }
        expect(result.current.loading).toBe(false);
        expect(result.current.user).toEqual(mockUser);
      });
    });

    it('should handle sign in successfully', async () => {
      mockOnAuthChange.mockReturnValue(() => {});
      mockSignInAsGuest.mockResolvedValue({ uid: 'guest-user' } as User);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await result.current.signIn();

      expect(mockSignInAsGuest).toHaveBeenCalledTimes(1);
    });

    it('should handle sign in error gracefully', async () => {
      mockOnAuthChange.mockReturnValue(() => {});
      mockSignInAsGuest.mockRejectedValue(new Error('Sign in failed'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await result.current.signIn();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to sign in:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    it('should cleanup auth listener on unmount', () => {
      const unsubscribe = jest.fn();
      mockOnAuthChange.mockReturnValue(unsubscribe);

      const { unmount } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      unmount();

      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('useAuth', () => {
    it('should throw error when used outside AuthProvider', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleErrorSpy.mockRestore();
    });

    it('should return auth context when used within AuthProvider', () => {
      mockOnAuthChange.mockReturnValue(() => {});

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('signIn');
    });
  });
});
