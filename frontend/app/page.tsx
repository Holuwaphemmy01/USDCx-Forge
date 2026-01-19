'use client';

import { BridgeFlowMap } from "@/components/dashboard/BridgeFlowMap";
import { useStacksAuth } from "@/lib/useStacksAuth";

export default function Home() {
  const { connectWallet, disconnectWallet, userData } = useStacksAuth();

  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
             U
           </div>
           <span className="font-bold text-slate-900">USDCx Studio</span>
        </div>
        <div>
           {userData ? (
             <button 
                onClick={disconnectWallet}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
             >
                {userData.profile.stxAddress.testnet.slice(0,6)}...{userData.profile.stxAddress.testnet.slice(-4)}
             </button>
           ) : (
             <button 
                onClick={connectWallet}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
             >
                Connect Stacks Wallet
             </button>
           )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
               Safe USDCx Integration
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
               Visualize the flow, generate safe contracts, and verify your integration.
            </p>
        </div>

        <BridgeFlowMap />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 max-w-4xl mx-auto">
           <div className="p-6 bg-white rounded-xl border border-slate-200 hover:border-blue-500 transition-colors cursor-pointer group">
              <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600">
                Generate Safe Contracts
              </h3>
              <p className="text-slate-600">
                 Create audited-style Clarity contracts for Escrow and Payment flows.
              </p>
           </div>
           
           <div className="p-6 bg-white rounded-xl border border-slate-200 hover:border-blue-500 transition-colors cursor-pointer group">
              <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600">
                Safety Checker
              </h3>
              <p className="text-slate-600">
                 Analyze your existing Clarity contracts for common USDCx vulnerabilities.
              </p>
           </div>
        </div>
      </div>
    </main>
  );
}
