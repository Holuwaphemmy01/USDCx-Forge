# USDCx Integration Studio

Developer-focused infrastructure for safe USDCx integrations on Stacks. Includes a Next.js frontend and Clarinet-based smart contracts.

## Features
- Flow Playground: visualize ETH→Stacks bridging with accurate wallet gating (ETH shows 0 until connected).
- Safe Integration Generator: compose audited-style escrow/payment contracts; generation disabled until inputs are valid.
- Safety Checker: deep detection of unsafe transfer-like calls and a side-by-side Security Diff.

## Repository Structure
- frontend: Next.js application with generator, safety checker, and flow map.
- contracts: Clarinet project containing USDCx escrow contract and traits.

## Quickstart
- Frontend
  - Install and run:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
  - Open http://localhost:3000 and use the generator, checker, and flow playground.
- Contracts (Clarinet)
  - Validate and run:
    ```bash
    cd contracts
    clarinet check
    clarinet console
    ```
  - Deploy plan (Devnet/Testnet):
    ```bash
    clarinet deployments generate --devnet
    clarinet deployments apply --devnet
    # or
    clarinet deployments generate --testnet
    clarinet deployments apply --testnet
    ```

## Key Files
- Frontend overview: [frontend/README.md](file:///c:/Users/Admin/Desktop/USDCx-Forge/frontend/README.md)
- Contract docs: [contracts/README.md](file:///c:/Users/Admin/Desktop/USDCx-Forge/contracts/README.md)
- Safety UI: [SafetyChecker.tsx](file:///c:/Users/Admin/Desktop/USDCx-Forge/frontend/components/analysis/SafetyChecker.tsx)
- Analyzer: [safety-checker.ts](file:///c:/Users/Admin/Desktop/USDCx-Forge/frontend/lib/analysis/safety-checker.ts)
- Generator UI: [ContractGenerator.tsx](file:///c:/Users/Admin/Desktop/USDCx-Forge/frontend/components/generator/ContractGenerator.tsx)
- Escrow contract: [usdcx-escrow.clar](file:///c:/Users/Admin/Desktop/USDCx-Forge/contracts/contracts/usdcx-escrow.clar)
- Traits: [traits.clar](file:///c:/Users/Admin/Desktop/USDCx-Forge/contracts/contracts/traits.clar)

## Scripts
- Frontend: dev, build, start, lint, test (Vitest)
- Contracts: managed via Clarinet (check, console, deployments)

## Notes
- Generation and analysis do not require wallet connection; deployment does.
- Do not commit secrets or mnemonics; use local settings files for development.
