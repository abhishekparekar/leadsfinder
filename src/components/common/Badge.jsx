import React from 'react';

export function PriorityBadge({ priority }) {
  const styles = {
    Hot: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    Warm: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Cold: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    Unqualified: 'bg-slate-500/15 text-slate-400 border-slate-500/30'
  };

  const style = styles[priority] || styles.Cold;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${priority === 'Hot' ? 'bg-rose-400 animate-pulse' : priority === 'Warm' ? 'bg-amber-400' : 'bg-slate-400'}`}></span>
      {priority || 'Cold'}
    </span>
  );
}

export function StageBadge({ stage }) {
  const styles = {
    New: 'bg-slate-800 text-slate-300 border-slate-700',
    Researching: 'bg-indigo-950/60 text-indigo-300 border-indigo-700/50',
    Qualified: 'bg-cyan-950/60 text-cyan-300 border-cyan-700/50',
    Contacted: 'bg-blue-950/60 text-blue-300 border-blue-700/50',
    Interested: 'bg-teal-950/60 text-teal-300 border-teal-700/50',
    'Meeting Booked': 'bg-purple-950/60 text-purple-300 border-purple-700/50',
    'Proposal Sent': 'bg-amber-950/60 text-amber-300 border-amber-700/50',
    Negotiation: 'bg-orange-950/60 text-orange-300 border-orange-700/50',
    Won: 'bg-emerald-950/70 text-emerald-300 border-emerald-600 font-bold',
    Lost: 'bg-rose-950/60 text-rose-300 border-rose-800',
    'Not a Fit': 'bg-slate-900 text-slate-400 border-slate-800'
  };

  const style = styles[stage] || styles.New;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${style}`}>
      {stage}
    </span>
  );
}
