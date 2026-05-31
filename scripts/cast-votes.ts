import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const FACTORY = process.env.NEXT_PUBLIC_FACTORY_ADDRESS!;
const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY!;
const RPC = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";

const ABI = [
  "function castVote(uint256 pollId, uint256 optionIndex) external",
  "function pollCount() view returns (uint256)",
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const deployer = new ethers.Wallet(DEPLOYER_KEY, provider);

  // Generate 30 deterministic wallets from the deployer's key
  // These will be the same every time we run
  const voters: ethers.Wallet[] = [];
  for (let i = 0; i < 30; i++) {
    const pk = ethers.keccak256(ethers.toUtf8Bytes(DEPLOYER_KEY + ":" + i));
    voters.push(new ethers.Wallet(pk, provider));
  }

  const pollCount = Number(await new ethers.Contract(FACTORY, ["function pollCount() view returns (uint256)"], provider).pollCount());
  console.log(`Polls: ${pollCount}, Voters: ${voters.length}`);

  // Check which need funding
  let needFunding = 0;
  for (const v of voters) {
    const bal = await provider.getBalance(v.address);
    if (bal < ethers.parseEther("0.001")) needFunding++;
  }
  
  if (needFunding > 0) {
    console.log(`Funding ${needFunding} unfunded voters...`);
    const FUND = ethers.parseEther("0.012");
    let nonce = Number(await deployer.getNonce());
    for (const v of voters) {
      const bal = await provider.getBalance(v.address);
      if (bal < ethers.parseEther("0.001")) {
        const tx = await deployer.sendTransaction({ to: v.address, value: FUND, nonce: nonce++ });
        await tx.wait();
      }
    }
    console.log("Funding done");
  } else {
    console.log("All voters already funded");
  }

  // Cast votes
  console.log("Casting votes...");
  let done = 0;
  for (let vi = 0; vi < voters.length; vi++) {
    const v = voters[vi];
    const c = new ethers.Contract(FACTORY, ABI, v);
    const vNonce = Number(await v.getNonce());
    for (let pid = 0; pid < pollCount; pid++) {
      const choice = Math.floor(Math.random() * 5); // assume 5 options
      try {
        const tx = await c.castVote(pid, choice, { nonce: vNonce + pid, gasLimit: 200000 });
        await tx.wait();
        done++;
      } catch { /* skip */ }
    }
    if ((vi + 1) % 10 === 0) console.log(`  ${vi + 1}/30 done (${done} votes)`);
  }

  // Results
  console.log(`\n${done} votes cast\n`);
  const factory = new ethers.Contract(FACTORY, [
    "function getResults(uint256) view returns (uint256[])",
    "function getPollOptions(uint256) view returns (string[])",
  ], provider);
  for (let i = 0; i < pollCount; i++) {
    const opts = await factory.getPollOptions(i);
    const res = await factory.getResults(i);
    const total = res.reduce((a: bigint, b: bigint) => a + b, 0n);
    console.log(`  #${i}: ${total} total — ${opts.map((o: string, j: number) => `${o}: ${res[j]}`).join(", ")}`);
  }
}

main().catch(console.error);
