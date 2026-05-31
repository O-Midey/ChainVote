import type { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session";
import { SiweMessage } from "siwe";
import { sessionOptions, SessionData } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!rateLimit(req, res, 10)) return;
  if (req.method !== "POST") return res.status(405).end();

  const { message, signature } = req.body as { message: string; signature: string };
  if (!message || !signature) return res.status(400).json({ error: "message and signature required" });

  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  try {
    const siwe = new SiweMessage(message);
    const { data } = await siwe.verify({ signature, nonce: session.nonce });

    session.address = data.address;
    session.authenticated = true;
    session.nonce = undefined;
    await session.save();

    res.status(200).json({ authenticated: true, address: data.address });
  } catch (err: unknown) {
    session.nonce = undefined;
    await session.save();
    const msg = err instanceof Error ? err.message : "Verification failed";
    res.status(401).json({ error: msg });
  }
}
