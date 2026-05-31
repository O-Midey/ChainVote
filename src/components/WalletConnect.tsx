import { shortAddress } from "@/lib/ens";

interface Props {
  wallet: string;
  isCorrectNetwork: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onProfile: () => void;
}

interface PrivyWindow extends Window {
  __privy?: { login: () => void };
}

export default function WalletConnect({ wallet, isCorrectNetwork, onConnect, onDisconnect, onProfile }: Props) {
  if (!wallet) {
    return (
      <div className="flex items-center gap-2">
        {process.env.NEXT_PUBLIC_PRIVY_APP_ID ? (
          <>
            <button
              onClick={() => { const pw = window as unknown as PrivyWindow; if (pw.__privy) { pw.__privy.login(); } else { onConnect(); } }}
              className="bg-[#f0ede8] hover:bg-white text-[#0d0d12] text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200"
            >
              Sign in
            </button>
            <button
              onClick={onConnect}
              className="bg-[#d4a853] hover:bg-[#e0bb64] text-[#0d0d12] text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200"
            >
              Wallet
            </button>
          </>
        ) : (
          <button
            onClick={onConnect}
            className="bg-[#d4a853] hover:bg-[#e0bb64] text-[#0d0d12] text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200"
          >
            Connect
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {!isCorrectNetwork && (
        <span className="hidden sm:flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#d4a853] bg-[#d4a853]/[0.08] border border-[#d4a853]/[0.15] px-2 py-1 rounded-md">
          Wrong network
        </span>
      )}
      <button
        onClick={onProfile}
        className="flex items-center gap-1.5 text-xs font-mono text-[#b0aca4] bg-[#f0ede8]/[0.04] border border-[#f0ede8]/[0.06] hover:border-[#f0ede8]/[0.14] hover:bg-[#f0ede8]/[0.06] px-3 py-1.5 rounded-lg transition-all duration-150"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#5a9e6f]" />
        {shortAddress(wallet)}
      </button>
      <button onClick={onDisconnect} className="text-[#6e6b65] hover:text-[#c85a54] transition-colors text-xs p-1" title="Disconnect">
        &times;
      </button>
    </div>
  );
}
