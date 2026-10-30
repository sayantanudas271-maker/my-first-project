import React, { useState } from 'react';
import { ExecutionLog } from '../types.ts';
import { Terminal, Shield, AlertTriangle, CheckCircle, Info, Sparkles, Filter } from 'lucide-react';

interface ExecutionStreamProps {
  logs: ExecutionLog[];
  maxHeight?: string;
}

export const ExecutionStream: React.FC<ExecutionStreamProps> = ({ logs, maxHeight = 'h-80' }) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    if (filterLevel === 'ALL') return true;
    return log.level === filterLevel;
  });

  const getLevelStyle = (level: ExecutionLog['level']) => {
    switch (level) {
      case 'WARN':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'ACTION':
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
      case 'SUCCESS':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'ERROR':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getLevelIcon = (level: ExecutionLog['level']) => {
    switch (level) {
      case 'WARN':
        return <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0" />;
      case 'ACTION':
        return <Sparkles className="h-3 w-3 text-indigo-400 shrink-0" />;
      case 'SUCCESS':
        return <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0" />;
      case 'ERROR':
        return <AlertTriangle className="h-3 w-3 text-rose-400 shrink-0" />;
      default:
        return <Info className="h-3 w-3 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 backdrop-blur-md overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-bold text-slate-200">
            Autonomous Agent Execution Feed
          </span>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Filter controls */}
        <div className="flex items-center space-x-1.5 text-[11px]">
          {['ALL', 'ACTION', 'WARN', 'SUCCESS'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-2 py-0.5 rounded font-mono transition ${
                filterLevel === lvl
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed List */}
      <div className={`p-3 space-y-2 overflow-y-auto font-mono text-xs ${maxHeight}`}>
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 italic">
            No agent execution events match the current filter.
          </div>
        ) : (
          filteredLogs.map((log, i) => (
            <div
              key={i}
              className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 hover:border-slate-700/80 transition flex items-start space-x-2.5"
            >
              <div className="mt-0.5">{getLevelIcon(log.level)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1 mb-1">
                  <span className="text-[10px] text-slate-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-500/30">
                    {log.agentName}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${getLevelStyle(log.level)}`}>
                    {log.action}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  {log.result}
                </p>
                {log.data && (
                  <pre className="mt-1.5 p-2 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-400 overflow-x-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
