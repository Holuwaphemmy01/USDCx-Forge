import { ethClient, ETH_USDC_CONTRACT } from './ethereum';
import { parseAbiItem, WatchContractEventReturnType } from 'viem';

// Simplified ABI for Transfer event
const TRANSFER_EVENT_ABI = parseAbiItem(
  'event Transfer(address indexed from, address indexed to, uint256 value)'
);

export async function getUSDCTransfers(address: `0x${string}`) {
  try {
    const logs = await ethClient.getLogs({
      address: ETH_USDC_CONTRACT,
      event: TRANSFER_EVENT_ABI,
      args: {
        to: address
      },
      fromBlock: 'earliest',
      toBlock: 'latest'
    });

    return logs.map(log => ({
      hash: log.transactionHash,
      from: log.args.from,
      to: log.args.to,
      value: log.args.value ? log.args.value.toString() : '0',
      blockNumber: log.blockNumber
    }));
  } catch (error) {
    console.error("Error fetching Ethereum logs:", error);
    return [];
  }
}

export function watchUSDCDeposits(
  address: `0x${string}`, 
  onDeposit: (event: any) => void
): WatchContractEventReturnType {
  return ethClient.watchContractEvent({
    address: ETH_USDC_CONTRACT,
    abi: [TRANSFER_EVENT_ABI],
    eventName: 'Transfer',
    args: {
      to: address
    },
    onLogs: (logs) => {
      logs.forEach(log => {
        onDeposit({
          hash: log.transactionHash,
          from: log.args.from,
          to: log.args.to,
          value: log.args.value ? log.args.value.toString() : '0',
          blockNumber: log.blockNumber
        });
      });
    }
  });
}
