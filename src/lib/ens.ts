import { JsonRpcProvider } from "ethers";

const mainnet = new JsonRpcProvider("https://cloudflare-eth.com");

const cache = new Map<string, string>();

export async function resolveENS(address: string): Promise<string> {
  if (cache.has(address)) return cache.get(address)!;
  try {
    const name = await mainnet.lookupAddress(address);
    const result = name ?? shortAddress(address);
    cache.set(address, result);
    return result;
  } catch {
    return shortAddress(address);
  }
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
