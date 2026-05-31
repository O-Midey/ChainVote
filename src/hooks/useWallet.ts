import { useState, useEffect, useCallback } from "react";
import { BrowserProvider } from "ethers";
import { SiweMessage } from "siwe";
import toast from "react-hot-toast";
import { CURRENT_CHAIN } from "@/utils/contract";

// Minimal MetaMask provider type
interface EthereumProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on(event: string, handler: (...args: unknown[]) => void): void;
  removeListener(event: string, handler: (...args: unknown[]) => void): void;
}
declare global { interface Window { ethereum?: EthereumProvider; } }

export function useWallet() {
  const [wallet, setWallet] = useState("");
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  const checkNetwork = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !window.ethereum) return false;
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    const correct = chainId === CURRENT_CHAIN.chainId;
    setIsCorrectNetwork(correct);
    return correct;
  }, []);

  const switchToBase = async () => {
    try {
      await window.ethereum!.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CURRENT_CHAIN.chainId }],
      });
    } catch (err: unknown) {
      if ((err as { code?: number })?.code === 4902) {
        const chainParams: Record<string, unknown> = {
          chainId: CURRENT_CHAIN.chainId,
          chainName: CURRENT_CHAIN.name,
          nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
          rpcUrls: [CURRENT_CHAIN.rpcUrl],
        };
        if (CURRENT_CHAIN.explorer) {
          chainParams.blockExplorerUrls = [CURRENT_CHAIN.explorer];
        }
        await window.ethereum!.request({
          method: "wallet_addEthereumChain",
          params: [chainParams],
        });
      } else {
        toast.error(`Please switch to ${CURRENT_CHAIN.name} in your wallet.`);
      }
    }
  };

  const signIn = async (p: BrowserProvider, address: string) => {
    try {
      const { nonce } = await fetch("/api/auth/nonce").then((r) => r.json());
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to ChainVote",
        uri: window.location.origin,
        version: "1",
        chainId: CURRENT_CHAIN.chainIdNum,
        nonce,
      });
      const signer = await p.getSigner();
      const signature = await signer.signMessage(message.prepareMessage());
      await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.prepareMessage(), signature }),
      });
    } catch {
      // Non-blocking
    }
  };

  const connect = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      toast.error("Wallet not detected. Please install MetaMask or use email login.");
      return;
    }
    const correct = await checkNetwork();
    if (!correct) { await switchToBase(); return; }

    try {
      const p = new BrowserProvider(window.ethereum);
      const signer = await p.getSigner();
      const address = await signer.getAddress();
      setProvider(p);
      setWallet(address);
      await signIn(p, address);
    } catch {
      toast.error("Failed to connect wallet.");
    }
  };

  const disconnect = useCallback(async () => {
    setWallet("");
    setProvider(null);
    setIsCorrectNetwork(false);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const list = accounts as string[];
      if (list.length === 0) disconnect();
      else setWallet(list[0]);
    };

    const handleChainChanged = () => {
      checkNetwork();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, [checkNetwork, disconnect]);

  return { wallet, provider, isCorrectNetwork, connect, disconnect };
}
