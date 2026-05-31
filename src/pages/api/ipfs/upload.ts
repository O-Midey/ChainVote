import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { rateLimit } from "@/lib/rate-limit";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!rateLimit(req, res, 20)) return;
  if (req.method !== "POST") return res.status(405).end();

  const pinataJwt = process.env.PINATA_JWT;
  if (!pinataJwt || pinataJwt === "your_pinata_jwt_here") {
    return res.status(500).json({ error: "IPFS not configured. Set PINATA_JWT in environment." });
  }

  try {
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      { pinataContent: req.body },
      {
        headers: {
          Authorization: `Bearer ${pinataJwt}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );
    res.status(200).json({ cid: response.data.IpfsHash });
  } catch (err: unknown) {
    const status = axios.isAxiosError(err) ? err.response?.status : 500;
    const message = axios.isAxiosError(err)
      ? String((err.response?.data as Record<string, unknown>)?.error || "IPFS upload failed")
      : "IPFS upload failed";
    console.error("IPFS upload error:", status, message);
    res.status(500).json({ error: message });
  }
}
