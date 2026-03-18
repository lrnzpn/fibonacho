import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Home from '../page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('Home Page', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    mockPush.mockClear();
  });

  it('should render the landing page', () => {
    render(<Home />);

    expect(screen.getByText('Fibo', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('nacho', { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/high-vibe, real-time pointing poker tool/i)).toBeInTheDocument();
  });

  it('should render Create New Room button', () => {
    render(<Home />);

    const createButton = screen.getByRole('button', { name: /create new room/i });
    expect(createButton).toBeInTheDocument();
  });

  it('should navigate to new room when Create New Room is clicked', () => {
    render(<Home />);

    const createButton = screen.getByRole('button', { name: /create new room/i });
    fireEvent.click(createButton);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/room/ABC12345');
  });

  it('should render room code input field', () => {
    render(<Home />);

    const input = screen.getByPlaceholderText(/enter room code/i);
    expect(input).toBeInTheDocument();
  });

  it('should render Join Room button', () => {
    render(<Home />);

    const joinButton = screen.getByRole('button', { name: /join room/i });
    expect(joinButton).toBeInTheDocument();
  });

  it('should disable Join Room button when input is empty', () => {
    render(<Home />);

    const joinButton = screen.getByRole('button', { name: /join room/i });
    expect(joinButton).toBeDisabled();
  });

  it('should enable Join Room button when input has value', () => {
    render(<Home />);

    const input = screen.getByPlaceholderText(/enter room code/i);
    const joinButton = screen.getByRole('button', { name: /join room/i });

    fireEvent.change(input, { target: { value: 'ABC12345' } });

    expect(joinButton).not.toBeDisabled();
  });

  it('should navigate to room when Join Room is clicked with valid code', () => {
    render(<Home />);

    const input = screen.getByPlaceholderText(/enter room code/i);
    const joinButton = screen.getByRole('button', { name: /join room/i });

    fireEvent.change(input, { target: { value: 'ABC12345' } });
    fireEvent.click(joinButton);

    expect(mockPush).toHaveBeenCalledWith('/room/ABC12345');
  });

  it('should trim whitespace from room code', () => {
    render(<Home />);

    const input = screen.getByPlaceholderText(/enter room code/i);
    const joinButton = screen.getByRole('button', { name: /join room/i });

    fireEvent.change(input, { target: { value: '  ABC12345  ' } });
    fireEvent.click(joinButton);

    expect(mockPush).toHaveBeenCalledWith('/room/ABC12345');
  });

  it('should not navigate when Join Room is clicked with empty input', () => {
    render(<Home />);

    const joinButton = screen.getByRole('button', { name: /join room/i });
    fireEvent.click(joinButton);

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should display tagline', () => {
    render(<Home />);

    expect(screen.getByText(/no sign-up required/i)).toBeInTheDocument();
  });

  it('should limit room code input to 8 characters', () => {
    render(<Home />);

    const input = screen.getByPlaceholderText(/enter room code/i) as HTMLInputElement;
    expect(input.maxLength).toBe(8);
  });
});
