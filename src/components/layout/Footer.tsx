import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CURRENT_CHAIN } from "@/utils/contract";

export default function Footer() {
  return (
    <footer className="border-t border-[#f0ede8]/[0.05] bg-[#0d0d12]">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pb-8 border-b border-[#f0ede8]/[0.04]">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-display text-lg font-bold italic text-[#d4a853]">
                V
              </span>
              <span className="text-[#f0ede8] font-display font-semibold text-sm tracking-wide">
                ChainVote
              </span>
            </div>
            <p className="text-[#6e6b65] text-xs leading-relaxed max-w-xs">
              On-chain voting on Base. Every vote is a transaction. Every result
              is independently verifiable.
            </p>
          </div>
          <div>
            <p className="text-[#b0aca4] font-semibold text-[10px] uppercase tracking-widest mb-3">
              Product
            </p>
            <div className="space-y-2">
              <Link
                href="/polls"
                className="block text-[#6e6b65] hover:text-[#b0aca4] text-xs transition-colors"
              >
                Browse polls
              </Link>
              <Link
                href="/create"
                className="block text-[#6e6b65] hover:text-[#b0aca4] text-xs transition-colors"
              >
                Create a poll
              </Link>
              <Link
                href="/dashboard"
                className="block text-[#6e6b65] hover:text-[#b0aca4] text-xs transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
          <div>
            <p className="text-[#b0aca4] font-semibold text-[10px] uppercase tracking-widest mb-3">
              Built on
            </p>
            <div className="space-y-2">
              <a
                href={`${CURRENT_CHAIN.explorer}/address/${process.env.NEXT_PUBLIC_FACTORY_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#6e6b65] hover:text-[#b0aca4] text-xs transition-colors"
              ></a>
              <a
                href="https://base.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#6e6b65] hover:text-[#b0aca4] text-xs transition-colors"
              >
                <ExternalLink size={10} /> Base L2
              </a>
              <a
                href="https://ipfs.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#6e6b65] hover:text-[#b0aca4] text-xs transition-colors"
              >
                <ExternalLink size={10} /> IPFS
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6">
          <p className="text-[10px] text-[#6e6b65]">
            &copy; {new Date().getFullYear()} ChainVote. All votes on Base.
          </p>
          <div className="flex items-center gap-4 text-[10px] text-[#6e6b65]">
            <a href="#" className="hover:text-[#b0aca4] transition-colors">
              GitHub
            </a>
            <a href="#" className="hover:text-[#b0aca4] transition-colors">
              Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
