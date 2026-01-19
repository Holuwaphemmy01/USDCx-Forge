import { STACKS_MOCKNET, STACKS_TESTNET } from "@stacks/network";

const isDevnet = process.env.NEXT_PUBLIC_NETWORK === 'devnet';

export const network = isDevnet 
  ? STACKS_MOCKNET 
  : STACKS_TESTNET;

if (isDevnet) {
    // network.coreApiUrl = 'http://localhost:3999';
}
