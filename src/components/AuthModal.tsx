import React, { useState, useEffect } from 'react';
import { X, Lock, Phone, Server, CheckSquare, Square, LogIn, ShieldCheck } from 'lucide-react';
import { SERVERS } from '../utils/api.ts';
import { sound } from '../utils/sound.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginWithPhone: (
    phone: string,
    pass: string,
    serverId: string,
    customUrl: string,
    remember: boolean
  ) => Promise<{ success: boolean; message?: string }>;
  selectedServerId: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginWithPhone,
  selectedServerId,
}) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [serverId, setServerId] = useState(selectedServerId || SERVERS[0].id);
  const [remember, setRemember] = useState(true);
  const [savedPhone, setSavedPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    try {
      const storedPh = localStorage.getItem('wingo_ph');
      const storedPw = localStorage.getItem('wingo_pw');
      if (storedPh) {
        setSavedPhone(storedPh);
        setPhone(storedPh);
      }
      if (storedPw) {
        setPassword(storedPw);
      }
    } catch {
      // Ignore
    }
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    sound.playTick();

    if (phone.length < 8) {
      setErrorMsg('ဖုန်းနံပါတ် အနည်းဆုံး ၈ လုံး ထည့်သွင်းပါ (Phone number too short)');
      setLoading(false);
      return;
    }
    if (password.length < 4) {
      setErrorMsg('လျှို့ဝှက်နံပါတ် အနည်းဆုံး ၄ လုံး ထည့်သွင်းပါ (Password too short)');
      setLoading(false);
      return;
    }

    const res = await onLoginWithPhone(phone, password, serverId, '', remember);
    setLoading(false);

    if (res.success) {
      sound.playWin();
      onClose();
    } else {
      setErrorMsg(res.message || 'Login failed. Please check credentials or network.');
      sound.playLoss();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          aria-label="Close modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <LogIn className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Connect Game Account</h2>
            <p className="text-xs text-slate-400">777 Big Win Server Authentication</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Server Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Server</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SERVERS.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setServerId(s.id)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                    serverId === s.id
                      ? 'bg-amber-950/60 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Phone Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Phone Number (ဖုန်းနံပါတ်)</span>
              </label>
              {savedPhone && (
                <button
                  type="button"
                  onClick={() => setPhone(savedPhone)}
                  className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                >
                  Recent ({savedPhone})
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500 text-sm font-mono">
                +95
              </div>
              <input
                type="text"
                placeholder="09... / 9..."
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-12 pr-3 py-2.5 text-sm font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Password (လျှို့ဝှက်နံပါတ်)</span>
            </label>
            <input
              type="password"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg('');
              }}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Remember Credentials Checkbox */}
          <button
            type="button"
            onClick={() => setRemember(!remember)}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer text-left self-start"
          >
            {remember ? (
              <CheckSquare className="w-4 h-4 text-cyan-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-600" />
            )}
            <span>Remember account credentials (အကောင့်မှတ်ထားမည်)</span>
          </button>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs leading-relaxed animate-fade-in">
              {errorMsg}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
              loading
                ? 'opacity-60 bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            {loading ? 'Connecting...' : 'Connect to Game Server (အကောင့်ချိတ်ဆက်မည်)'}
          </button>
        </form>
      </div>
    </div>
  );
};
