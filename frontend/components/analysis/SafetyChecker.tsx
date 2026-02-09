'use client';

import { useMemo, useRef, useState } from 'react';
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
  const [showOnlyChanges, setShowOnlyChanges] = useState(false);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

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

  const diffRows = useMemo(() => {
    const a = code.split('\n');
    const b = safeCode.split('\n');
    const n = a.length;
    const m = b.length;
    const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    const rows: { left?: string; right?: string; type: 'equal' | 'insert' | 'delete' }[] = [];
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) {
        rows.push({ left: a[i], right: b[j], type: 'equal' });
        i++;
        j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        rows.push({ left: a[i], right: undefined, type: 'delete' });
        i++;
      } else {
        rows.push({ left: undefined, right: b[j], type: 'insert' });
        j++;
      }
    }
    while (i < n) {
      rows.push({ left: a[i], right: undefined, type: 'delete' });
      i++;
    }
    while (j < m) {
      rows.push({ left: undefined, right: b[j], type: 'insert' });
      j++;
    }
    if (!showOnlyChanges) return rows;
    const changedIdx: number[] = [];
    rows.forEach((r, idx) => {
      if (r.type !== 'equal') changedIdx.push(idx);
    });
    const keep = new Set<number>();
    const ctx = 2;
    changedIdx.forEach(idx => {
      for (let k = Math.max(0, idx - ctx); k <= Math.min(rows.length - 1, idx + ctx); k++) keep.add(k);
    });
    return rows.filter((_, idx) => keep.has(idx));
  }, [code, safeCode, showOnlyChanges]);

  const changesCount = useMemo(() => diffRows.filter(r => r.type !== 'equal').length, [diffRows]);

  const syncScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const other = e.currentTarget === leftRef.current ? rightRef.current : leftRef.current;
    if (other) other.scrollTop = e.currentTarget.scrollTop;
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
                    {showDiff ? 'Show Analysis' : 'Show Security Diff'}
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
                    {showDiff ? 'Security Diff' : 'Analysis Report'}
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
                    <div className="relative h-full flex flex-col">
                        <div className="flex items-center justify-between px-4 py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">{changesCount} Changes</span>
                            <label className="flex items-center gap-2 text-xs text-slate-600">
                              <input type="checkbox" checked={showOnlyChanges} onChange={e => setShowOnlyChanges(e.target.checked)} />
                              Show only changes
                            </label>
                          </div>
                          <button 
                              onClick={() => navigator.clipboard.writeText(safeCode)}
                              className="p-2 bg-white hover:bg-slate-100 rounded shadow text-slate-600 hover:text-slate-800"
                              title="Copy Safe Code"
                          >
                              <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-0 flex-1">
                          <div ref={leftRef} onScroll={syncScroll} className="overflow-auto border-r border-slate-200">
                            <div className="min-h-full">
                              {diffRows.map((r, idx) => (
                                <div key={idx} className={`px-4 py-0.5 font-mono text-xs ${r.type === 'equal' ? 'bg-white' : r.type === 'delete' ? 'bg-red-50' : 'bg-white'}`}>
                                  <pre className="whitespace-pre-wrap">{r.left ?? ''}</pre>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div ref={rightRef} onScroll={syncScroll} className="overflow-auto">
                            <div className="min-h-full">
                              {diffRows.map((r, idx) => (
                                <div key={idx} className={`px-4 py-0.5 font-mono text-xs ${r.type === 'equal' ? 'bg-white' : r.type === 'insert' ? 'bg-green-50' : 'bg-white'}`}>
                                  <pre className="whitespace-pre-wrap">{r.right ?? ''}</pre>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
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
