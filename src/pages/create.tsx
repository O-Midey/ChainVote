import { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { useWallet } from "@/hooks/useWallet";
import { uploadMetadata } from "@/lib/ipfs";
import { getFactory } from "@/utils/contract";
import { Plus, Trash2, ArrowRight, Clock, Info } from "lucide-react";
import { Card, Spinner, Divider } from "@/components/ui";
import toast from "react-hot-toast";

const DURATIONS = [
  { label: "1 hour", value: 3600 },
  { label: "24 hours", value: 86400 },
  { label: "3 days", value: 259200 },
  { label: "7 days", value: 604800 },
];

export default function CreatePage() {
  const router = useRouter();
  const { wallet, provider, connect } = useWallet();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [duration, setDuration] = useState(86400);
  const [submitting, setSubmitting] = useState(false);

  const addOption = () => { if (options.length < 10) setOptions([...options, ""]); };
  const removeOption = (i: number) => { if (options.length > 2) setOptions(options.filter((_, idx) => idx !== i)); };
  const updateOption = (i: number, val: string) => setOptions(options.map((o, idx) => idx === i ? val : o));
  const valid = title.trim().length > 0 && options.filter((o) => o.trim()).length >= 2;

  const submit = async () => {
    if (!provider || !wallet || !valid) return;
    setSubmitting(true);
    const toastId = toast.loading("Uploading to IPFS…");
    try {
      const cid = await uploadMetadata({ title: title.trim(), description: description.trim() });
      toast.loading("Confirming on Base…", { id: toastId });
      const signer = await provider.getSigner();
      const contract = getFactory(signer);
      const tx = await contract.createPoll(cid, options.filter((o) => o.trim()), duration);
      const receipt = await tx.wait();
      const iface = contract.interface;
      let pollId = 0;
      for (const log of receipt.logs) {
        try { const parsed = iface.parseLog(log); if (parsed?.name === "PollCreated") { pollId = Number(parsed.args.pollId); break; } } catch {}
      }
      toast.success("Poll created.", { id: toastId, duration: 4000 });
      router.push(`/polls/${pollId}`);
    } catch (err: unknown) {
      toast.error((err as { reason?: string })?.reason ?? "Transaction failed.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d12] pt-20">
      <div className="max-w-xl mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-2xl font-bold mb-1">Create a poll</h1>
          <p className="text-[#6e6b65] text-sm">IPFS metadata &middot; On-chain votes</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-4">
          <Card className="p-5">
            <label className="block text-[10px] font-semibold text-[#6e6b65] uppercase tracking-[0.2em] mb-3">Question <span className="text-[#c85a54]">*</span></label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What should we build next?" maxLength={120} className="w-full bg-transparent text-[#f0ede8] placeholder-[#6e6b65] text-sm focus:outline-none" />
            <Divider className="mt-3 mb-2" />
            <p className="text-[10px] text-[#6e6b65]">{title.length}/120</p>
          </Card>

          <Card className="p-5">
            <label className="block text-[10px] font-semibold text-[#6e6b65] uppercase tracking-[0.2em] mb-3">Description <span className="text-[#6e6b65] normal-case font-normal tracking-normal">(optional)</span></label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add context…" rows={3} maxLength={500} className="w-full bg-transparent text-[#f0ede8] placeholder-[#6e6b65] text-sm focus:outline-none resize-none" />
          </Card>

          <Card className="p-5">
            <label className="block text-[10px] font-semibold text-[#6e6b65] uppercase tracking-[0.2em] mb-3">Options <span className="text-[#c85a54]">*</span> <span className="text-[#6e6b65] normal-case font-normal tracking-normal">min 2, max 10</span></label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#6e6b65] w-4 shrink-0 text-center">{i + 1}</span>
                  <input value={opt} onChange={(e) => updateOption(i, e.target.value)} placeholder={`Option ${i + 1}`} className="flex-1 bg-[#f0ede8]/[0.02] border border-[#f0ede8]/[0.06] rounded-lg px-3 py-2.5 text-sm text-[#f0ede8] placeholder-[#6e6b65] focus:outline-none focus:border-[#d4a853]/30 focus:bg-[#f0ede8]/[0.03] transition-all duration-150" />
                  {options.length > 2 && <button onClick={() => removeOption(i)} className="text-[#6e6b65] hover:text-[#c85a54] transition-colors p-1"><Trash2 size={12} /></button>}
                </div>
              ))}
            </div>
            {options.length < 10 && <button onClick={addOption} className="mt-3 flex items-center gap-1.5 text-[11px] text-[#6e6b65] hover:text-[#d4a853] transition-colors font-medium"><Plus size={11} /> Add option</button>}
          </Card>

          <Card className="p-5">
            <label className="block text-[10px] font-semibold text-[#6e6b65] uppercase tracking-[0.2em] mb-3"><Clock size={11} className="inline mr-1.5" />Duration</label>
            <div className="grid grid-cols-4 gap-2">
              {DURATIONS.map((d) => (
                <button key={d.value} onClick={() => setDuration(d.value)} className={`py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 border ${duration === d.value ? "bg-[#d4a853]/[0.08] border-[#d4a853]/30 text-[#d4a853]" : "bg-[#f0ede8]/[0.01] border-[#f0ede8]/[0.05] text-[#6e6b65] hover:border-[#f0ede8]/[0.12] hover:text-[#b0aca4]"}`}>{d.label}</button>
              ))}
            </div>
          </Card>

          <div className="flex items-start gap-2 p-4 rounded-xl bg-[#d4a853]/[0.04] border border-[#d4a853]/[0.08]">
            <Info size={12} className="text-[#d4a853] mt-0.5 shrink-0" />
            <div className="text-[11px] text-[#b0aca4] leading-relaxed">
              <p className="font-medium text-[#f0ede8] mb-0.5">What happens?</p>
              <p>Metadata goes to IPFS. The poll is deployed on Base. Gas cost is ~$0.01&ndash;0.05. Once confirmed, it&apos;s permanent.</p>
            </div>
          </div>

          {!wallet ? (
            <button onClick={connect} className="w-full bg-[#d4a853] hover:bg-[#e0bb64] text-[#0d0d12] font-semibold py-3 rounded-lg transition-all duration-200 text-sm">Connect wallet to create</button>
          ) : (
            <button onClick={submit} disabled={!valid || submitting} className="w-full flex items-center justify-center gap-2 bg-[#f0ede8] text-[#0d0d12] font-semibold py-3 rounded-lg hover:bg-white transition-all duration-200 text-sm disabled:opacity-30 disabled:cursor-not-allowed">
              {submitting ? <><Spinner size={15} /> Creating…</> : <>Create poll <ArrowRight size={14} /></>}
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
