import type { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session";
import { generateNonce } from "siwe";
import { sessionOptions, SessionData } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!rateLimit(req, res, 20)) return;
  if (req.method !== "GET") return res.status(405).end();

  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  session.nonce = generateNonce();
  await session.save();

  res.status(200).json({ nonce: session.nonce });
}
