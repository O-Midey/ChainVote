import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { JsonRpcProvider } from "ethers";
import { fetchCreatorPolls } from "@/lib/polls";
import { Poll } from "@/lib/types";
import { resolveENS, shortAddress } from "@/lib/ens";
import PollCard from "@/components/PollCard";
import { EmptyState, StatCard, SkeletonCard } from "@/components/ui";
import { Copy, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { CURRENT_CHAIN } from "@/utils/contract";

export default function ProfilePage() {
  const router = useRouter();
  const { address } = router.query;
  const [ens, setEns] = useState("");
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address || typeof address !== "string") return;
    resolveENS(address).then(setEns);
    fetchCreatorPolls(new JsonRpcProvider(CURRENT_CHAIN.rpcUrl), address)
      .then(setPolls).finally(() => setLoading(false));
  }, [address]);

  const copy = () => { navigator.clipboard.writeText(address as string); toast.success("Copied"); };
  const totalVotes = polls.reduce((a, p) => a + (p.totalVotes ?? 0), 0);
  const livePolls = polls.filter((p) => Date.now() / 1000 < p.deadline).length;
  if (!address) return null;

  return (
    <div className="min-h-screen bg-[#0d0d12] pt-20">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-start gap-5 mb-10">
          <div className="w-16 h-16 rounded-2xl shrink-0 ring-1 ring-[#f0ede8]/[0.05]" style={{ background: `linear-gradient(135deg, hsl(${parseInt((address as string).slice(2, 6), 16) % 360}, 50%, 40%), hsl(${parseInt((address as string).slice(6, 10), 16) % 360}, 50%, 30%))` }} />
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl font-bold truncate">{ens || shortAddress(address as string)}</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs font-mono text-[#6e6b65] truncate">{address}</span>
              <button onClick={copy} className="text-[#6e6b65] hover:text-[#b0aca4] transition-colors shrink-0"><Copy size={11} /></button>
              <a href={`${CURRENT_CHAIN.explorer}/address/${address}`} target="_blank" rel="noopener noreferrer" className="text-[#6e6b65] hover:text-[#d4a853] transition-colors shrink-0"><ExternalLink size={11} /></a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8 max-w-md">
          <StatCard label="Polls" value={polls.length} />
          <StatCard label="Live" value={livePolls} />
          <StatCard label="Votes" value={totalVotes} />
        </div>

        <h2 className="text-[10px] font-semibold text-[#6e6b65] uppercase tracking-[0.2em] mb-4">Polls created</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : polls.length === 0 ? (
          <EmptyState icon="🗳" title="No polls" description="This address hasn't created any polls." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{polls.map((p) => <PollCard key={p.id} poll={p} />)}</div>
        )}
      </div>
    </div>
  );
}
