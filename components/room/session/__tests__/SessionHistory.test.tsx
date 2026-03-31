import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SessionHistory from '../SessionHistory';
import { getHistory } from '@/lib/firebase/firestore';
import { HistoryEntry } from '@/types';
import { Timestamp } from 'firebase/firestore';

jest.mock('@/lib/firebase/firestore');

const mockGetHistory = getHistory as jest.MockedFunction<typeof getHistory>;

describe('SessionHistory', () => {
  const createMockTimestamp = (millis: number) => ({
    toMillis: () => millis,
    toDate: () => new Date(millis),
    seconds: Math.floor(millis / 1000),
    nanoseconds: (millis % 1000) * 1000000,
  });

  const mockHistory: HistoryEntry[] = [
    {
      entryId: 'entry1',
      roomId: 'test-room',
      topic: 'User Authentication',
      finalEstimate: 5,
      median: 5,
      mode: 5,
      totalVotes: 3,
      completedAt: createMockTimestamp(Date.now()) as unknown as Timestamp,
      roundNumber: 1,
    },
    {
      entryId: 'entry2',
      roomId: 'test-room',
      topic: 'Database Schema',
      finalEstimate: 8,
      median: 8,
      mode: 8,
      totalVotes: 4,
      completedAt: createMockTimestamp(Date.now() - 1000000) as unknown as Timestamp,
      roundNumber: 2,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('should render Session History title', () => {
    mockGetHistory.mockResolvedValue([]);
    render(<SessionHistory roomId="test-room" />);

    expect(screen.getByText('Session History')).toBeInTheDocument();
  });

  it('should display history entries', async () => {
    mockGetHistory.mockResolvedValue(mockHistory);

    render(<SessionHistory roomId="test-room" />);

    await waitFor(() => {
      expect(screen.getByText('User Authentication')).toBeInTheDocument();
      expect(screen.getByText('Database Schema')).toBeInTheDocument();
    });
  });

  it('should display story points for each entry', async () => {
    mockGetHistory.mockResolvedValue(mockHistory);

    render(<SessionHistory roomId="test-room" />);

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
    });
  });

  it('should display round numbers', async () => {
    mockGetHistory.mockResolvedValue(mockHistory);

    render(<SessionHistory roomId="test-room" />);

    await waitFor(() => {
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
    });
  });

  it('should show empty state when no history', async () => {
    mockGetHistory.mockResolvedValue([]);

    render(<SessionHistory roomId="test-room" />);

    await waitFor(() => {
      expect(screen.getByText(/No estimation history yet/i)).toBeInTheDocument();
    });
  });

  it('should copy history to clipboard', async () => {
    mockGetHistory.mockResolvedValue(mockHistory);

    render(<SessionHistory roomId="test-room" />);

    await waitFor(() => {
      expect(screen.getByTitle('Copy to clipboard')).toBeInTheDocument();
    });

    const copyButton = screen.getByTitle('Copy to clipboard');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  it('should show download button', async () => {
    mockGetHistory.mockResolvedValue(mockHistory);

    render(<SessionHistory roomId="test-room" />);

    await waitFor(() => {
      expect(screen.getByTitle('Download as text file')).toBeInTheDocument();
    });
  });

  it('should load history on mount', async () => {
    mockGetHistory.mockResolvedValue(mockHistory);

    render(<SessionHistory roomId="test-room" />);

    await waitFor(() => {
      expect(mockGetHistory).toHaveBeenCalledWith('test-room');
    });
  });
});
