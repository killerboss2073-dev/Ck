import React, { useRef, useEffect } from 'react';
import { Terminal, Copy, Trash2, Check } from 'lucide-react';

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'bet' | 'win' | 'loss' | 'api' | 'warn';
  message: string;
  details?: string;
}

interface ConsoleLogDrawerProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const ConsoleLogDrawer: React.FC<ConsoleLogDrawerProps> = ({ logs, onClearLogs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopy = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message} ${l.details || ''}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 shadow-xl flex flex-col gap-2 font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200">Execution Logs & API Terminal</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
            {logs.length} events
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Copy logs"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={onClearLogs}
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Terminal View */}
      <div
        ref={scrollRef}
        className="h-44 sm:h-52 overflow-y-auto space-y-1.5 pr-1 text-[11px] leading-relaxed"
      >
        {logs.length === 0 ? (
          <div className="text-slate-600 italic py-4 text-center">
            Ready for execution. AutoBot engine standby...
          </div>
        ) : (
          logs.map((log) => {
            let color = 'text-slate-300';
            let badgeBg = 'bg-slate-800 text-slate-300';

            if (log.type === 'win') {
              color = 'text-emerald-400 font-bold';
              badgeBg = 'bg-emerald-950 text-emerald-300 border border-emerald-800';
            } else if (log.type === 'loss') {
              color = 'text-red-400';
              badgeBg = 'bg-red-950 text-red-300 border border-red-800';
            } else if (log.type === 'bet') {
              color = 'text-amber-300';
              badgeBg = 'bg-amber-950 text-amber-300 border border-amber-800';
            } else if (log.type === 'api') {
              color = 'text-cyan-300';
              badgeBg = 'bg-cyan-950 text-cyan-300 border border-cyan-800';
            } else if (log.type === 'warn') {
              color = 'text-yellow-400';
              badgeBg = 'bg-yellow-950 text-yellow-300 border border-yellow-800';
            }

            return (
              <div key={log.id} className="flex items-start gap-2 hover:bg-slate-900/60 p-0.5 rounded">
                <span className="text-slate-600 text-[10px] shrink-0">{log.timestamp}</span>
                <span className={`text-[9px] px-1 py-0.2 rounded uppercase font-bold shrink-0 ${badgeBg}`}>
                  {log.type}
                </span>
                <div className="flex-1 break-all">
                  <span className={color}>{log.message}</span>
                  {log.details && (
                    <span className="text-slate-500 text-[10px] block mt-0.5">{log.details}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
