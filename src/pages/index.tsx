import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { CURRENT_CHAIN } from "@/utils/contract";

const steps = [
  {
    num: "01",
    title: "Connect your wallet.",
    body: "Sign in with Ethereum. No email, no password, no account. Just your wallet and a cryptographic signature. We never see your keys.",
  },
  {
    num: "02",
    title: "Create a poll — or vote on one.",
    body: "Write a question, add options, set a deadline. Metadata goes to IPFS; the poll lives on Base. Or browse what others have created and cast your vote.",
  },
  {
    num: "03",
    title: "Every vote is a transaction.",
    body: "When you vote, you sign a transaction. It gets included in a block. It's permanent. Anyone can verify the tally by reading the chain directly.",
  },
  {
    num: "04",
    title: "Results are public. Forever.",
    body: "No one can delete a poll. No one can edit a result. The contract has no admin keys. What's recorded is recorded. That's the whole point.",
  },
];

const guarantees = [
  {
    title: "No hidden admin.",
    body: "The contract has no owner functions, no upgrade mechanism, no kill switch. Once deployed, it runs exactly as written. We couldn't change a result if we wanted to.",
  },
  {
    title: "Public audit trail.",
    body: "Every vote emits an event. Every event is indexed on Base. You can verify the tally yourself using Basescan or any Ethereum RPC node. No trust required.",
  },
  {
    title: "You hold the keys.",
    body: "We never custody your wallet. Voting happens directly from your address. Sign-In with Ethereum means you prove ownership without sharing secrets.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0d0d12] text-[#f0ede8] overflow-x-hidden">
      {/* ========== GLOBAL STYLES FOR SCROLL REVEAL ========== */}
      <style>{`
        .reveal-section {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-section.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }
        .reveal-delay-4 { transition-delay: 0.4s; }

        @keyframes draw-line {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        .line-draw {
          transform-origin: top;
          animation: draw-line 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .float-slow {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* Reveal observer script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function(){
            if (typeof window === 'undefined') return;
            var observer = new IntersectionObserver(function(entries){
              entries.forEach(function(e){
                if (e.isIntersecting) e.target.classList.add('visible');
              });
            }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
            document.addEventListener('DOMContentLoaded', function(){
              document.querySelectorAll('.reveal-section').forEach(function(el){ observer.observe(el); });
            });
            // Also observe immediately for SSR
            setTimeout(function(){
              document.querySelectorAll('.reveal-section').forEach(function(el){ observer.observe(el); });
            }, 100);
          })();
        `,
        }}
      />

      <div className="relative">
        {/* ===== HERO ===== */}
        <section className="mx-auto max-w-3xl px-6 pt-44 pb-20 text-center relative">
          {/* Floating V logomark */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-none select-none">
            <span className="font-display text-[12rem] font-bold italic text-[#d4a853]/[0.03] float-slow block leading-none">
              V
            </span>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 text-[#6e6b65] text-[11px] uppercase tracking-[0.25em] font-semibold mb-12 reveal-section">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4a853] animate-pulse" />
              Deployed on Base
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-8 reveal-section reveal-delay-1">
              Every vote should
              <br />
              <span className="italic text-[#d4a853]">leave a mark.</span>
            </h1>

            <p className="text-[#b0aca4] text-lg max-w-lg mx-auto leading-relaxed mb-12 font-light reveal-section reveal-delay-2">
              Most polls live in someone else&apos;s database — editable,
              deletable, deniable. ChainVote puts every vote on-chain.
              Immutable. Verifiable. Yours.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap reveal-section reveal-delay-3">
              <Link
                href="/create"
                className="group inline-flex items-center gap-2 bg-[#d4a853] hover:bg-[#e0bb64] text-[#0d0d12] font-semibold px-7 py-3.5 rounded-lg transition-all duration-300 text-sm relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Create a poll
                  <ArrowRight
                    size={15}
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  />
                </span>
              </Link>
              <Link
                href="/polls"
                className="inline-flex items-center gap-2 text-[#b0aca4] border border-[#f0ede8]/10 hover:border-[#f0ede8]/20 hover:text-[#f0ede8] px-7 py-3.5 rounded-lg transition-all duration-300 text-sm"
              >
                Browse polls
              </Link>
            </div>
          </div>
        </section>

        {/* ===== DIVIDER — thin amber line ===== */}
        <div className="mx-auto max-w-3xl px-6 pb-28">
          <div className="flex items-center gap-4 reveal-section">
            <div className="h-px flex-1 bg-[#f0ede8]/[0.04]" />
            <div className="h-px flex-1 bg-[#f0ede8]/[0.04]" />
          </div>
        </div>

        {/* ===== HOW IT WORKS — timeline structure ===== */}
        <section className="mx-auto max-w-3xl px-6 pb-32">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#6e6b65] mb-16 text-center reveal-section">
            How it works
          </p>

          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-[23px] top-2 bottom-0 w-px bg-[#f0ede8]/[0.05] hidden md:block line-draw"
              style={{ animationDelay: "0.3s" }}
            />

            <div className="space-y-20">
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  className={`flex gap-6 md:gap-10 reveal-section reveal-delay-${i}`}
                >
                  {/* Number dot */}
                  <div className="relative shrink-0">
                    <div className="w-[47px] h-[47px] rounded-full border-2 border-[#f0ede8]/[0.08] flex items-center justify-center bg-[#0d0d12] relative z-10">
                      <span className="font-display text-sm font-bold text-[#d4a853]">
                        {step.num}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2.5">
                    <h3 className="font-display text-xl font-semibold text-[#f0ede8] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[#b0aca4] text-sm leading-relaxed max-w-lg">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== PULL QUOTE — dramatic section ===== */}
        <section className="mx-auto max-w-3xl px-6 pb-32">
          <div className="border-l-2 border-[#d4a853]/30 pl-8 py-2 reveal-section">
            <div className="flex gap-2 mb-6">
              {[1, 2, 3].map((n) => (
                <span
                  key={n}
                  className="w-1 h-1 rounded-full bg-[#d4a853]/50"
                />
              ))}
            </div>
            <blockquote className="font-display text-2xl md:text-3xl font-semibold italic text-[#f0ede8] leading-relaxed mb-6">
              &ldquo;The best way to prove a vote wasn&apos;t tampered with is
              to make tampering mathematically impossible.&rdquo;
            </blockquote>
            <p className="text-[#6e6b65] text-sm max-w-xl">
              That&apos;s why ChainVote doesn&apos;t use databases. Every poll
              runs on a smart contract. Every vote is a transaction. Every
              result is computed from on-chain state — not from a server you
              have to trust.
            </p>
          </div>
        </section>

        {/* ===== GUARANTEES — card grid with amber top border ===== */}
        <section className="mx-auto max-w-3xl px-6 pb-32">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#6e6b65] mb-16 text-center reveal-section">
            What we guarantee
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guarantees.map((g, i) => (
              <div
                key={g.title}
                className={`group relative bg-[#16161d] border border-[#f0ede8]/[0.05] rounded-xl p-6 hover:border-[#d4a853]/15 transition-all duration-300 reveal-section reveal-delay-${i}`}
              >
                {/* Amber top accent */}
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#d4a853]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <h3 className="font-display text-lg font-semibold text-[#f0ede8] mb-3">
                  {g.title}
                </h3>
                <p className="text-[#b0aca4] text-sm leading-relaxed">
                  {g.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== STATS STRIP ===== */}
        <section className="mx-auto max-w-2xl px-6 pb-32">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 reveal-section">
            {[
              { v: "Base L2", l: "Network" },
              { v: "~2 sec", l: "Finality" },
              { v: "< $0.01", l: "Per vote" },
              { v: "IPFS", l: "Storage" },
            ].map((s) => (
              <div
                key={s.l}
                className="text-center p-5 rounded-xl bg-[#16161d] border border-[#f0ede8]/[0.04] hover:border-[#d4a853]/15 transition-all duration-300 group"
              >
                <p className="font-display text-lg font-bold text-[#f0ede8]">
                  {s.v}
                </p>
                <p className="text-[#6e6b65] text-[10px] uppercase tracking-widest mt-1 font-semibold group-hover:text-[#d4a853]/70 transition-colors">
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="mx-auto max-w-2xl px-6 pb-40 text-center">
          <div className="reveal-section">
            <h2 className="font-display text-2xl md:text-4xl font-bold text-[#f0ede8] mb-4 leading-tight">
              Your voice,
              <br />
              <span className="italic text-[#d4a853]">on the record.</span>
            </h2>
            <p className="text-[#b0aca4] text-sm max-w-md mx-auto mb-10 leading-relaxed">
              Create a poll in 60 seconds. Connect your wallet, write a
              question, and put it on Base. It costs less than a cent. It lasts
              forever.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/create"
                className="group inline-flex items-center gap-2 bg-[#d4a853] hover:bg-[#e0bb64] text-[#0d0d12] font-semibold px-7 py-3.5 rounded-lg transition-all duration-300 text-sm"
              >
                Get started
                <ArrowRight
                  size={15}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </Link>
              <a
                href={`${CURRENT_CHAIN.explorer}/address/${process.env.NEXT_PUBLIC_FACTORY_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#6e6b65] hover:text-[#b0aca4] text-sm transition-colors"
              >
                <ExternalLink size={14} /> View contract
              </a>
            </div>
          </div>
        </section>

        {/* ===== FLOATING "V" — bottom ===== */}
        <div className="absolute bottom-0 right-0 pointer-events-none select-none overflow-hidden opacity-[0.02]">
          <span className="font-display text-[20rem] font-bold italic text-[#d4a853] block leading-none -mb-16 -mr-8">
            V
          </span>
        </div>
      </div>
    </div>
  );
}
