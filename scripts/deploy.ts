import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const artifact = JSON.parse(
  readFileSync(join(__dirname, "..", "artifacts", "contracts", "ChainVote.sol", "ChainVote.json"), "utf-8")
);

async function main() {
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  
  if (!privateKey || privateKey.length < 64) {
    console.error("Set DEPLOYER_PRIVATE_KEY in .env.local first.");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log("Deployer:", wallet.address);

  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    console.error("Wallet has 0 ETH. Get Sepolia ETH from https://www.alchemy.com/faucets/base-sepolia");
    process.exit(1);
  }

  const Factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\nChainVote deployed to:", address);
  console.log("\nCopy this into your .env.local:");
  console.log("NEXT_PUBLIC_FACTORY_ADDRESS=" + address);
}

main().catch((e) => { console.error(e); process.exit(1); });
