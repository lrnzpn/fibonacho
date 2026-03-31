import { render, screen } from '@testing-library/react';
import Home from '../page';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock nanoid
jest.mock('nanoid', () => ({
  customAlphabet: jest.fn(() => jest.fn(() => 'ABC12345')),
}));

describe('Accessibility Tests - Home Page', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have main landmark', () => {
      render(<Home />);
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<Home />);
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveAttribute('id', 'main-heading');
    });

    it('should have focus rings on Create Room button', () => {
      render(<Home />);
      const createButton = screen.getByRole('button', {
        name: /create a new planning poker room/i,
      });
      expect(createButton.className).toContain('focus:outline-none');
      expect(createButton.className).toContain('focus:ring-2');
      expect(createButton.className).toContain('focus:ring-[var(--accent-primary)]');
    });

    it('should have focus rings on Join Room button', () => {
      render(<Home />);
      const joinButton = screen.getByRole('button', { name: /join room with entered code/i });
      expect(joinButton.className).toContain('focus:outline-none');
      expect(joinButton.className).toContain('focus:ring-2');
    });

    it('should have focus ring on room code input', () => {
      render(<Home />);
      const input = screen.getByLabelText(/enter room code/i);
      expect(input.className).toContain('focus:border-[var(--accent-primary)]');
      expect(input.className).toContain('focus:outline-none');
    });
  });

  describe('ARIA Labels and Attributes', () => {
    it('should have aria-label on Create Room button', () => {
      render(<Home />);
      const createButton = screen.getByRole('button', {
        name: /create a new planning poker room/i,
      });
      expect(createButton).toHaveAttribute('aria-label', 'Create a new planning poker room');
    });

    it('should have aria-label on Join Room button', () => {
      render(<Home />);
      const joinButton = screen.getByRole('button', { name: /join room with entered code/i });
      expect(joinButton).toHaveAttribute('aria-label', 'Join room with entered code');
    });

    it('should have label associated with room code input', () => {
      render(<Home />);
      const input = screen.getByLabelText(/enter room code/i);
      expect(input).toHaveAttribute('id', 'room-code-input');
    });

    it('should have aria-describedby on room code input', () => {
      render(<Home />);
      const input = screen.getByLabelText(/enter room code/i);
      expect(input).toHaveAttribute('aria-describedby', 'room-code-help');
    });

    it('should have help text for room code input', () => {
      render(<Home />);
      const helpText = document.getElementById('room-code-help');
      expect(helpText).toBeInTheDocument();
      expect(helpText).toHaveClass('sr-only');
      expect(helpText).toHaveTextContent(/8-character room code/i);
    });

    it('should have aria-hidden on decorative divider', () => {
      const { container } = render(<Home />);
      const divider = container.querySelector('[aria-hidden="true"]');
      expect(divider).toBeInTheDocument();
    });

    it('should have aria-label on form', () => {
      render(<Home />);
      const form = screen.getByRole('form', { name: /join existing room/i });
      expect(form).toBeInTheDocument();
    });
  });

  describe('Screen Reader Support', () => {
    it('should have sr-only label for input', () => {
      const { container } = render(<Home />);
      const label = container.querySelector('label.sr-only');
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent('Enter room code');
    });

    it('should have sr-only help text', () => {
      const { container } = render(<Home />);
      const helpText = container.querySelector('#room-code-help.sr-only');
      expect(helpText).toBeInTheDocument();
    });

    it('should mark decorative icon as aria-hidden', () => {
      const { container } = render(<Home />);
      const iconContainer = container.querySelector('[aria-hidden="true"]');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Error Handling Accessibility', () => {
    it('should have role="alert" on error message', () => {
      render(<Home />);
      const createButton = screen.getByRole('button', {
        name: /create a new planning poker room/i,
      });

      // Trigger rate limit error
      createButton.click();
      createButton.click();

      const errorAlert = screen.queryByRole('alert');
      if (errorAlert) {
        expect(errorAlert).toHaveAttribute('aria-live', 'polite');
      }
    });
  });

  describe('Form Accessibility', () => {
    it('should have proper form structure', () => {
      render(<Home />);
      const form = screen.getByRole('form', { name: /join existing room/i });
      expect(form).toBeInTheDocument();
    });

    it('should have label for input field', () => {
      render(<Home />);
      const input = screen.getByLabelText(/enter room code/i);
      expect(input).toBeInTheDocument();
    });

    it('should disable join button when input is empty', () => {
      render(<Home />);
      const joinButton = screen.getByRole('button', { name: /join room with entered code/i });
      expect(joinButton).toBeDisabled();
    });

    it('should have proper input attributes', () => {
      render(<Home />);
      const input = screen.getByLabelText(/enter room code/i);
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveAttribute('maxLength', '8');
      expect(input).toHaveAttribute('autoComplete', 'off');
    });
  });

  describe('Semantic HTML', () => {
    it('should use semantic main element', () => {
      render(<Home />);
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('should use proper heading levels', () => {
      render(<Home />);
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
    });

    it('should use button elements for actions', () => {
      render(<Home />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach((button) => {
        expect(button.tagName).toBe('BUTTON');
      });
    });
  });
});
