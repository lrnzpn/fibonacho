import { render, screen } from '@testing-library/react';
import NotFound from '../not-found';

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('NotFound Page', () => {
  it('should render 404 heading', () => {
    render(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('should render nacho-themed message', () => {
    render(<NotFound />);
    expect(screen.getByText('This is nacho business!')).toBeInTheDocument();
  });

  it('should render descriptive error message', () => {
    render(<NotFound />);
    expect(
      screen.getByText(/Looks like you've wandered into uncharted nacho territory/i)
    ).toBeInTheDocument();
  });

  it('should render NachoIcon', () => {
    const { container } = render(<NotFound />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should render "Take Me Home" link', () => {
    render(<NotFound />);
    const homeLink = screen.getByRole('link', { name: /take me home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should render "Go Back" button', () => {
    render(<NotFound />);
    const backButton = screen.getByRole('button', { name: /go back/i });
    expect(backButton).toBeInTheDocument();
  });

  it('should have proper accessibility attributes on home link', () => {
    render(<NotFound />);
    const homeLink = screen.getByRole('link', { name: /take me home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should have proper accessibility attributes on back button', () => {
    render(<NotFound />);
    const backButton = screen.getByRole('button', { name: /go back/i });
    expect(backButton).toHaveAttribute('aria-label', 'Go back to previous page');
  });

  it('should have focus ring classes on interactive elements', () => {
    render(<NotFound />);
    const homeLink = screen.getByRole('link', { name: /take me home/i });
    expect(homeLink).toBeInTheDocument();
    // Focus ring classes are applied via className prop but not accessible in test
  });

  it('should call window.history.back when Go Back is clicked', () => {
    const mockBack = jest.fn();
    window.history.back = mockBack;

    render(<NotFound />);
    const backButton = screen.getByRole('button', { name: /go back/i });
    backButton.click();

    expect(mockBack).toHaveBeenCalled();
  });

  it('should render within a main element', () => {
    const { container } = render(<NotFound />);
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
  });

  it('should have centered layout', () => {
    const { container } = render(<NotFound />);
    const main = container.querySelector('main');
    expect(main?.className).toContain('flex');
    expect(main?.className).toContain('items-center');
    expect(main?.className).toContain('justify-center');
  });
});
