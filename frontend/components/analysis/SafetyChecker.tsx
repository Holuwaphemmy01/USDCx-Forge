'use client';

import { useState } from 'react';
import { analyzeContract, generateSafeContract, SafetyIssue } from '@/lib/analysis/safety-checker';
import { AlertTriangle, CheckCircle, Search, ShieldAlert, ArrowRightLeft, Copy } from 'lucide-react';

const UNSAFE_EXAMPLE = `
(define-public (unsafe-transfer (amount uint))
    (begin
        ;; Missing auth check!
        (contract-call? .usdc transfer amount tx-sender 'ST1... none)
        (ok true)
    )
)
`;

export function SafetyChecker() {
  const [code, setCode] = useState(UNSAFE_EXAMPLE.trim());
  const [safeCode, setSafeCode] = useState('');
  const [issues, setIssues] = useState<SafetyIssue[]>([]);
  const [showDiff, setShowDiff] = useState(false);

  const handleAnalyze = () => {
    const foundIssues = analyzeContract(code);
    setIssues(foundIssues);
    if (foundIssues.length > 0) {
        const fixed = generateSafeContract(code, foundIssues);
        setSafeCode(fixed);
        setShowDiff(true);
    } else {
        setShowDiff(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-slate-200 mt-8">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-800">Safety Checker</h2>
                <p className="text-sm text-slate-500">Analyze Clarity code for common USDCx integration vulnerabilities.</p>
            </div>
        </div>
        
        {issues.length > 0 && (
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setShowDiff(!showDiff)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${showDiff ? 'bg-slate-200 text-slate-700' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                >
                    <ArrowRightLeft className="w-4 h-4" />
                    {showDiff ? 'Show Analysis' : 'Show Fix Diff'}
                </button>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
        {/* Left: Input / User Code */}
        <div className="flex flex-col h-full">
            <div className="mb-2 flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700">Your Contract Code</label>
                <button 
                    onClick={handleAnalyze}
                    className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white text-sm rounded-md hover:bg-slate-800 transition-colors"
                >
                    <Search className="w-4 h-4" />
                    Analyze
                </button>
            </div>
            <textarea 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 w-full p-4 font-mono text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                spellCheck={false}
            />
        </div>

        {/* Right: Analysis or Diff */}
        <div className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
                    {showDiff ? 'Proposed Fixes (Safe Code)' : 'Analysis Report'}
                </span>
                {issues.length > 0 && (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                        {issues.length} Issues Found
                    </span>
                )}
            </div>
            
            <div className="flex-1 overflow-auto p-0 relative">
                {issues.length === 0 && !showDiff ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-4">
                        <CheckCircle className="w-12 h-12 mb-2 opacity-20" />
                        <p>No issues detected or analysis not run.</p>
                    </div>
                ) : showDiff ? (
                    <div className="relative h-full">
                        <textarea 
                            readOnly
                            value={safeCode}
                            className="w-full h-full p-4 font-mono text-sm bg-green-50/50 text-slate-800 resize-none focus:outline-none"
                        />
                        <button 
                            onClick={() => navigator.clipboard.writeText(safeCode)}
                            className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded shadow text-slate-500 hover:text-slate-800"
                            title="Copy Safe Code"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="p-4 space-y-3">
                        {issues.map((issue, idx) => (
                            <div key={idx} className="p-3 bg-white border-l-4 border-red-500 shadow-sm rounded-r-md">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-slate-800 text-sm">{issue.title}</h4>
                                        <p className="text-xs text-slate-600 mt-1">{issue.description}</p>
                                        {issue.line && (
                                            <p className="text-xs text-slate-400 mt-1">Line: {issue.line}</p>
                                        )}
                                        {issue.suggestion && (
                                            <div className="mt-2 p-2 bg-slate-100 rounded text-xs font-mono text-slate-700">
                                                Suggestion: {issue.suggestion}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
