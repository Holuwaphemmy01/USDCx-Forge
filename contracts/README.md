# USDCx Escrow Contract

Developer-oriented documentation for the safe USDCx escrow contract included in this repository.

## Overview
- Holds USDCx in escrow until release or refund conditions are met.
- Enforces arbiter authorization and timelock unlock height.
- Uses audited-style patterns for safe token operations and bridge interactions.

## Files
- Contract: [usdcx-escrow.clar](file:///c:/Users/Admin/Desktop/USDCx-Forge/contracts/contracts/usdcx-escrow.clar)
- Traits: [traits.clar](file:///c:/Users/Admin/Desktop/USDCx-Forge/contracts/contracts/traits.clar)

## Traits
- SIP-010 fungible token trait for USDCx transfer and balance operations.
- xReserve trait (mock) for mint/burn in bridge scenarios.

## Data Model
- beneficiary: principal receiving funds on release.
- arbiter: principal authorized to release or manage refunds.
- unlock-height: uint block height when refund becomes available.
- is-locked: bool indicating whether funds are currently escrowed.

## Public Functions
- lock-funds(amount, usdc-contract)
  - Transfers USDCx from tx-sender to the contract.
  - Requires nonzero amount, not already locked, and valid unlock-height.
- release-funds(usdc-contract)
  - Transfers escrowed USDCx from the contract to beneficiary.
  - Requires arbiter authorization and locked state.
- refund(usdc-contract)
  - Refunds escrowed USDCx to arbiter after unlock-height.
  - Requires locked state and block-height >= unlock-height.
- bridge-out(amount, xreserve-contract)
  - Burns USDCx via xReserve for bridge-out scenarios.
  - Requires arbiter authorization and locked state.

## Read-only
- get-details()
  - Returns beneficiary, arbiter, unlock-height, and is-locked.

## Safety
- Transfer result handling uses try!/unwrap-panic to avoid silent failures.
- Authorization checks ensure only the arbiter can release or bridge-out.
- Timelock enforcement prevents early refunds.
- Contract calls use as-contract where appropriate to ensure correct sender context.

## Configuration
- beneficiary, arbiter, unlock-height are initialized in the contract and typically set by the generator before deployment.
- Update these values via the generator UI or by editing the data vars prior to publishing if using manual workflows.

## Deployment
- Via App: Use the Integration Studio frontend to generate parameters and deploy with a connected wallet.
- Manual (Stacks tooling):
  - Publish the contract with your chosen Stacks deployment flow.
  - Ensure the USDCx principal passed to functions implements SIP-010 and matches your environment.
  - For bridge-out, ensure the xReserve contract principal implements the required trait.

## Usage Examples

Lock funds:
```clarity
(contract-call? .usdcx-escrow lock-funds u1000 'SP...usdcx)
```

Release funds (arbiter only):
```clarity
(contract-call? .usdcx-escrow release-funds 'SP...usdcx)
```

Refund after timelock:
```clarity
(contract-call? .usdcx-escrow refund 'SP...usdcx)
```

Bridge-out (arbiter only):
```clarity
(contract-call? .usdcx-escrow bridge-out u1000 'SP...xreserve)
```

## Error Codes
- u100 ERR-NOT-AUTHORIZED: Caller lacks required authorization (e.g., non-arbiter).
- u101 ERR-ALREADY-LOCKED: Escrow already locked; lock-funds cannot run again.
- u102 ERR-INVALID-EXPIRY: unlock-height must be greater than current block-height.
- u103 ERR-NOT-EXPIRED: Refund requires block-height >= unlock-height.
- u104 ERR-INVALID-AMOUNT: Amount must be greater than zero.

## State Model
- Initial: is-locked = false, balance = 0.
- lock-funds: is-locked = true, balance += amount.
- release-funds: balance transfers to beneficiary; is-locked remains true (one-shot).
- refund: balance transfers to arbiter after unlock-height; is-locked remains true.
- bridge-out: burns balance via xReserve; is-locked remains true.

Notes:
- One-shot escrow: Once locked, the contract does not reset is-locked to false.
- Subsequent lock attempts are rejected; further release/refund calls after empty balance are no-ops.
- If you need multi-cycle escrow, add a post-action reset to is-locked or implement per-deposit tracking.

## Design Notes
- Multi-cycle escrow: Consider resetting is-locked after release/refund or switch to a map keyed by deposit IDs to track multiple deposits concurrently.
- Transfer safety: Wrap SIP-010 and xReserve calls with try!/unwrap to ensure failures are explicit.
- Eventing: Add print or custom events for operational observability on lock/release/refund/bridge-out.
- Trait versioning: Pin trait versions and gate xReserve interactions behind feature flags when integrating different environments.

## Quickstart (Clarinet CLI)
- Prerequisites: Install Clarinet and ensure settings/Devnet.toml contains a deployer account.
- Validate contracts:
```bash
clarinet check
```
- Launch local console and auto-deploy:
```bash
clarinet console
```
- Generate and apply a Devnet deployment plan:
```bash
clarinet deployments generate --devnet
clarinet deployments apply --devnet
```
- Testnet/Mainnet: Create settings/Testnet.toml or settings/Mainnet.toml and use:
```bash
clarinet deployments generate --testnet
clarinet deployments apply --testnet
```
