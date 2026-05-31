import { ethers } from "ethers";

const FACTORY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const FACTORY_ABI = [
  { inputs: [{ internalType: "string", name: "metadataCID", type: "string" }, { internalType: "string[]", name: "options", type: "string[]" }, { internalType: "uint256", name: "durationSeconds", type: "uint256" }], name: "createPoll", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "uint256", name: "pollId", type: "uint256" }, { internalType: "uint256", name: "optionIndex", type: "uint256" }], name: "castVote", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "uint256", name: "pollId", type: "uint256" }], name: "fundGasTank", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ internalType: "uint256", name: "pollId", type: "uint256" }], name: "withdrawGasTank", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "uint256", name: "pollId", type: "uint256" }], name: "getResults", outputs: [{ internalType: "uint256[]", name: "counts", type: "uint256[]" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "pollId", type: "uint256" }], name: "getPollOptions", outputs: [{ internalType: "string[]", name: "", type: "string[]" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "address", name: "creator", type: "address" }], name: "getCreatorPolls", outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "pollId", type: "uint256" }], name: "closePoll", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "uint256", name: "pollId", type: "uint256" }], name: "isPollExpired", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "pollCount", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "", type: "uint256" }], name: "polls", outputs: [{ internalType: "uint256", name: "id", type: "uint256" }, { internalType: "address", name: "creator", type: "address" }, { internalType: "string", name: "metadataCID", type: "string" }, { internalType: "uint256", name: "deadline", type: "uint256" }, { internalType: "uint256", name: "createdAt", type: "uint256" }, { internalType: "bool", name: "active", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "", type: "uint256" }, { internalType: "address", name: "", type: "address" }], name: "hasVoted", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "", type: "uint256" }, { internalType: "address", name: "", type: "address" }], name: "voterChoice", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "", type: "uint256" }], name: "gasTank", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "", type: "uint256" }], name: "sponsorshipEnabled", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "view", type: "function" },
];

async function main() {
  const p = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const c = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, p);
  
  console.log("pollCount:", Number(await c.pollCount()));
  console.log("polls(0):", await c.polls(0));
  console.log("getPollOptions(0):", await c.getPollOptions(0));
  console.log("getResults(0):", await c.getResults(0));
  console.log("gasTank(0):", await c.gasTank(0));
}

main().catch(console.error);
