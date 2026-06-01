import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";

const ADDRESS = "0x426758c2416B951Fe577638990D14523E093933e";
const RPC = "https://sepolia.base.org";

let cache: { data: unknown; ts: number } | null = null;
const TTL = 30_000;

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const now = Date.now();
    if (cache && now - cache.ts < TTL) return res.status(200).json(cache.data);

    const p = new ethers.JsonRpcProvider(RPC);
    const c = new ethers.Contract(ADDRESS, [
      "function pollCount() view returns (uint256)",
      "function getPollOptions(uint256) view returns (string[])",
      "function getResults(uint256) view returns (uint256[])",
      {
        type: "function", name: "polls", stateMutability: "view",
        inputs: [{ name: "", type: "uint256" }],
        outputs: [
          { name: "id", type: "uint256" },
          { name: "creator", type: "address" },
          { name: "metadataCID", type: "string" },
          { name: "deadline", type: "uint256" },
          { name: "createdAt", type: "uint256" },
          { name: "active", type: "bool" },
        ],
      },
    ], p);

    const count = Number(await c.pollCount());
    const polls = [];
    for (let i = 0; i < count; i++) {
      try {
        const [raw, opts, res_] = await Promise.all([
          c.polls(i),
          c.getPollOptions(i).catch(() => []),
          c.getResults(i).catch(() => []),
        ]);
        polls.push({
          id: i, creator: raw.creator, metadataCID: raw.metadataCID,
          options: opts, deadline: Number(raw.deadline),
          createdAt: Number(raw.createdAt), active: raw.active,
          results: res_.map(Number),
          totalVotes: res_.reduce((a: number, b: number) => a + Number(b), 0),
          metadata: {
            title: raw.metadataCID.split("-").slice(1).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || `Poll #${i}`,
            description: "",
          },
        });
      } catch { /* skip broken poll */ }
    }

    cache = { data: polls.reverse(), ts: now };
    res.status(200).json(polls);
  } catch (e) {
    console.error("API error:", e);
    if (cache) return res.status(200).json(cache.data);
    res.status(500).json({ error: "Failed to fetch polls" });
  }
}
