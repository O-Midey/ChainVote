import { useState } from "react";
import { motion } from "framer-motion";
import PollCard from "@/components/PollCard";
import { EmptyState, SkeletonCard } from "@/components/ui";
import Reveal from "@/components/Reveal";
import { Search, RefreshCw } from "lucide-react";
import { usePolls } from "@/hooks/usePolls";

type Filter = "all" | "live" | "ended";
const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" as const } } };

export default function PollsPage() {
  const { polls, loading, error, refetch } = usePolls();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const now = Date.now() / 1000;
  const filtered = polls.filter((p) => {
    const ms = !search || (p.metadata?.title?.toLowerCase().includes(search.toLowerCase()) ?? false);
    return ms && (filter === "all" || (filter === "live" ? now < p.deadline : now >= p.deadline));
  });

  return (
    <div className="min-h-screen bg-[#0d0d12] pt-20">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold mb-1">Browse polls</h1>
              <p className="text-[#6e6b65] text-sm">
                {polls.length} polls · refreshed every 30s
              </p>
            </div>
            <button
              onClick={refetch}
              className="flex items-center gap-1.5 text-[11px] text-[#6e6b65] hover:text-[#b0aca4] transition-colors"
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6e6b65]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search polls…" className="w-full bg-[#f0ede8]/[0.02] border border-[#f0ede8]/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#f0ede8] placeholder-[#6e6b65] focus:outline-none focus:border-[#d4a853]/30 transition-all duration-150" />
          </div>
          <div className="flex gap-1 bg-[#f0ede8]/[0.02] border border-[#f0ede8]/[0.06] rounded-xl p-1">
            {(["all", "live", "ended"] as Filter[]).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-150 ${filter === f ? "bg-[#f0ede8]/[0.08] text-[#f0ede8]" : "text-[#6e6b65] hover:text-[#b0aca4]"}`}>{f}</button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : error ? (
          <EmptyState icon="⚠" title="Could not load polls" description="The network may be rate-limited. Try refreshing." action={<button onClick={refetch} className="bg-[#d4a853] hover:bg-[#e0bb64] text-[#0d0d12] text-sm font-semibold px-5 py-2 rounded-lg">Retry</button>} />
        ) : filtered.length === 0 ? (
          <EmptyState icon="🗳" title="No polls" description={search ? "Try a different search." : "Create the first poll."} />
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p, idx) => (
              <motion.div key={p.id} variants={item}>
                <Reveal delay={Math.min(idx % 5, 4) as 0 | 1 | 2 | 3 | 4}>
                  <PollCard poll={p} />
                </Reveal>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
