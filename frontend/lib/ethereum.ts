import { createPublicClient, http, defineChain } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

// Mock chain for local devnet if needed
const localChain = defineChain({
  id: 31337,
  name: 'Localhost',
  network: 'localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
});

const isDevnet = process.env.NEXT_PUBLIC_NETWORK === 'devnet';
const chain = isDevnet ? localChain : sepolia;

export const ethClient = createPublicClient({
  chain: chain,
  transport: http(),
});

// Mock USDC Contract Address on Ethereum (Sepolia or Local)
export const ETH_USDC_CONTRACT = isDevnet 
  ? '0x5FbDB2315678afecb367f032d93F642f64180aa3' // Mock local address
  : '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'; // Sepolia USDC
