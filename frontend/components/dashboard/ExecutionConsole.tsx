import { Copy, Terminal, X } from 'lucide-react';

interface ExecutionConsoleProps {
  txData: {
    contractAddress: string;
    contractName: string;
    functionName: string;
    functionArgs: any[];
    postConditions?: any[];
  } | null;
  onClose?: () => void;
}

export function ExecutionConsole({ txData, onClose }: ExecutionConsoleProps) {
  if (!txData) return null;

  return (
    <div className="w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-700 font-mono text-sm mt-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-2 text-slate-400">
                <Terminal className="w-4 h-4" />
                <span className="font-semibold text-slate-200">Clarity Execution Console</span>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-700"
                    title="Copy to clipboard"
                >
                    <Copy className="w-4 h-4" />
                </button>
                {onClose && (
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-red-400 transition-colors p-1 rounded hover:bg-slate-700"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>

        {/* Content */}
        <div className="p-4 text-slate-300 space-y-2 overflow-x-auto max-h-[300px] overflow-y-auto custom-scrollbar">
            <div className="flex gap-2">
                <span className="text-purple-400 font-bold">contract-call?</span>
                <span className="text-blue-400">'{txData.contractAddress}.{txData.contractName}</span>
                <span className="text-yellow-400">{txData.functionName}</span>
            </div>
            
            <div className="pl-4 border-l-2 border-slate-700 ml-1 space-y-1 my-2">
                {txData.functionArgs.map((arg, i) => (
                    <div key={i} className="whitespace-pre flex gap-2">
                        <span className="text-slate-500 select-none">arg[{i}]:</span> 
                        <span className="text-emerald-400 break-all">{JSON.stringify(arg)}</span>
                    </div>
                ))}
            </div>

            {txData.postConditions && txData.postConditions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                     <div className="text-slate-500 mb-1 flex items-center gap-2">
                        <span>// Post Conditions</span>
                        <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400">STRICT</span>
                     </div>
                     {txData.postConditions.map((pc, i) => (
                         <div key={i} className="text-orange-400 pl-4 border-l-2 border-orange-900/30 ml-1">
                            {JSON.stringify(pc)}
                         </div>
                     ))}
                </div>
            )}
            
            <div className="mt-4 text-xs text-slate-600 italic">
                {'>'} Ready to sign and broadcast...
            </div>
        </div>
    </div>
  );
}
