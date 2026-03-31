import { render, screen, fireEvent } from '@testing-library/react';
import ErrorPage from '../error';

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('Error Boundary Page', () => {
  const mockError = new Error('Test error message');
  const mockReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render error heading', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    expect(screen.getByText('Oops!')).toBeInTheDocument();
  });

  it('should render nacho-themed error message', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    expect(screen.getByText(/Something went nacho-riously wrong/i)).toBeInTheDocument();
  });

  it('should render descriptive message', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    expect(screen.getByText(/Our nachos got a bit too crispy/i)).toBeInTheDocument();
  });

  it('should render NachoIcon', () => {
    const { container } = render(<ErrorPage error={mockError} reset={mockReset} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should render "Try Again" button', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    expect(tryAgainButton).toBeInTheDocument();
  });

  it('should render "Go Home" link', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    const homeLink = screen.getByRole('link', { name: /go home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should call reset function when Try Again is clicked', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(tryAgainButton);
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('should display error message in details section', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should have collapsible technical details', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    const details = screen.getByText('Technical Details');
    expect(details.closest('details')).toBeInTheDocument();
  });

  it('should log error to console on mount', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error');
    render(<ErrorPage error={mockError} reset={mockReset} />);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Application error:', mockError);
  });

  it('should have proper accessibility attributes on Try Again button', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    expect(tryAgainButton).toHaveAttribute('aria-label', 'Try again');
  });

  it('should have proper accessibility attributes on Go Home link', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    const homeLink = screen.getByRole('link', { name: /go home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should have focus ring classes on interactive elements', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    expect(tryAgainButton.className).toContain('focus:outline-none');
    expect(tryAgainButton.className).toContain('focus:ring-2');
  });

  it('should render within a main element', () => {
    const { container } = render(<ErrorPage error={mockError} reset={mockReset} />);
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
  });

  it('should handle error with digest property', () => {
    const errorWithDigest = Object.assign(new Error('Test error'), { digest: 'abc123' });
    render(<ErrorPage error={errorWithDigest} reset={mockReset} />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });
});
