import { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { fetchCreatorPolls } from "@/lib/polls";
import { Poll } from "@/lib/types";
import PollCard from "@/components/PollCard";
import { EmptyState, StatCard, SkeletonCard } from "@/components/ui";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { wallet, provider, isCorrectNetwork, connect } = useWallet();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!wallet || !provider) return;
    setLoading(true);
    fetchCreatorPolls(provider, wallet).then(setPolls).finally(() => setLoading(false));
  }, [wallet, provider]);

  const totalVotes = polls.reduce((a, p) => a + (p.totalVotes ?? 0), 0);
  const livePolls = polls.filter((p) => Date.now() / 1000 < p.deadline).length;

  if (!wallet) {
    return (
      <div className="min-h-screen bg-[#0d0d12] flex items-center justify-center px-4">
        <div className="text-center space-y-5">
          <p className="font-display text-xl font-semibold">Connect your wallet</p>
          <p className="text-[#6e6b65] text-sm max-w-xs mx-auto">Dashboard shows your polls and their performance.</p>
          <button onClick={connect} className="bg-[#d4a853] hover:bg-[#e0bb64] text-[#0d0d12] text-sm font-semibold px-6 py-2.5 rounded-lg transition-all duration-200">Connect</button>
        </div>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="min-h-screen bg-[#0d0d12] flex items-center justify-center px-4 text-center">
        <div className="space-y-4">
          <p className="font-display text-xl font-semibold">Wrong network</p>
          <p className="text-[#6e6b65] text-sm">Switch to Base Sepolia.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d12] pt-20">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Dashboard</h1>
            <p className="text-[#6e6b65] text-sm">Your polls</p>
          </div>
          <Link href="/create" className="flex items-center gap-1.5 bg-[#d4a853] hover:bg-[#e0bb64] text-[#0d0d12] text-xs font-semibold px-4 py-2 rounded-lg transition-colors"><Plus size={12} /> New</Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Total" value={polls.length} />
          <StatCard label="Live" value={livePolls} />
          <StatCard label="Votes" value={totalVotes} />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : polls.length === 0 ? (
          <EmptyState icon="🗳" title="No polls yet" description="Create your first on-chain poll." action={<Link href="/create" className="bg-[#d4a853] hover:bg-[#e0bb64] text-[#0d0d12] text-sm font-semibold px-5 py-2 rounded-lg transition-all duration-200">Create</Link>} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{polls.map((p) => <PollCard key={p.id} poll={p} />)}</div>
        )}
      </div>
    </div>
  );
}
