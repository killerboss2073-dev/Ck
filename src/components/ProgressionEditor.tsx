import React, { useState } from 'react';
import { Layers, Plus, Trash2, RotateCcw, Zap } from 'lucide-react';
import { sound } from '../utils/sound.ts';

interface ProgressionEditorProps {
  betAmounts: number[];
  lossIndex: number;
  onAddAmount: (amount: number) => void;
  onRemoveAmount: (index: number) => void;
  onResetAmounts: (preset?: number[]) => void;
  isBotRunning: boolean;
}

export const DEFAULT_BET_SEQUENCE = [100, 300, 700, 1600, 3200, 7600, 16000];

export const ProgressionEditor: React.FC<ProgressionEditorProps> = ({
  betAmounts,
  lossIndex,
  onAddAmount,
  onRemoveAmount,
  onResetAmounts,
  isBotRunning,
}) => {
  const [newAmountInput, setNewAmountInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newAmountInput.trim());
    if (isNaN(val) || val <= 0) {
      setErrorMsg('Please enter a valid amount (အနည်းဆုံး ၁ ကျပ်)');
      return;
    }
    setErrorMsg('');
    onAddAmount(val);
    setNewAmountInput('');
    sound.playTick();
  };

  const handleApplyDefaultSequence = () => {
    sound.playTick();
    onResetAmounts(DEFAULT_BET_SEQUENCE);
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl flex flex-col gap-4">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Bet Squence (အဆင့်လိုက်လောင်းကြေး)</h2>
            <p className="text-xs text-slate-400">ရှုံးပါက အဆင့်လိုက်တက်ထိုးမည့် ငွေပမာဏများ စာရင်း</p>
          </div>
        </div>

        <button
          onClick={() => onResetAmounts(DEFAULT_BET_SEQUENCE)}
          disabled={isBotRunning}
          title="Reset to Bet Sequence (100,300,700,1600,3200,7600,16000)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Bet Squence Preset Button */}
      <div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Bet Squence
        </span>
        <button
          disabled={isBotRunning}
          onClick={handleApplyDefaultSequence}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-950 to-slate-900 border border-amber-800/70 hover:border-amber-500 text-left transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-xs font-bold text-amber-300 block">
                Bet Squence: 100, 300, 700, 1600, 3200, 7600, 16000
              </span>
              <span className="text-[10px] text-slate-400">
                (7-Step Optimized Progression • ၁၀၀ ကျပ် စတင်)
              </span>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 group-hover:bg-amber-400 transition-colors">
            Apply
          </span>
        </button>
      </div>

      {/* Current Ladder Chips */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
          <span>Active Ladder Steps ({betAmounts.length} steps configured)</span>
          <span className="text-amber-400 font-mono font-bold">Current Step: #{lossIndex + 1}</span>
        </div>

        <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 min-h-[56px] items-center">
          {betAmounts.map((amt, idx) => {
            const isCurrent = idx === lossIndex;
            return (
              <div
                key={idx}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 shadow-lg shadow-amber-500/30 scale-105'
                    : 'bg-slate-900 text-slate-200 border border-slate-700'
                }`}
              >
                <span className="text-[10px] opacity-75">#{idx + 1}</span>
                <span>K {amt.toLocaleString()}</span>
                {betAmounts.length > 1 && !isBotRunning && (
                  <button
                    aria-label={`Remove step ${idx + 1}`}
                    onClick={() => onRemoveAmount(idx)}
                    className="p-0.5 rounded hover:bg-slate-800/80 hover:text-red-400 transition-colors ml-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Amount Form */}
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-800">
        <input
          type="number"
          min="10"
          step="10"
          disabled={isBotRunning}
          placeholder="Enter next bet amount (e.g. 35000)..."
          value={newAmountInput}
          onChange={(e) => {
            setNewAmountInput(e.target.value);
            setErrorMsg('');
          }}
          className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
        />
        <button
          type="submit"
          disabled={isBotRunning || !newAmountInput.trim()}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Amount</span>
        </button>
      </form>
      {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
    </div>
  );
};
