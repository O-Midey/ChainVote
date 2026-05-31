import { Provider } from "ethers";
import { getFactory } from "@/utils/contract";
import { fetchMetadata } from "./ipfs";
import { Poll } from "./types";

// Retry wrapper for rate-limited RPC calls
async function retry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise((r) => setTimeout(r, delay * (i + 1)));
    }
  }
  throw new Error("unreachable");
}

export async function fetchPoll(provider: Provider, pollId: number): Promise<Poll> {
  const contract = getFactory(provider);

  // Fetch one at a time to avoid rate limiting
  const raw = await retry(() => contract.polls(pollId));
  const options = await retry(() => contract.getPollOptions(pollId));
  const results = await retry(() => contract.getResults(pollId));
  const gasTank = await retry(() => contract.gasTank(pollId)).catch(() => BigInt(0));
  const sponsored = await retry(() => contract.sponsorshipEnabled(pollId)).catch(() => false);

  const counts = (results as bigint[]).map(Number);
  const poll: Poll = {
    id: pollId,
    creator: raw.creator,
    metadataCID: raw.metadataCID,
    options: options as string[],
    deadline: Number(raw.deadline),
    createdAt: Number(raw.createdAt),
    active: raw.active,
    results: counts,
    totalVotes: counts.reduce((a: number, b: number) => a + b, 0),
    gasTank: gasTank?.toString(),
    sponsored: sponsored as boolean,
  };

  try {
    poll.metadata = await fetchMetadata(raw.metadataCID);
  } catch {
    const parts = raw.metadataCID.split("-");
    const readable = parts.length > 1
      ? parts.slice(1).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
      : `Poll #${pollId}`;
    poll.metadata = { title: readable, description: "" };
  }

  return poll;
}

export async function fetchAllPolls(provider: Provider): Promise<Poll[]> {
  const contract = getFactory(provider);
  const count = Number(await retry(() => contract.pollCount()));
  if (count === 0) return [];

  // Fetch sequentially with delays to avoid rate limiting
  const polls: Poll[] = [];
  for (let i = 0; i < count; i++) {
    polls.push(await fetchPoll(provider, i));
    if (i < count - 1) await new Promise((r) => setTimeout(r, 200)); // 200ms gap
  }
  return polls.reverse();
}

export async function fetchCreatorPolls(provider: Provider, address: string): Promise<Poll[]> {
  const contract = getFactory(provider);
  const ids = (await retry(() => contract.getCreatorPolls(address))) as bigint[];
  const polls: Poll[] = [];
  for (const id of ids) {
    polls.push(await fetchPoll(provider, Number(id)));
  }
  return polls.reverse();
}

export function timeLeft(deadline: number): string {
  const diff = deadline - Math.floor(Date.now() / 1000);
  if (diff <= 0) return "Ended";
  const d = Math.floor(diff / 86400);
  const h = Math.floor((diff % 86400) / 3600);
  const m = Math.floor((diff % 3600) / 60);
  if (d > 0) return `${d}d ${h}h left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}
