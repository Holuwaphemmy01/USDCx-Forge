'use client';

import { useState } from 'react';
import { ClarityASTBuilder, EscrowConfig } from '@/lib/generator/builder';
import { Copy, Download, RefreshCw, ShieldCheck, Rocket } from 'lucide-react';
import { useStacksAuth } from '@/lib/useStacksAuth';
import { openContractDeploy } from '@stacks/connect';

export function ContractGenerator() {
  const { userSession, network } = useStacksAuth();
  const [config, setConfig] = useState<EscrowConfig>({
    beneficiary: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    arbiter: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    unlockHeight: 100,
    usdcTraitContract: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdc-token'
  });

  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate processing time
    setTimeout(() => {
        const code = ClarityASTBuilder.generateEscrow(config);
        setGeneratedCode(code);
        setIsGenerating(false);
    }, 500);
  };

  const handleDeploy = () => {
    if (!generatedCode) return;
    
    openContractDeploy({
      contractName: `usdcx-escrow-${Math.floor(Date.now() / 1000)}`,
      codeBody: generatedCode,
      network: network, // Use the network from our auth hook (Testnet/Devnet)
      appDetails: {
        name: 'USDCx Integration Studio',
        icon: window.location.origin + '/favicon.ico',
      },
      onFinish: (data) => {
        console.log('Contract deployed!', data);
        alert(`Contract deployment submitted! TxId: ${data.txId}`);
      },
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    alert('Contract code copied to clipboard!');
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-slate-200 mt-8">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
            <h2 className="text-xl font-bold text-slate-800">Safe Integration Generator</h2>
            <p className="text-sm text-slate-500">Configure and generate an audited USDCx Escrow contract.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Form */}
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Beneficiary Principal</label>
                <input 
                    type="text" 
                    value={config.beneficiary}
                    onChange={(e) => setConfig({...config, beneficiary: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                />
                <p className="text-xs text-slate-500 mt-1">The Stacks address that will receive the funds.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Arbiter Principal</label>
                <input 
                    type="text" 
                    value={config.arbiter}
                    onChange={(e) => setConfig({...config, arbiter: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                />
                <p className="text-xs text-slate-500 mt-1">The address authorized to release or refund funds.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Unlock Height</label>
                    <input 
                        type="number" 
                        value={config.unlockHeight}
                        onChange={(e) => setConfig({...config, unlockHeight: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">USDCx Contract</label>
                    <input 
                        type="text" 
                        value={config.usdcTraitContract}
                        onChange={(e) => setConfig({...config, usdcTraitContract: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                    />
                </div>
            </div>

            <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
                {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                Generate Contract
            </button>
        </div>

        {/* Code Preview */}
        <div className="bg-slate-900 rounded-xl overflow-hidden flex flex-col h-[500px]">
            <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
                <span className="text-xs font-mono text-slate-400">usdcx-escrow.clar</span>
                <div className="flex gap-2">
                    {generatedCode && userSession.isUserSignedIn() && (
                        <button 
                            onClick={handleDeploy}
                            className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium transition-colors mr-2"
                        >
                            <Rocket className="w-3 h-3" />
                            Deploy
                        </button>
                    )}
                    <button onClick={copyToClipboard} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="Copy">
                        <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="Download">
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                {generatedCode ? (
                    <pre className="text-sm font-mono text-blue-300 whitespace-pre-wrap">
                        {generatedCode}
                    </pre>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                        <ShieldCheck className="w-12 h-12 mb-2 opacity-20" />
                        <p>Configure parameters and click Generate</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
