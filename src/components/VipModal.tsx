import React from 'react';
import { X, Send, Sparkles, ShieldCheck } from 'lucide-react';

interface VipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VipModal: React.FC<VipModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleJoin = () => {
    window.open('https://t.me/KillerbossCrackerChannel', '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Telegram VIP Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-500/30 ring-4 ring-blue-500/20">
          <Send className="w-8 h-8 text-white -translate-x-0.5 translate-y-0.5" />
        </div>

        {/* Bilingual dialog text */}
        <h3 className="text-lg font-black text-slate-100 mb-1">
          VIP Member or Team Member?
        </h3>
        <p className="text-xs font-semibold text-cyan-400 mb-2">
          Vip Member လား / Team မန်ဘာလား?
        </p>
        <p className="text-xs text-slate-300 leading-relaxed mb-6 px-1">
          30s VIP Signal ယူရန် VIP Member ဖြစ်ရန်လိုပါသည် 💀 / Channel Join ပြီး Free Mode သုံးနိုင်ပါသည် 💤
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleJoin}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>JOIN VIP CHANNEL 🚀</span>
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            CANCEL (ပယ်ဖျက်မည်)
          </button>
        </div>
      </div>
    </div>
  );
};
