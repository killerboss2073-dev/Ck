import React from 'react';
import { Bot, Volume2, VolumeX, Send, RefreshCw, Server, User, LogOut } from 'lucide-react';
import { sound } from '../utils/sound.ts';
import { SERVERS } from '../utils/api.ts';

interface NavbarProps {
  balance: number;
  userId: string;
  isBotRunning: boolean;
  selectedServer: string;
  isLoggedIn: boolean;
  onOpenLogin: () => void;
  onOpenVipModal: () => void;
  onRefreshBalance: () => void;
  onSelectServer: (serverId: string) => void;
  onLogout: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  balance,
  userId,
  isBotRunning,
  selectedServer,
  isLoggedIn,
  onOpenLogin,
  onOpenVipModal,
  onRefreshBalance,
  onSelectServer,
  onLogout,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-wider bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300 bg-clip-text text-transparent drop-shadow-sm font-mono">
                KILLERBOSS V1.9
              </span>
              {isBotRunning && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-600/40 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  RUNNING
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Server & Balance Controls */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Server Selector Dropdown */}
          <div className="flex items-center bg-slate-950/80 rounded-lg border border-slate-800 p-1 text-xs">
            <Server className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
            <select
              aria-label="Select Lottery Server"
              value={selectedServer}
              onChange={(e) => onSelectServer(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none pr-1 cursor-pointer"
            >
              {SERVERS.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* GAME ID Pill */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 shadow-sm">
            <div className={`w-2 h-2 rounded-full ${isLoggedIn ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            <div className="text-left">
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                GAME ID
              </span>
              <span className="text-xs font-mono font-bold text-emerald-300">
                {isLoggedIn && userId ? userId : 'Not Connected'}
              </span>
            </div>
          </div>

          {/* Balance Pill */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-slate-950 to-slate-900 border border-cyan-500/30 rounded-xl px-3 py-1.5 shadow-inner">
            <div className="text-right">
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Balance</span>
              <span className="text-sm font-black font-mono text-cyan-300">
                K {balance.toLocaleString()}
              </span>
            </div>
            <button
              aria-label="Refresh Balance"
              onClick={() => {
                sound.playTick();
                onRefreshBalance();
              }}
              title="Refresh Balance"
              className="p-1 text-slate-400 hover:text-cyan-300 transition-colors rounded hover:bg-slate-800 active:rotate-180 duration-300 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sound Mute/Unmute */}
          <button
            aria-label={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
            onClick={onToggleSound}
            title={soundEnabled ? 'Sound On' : 'Sound Muted'}
            className="p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* VIP Channel Button */}
          <button
            onClick={onOpenVipModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">VIP Channel</span>
          </button>

          {/* User ID / Login status */}
          {isLoggedIn ? (
            <button
              onClick={onLogout}
              title="Logout"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-900/60 bg-red-950/40 hover:bg-red-900/60 text-red-300 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-cyan-500 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 transition-colors cursor-pointer animate-pulse"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
