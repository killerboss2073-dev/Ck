import React from 'react';
import { History, TrendingUp } from 'lucide-react';
import type { DrawResult } from '../utils/wingo.ts';

interface RecentResultsTableProps {
  recentDraws: DrawResult[];
}

export const RecentResultsTable: React.FC<RecentResultsTableProps> = ({ recentDraws }) => {
  const bigCount = recentDraws.filter((d) => d.type === 'big').length;
  const smallCount = recentDraws.filter((d) => d.type === 'small').length;

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl flex flex-col gap-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100">Live Game Results</h2>
          <p className="text-xs text-slate-400">Real-time Win Go 30s draw outcomes</p>
        </div>

        {/* Big/Small Ratio Indicator */}
        <div className="flex items-center gap-2 text-xs font-mono font-bold bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-amber-400">BIG: {bigCount}</span>
          <span className="text-slate-600">/</span>
          <span className="text-cyan-400">SMALL: {smallCount}</span>
        </div>
      </div>

      {/* High Density Table */}
      <div className="overflow-x-auto max-h-72 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider z-10">
            <tr>
              <th className="py-2.5 px-3">Period Issue</th>
              <th className="py-2.5 px-3 text-center">Number</th>
              <th className="py-2.5 px-3 text-center">Big / Small</th>
              <th className="py-2.5 px-3 text-right">Color</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {recentDraws.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500 font-sans">
                  No draw outcomes loaded yet. Connecting to stream...
                </td>
              </tr>
            ) : (
              recentDraws.map((draw, idx) => {
                const isBig = draw.type === 'big';
                const isViolet = draw.colour.includes('v');
                const isGreen = draw.colour.includes('g');

                return (
                  <tr key={draw.issueNumber || idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-300">
                      #{draw.issueNumber}
                    </td>

                    <td className="py-2.5 px-3 text-center font-sans">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-black text-xs text-white shadow-sm ${
                          isViolet
                            ? 'bg-purple-600 shadow-purple-500/20'
                            : isGreen
                            ? 'bg-emerald-600 shadow-emerald-500/20'
                            : 'bg-red-600 shadow-red-500/20'
                        }`}
                      >
                        {draw.number}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center font-sans">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                          isBig
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}
                      >
                        {draw.type}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-sans">
                      <span
                        className="inline-flex items-center gap-1 text-xs font-semibold capitalize"
                        style={{
                          color: isViolet ? '#c084fc' : isGreen ? '#34d399' : '#f87171',
                        }}
                      >
                        {isViolet ? 'Violet' : isGreen ? 'Green' : 'Red'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
