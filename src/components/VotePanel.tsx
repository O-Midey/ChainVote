import { useState, useEffect, useCallback } from "react";
import { BrowserProvider, JsonRpcProvider } from "ethers";
import { getFactory } from "@/utils/contract";
import { Poll } from "@/lib/types";
import { timeLeft } from "@/lib/polls";
import { shortAddress } from "@/lib/ens";
import { Badge, Card, Spinner, Divider, TrustBadge, ProgressBar, Skeleton } from "./ui";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Download, Clock, Users, Activity, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { CURRENT_CHAIN } from "@/utils/contract";

const COLORS = ["#d4a853", "#5a9e6f", "#8b7e74", "#c85a54", "#6b8fae", "#9b7eb8", "#b0886a", "#5c8a7a", "#a07a5e", "#7a8fa0"];

interface Props {
  poll: Poll;
  wallet: string;
  provider: BrowserProvider | JsonRpcProvider | null;
  onVoted: () => void;
}

function fireConfetti() {
  const colors = ["#d4a853", "#5a9e6f", "#c85a54", "#8b7e74", "#6b8fae", "#9b7eb8"];
  for (let i = 0; i < 35; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.top = `${Math.random() * 40}vh`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = `${4 + Math.random() * 8}px`;
    piece.style.height = `${4 + Math.random() * 8}px`;
    piece.style.animationDuration = `${0.8 + Math.random() * 1.4}s`;
    piece.style.animationDelay = `${Math.random() * 0.3}s`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 2000);
  }
}

export default function VotePanel({ poll, wallet, provider, onVoted }: Props) {
  const [results, setResults] = useState<number[]>(poll.results ?? []);
  const [hasVoted, setHasVoted] = useState(false);
  const [userChoice, setUserChoice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [voters, setVoters] = useState<{ address: string; option: string; txHash?: string }[]>([]);

  const total = results.reduce((a, b) => a + b, 0);
  const expired = Date.now() / 1000 > poll.deadline;

  const checkVoted = useCallback(async () => {
    if (!provider || !wallet) { setChecking(false); return; }
    try {
      const contract = getFactory(provider);
      const voted = await contract.hasVoted(poll.id, wallet);
      setHasVoted(voted);
      if (voted) setUserChoice(Number(await contract.voterChoice(poll.id, wallet)));
    } catch { /* ignore */ }
    setChecking(false);
  }, [provider, wallet, poll.id]);

  useEffect(() => { checkVoted(); }, [checkVoted]);

  useEffect(() => {
    if (!provider) return;
    const contract = getFactory(provider);
    (async () => {
      try {
        const filter = contract.filters.VoteCast(poll.id);
        const events = await contract.queryFilter(filter);
        const history = (events as unknown as Array<{ args: { voter: string; optionIndex: bigint }; transactionHash: string }>)
          .map((e) => ({
            address: e.args.voter,
            option: poll.options[Number(e.args.optionIndex)] ?? "?",
            txHash: e.transactionHash,
          }));
        setVoters(history.reverse());
      } catch {}
    })();
  }, [provider, poll.id, poll.options]);

  useEffect(() => {
    if (!provider) return;
    const contract = getFactory(provider);
    const onVoteCast = (pollId: bigint, voter: string, optionIndex: bigint, event: { log?: { transactionHash?: string } }) => {
      if (Number(pollId) !== poll.id) return;
      setResults((prev) => { const n = [...prev]; n[Number(optionIndex)]++; return n; });
      setVoters((prev) => [{ address: voter, option: poll.options[Number(optionIndex)] ?? "?", txHash: event?.log?.transactionHash }, ...prev]);
    };
    contract.on("VoteCast", onVoteCast);
    return () => { contract.off("VoteCast", onVoteCast); };
  }, [provider, poll.id, poll.options]);

  const vote = async (optionIndex: number) => {
    if (!provider || !wallet || loading || hasVoted || expired) return;
    setLoading(true);
    const toastId = toast.loading("Submitting vote…");
    setResults((prev) => { const n = [...prev]; n[optionIndex]++; return n; });
    setHasVoted(true);
    setUserChoice(optionIndex);
    try {
      const signer = await provider.getSigner();
      const contract = getFactory(signer);
      const tx = await contract.castVote(poll.id, optionIndex);
      await tx.wait();
      fireConfetti();
      toast.success(
        <span>
          Voted: <strong>{poll.options[optionIndex]}</strong>
          <br />
          <a href={`${CURRENT_CHAIN.explorer}/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#d4a853] hover:underline flex items-center gap-1 mt-0.5">
            Verify on Basescan <ExternalLink size={10} />
          </a>
        </span>,
        { id: toastId, duration: 5000 }
      );
      onVoted();
    } catch (err: unknown) {
      setResults((prev) => { const n = [...prev]; n[optionIndex]--; return n; });
      setHasVoted(false);
      setUserChoice(null);
      const msg = (err as { reason?: string })?.reason ?? "";
      toast.error(msg.includes("Already") ? "Already voted." : "Transaction failed.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const rows = [["Option", "Votes", "%"]];
    poll.options.forEach((opt, i) => rows.push([opt, String(results[i] ?? 0), total > 0 ? `${((results[i] / total) * 100).toFixed(1)}%` : "0%"]));
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `votechain-poll-${poll.id}.csv`;
    a.click();
  };

  const chartData = poll.options.map((opt, i) => ({
    name: opt.length > 14 ? opt.slice(0, 14) + "…" : opt,
    votes: results[i] ?? 0,
  }));

  if (checking && wallet) {
    return (
      <div className="space-y-4">
        <Skeleton height={18} width="55%" />
        <div className="space-y-2">{poll.options.map((_, i) => <Skeleton key={i} height={46} />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={expired ? "red" : "green"}>{expired ? "Ended" : "Live"}</Badge>
          <span className="text-[11px] text-[#6e6b65] flex items-center gap-1"><Clock size={10} />{timeLeft(poll.deadline)}</span>
          <span className="text-[11px] text-[#6e6b65] flex items-center gap-1"><Users size={10} />{total} votes</span>
        </div>
        <div className="flex items-center gap-2">
          <TrustBadge label="On-chain" />
          {poll.sponsored && (
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#5a9e6f] bg-[#5a9e6f]/[0.06] border border-[#5a9e6f]/[0.12] px-2.5 py-1 rounded-full">
              <span className="w-1 h-1 rounded-full bg-[#5a9e6f]" />
              Free to vote
            </span>
          )}
          <button onClick={exportCSV} className="flex items-center gap-1.5 text-[11px] text-[#6e6b65] hover:text-[#b0aca4] transition-colors">
            <Download size={11} /> CSV
          </button>
        </div>
      </div>

      {!expired && (
        <div className="space-y-2">
          {poll.options.map((opt, i) => {
            const pct = total > 0 ? Math.round(((results[i] ?? 0) / total) * 100) : 0;
            const isChosen = userChoice === i;
            return (
              <button
                key={i}
                onClick={() => vote(i)}
                disabled={loading || hasVoted || !wallet || expired}
                className={`relative w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-200 overflow-hidden disabled:cursor-not-allowed
                  ${isChosen ? "border-[#d4a853]/40 text-[#f0ede8] bg-[#d4a853]/[0.05]" : hasVoted ? "border-[#f0ede8]/[0.03] text-[#6e6b65] cursor-default" : "border-[#f0ede8]/[0.07] text-[#b0aca4] hover:border-[#f0ede8]/[0.15] hover:text-[#f0ede8]"}`}
              >
                {hasVoted && (
                  <div className="absolute inset-0 opacity-[0.06] transition-all duration-700 ease-out" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                )}
                <div className="relative flex items-center justify-between">
                  <span className="truncate mr-3">{opt}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {hasVoted && <span className="text-[11px] font-mono" style={{ color: COLORS[i % COLORS.length] }}>{pct}%</span>}
                    {isChosen && <span className="text-[11px] text-[#d4a853] font-medium">Your vote</span>}
                  </div>
                </div>
              </button>
            );
          })}
          {!wallet && <p className="text-center text-[11px] text-[#6e6b65] pt-1">Connect wallet to vote.</p>}
        </div>
      )}

      {total > 0 && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-semibold text-[#6e6b65] uppercase tracking-[0.15em] flex items-center gap-1.5">
              <Activity size={11} /> Results
            </h3>
            <span className="text-[9px] text-[#6e6b65]">On-chain data</span>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={chartData} barSize={28}>
              <XAxis dataKey="name" tick={{ fill: "#6e6b65", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#1f1f28", border: "1px solid rgba(240,237,232,0.08)", borderRadius: 8, fontSize: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}
                labelStyle={{ color: "#b0aca4", fontWeight: 600, marginBottom: 4 }}
                cursor={{ fill: "rgba(240,237,232,0.02)" }}
                formatter={(v) => [`${String(v)} vote${Number(v) !== 1 ? "s" : ""}`, ""]}
              />
              <Bar dataKey="votes" radius={[5, 5, 0, 0]} maxBarSize={36}>
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <Divider className="my-4" />
          <div className="space-y-2.5">
            {poll.options.map((opt, i) => {
              const pct = total > 0 ? ((results[i] ?? 0) / total) * 100 : 0;
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-[#b0aca4] font-medium truncate mr-3">{opt}</span>
                    <span className="text-[#6e6b65] font-mono text-[11px] shrink-0">{results[i] ?? 0} ({pct.toFixed(1)}%)</span>
                  </div>
                  <ProgressBar value={pct} color={COLORS[i % COLORS.length]} />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {voters.length > 0 && (
        <Card className="p-5">
          <h3 className="text-[10px] font-semibold text-[#6e6b65] uppercase tracking-[0.15em] mb-3 flex items-center gap-1.5">
            <Activity size={11} /> Recent votes
          </h3>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {voters.slice(0, 25).map((v, i) => (
              <div key={i} className="flex items-center justify-between text-[12px] group py-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-full shrink-0" style={{ background: `linear-gradient(135deg, hsl(${parseInt(v.address.slice(2, 6), 16) % 360}, 50%, 40%), hsl(${parseInt(v.address.slice(6, 10), 16) % 360}, 50%, 30%))` }} />
                  <span className="font-mono text-[#6e6b65] text-[11px] truncate">{shortAddress(v.address)}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[#b0aca4] text-[12px]">{v.option}</span>
                  {v.txHash && (
                    <a href={`${CURRENT_CHAIN.explorer}/tx/${v.txHash}`} target="_blank" rel="noopener noreferrer" className="text-[#6e6b65] hover:text-[#d4a853] transition-colors opacity-0 group-hover:opacity-100">
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {loading && <div className="flex justify-center py-2"><Spinner size={16} /></div>}
    </div>
  );
}
