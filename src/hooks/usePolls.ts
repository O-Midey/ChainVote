import { useEffect, useState, useCallback } from "react";
import { Poll } from "@/lib/types";

/**
 * Fetch polls from the server-side cached API endpoint.
 * Refreshes every 30 seconds automatically.
 */
export function usePolls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPolls = useCallback(async () => {
    try {
      const res = await fetch("/api/polls");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPolls(data);
      setError(null);
    } catch (e) {
      setError("Could not load polls");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolls();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPolls, 30_000);
    return () => clearInterval(interval);
  }, [fetchPolls]);

  return { polls, loading, error, refetch: fetchPolls };
}
