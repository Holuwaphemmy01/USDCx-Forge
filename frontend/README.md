# USDCx Integration Studio (Frontend)

Developer-focused toolkit for safe USDCx integrations on Stacks. Explore bridging flows, generate audited-style Clarity escrow/payment contracts, and verify safety issues with automated checks.

## Features
- Flow Playground: visualize ETH→Stacks bridging; ETH balance shows 0 until wallet connects.
- Safe Integration Generator: compose escrow/payment contracts with validated inputs and safe transfer handling.
- Safety Checker: detects missing tx-sender validation and unchecked transfer-like calls; includes a side-by-side Security Diff.

Key implementations:
- UI diff: [SafetyChecker.tsx](file:///c:/Users/Admin/Desktop/USDCx-Forge/frontend/components/analysis/SafetyChecker.tsx)
- Analyzer: [safety-checker.ts](file:///c:/Users/Admin/Desktop/USDCx-Forge/frontend/lib/analysis/safety-checker.ts)
- Bridge balances: [BridgeFlowMap.tsx](file:///c:/Users/Admin/Desktop/USDCx-Forge/frontend/components/dashboard/BridgeFlowMap.tsx)
- Contract generator: [ContractGenerator.tsx](file:///c:/Users/Admin/Desktop/USDCx-Forge/frontend/components/generator/ContractGenerator.tsx)

## Requirements
- Node.js 18+ and npm

## Getting Started
Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Scripts
- dev: start development server
- build: production build
- start: run production build
- lint: run ESLint
- test: run Vitest unit tests

## Notes
- Generate Contract is disabled until beneficiary, arbiter, unlock height, and USDCx trait are provided.
- Deployment actions require wallet connection; generation and analysis do not.
