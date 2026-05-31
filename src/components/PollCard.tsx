import Link from "next/link";
import { motion } from "framer-motion";
import { Poll } from "@/lib/types";
import { timeLeft } from "@/lib/polls";
import { Badge } from "./ui";
import { Users, Clock, ArrowUpRight } from "lucide-react";

const COLORS = ["#d4a853", "#5a9e6f", "#c85a54", "#8b7e74", "#6b8fae", "#9b7eb8"];

export default function PollCard({ poll }: { poll: Poll }) {
  const total = poll.totalVotes ?? 0;
  const expired = Date.now() / 1000 > poll.deadline;
  const leadingIdx = poll.results && total > 0 ? poll.results.indexOf(Math.max(...poll.results)) : -1;
  const leading = leadingIdx >= 0 ? poll.options[leadingIdx] : null;

  return (
    <Link href={`/polls/${poll.id}`}>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.15 }}
        className="group relative p-5 bg-[#16161d] border border-[#f0ede8]/[0.05] rounded-xl hover:border-[#d4a853]/20 transition-all duration-200 cursor-pointer flex flex-col min-h-[160px]"
      >
        {/* Title + badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-display font-semibold text-[#f0ede8] text-sm leading-snug line-clamp-2 flex-1">
            {poll.metadata?.title ?? `Poll #${poll.id}`}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant={expired ? "red" : "green"} dot>
              {expired ? "Ended" : "Live"}
            </Badge>
            <ArrowUpRight size={12} className="text-[#6e6b65] group-hover:text-[#d4a853] transition-colors" />
          </div>
        </div>

        {/* Description — fixed height reserved */}
        <div className="mb-4 min-h-[32px]">
          {poll.metadata?.description && (
            <p className="text-[#6e6b65] text-[12px] line-clamp-2 leading-relaxed">{poll.metadata.description}</p>
          )}
        </div>

        {/* Results bar — always reserve space */}
        {total > 0 && poll.results ? (
          <div className="flex gap-0.5 h-1 rounded-full overflow-hidden mb-4">
            {poll.results.map((count, i) => (
              <div
                key={i}
                className="transition-all duration-500 rounded-full"
                style={{ width: `${(count / total) * 100}%`, background: COLORS[i % COLORS.length] }}
              />
            ))}
          </div>
        ) : (
          <div className="h-1 mb-4" />
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between text-[11px] text-[#6e6b65]">
          <span className="flex items-center gap-1.5"><Users size={10} />{total} {total === 1 ? "vote" : "votes"}</span>
          <span className="flex items-center gap-1.5"><Clock size={10} />{timeLeft(poll.deadline)}</span>
        </div>

        {/* Leading row — always present for height consistency */}
        <div className="mt-2.5 pt-2.5 border-t border-[#f0ede8]/[0.03] flex items-center justify-between min-h-[24px]">
          {leading ? (
            <p className="text-[11px] text-[#6e6b65]">
              Leading: <span className="text-[#b0aca4] font-medium">{leading}</span>
            </p>
          ) : (
            <p className="text-[11px] text-[#6e6b65]/40 italic">No votes yet</p>
          )}
          {poll.sponsored && (
            <span className="text-[9px] text-[#5a9e6f]/70 font-semibold uppercase tracking-wider">Free</span>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
