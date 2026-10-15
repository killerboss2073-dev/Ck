import React from 'react';
import { Timer, AlertCircle, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import { sound } from '../utils/sound.ts';

interface CountdownCardProps {
  periodNumber: string;
  remainingSeconds: number;
  formattedCountdown: string;
  currentBetAmount: number;
  lossIndex: number;
  totalLadderSteps: number;
  onManualBet: (type: 13 | 14) => void;
  isBotRunning: boolean;
  isLocked: boolean;
  pendingBet: { type: 13 | 14; amount: number; issueNumber: string } | null;
}

export const CountdownCard: React.FC<CountdownCardProps> = ({
  periodNumber,
  remainingSeconds,
  formattedCountdown,
  currentBetAmount,
  lossIndex,
  totalLadderSteps,
  onManualBet,
  isLocked,
  pendingBet,
}) => {
  const progressPercent = Math.max(0, Math.min(100, ((30 - remainingSeconds) / 30) * 100));
  const isUrgent = remainingSeconds <= 5;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-5 shadow-2xl">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800 text-cyan-400">
            <Timer className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Win Go 30s Period Issue</div>
            <div className="text-base sm:text-lg font-black font-mono text-cyan-300 tracking-wide">
              #{periodNumber}
            </div>
          </div>
        </div>

        {/* Current Progression Level Pill */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Ladder Level</span>
            <span className="text-xs font-bold text-amber-300 font-mono">
              Step {lossIndex + 1} / {totalLadderSteps} (K {currentBetAmount.toLocaleString()})
            </span>
          </div>
        </div>
      </div>

      {/* Main Countdown Display */}
      <div className="py-6 flex flex-col items-center justify-center text-center">
        <div className="relative flex items-center justify-center mb-3">
          <div
            className={`w-40 h-40 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-300 ${
              isUrgent
                ? 'border-red-500 bg-red-950/30 shadow-lg shadow-red-500/30 scale-105'
                : 'border-cyan-500/40 bg-slate-950/80 shadow-lg shadow-cyan-500/10'
            }`}
          >
            <span className="text-[11px] uppercase tracking-widest font-bold text-slate-400">
              {isUrgent ? 'LOCKED' : 'TIME LEFT'}
            </span>
            <span
              className={`font-mono text-4xl sm:text-5xl font-black tracking-tight ${
                isUrgent ? 'text-red-400 animate-pulse' : 'text-slate-100'
              }`}
            >
              {formattedCountdown}
            </span>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
              <span>{remainingSeconds}s</span>
              <span className="text-slate-600">•</span>
              <span className={isUrgent ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                {isUrgent ? 'Draw in progress' : 'Accepting bets'}
              </span>
            </div>
          </div>
        </div>

        {/* Linear progress bar */}
        <div className="w-full max-w-md bg-slate-800 h-2 rounded-full overflow-hidden mt-1 mb-2">
          <div
            className={`h-full transition-all duration-300 ${
              isUrgent ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Pending bet indicator */}
        {pendingBet && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-700 text-cyan-300 text-xs font-bold animate-pulse">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Active Bet: {pendingBet.type === 13 ? 'BIG' : 'SMALL'} (K {pendingBet.amount.toLocaleString()}) on #{pendingBet.issueNumber}
            </span>
          </div>
        )}
      </div>

      {/* Manual Bet Buttons matching Android layout */}
      <div className="mt-2 pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
          <span>Manual Bet Trigger (လက်ရှိအဆင့် ငွေပမာဏဖြင့် ထိုးရန်)</span>
          <span className="font-mono text-slate-300 font-bold">K {currentBetAmount.toLocaleString()}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Bet Big (13) */}
          <button
            aria-label="Bet Big"
            disabled={isLocked}
            onClick={() => {
              sound.playBet();
              onManualBet(13);
            }}
            className={`group relative overflow-hidden py-3.5 px-4 rounded-xl font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer ${
              isLocked
                ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500'
                : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 shadow-amber-500/20'
            }`}
          >
            <ArrowUpRight className="w-5 h-5 text-slate-950 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            <span>BET BIG</span>
          </button>

          {/* Bet Small */}
          <button
            aria-label="Bet Small"
            disabled={isLocked}
            onClick={() => {
              sound.playBet();
              onManualBet(14);
            }}
            className={`group relative overflow-hidden py-3.5 px-4 rounded-xl font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer ${
              isLocked
                ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500'
                : 'bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-600 hover:from-cyan-400 hover:to-teal-400 text-slate-950 shadow-cyan-500/20'
            }`}
          >
            <ArrowDownRight className="w-5 h-5 text-slate-950 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            <span>BET SMALL</span>
          </button>
        </div>

        {isLocked && (
          <p className="mt-2 text-center text-xs text-amber-400 flex items-center justify-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            နောက်ဆုံး ၅ စက္ကန့်တွင် အလောင်းအစားပိတ်ထားပါသည် (Drawing in progress)
          </p>
        )}
      </div>
    </div>
  );
};
