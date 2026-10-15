import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import type { BetItem } from '../utils/wingo.ts';

interface BetHistoryTableProps {
  myBets: BetItem[];
  onClearHistory: () => void;
}

export const BetHistoryTable: React.FC<BetHistoryTableProps> = ({ myBets, onClearHistory }) => {
  const [filter, setFilter] = useState<'all' | 'wins' | 'losses'>('all');

  const filteredBets = myBets.filter((bet) => {
    if (filter === 'wins') return bet.state === 1;
    if (filter === 'losses') return bet.state === 0;
    return true;
  });

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl flex flex-col gap-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100">My Betting History</h2>
          <p className="text-xs text-slate-400">Tracking execution, win/loss states, and profits</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented Filter */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                filter === 'all' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({myBets.length})
            </button>
            <button
              onClick={() => setFilter('wins')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                filter === 'wins' ? 'bg-emerald-950 text-emerald-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Wins
            </button>
            <button
              onClick={() => setFilter('losses')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                filter === 'losses' ? 'bg-red-950 text-red-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Losses
            </button>
          </div>

          {myBets.length > 0 && (
            <button
              onClick={onClearHistory}
              title="Clear bet history"
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* High Density Table */}
      <div className="overflow-x-auto max-h-72 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider z-10">
            <tr>
              <th className="py-2.5 px-3">Period Issue</th>
              <th className="py-2.5 px-3 text-center">Prediction</th>
              <th className="py-2.5 px-3 text-right">Stake</th>
              <th className="py-2.5 px-3 text-right">Result & P&L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredBets.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500 font-sans">
                  No bets recorded in history yet
                </td>
              </tr>
            ) : (
              filteredBets.map((bet, idx) => {
                const isBig = bet.selectType === 13;
                const isWin = bet.state === 1;
                const isLoss = bet.state === 0;
                const isPending = bet.state === 2;

                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-300">
                      <div>#{bet.issueNumber}</div>
                      {bet.time && <div className="text-[10px] text-slate-500 font-normal font-sans">{bet.time}</div>}
                    </td>

                    <td className="py-2.5 px-3 text-center font-sans">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded font-bold uppercase text-[10px] ${
                          isBig
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}
                      >
                        {isBig ? 'BIG' : 'SMALL'}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold text-slate-300">
                      K {bet.amount.toLocaleString()}
                    </td>

                    <td className="py-2.5 px-3 text-right font-sans">
                      {isWin && (
                        <div className="inline-flex items-center gap-1 font-mono font-black text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>+K {bet.profitAmount.toLocaleString()}</span>
                        </div>
                      )}
                      {isLoss && (
                        <div className="inline-flex items-center gap-1 font-mono font-bold text-red-400">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>-K {bet.amount.toLocaleString()}</span>
                        </div>
                      )}
                      {isPending && (
                        <div className="inline-flex items-center gap-1 font-mono font-bold text-amber-400 animate-pulse">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Waiting draw...</span>
                        </div>
                      )}
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
