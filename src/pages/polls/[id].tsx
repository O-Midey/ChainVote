import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { JsonRpcProvider } from "ethers";
import { fetchPoll } from "@/lib/polls";
import { Poll } from "@/lib/types";
import { useWallet } from "@/hooks/useWallet";
import VotePanel from "@/components/VotePanel";
import { Badge, Skeleton, TrustBadge } from "@/components/ui";
import { shortAddress } from "@/lib/ens";
import { timeLeft } from "@/lib/polls";
import { Share2, ExternalLink, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { CURRENT_CHAIN } from "@/utils/contract";

export default function PollDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { wallet, provider } = useWallet();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);

  const getProvider = useCallback(() => {
    if (provider) return provider;
    return new JsonRpcProvider(CURRENT_CHAIN.rpcUrl);
  }, [provider]);

  const load = useCallback(async () => {
    const p = getProvider();
    if (!p || !id) return;
    try {
      setPoll(await fetchPoll(p, Number(id)));
    } catch {
      toast.error("Failed to load poll.");
    } finally {
      setLoading(false);
    }
  }, [id, getProvider]);

  useEffect(() => { if (id) load(); }, [id, load]);

  const share = () => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d12] pt-20">
        <div className="max-w-2xl mx-auto px-4 py-10 space-y-5">
          <Skeleton height={28} width="65%" />
          <Skeleton height={14} width="45%" />
          <Skeleton height={14} width="80%" />
          <div className="space-y-2 pt-4">{[1, 2, 3].map((i) => <Skeleton key={i} height={46} />)}</div>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-[#0d0d12] flex items-center justify-center text-[#6e6b65]">
        <div className="text-center space-y-3">
          <p className="text-lg">Poll not found.</p>
        </div>
      </div>
    );
  }

  const expired = Date.now() / 1000 > poll.deadline;

  return (
    <div className="min-h-screen bg-[#0d0d12] pt-20">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Badge variant={expired ? "red" : "green"} dot>{expired ? "Ended" : "Live"}</Badge>
            <span className="text-[11px] text-[#6e6b65] flex items-center gap-1"><Clock size={10} />{timeLeft(poll.deadline)}</span>
            <TrustBadge label="On-chain" />
            <span className="text-[10px] text-[#6e6b65]">Poll #{poll.id}</span>
          </div>

          <h1 className="font-display text-2xl font-bold leading-tight tracking-tight mb-2">
            {poll.metadata?.title ?? `Poll #${poll.id}`}
          </h1>

          {poll.metadata?.description && (
            <p className="text-[#b0aca4] text-sm leading-relaxed mb-4">{poll.metadata.description}</p>
          )}

          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs text-[#6e6b65]">
              <span>Created by</span>
              <a href={`/profile/${poll.creator}`} className="text-[#b0aca4] hover:text-[#f0ede8] font-mono transition-colors">
                {shortAddress(poll.creator)}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={share} className="flex items-center gap-1.5 text-[11px] text-[#6e6b65] hover:text-[#b0aca4] border border-[#f0ede8]/[0.06] hover:border-[#f0ede8]/[0.12] px-3 py-1.5 rounded-lg transition-all duration-150">
                <Share2 size={11} /> Share
              </button>
              <a href={`${CURRENT_CHAIN.explorer}/address/${process.env.NEXT_PUBLIC_FACTORY_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] text-[#6e6b65] hover:text-[#b0aca4] border border-[#f0ede8]/[0.06] hover:border-[#f0ede8]/[0.12] px-3 py-1.5 rounded-lg transition-all duration-150">
                <ExternalLink size={11} /> Contract
              </a>
            </div>
          </div>
        </div>

        <VotePanel poll={poll} wallet={wallet} provider={getProvider()} onVoted={load} />
      </div>
    </div>
  );
}
