import type { Vote, VoteValue, VoteAnalytics, FibonacciValue } from '@/types';

const FIBONACCI_SEQUENCE: FibonacciValue[] = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

export const calculateVoteAnalytics = (votes: Vote[]): VoteAnalytics => {
  const numericVotes = votes
    .map((v) => v.value)
    .filter((v): v is FibonacciValue => typeof v === 'number');

  const specialCards = {
    questions: votes.filter((v) => v.value === '?').length,
    breaks: votes.filter((v) => v.value === '☕').length,
  };

  const distribution: Record<VoteValue, number> = {} as Record<VoteValue, number>;
  votes.forEach((vote) => {
    distribution[vote.value] = (distribution[vote.value] || 0) + 1;
  });

  if (numericVotes.length === 0) {
    return {
      median: null,
      mode: null,
      distribution,
      hasConsensus: false,
      consensusThreshold: 0.75,
      specialCards,
      totalVotes: votes.length,
      numericVotes: 0,
    };
  }

  const sorted = [...numericVotes].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  const frequency: Record<number, number> = {};
  numericVotes.forEach((v) => {
    frequency[v] = (frequency[v] || 0) + 1;
  });

  const maxFreq = Math.max(...Object.values(frequency));
  const mode = Number(Object.keys(frequency).find((k) => frequency[Number(k)] === maxFreq));

  const hasConsensus = checkConsensus(numericVotes);

  return {
    median,
    mode,
    distribution,
    hasConsensus,
    consensusThreshold: 0.75,
    specialCards,
    totalVotes: votes.length,
    numericVotes: numericVotes.length,
  };
};

const checkConsensus = (numericVotes: FibonacciValue[]): boolean => {
  if (numericVotes.length === 0) return false;

  const sorted = [...numericVotes].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const medianIndex = FIBONACCI_SEQUENCE.indexOf(median);

  if (medianIndex === -1) return false;

  const withinRange = numericVotes.filter((vote) => {
    const voteIndex = FIBONACCI_SEQUENCE.indexOf(vote);
    return Math.abs(voteIndex - medianIndex) <= 1;
  });

  return withinRange.length / numericVotes.length >= 0.75;
};

export const exportVotesToCSV = (votes: Vote[], roomId: string): string => {
  const headers = ['User ID', 'Vote Value', 'Round ID', 'Created At', 'Updated At'];
  const rows = votes.map((vote) => [
    vote.userId,
    vote.value.toString(),
    vote.roundId,
    vote.createdAt.toDate().toISOString(),
    vote.updatedAt.toDate().toISOString(),
  ]);

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
  return csv;
};

export const downloadCSV = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};
