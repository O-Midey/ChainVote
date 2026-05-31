export interface PollMetadata {
  title: string;
  description: string;
  imageUrl?: string;
  tags?: string[];
}

export interface Poll {
  id: number;
  creator: string;
  metadataCID: string;
  options: string[];
  deadline: number;
  createdAt: number;
  active: boolean;
  metadata?: PollMetadata;
  results?: number[];
  totalVotes?: number;
  gasTank?: string;       // wei balance in gas tank
  sponsored?: boolean;    // is voting free for this poll?
}

export interface VoteEvent {
  pollId: number;
  voter: string;
  optionIndex: number;
  txHash: string;
  timestamp: number;
}
