import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  DollarSign, 
  Plus, 
  ChevronRight, 
  Sparkles, 
  AlertCircle, 
  MapPin, 
  X,
  TrendingUp,
  UserCheck,
  Trophy,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PriorityBadge } from '../components/common/Badge';
import { ScorePill } from '../components/common/ScorePill';
import { LeadDetailModal } from '../components/leads/LeadDetailModal';

const PIPELINE_STAGES = [
  { id: 'New', label: 'New Discovered', color: 'border-slate-700 bg-slate-900/60' },
  { id: 'Researching', label: 'Researching', color: 'border-indigo-700/40 bg-indigo-950/20' },
  { id: 'Qualified', label: 'Qualified Fit', color: 'border-cyan-700/40 bg-cyan-950/20' },
  { id: 'Contacted', label: 'Contacted', color: 'border-blue-700/40 bg-blue-950/20' },
  { id: 'Meeting Booked', label: 'Meeting Booked', color: 'border-purple-700/40 bg-purple-950/20' },
  { id: 'Proposal Sent', label: 'Proposal Sent', color: 'border-amber-700/40 bg-amber-950/20' },
  { id: 'Negotiation', label: 'Negotiation', color: 'border-orange-700/40 bg-orange-950/20' },
  { id: 'Won', label: 'Closed Won', color: 'border-emerald-600/50 bg-emerald-950/30' },
  { id: 'Lost', label: 'Lost / Closed', color: 'border-rose-800/40 bg-rose-950/20' }
];

export function PipelinePage({ onOpenOutreach }) {
  const { currentUser } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLeadId, setActiveLeadId] = useState(null);

  // Won Modal
  const [wonModalLead, setWonModalLead] = useState(null);
  const [wonDealValue, setWonDealValue] = useState(0);
  const [wonCashCollected, setWonCashCollected] = useState(0);

  // Lost Modal
  const [lostModalLead, setLostModalLead] = useState(null);
  const [lossReason, setLossReason] = useState('no response');

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await api.getLeads(currentUser?.uid ? { owner: currentUser.uid } : {});
      setLeads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [currentUser?.uid]);

  const moveStage = async (lead, newStage) => {
    if (newStage === 'Won') {
      setWonDealValue(lead.dealValue || 50000);
      setWonCashCollected(lead.cashCollected || lead.dealValue || 50000);
      setWonModalLead(lead);
      return;
    }

    if (newStage === 'Lost' || newStage === 'Not a Fit') {
      setLostModalLead(lead);
      return;
    }

    try {
      await api.updateLeadStage(lead.id, {
        stage: newStage,
        actorUid: currentUser?.uid
      });
      loadLeads();
    } catch (err) {
      alert('Error updating stage: ' + err.message);
    }
  };

  const handleConfirmWon = async () => {
    if (!wonModalLead) return;
    try {
      await api.updateLeadStage(wonModalLead.id, {
        stage: 'Won',
        dealValue: Number(wonDealValue),
        cashCollected: Number(wonCashCollected),
        actorUid: currentUser?.uid
      });

      // Confetti celebration!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      setWonModalLead(null);
      loadLeads();
    } catch (err) {
      alert('Failed to mark as Won: ' + err.message);
    }
  };

  const handleConfirmLost = async () => {
    if (!lostModalLead) return;
    try {
      await api.updateLeadStage(lostModalLead.id, {
        stage: 'Lost',
        lossReason,
        actorUid: currentUser?.uid
      });
      setLostModalLead(null);
      loadLeads();
    } catch (err) {
      alert('Failed to mark as Lost: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Sales Pipeline Kanban</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-semibold">
              Live Stages
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track deals from initial research to cash collected. Move cards across stages to advance deals.
          </p>
        </div>
      </div>

      {/* Kanban Board Horizontal Scroll Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-slate-700 min-h-[620px]">
        {PIPELINE_STAGES.map((col) => {
          const colLeads = leads.filter(l => l.pipelineStage === col.id);
          const colValue = colLeads.reduce((acc, curr) => acc + (Number(curr.dealValue) || 0), 0);

          return (
            <div
              key={col.id}
              className={`w-72 sm:w-80 shrink-0 rounded-2xl border ${col.color} p-4 flex flex-col justify-between shadow-xl flex-shrink-0`}
            >
              {/* Column Header */}
              <div className="space-y-1 mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white">{col.label}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs font-mono font-bold text-slate-300 border border-slate-700">
                    {colLeads.length}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {colValue > 0 ? `Potential: ₹${colValue.toLocaleString()}` : '—'}
                </div>
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[580px] pr-1">
                {colLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 rounded-xl bg-slate-900/90 border border-slate-750 hover:border-slate-600 transition shadow-md space-y-3 cursor-pointer group"
                    onClick={() => setActiveLeadId(lead.id)}
                  >
                    {/* Top Row: Category & Score */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 truncate max-w-[150px]">
                        {lead.category}
                      </span>
                      <ScorePill score={lead.score} size="sm" />
                    </div>

                    {/* Business Name */}
                    <h4 className="font-bold text-white text-xs group-hover:text-blue-400 transition leading-snug">
                      {lead.businessName}
                    </h4>

                    {/* Location */}
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                      <span className="truncate">{lead.locality}</span>
                    </p>

                    {/* Deal Value if set */}
                    {lead.dealValue > 0 && (
                      <div className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>₹{lead.dealValue.toLocaleString()}</span>
                      </div>
                    )}

                    {/* Card Footer: Priority and Advance Stage selector */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                      <PriorityBadge priority={lead.priority} />

                      {/* Move to next stage quick button */}
                      <select
                        value={lead.pipelineStage}
                        onChange={(e) => moveStage(lead, e.target.value)}
                        className="bg-slate-950 text-[10px] text-slate-300 font-medium px-2 py-1 rounded border border-slate-750 focus:outline-none"
                      >
                        {PIPELINE_STAGES.map(s => (
                          <option key={s.id} value={s.id}>→ {s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                {colLeads.length === 0 && (
                  <div className="py-12 text-center text-xs text-slate-500 italic border border-dashed border-slate-800 rounded-xl">
                    No leads in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Won Modal (PRD Section 7.6 & 7.9: Confirms Won Deal Value and Cash Collected) */}
      {wonModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/50 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span>Mark Deal as Closed WON!</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">{wonModalLead.businessName}</p>
              </div>
              <button onClick={() => setWonModalLead(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Total Agreed Deal Value (₹)</label>
                <input
                  type="number"
                  value={wonDealValue}
                  onChange={(e) => setWonDealValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm font-bold text-emerald-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Cash Collected to Date (₹)</label>
                <input
                  type="number"
                  value={wonCashCollected}
                  onChange={(e) => setWonCashCollected(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm font-bold text-cyan-400 focus:outline-none"
                  required
                />
              </div>

              <p className="text-[11px] text-slate-400 italic">
                PRD Section 7.9: Revenue is strictly counted when verified won or collected.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setWonModalLead(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmWon}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
              >
                <Trophy className="w-3.5 h-3.5 text-white" />
                <span>Confirm Won Deal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lost Modal with PRD Loss Reasons */}
      {lostModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                  <span>Record Deal Loss Reason</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">{lostModalLead.businessName}</p>
              </div>
              <button onClick={() => setLostModalLead(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs text-slate-300 block mb-1">Reason for Loss (PRD Section 7.6):</label>
              <select
                value={lossReason}
                onChange={(e) => setLossReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
              >
                <option value="no response">No Response / Unreachable</option>
                <option value="no current need">No Current Need</option>
                <option value="budget">Budget Constraints</option>
                <option value="timing">Timing / Deferred to next quarter</option>
                <option value="competitor">Chosen Competitor</option>
                <option value="invalid contact">Invalid Contact Details</option>
                <option value="opted out">Opted Out of Outreach</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setLostModalLead(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLost}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition"
              >
                Record Loss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {activeLeadId && (
        <LeadDetailModal
          leadId={activeLeadId}
          onClose={() => setActiveLeadId(null)}
          onLeadUpdated={() => loadLeads()}
          onOpenOutreach={onOpenOutreach}
        />
      )}
    </div>
  );
}
