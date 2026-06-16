# ChainVote

A decentralized voting application that runs elections fully on-chain — tamper-evident ballots, transparent tallying, and verifiable results. Built with Solidity, Next.js, and ethers.js, deployed on the Sepolia testnet.

## Why ChainVote

Conventional voting systems require trust in a central operator to count honestly and not tamper with results. ChainVote removes that requirement: every vote is a transaction recorded immutably on-chain, the tally is computed by the smart contract itself, and anyone can independently verify the outcome by reading contract state.

## Features

- **One vote per wallet**, enforced at the contract level.
- **On-chain tally** — no off-chain counting; results are computed and stored by the contract.
- **Live results** fetched directly from contract state, no backend needed.
- **MetaMask integration** for wallet connection and transaction signing.
- **Responsive UI** with toast feedback for transaction states (pending, confirmed, reverted).

## Architecture

ChainVote is split into three layers:

**Smart contract layer** — Solidity contract handling voter eligibility, vote casting, and tally storage. Designed with explicit access control and revert-on-double-vote to prevent the most common voting-system attacks.

**Web3 layer** — ethers.js (v6) for contract calls and transaction lifecycle handling, with a typed contract interface generated from the ABI.

**Frontend layer** — Next.js + TypeScript + Tailwind CSS. State is read directly from chain (no centralized API), so the UI cannot misrepresent results.

## Tech Stack

- **Smart contracts:** Solidity, Hardhat
- **Web3:** ethers.js v6, MetaMask
- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Network:** Sepolia testnet

## Contract

- **Network:** Sepolia
- **Address:** `[0x426758c2416B951Fe577638990D14523E093933e]`
- **Verified on Etherscan:** `[https://chain-vote-d-app.vercel.app/]`

## Local development

```bash
git clone https://github.com/O-Midey/ChainVote.git
cd ChainVote
npm install

# Compile contracts
npx hardhat compile

# Run contract tests
npx hardhat test

# Start the frontend
npm run dev
```

You'll need a `.env` file with `SEPOLIA_RPC_URL` and `PRIVATE_KEY` for contract deployment, plus `NEXT_PUBLIC_CONTRACT_ADDRESS` for the frontend.

## Security considerations

- Eligibility and double-vote prevention are enforced in the contract, not the frontend — the UI is untrusted by design.
- Contract uses checks-effects-interactions ordering to avoid reentrancy on state-changing calls.
- All external calls revert on failure rather than silently swallowing errors.

## Roadmap

- Migrate to Foundry for richer testing (fuzz, invariant tests).
- Deploy to Base L2 for production-grade gas economics, with verification on Basescan.
- IPFS-stored proposal metadata for richer ballot content beyond Yes/No.
- Quadratic voting extension as an alternate ballot mode.

## License

MIT
