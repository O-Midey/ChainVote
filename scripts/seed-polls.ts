import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS!;
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY!;

const FACTORY_ABI = ["function createPoll(string metadataCID, string[] options, uint256 durationSeconds) external returns (uint256)"];

const polls = [
  { cid: "bafkreia-tech-stack-2026", opts: ["TypeScript", "Rust", "Python", "Go", "Zig"], dur: 604800 },
  { cid: "bafkreia-best-dapp-idea", opts: ["DeFi Lending", "NFT Marketplace", "Social Network", "On-Chain Gaming", "DAO Tooling"], dur: 259200 },
  { cid: "bafkreia-ai-coding-tools", opts: ["Cursor", "GitHub Copilot", "Claude Code", "Windsurf", "Neovim + no AI"], dur: 432000 },
  { cid: "bafkreia-crypto-sentiment", opts: ["Bull market soon", "Sideways chop", "Bear market ahead"], dur: 259200 },
  { cid: "bafkreia-remote-work-2026", opts: ["Full remote", "Hybrid 2-3 days", "Full office return"], dur: 604800 },
  { cid: "bafkreia-best-l2-scaling", opts: ["Base", "Arbitrum", "Optimism", "zkSync", "Starknet"], dur: 432000 },
];

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org");
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, wallet);

  console.log("Deployer:", wallet.address);
  console.log("Factory:", FACTORY_ADDRESS);

  let nonce = Number(await wallet.getNonce());
  for (const p of polls) {
    const tx = await factory.createPoll(p.cid, p.opts, p.dur, { nonce: nonce++, gasLimit: 500000 });
    console.log(`  Sending: "${p.cid.split("-").slice(1).join(" ")}"...`);
    await tx.wait();
    console.log(`  Confirmed: ${tx.hash}`);
  }

  console.log("\nDone! View at: https://chainvote.vercel.app/polls");
}

main().catch(console.error);
