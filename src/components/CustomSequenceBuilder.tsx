import React, { useState } from 'react';
import { SlidersHorizontal, Plus, Trash2, ArrowLeftRight, RotateCcw, Copy, Check, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound.ts';

interface CustomSequenceBuilderProps {
  sequence: ('big' | 'small')[];
  onUpdateSequence: (seq: ('big' | 'small')[]) => void;
  activeStep: number;
  isBotRunning: boolean;
}

const SEQUENCE_PRESETS = [
  { name: 'Double Strike', seq: ['big', 'big', 'small', 'small'] as ('big' | 'small')[] },
  { name: 'B-S-B-B-S', seq: ['big', 'small', 'big', 'big', 'small'] as ('big' | 'small')[] },
  { name: 'Dragon 6', seq: ['big', 'big', 'big', 'small', 'small', 'small'] as ('big' | 'small')[] },
  { name: 'Alternating 4', seq: ['big', 'small', 'big', 'small'] as ('big' | 'small')[] },
  { name: 'Triple Big Strike', seq: ['big', 'big', 'big', 'small'] as ('big' | 'small')[] },
];

export const CustomSequenceBuilder: React.FC<CustomSequenceBuilderProps> = ({
  sequence,
  onUpdateSequence,
  activeStep,
  isBotRunning,
}) => {
  const [textInput, setTextInput] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleAddStep = (type: 'big' | 'small') => {
    sound.playTick();
    onUpdateSequence([...sequence, type]);
  };

  const handleToggleStep = (index: number) => {
    if (isBotRunning) return;
    sound.playTick();
    const updated = [...sequence];
    updated[index] = updated[index] === 'big' ? 'small' : 'big';
    onUpdateSequence(updated);
  };

  const handleRemoveStep = (index: number) => {
    if (isBotRunning || sequence.length <= 1) return;
    sound.playTick();
    const updated = sequence.filter((_, i) => i !== index);
    onUpdateSequence(updated);
  };

  const handleApplyText = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = textInput.trim().toUpperCase();
    if (!raw) return;

    const tokens = raw.split(/[\s,;+->]+/);
    const parsed: ('big' | 'small')[] = [];

    for (const t of tokens) {
      if (t === 'B' || t === 'BIG' || t === '13' || t === 'ကြီး') {
        parsed.push('big');
      } else if (t === 'S' || t === 'SMALL' || t === '14' || t === 'ငယ်') {
        parsed.push('small');
      }
    }

    if (parsed.length > 0) {
      sound.playBet();
      onUpdateSequence(parsed);
      setTextInput('');
    }
  };

  const handleInvert = () => {
    sound.playTick();
    const inverted = sequence.map((s) => (s === 'big' ? 'small' : 'big'));
    onUpdateSequence(inverted);
  };

  const handleClear = () => {
    sound.playTick();
    onUpdateSequence(['big', 'small']);
  };

  const handleCopy = () => {
    const text = sequence.map((s) => (s === 'big' ? 'B' : 'S')).join(', ');
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl flex flex-col gap-4">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-600 text-slate-950 shadow-md">
            <SlidersHorizontal className="w-5 h-5 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">Custom Bet Sequence Builder</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                {sequence.length} Steps Active
              </span>
            </div>
            <p className="text-xs text-slate-400">ကိုယ်စိတ်ကြိုက် Big / Small အစီအစဉ်ထည့်သွင်းပြီး Auto ထိုးရန်</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleInvert}
            disabled={isBotRunning}
            title="Invert Big <-> Small"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
            <span>Invert</span>
          </button>
          <button
            onClick={handleCopy}
            title="Copy sequence"
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleClear}
            disabled={isBotRunning}
            title="Reset sequence"
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-red-800 hover:text-red-400 text-slate-400 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preset Quick Chips */}
      <div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
          Pattern Presets (အမြန်သုံး ပုံစံများ)
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SEQUENCE_PRESETS.map((p) => (
            <button
              key={p.name}
              disabled={isBotRunning}
              onClick={() => {
                sound.playTick();
                onUpdateSequence(p.seq);
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-950 border border-slate-800 hover:border-amber-600 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Sequence Chain */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
          <span>Active Sequence Chain (Click step to toggle Big ↔ Small)</span>
          {isBotRunning && (
            <span className="text-amber-400 font-mono font-bold animate-pulse">
              Running Step: #{((activeStep % sequence.length) || 0) + 1}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 min-h-[64px] items-center">
          {sequence.map((step, idx) => {
            const isBig = step === 'big';
            const isActive = isBotRunning && (activeStep % sequence.length) === idx;

            return (
              <div
                key={idx}
                className={`group relative flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold font-mono text-xs transition-all ${
                  isActive
                    ? 'ring-2 ring-yellow-400 scale-105 shadow-lg shadow-amber-500/30'
                    : 'hover:scale-102'
                } ${
                  isBig
                    ? 'bg-amber-950 text-amber-300 border border-amber-700/80'
                    : 'bg-cyan-950 text-cyan-300 border border-cyan-700/80'
                }`}
              >
                <span className="text-[10px] opacity-75">#{idx + 1}</span>
                <button
                  type="button"
                  disabled={isBotRunning}
                  onClick={() => handleToggleStep(idx)}
                  className="font-black cursor-pointer hover:underline"
                  title="Click to toggle Big/Small"
                >
                  {isBig ? 'BIG' : 'SMALL'}
                </button>
                {isActive && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping ml-0.5" />}

                {sequence.length > 1 && !isBotRunning && (
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(idx)}
                    className="p-0.5 rounded hover:bg-slate-900 hover:text-red-400 transition-colors ml-1 text-slate-400 cursor-pointer"
                    title="Remove this step"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Add Buttons: + BIG and + SMALL */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={isBotRunning}
          onClick={() => handleAddStep('big')}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ ADD BIG</span>
        </button>

        <button
          type="button"
          disabled={isBotRunning}
          onClick={() => handleAddStep('small')}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ ADD SMALL</span>
        </button>
      </div>

      {/* Fast Text Input Box */}
      <form onSubmit={handleApplyText} className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-800">
        <input
          type="text"
          disabled={isBotRunning}
          placeholder="Fast paste sequence: e.g. B, S, B, B, S, S, B or 13, 14, 13..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
        />
        <button
          type="submit"
          disabled={isBotRunning || !textInput.trim()}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Apply Sequence</span>
        </button>
      </form>
    </div>
  );
};
