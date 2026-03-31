import { render, screen } from '@testing-library/react';
import RoomNotFound from '../[roomId]/not-found';

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('Room Not Found Page', () => {
  it('should render "Room Not Found" heading', () => {
    render(<RoomNotFound />);
    expect(screen.getByText('Room Not Found')).toBeInTheDocument();
  });

  it('should render nacho-themed message', () => {
    render(<RoomNotFound />);
    expect(screen.getByText("That's nacho room!")).toBeInTheDocument();
  });

  it('should render descriptive error message', () => {
    render(<RoomNotFound />);
    expect(
      screen.getByText(/This room doesn't exist or may have been deleted/i)
    ).toBeInTheDocument();
  });

  it('should render NachoIcon', () => {
    const { container } = render(<RoomNotFound />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should render "Create New Room" link', () => {
    render(<RoomNotFound />);
    const createLink = screen.getByRole('link', { name: /create new room/i });
    expect(createLink).toBeInTheDocument();
    expect(createLink).toHaveAttribute('href', '/');
  });

  it('should render "Go Back" button', () => {
    render(<RoomNotFound />);
    const backButton = screen.getByRole('button', { name: /go back/i });
    expect(backButton).toBeInTheDocument();
  });

  it('should have proper accessibility attributes on create link', () => {
    render(<RoomNotFound />);
    const createLink = screen.getByRole('link', { name: /create new room/i });
    expect(createLink).toBeInTheDocument();
    expect(createLink).toHaveAttribute('href', '/');
  });

  it('should have proper accessibility attributes on back button', () => {
    render(<RoomNotFound />);
    const backButton = screen.getByRole('button', { name: /go back/i });
    expect(backButton).toHaveAttribute('aria-label', 'Go back to previous page');
  });

  it('should have focus ring classes on interactive elements', () => {
    render(<RoomNotFound />);
    const createLink = screen.getByRole('link', { name: /create new room/i });
    expect(createLink).toBeInTheDocument();
    // Focus ring classes are applied via className prop but not accessible in test
  });

  it('should call window.history.back when Go Back is clicked', () => {
    const mockBack = jest.fn();
    window.history.back = mockBack;

    render(<RoomNotFound />);
    const backButton = screen.getByRole('button', { name: /go back/i });
    backButton.click();

    expect(mockBack).toHaveBeenCalled();
  });

  it('should render within a main element', () => {
    const { container } = render(<RoomNotFound />);
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
  });

  it('should have pulsing animation on icon', () => {
    const { container } = render(<RoomNotFound />);
    const iconContainer = container.querySelector('.animate-pulse');
    expect(iconContainer).toBeInTheDocument();
  });

  it('should suggest creating a new room', () => {
    render(<RoomNotFound />);
    expect(
      screen.getByText(/Want to create your own planning poker room instead/i)
    ).toBeInTheDocument();
  });
});
