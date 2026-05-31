import Link from "next/link";
import { useRouter } from "next/router";
import { useWallet } from "@/hooks/useWallet";
import WalletConnect from "@/components/WalletConnect";
import { Plus, LayoutDashboard, Vote } from "lucide-react";
import { CURRENT_CHAIN } from "@/utils/contract";

export default function Navbar() {
  const { wallet, isCorrectNetwork, connect, disconnect } = useWallet();
  const router = useRouter();

  const navLinks = [
    { href: "/polls", label: "Browse", icon: <Vote size={14} /> },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={14} />,
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#f0ede8]/[0.05] bg-[#0d0d12]/80 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold text-[#f0ede8] text-sm tracking-tight group"
        >
          <span className="font-display text-lg font-bold italic text-[#d4a853]">
            V
          </span>
          <span className="hidden sm:inline font-display tracking-wide">
            ChainVote
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                router.pathname.startsWith(l.href)
                  ? "text-[#f0ede8] bg-[#f0ede8]/[0.06]"
                  : "text-[#6e6b65] hover:text-[#b0aca4] hover:bg-[#f0ede8]/[0.03]"
              }`}
            >
              {l.icon}
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          <a
            href={`${CURRENT_CHAIN.explorer}/address/${process.env.NEXT_PUBLIC_FACTORY_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:block text-[10px] font-semibold uppercase tracking-widest text-[#5a9e6f] bg-[#5a9e6f]/[0.05] border border-[#5a9e6f]/[0.12] px-2.5 py-1 rounded-full hover:opacity-80 transition-opacity"
          >
            Verified
          </a>

          {wallet && (
            <Link
              href="/create"
              className="hidden sm:flex items-center gap-1.5 bg-[#d4a853] hover:bg-[#e0bb64] text-[#0d0d12] text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={12} /> New
            </Link>
          )}
          <WalletConnect
            wallet={wallet}
            isCorrectNetwork={isCorrectNetwork}
            onConnect={connect}
            onDisconnect={disconnect}
            onProfile={() => router.push(`/profile/${wallet}`)}
          />
        </div>
      </div>
    </header>
  );
}
