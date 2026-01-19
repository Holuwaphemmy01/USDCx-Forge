'use client';

import { useState, useEffect } from 'react';
import { useStacksAuth } from '@/lib/useStacksAuth';
import { getUSDCBalance } from '@/lib/ethereum';
import { ArrowRight, Lock, Unlock, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

export function BridgeFlowMap() {
  const { userData, network } = useStacksAuth();
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [usdcxBalance, setUsdcxBalance] = useState<string>('0');
  // Mock ETH address for now, in a real app this would come from a wallet connection
  const mockEthAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; 

  useEffect(() => {
    async function fetchBalances() {
      // 1. Fetch Ethereum USDC Balance
      const ethBal = await getUSDCBalance(mockEthAddress);
      setEthBalance(ethBal);

      // 2. Fetch Stacks USDCx Balance (Mock for now until contract interaction is set up)
      // In a real scenario, we would call the Stacks node API
      if (userData) {
          // const stxBal = await getUSDCxBalance(userData.profile.stxAddress.testnet);
          setUsdcxBalance('100'); // Mocked
      }
    }

    fetchBalances();
    const interval = setInterval(fetchBalances, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [userData]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold mb-6 text-slate-800">USDC Bridge Flow</h2>
      
      <div className="flex items-center justify-between gap-4">
        {/* Ethereum Side */}
        <div className="flex-1 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <h3 className="font-semibold text-blue-900">Ethereum (Source)</h3>
          </div>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white rounded-md shadow-sm">
                <Wallet className="w-5 h-5 text-blue-600" />
             </div>
             <div>
                <p className="text-xs text-blue-600 uppercase font-medium">USDC Balance</p>
                <p className="text-lg font-bold text-slate-900">{ethBalance} USDC</p>
             </div>
          </div>
        </div>

        {/* Bridge Visual */}
        <div className="flex flex-col items-center justify-center gap-2 px-4">
            <motion.div 
                animate={{ x: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-slate-400"
            >
                <ArrowRight className="w-6 h-6" />
            </motion.div>
            <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-mono text-slate-500">
                Bridge
            </div>
        </div>

        {/* Stacks Side */}
        <div className="flex-1 p-4 bg-orange-50 rounded-lg border border-orange-100">
          <div className="flex items-center gap-2 mb-2">
             <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <h3 className="font-semibold text-orange-900">Stacks (Destination)</h3>
          </div>
           <div className="flex items-center gap-3">
             <div className="p-2 bg-white rounded-md shadow-sm">
                <Lock className="w-5 h-5 text-orange-600" />
             </div>
             <div>
                <p className="text-xs text-orange-600 uppercase font-medium">USDCx Balance</p>
                <p className="text-lg font-bold text-slate-900">{usdcxBalance} USDCx</p>
             </div>
          </div>
        </div>
      </div>
      
      {/* Escrow Status (Future Integration) */}
      <div className="mt-6 pt-6 border-t border-slate-100">
         <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
                Escrow Status: <span className="text-emerald-600 font-medium">Ready</span>
            </div>
            <button className="px-4 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors">
                View Contract
            </button>
         </div>
      </div>
    </div>
  );
}
