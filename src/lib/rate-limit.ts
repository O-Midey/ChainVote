import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Simple in-memory rate limiter for API routes.
 * Limits each IP to `maxRequests` per `windowMs` milliseconds.
 */
const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  maxRequests: number = 10,
  windowMs: number = 60_000
): boolean {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
    || req.socket.remoteAddress
    || "unknown";

  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  entry.count++;
  if (entry.count > maxRequests) {
    res.status(429).json({ error: "Too many requests. Try again later." });
    return false;
  }

  return true;
}

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of hits) {
      if (now > entry.resetAt) hits.delete(ip);
    }
  }, 300_000);
}
