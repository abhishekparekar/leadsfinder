import React from 'react';

export function ScorePill({ score, size = 'md' }) {
  let color = 'text-slate-400 border-slate-700 bg-slate-800/50';
  let barColor = 'bg-slate-500';

  if (score >= 80) {
    color = 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40';
    barColor = 'bg-emerald-500';
  } else if (score >= 60) {
    color = 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40';
    barColor = 'bg-cyan-500';
  } else if (score >= 40) {
    color = 'text-amber-400 border-amber-500/30 bg-amber-950/40';
    barColor = 'bg-amber-500';
  } else {
    color = 'text-rose-400 border-rose-500/30 bg-rose-950/40';
    barColor = 'bg-rose-500';
  }

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${color}`}>
        <span>{score}</span>
        <span className="text-[10px] text-slate-400">/100</span>
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border ${color}`}>
      <div className="w-6 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${barColor}`} style={{ width: `${score}%` }}></div>
      </div>
      <span className="text-sm font-bold tracking-tight">{score}</span>
      <span className="text-xs text-slate-400 font-normal">pts</span>
    </div>
  );
}
