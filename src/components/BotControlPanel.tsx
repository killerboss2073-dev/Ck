import React from 'react';
import { Play, Square, Settings2, Sliders, Shield, Award } from 'lucide-react';
import { STRATEGIES } from '../utils/strategies.ts';
import { sound } from '../utils/sound.ts';

interface BotControlPanelProps {
  isBotRunning: boolean;
  onToggleBot: () => void;
  selectedStrategyId: string;
  onSelectStrategy: (id: string) => void;
  botStepCounter: number;
  stopLossLimit: number;
  onChangeStopLoss: (val: number) => void;
  takeProfitLimit: number;
  onChangeTakeProfit: (val: number) => void;
  totalProfit: number;
  totalWins: number;
  totalLosses: number;
}

export const BotControlPanel: React.FC<BotControlPanelProps> = ({
  isBotRunning,
  onToggleBot,
  selectedStrategyId,
  onSelectStrategy,
  botStepCounter,
  stopLossLimit,
  onChangeStopLoss,
  takeProfitLimit,
  onChangeTakeProfit,
  totalProfit,
  totalWins,
  totalLosses,
}) => {
  const currentStrategy = STRATEGIES.find((s) => s.id === selectedStrategyId) || STRATEGIES[0];

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl flex flex-col gap-4">
      {/* Panel Title & Main Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-800 text-purple-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">AutoBot Engine (အော်တိုထိုးစနစ်)</h2>
            <p className="text-xs text-slate-400">Select algorithm and let the bot execute auto-betting</p>
          </div>
        </div>

        {/* Start / Stop Master Switch */}
        <button
          aria-label={isBotRunning ? 'Stop AutoBot' : 'Start AutoBot'}
          onClick={() => {
            sound.playTick();
            onToggleBot();
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base transition-all shadow-lg active:scale-95 cursor-pointer ${
            isBotRunning
              ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-500/30 animate-pulse'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/30'
          }`}
        >
          {isBotRunning ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              <span>STOP BOT</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>START BOT</span>
            </>
          )}
        </button>
      </div>

      {/* Strategy Selection */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="strategy-select" className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Bot Strategy (နည်းဗျူဟာ ရွေးချယ်ပါ)</span>
          </label>
          <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800">
            {STRATEGIES.length} Patterns Ready
          </span>
        </div>

        <select
          id="strategy-select"
          aria-label="Select Bot Strategy"
          value={selectedStrategyId}
          disabled={isBotRunning}
          onChange={(e) => onSelectStrategy(e.target.value)}
          className={`w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 font-semibold focus:outline-none focus:border-cyan-500 transition-colors ${
            isBotRunning ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          {STRATEGIES.map((strat) => (
            <option key={strat.id} value={strat.id} className="bg-slate-900 text-slate-100 py-1">
              #{strat.id} • {strat.name} - {strat.burmeseName}
            </option>
          ))}
        </select>

        {/* Selected Strategy Details Card */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-cyan-300 text-sm">{currentStrategy.name}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
              Type: {currentStrategy.patternType.replace('_', ' ')}
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">{currentStrategy.description}</p>

          {/* Fixed Pattern Visual Ribbon */}
          {currentStrategy.sequence && (
            <div className="mt-1 pt-2 border-t border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                Pattern Sequence (အဆင့်လိုက် အစီအစဉ်)
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {currentStrategy.sequence.map((step, idx) => {
                  const isActive = isBotRunning && (botStepCounter % (currentStrategy.totalSteps || 1)) === idx;
                  const isBig = step === 'big';
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-xs font-mono transition-all ${
                        isActive
                          ? 'ring-2 ring-amber-400 scale-105 shadow-md shadow-amber-500/30'
                          : 'opacity-70'
                      } ${
                        isBig
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      }`}
                    >
                      <span>{idx + 1}.</span>
                      <span>{step.toUpperCase()}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Safety Controls: Stop Loss & Take Profit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-red-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Stop Loss Limit</span>
            </span>
            <span className="font-mono text-slate-400">K {stopLossLimit.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={10000}
            max={500000}
            step={10000}
            value={stopLossLimit}
            disabled={isBotRunning}
            onChange={(e) => onChangeStopLoss(Number(e.target.value))}
            className="w-full accent-red-500 cursor-pointer"
          />
          <span className="text-[10px] text-slate-500">ရှုံးငွေဤပမာဏရောက်ပါက ဘော့တ်အလိုအလျောက်ရပ်မည်</span>
        </div>

        <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              <span>Take Profit Target</span>
            </span>
            <span className="font-mono text-slate-400">K {takeProfitLimit.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={10000}
            max={500000}
            step={10000}
            value={takeProfitLimit}
            disabled={isBotRunning}
            onChange={(e) => onChangeTakeProfit(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <span className="text-[10px] text-slate-500">အမြတ်ဤပမာဏရောက်ပါက ဘော့တ်အလိုအလျောက်ရပ်မည်</span>
        </div>
      </div>

      {/* Session P&L Stats Cards */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
        <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">PROFIT</span>
          <span
            className={`text-sm sm:text-base font-black font-mono ${
              totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {totalProfit >= 0 ? `+ ${totalProfit.toLocaleString()}` : `- ${Math.abs(totalProfit).toLocaleString()}`}
          </span>
        </div>
        <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Wins</span>
          <span className="text-sm sm:text-base font-black font-mono text-emerald-400">
            {totalWins}
          </span>
        </div>
        <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Losses</span>
          <span className="text-sm sm:text-base font-black font-mono text-red-400">
            {totalLosses}
          </span>
        </div>
      </div>
    </div>
  );
};
