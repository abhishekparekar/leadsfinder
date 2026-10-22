import React, { useState, useEffect } from 'react';
import { 
  X, 
  Globe, 
  Phone, 
  MapPin, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Sparkles, 
  AlertTriangle,
  User,
  Tag,
  DollarSign,
  TrendingUp,
  Send,
  Plus,
  ExternalLink
} from 'lucide-react';
import { PriorityBadge, StageBadge } from '../common/Badge';
import { ScorePill } from '../common/ScorePill';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export function LeadDetailModal({ leadId, onClose, onLeadUpdated, onOpenOutreach }) {
  const { currentUser, isSales, isAdmin } = useAuth();
  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'timeline' | 'scoring' | 'tasks'

  // Activity Form State
  const [activityType, setActivityType] = useState('call');
  const [activityOutcome, setActivityOutcome] = useState('Spoke with Doctor / Manager');
  const [activitySummary, setActivitySummary] = useState('');
  const [activityDetails, setActivityDetails] = useState('');
  const [activityNextStep, setActivityNextStep] = useState('');

  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskType, setTaskType] = useState('call');
  const [taskDueDate, setTaskDueDate] = useState('');

  // Priority Override State
  const [overridePriority, setOverridePriority] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [editingPriority, setEditingPriority] = useState(false);

  // Stage change state
  const [dealValue, setDealValue] = useState(0);
  const [cashCollected, setCashCollected] = useState(0);

  const loadLead = async () => {
    try {
      setLoading(true);
      const [leadData, acts] = await Promise.all([
        api.getLeadById(leadId),
        api.getActivities(leadId)
      ]);
      setLead(leadData);
      setActivities(acts);
      setDealValue(leadData.dealValue || 0);
      setCashCollected(leadData.cashCollected || 0);
      setOverridePriority(leadData.priority);
      setOverrideReason(leadData.priorityReason || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leadId) loadLead();
  }, [leadId]);

  if (!leadId) return null;

  const handleStageChange = async (newStage) => {
    try {
      const updated = await api.updateLeadStage(lead.id, {
        stage: newStage,
        dealValue,
        cashCollected,
        actorUid: currentUser?.uid
      });
      setLead(updated);
      const acts = await api.getActivities(lead.id);
      setActivities(acts);
      if (onLeadUpdated) onLeadUpdated(updated);
    } catch (err) {
      alert('Error updating stage: ' + err.message);
    }
  };

  const handleSavePriorityOverride = async () => {
    try {
      const updated = await api.updateLead(lead.id, {
        priority: overridePriority,
        priorityReason: overrideReason
      }, currentUser?.uid);
      setLead(updated);
      setEditingPriority(false);
      if (onLeadUpdated) onLeadUpdated(updated);
    } catch (err) {
      alert('Error updating priority: ' + err.message);
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!activitySummary) return;
    try {
      await api.logActivity(lead.id, {
        type: activityType,
        outcome: activityOutcome,
        summary: activitySummary,
        details: activityDetails,
        nextStep: activityNextStep,
        actorUid: currentUser?.uid
      });
      setActivitySummary('');
      setActivityDetails('');
      setActivityNextStep('');
      const acts = await api.getActivities(lead.id);
      setActivities(acts);
      if (onLeadUpdated) onLeadUpdated();
    } catch (err) {
      alert('Error logging activity: ' + err.message);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle || !taskDueDate) return;
    try {
      await api.createTask({
        leadId: lead.id,
        title: taskTitle,
        type: taskType,
        dueAt: new Date(taskDueDate).toISOString(),
        actorUid: currentUser?.uid
      });
      setTaskTitle('');
      setTaskDueDate('');
      alert('Follow-up task scheduled successfully!');
      if (onLeadUpdated) onLeadUpdated();
    } catch (err) {
      alert('Error creating task: ' + err.message);
    }
  };

  const stages = [
    'New', 'Researching', 'Qualified', 'Contacted', 'Interested', 
    'Meeting Booked', 'Proposal Sent', 'Negotiation', 'Won', 'Lost', 'Not a Fit'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {lead?.businessName || 'Loading Lead...'}
              </h2>
              {lead && <PriorityBadge priority={lead.priority} />}
              {lead && <ScorePill score={lead.score} />}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-blue-400" />
                {lead?.category} {lead?.subcategory && `• ${lead.subcategory}`}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                {lead?.locality}, {lead?.city}
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                Source: {lead?.sourceName} (Verified: {lead?.lastVerifiedAt})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {lead && onOpenOutreach && (
              <button
                onClick={() => {
                  onClose();
                  onOpenOutreach(lead);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Outreach</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stage Selector Bar */}
        {lead && (
          <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Stage:</span>
            {stages.map((stg) => {
              const isActive = lead.pipelineStage === stg;
              return (
                <button
                  key={stg}
                  onClick={() => handleStageChange(stg)}
                  className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-sm ring-1 ring-blue-400'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                  }`}
                >
                  {stg}
                </button>
              );
            })}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'overview' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview & Commercials
          </button>
          <button
            onClick={() => setActiveTab('scoring')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'scoring' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Scoring Transparency ({lead?.score}/100)
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'timeline' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Activity Timeline ({activities.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'tasks' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Schedule Follow-up
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-20 text-center text-slate-500">Loading lead profile...</div>
          ) : !lead ? (
            <div className="py-20 text-center text-slate-500">Lead not found</div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column: Contact & Presence */}
                  <div className="space-y-4 md:col-span-1">
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-750 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Contact Channels</h4>
                      
                      <div className="space-y-2.5 text-xs">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                          {lead.businessPhone ? (
                            <a href={`tel:${lead.businessPhone}`} className="text-emerald-400 hover:underline font-mono">
                              {lead.businessPhone}
                            </a>
                          ) : (
                            <span className="text-slate-500 italic">No phone in record</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                          {lead.businessWebsite ? (
                            <a href={lead.businessWebsite} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline truncate">
                              {lead.businessWebsite}
                            </a>
                          ) : (
                            <span className="text-amber-400/80 italic font-medium">No website recorded</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                          {lead.publicBusinessEmail ? (
                            <span className="text-slate-300 font-mono truncate">{lead.publicBusinessEmail}</span>
                          ) : (
                            <span className="text-slate-500 italic">No lawful public email</span>
                          )}
                        </div>

                        <div className="flex items-start gap-2 pt-1 border-t border-slate-700/50">
                          <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <span className="text-slate-300">{lead.address || `${lead.locality}, ${lead.city}`}</span>
                        </div>

                        {(lead.googleMapsUri || (lead.businessName && lead.city)) && (
                          <div className="flex items-center gap-2 pt-1 border-t border-slate-700/50">
                            <ExternalLink className="w-4 h-4 text-cyan-400 shrink-0" />
                            <a
                              href={lead.googleMapsUri || `https://maps.google.com/?q=${encodeURIComponent(lead.businessName + ' ' + (lead.address || lead.city))}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                            >
                              <span>Open on Google Maps</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ownership & Commercials */}
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-750 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Deal Value & Cash (PRD 7.9)</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Deal Potential / Contract Value (₹)</label>
                          <input
                            type="number"
                            value={dealValue}
                            onChange={(e) => setDealValue(Number(e.target.value))}
                            onBlur={() => handleStageChange(lead.pipelineStage)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-sm font-semibold text-emerald-400 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Cash Collected (₹) — (Only count won)</label>
                          <input
                            type="number"
                            value={cashCollected}
                            onChange={(e) => setCashCollected(Number(e.target.value))}
                            onBlur={() => handleStageChange(lead.pipelineStage)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-sm font-semibold text-cyan-400 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="text-[11px] text-slate-500 italic">
                          PRD Rule: Leads are not labeled as revenue until recorded as won and collected.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Opportunities, Evidence, Notes */}
                  <div className="space-y-4 md:col-span-2">
                    {/* Opportunities identified */}
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-750 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                          Identified iCoded Service Opportunities
                        </h4>
                        <span className="text-xs text-blue-400 font-semibold">{lead.opportunityTypes?.length || 0} active</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {lead.opportunityTypes && lead.opportunityTypes.length > 0 ? (
                          lead.opportunityTypes.map((opp, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-950/60 text-blue-300 border border-blue-800">
                              {opp}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 italic">No specific opportunities selected yet.</span>
                        )}
                      </div>

                      {/* Evidence */}
                      <div className="pt-2 border-t border-slate-750">
                        <p className="text-xs font-semibold text-slate-300 mb-1.5">Observed Signals & Evidence:</p>
                        <ul className="space-y-1 text-xs text-slate-400 list-disc list-inside">
                          {lead.opportunityEvidence?.map((ev, i) => (
                            <li key={i}>{ev}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Priority Override Box */}
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-750 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Priority & Human Override (PRD Section 7.5)
                        </h4>
                        {!editingPriority && (
                          <button
                            onClick={() => setEditingPriority(true)}
                            className="text-xs text-blue-400 hover:underline"
                          >
                            Override Priority
                          </button>
                        )}
                      </div>

                      {editingPriority ? (
                        <div className="space-y-2 bg-slate-900 p-3 rounded-lg border border-slate-700">
                          <div className="flex items-center gap-3">
                            {['Hot', 'Warm', 'Cold', 'Unqualified'].map(p => (
                              <label key={p} className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                                <input
                                  type="radio"
                                  name="priority"
                                  value={p}
                                  checked={overridePriority === p}
                                  onChange={(e) => setOverridePriority(e.target.value)}
                                />
                                {p}
                              </label>
                            ))}
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Reason for overriding algorithmic score..."
                              value={overrideReason}
                              onChange={(e) => setOverrideReason(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingPriority(false)}
                              className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSavePriorityOverride}
                              className="px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-500"
                            >
                              Save Override
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <PriorityBadge priority={lead.priority} />
                            {lead.priorityReason && (
                              <span className="text-slate-400 italic">“{lead.priorityReason}”</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Internal Notes */}
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-750 space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Internal Sales Notes</h4>
                      <p className="text-xs text-slate-300 whitespace-pre-wrap bg-slate-900 p-3 rounded-lg border border-slate-800">
                        {lead.notes || 'No notes added yet.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SCORING TRANSPARENCY */}
              {activeTab === 'scoring' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/50 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>Transparent Prioritization Score:</span>
                        <span className="text-blue-400 font-black">{lead.score}/100</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Calculated transparently across 5 business dimensions per PRD Section 7.5. Not an automated claim of business intent.
                      </p>
                    </div>
                    <PriorityBadge priority={lead.priority} />
                  </div>

                  {/* 5 Dimensions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Dim 1 */}
                    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-300">1. Target-Sector Fit</span>
                        <span className="font-bold text-blue-400">{lead.scoreBreakdown?.targetSectorFit || 0} / 25 pts</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: `${((lead.scoreBreakdown?.targetSectorFit || 0) / 25) * 100}%` }}></div>
                      </div>
                      <p className="text-[11px] text-slate-400">Evaluates alignment with iCoded appointment & portal automation offerings.</p>
                    </div>

                    {/* Dim 2 */}
                    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-300">2. Service Opportunity Evidence</span>
                        <span className="font-bold text-cyan-400">{lead.scoreBreakdown?.serviceOpportunityEvidence || 0} / 25 pts</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div className="bg-cyan-500 h-full" style={{ width: `${((lead.scoreBreakdown?.serviceOpportunityEvidence || 0) / 25) * 100}%` }}></div>
                      </div>
                      <p className="text-[11px] text-slate-400">Based on verifiable signals: missing booking widget, legacy web design, manual scheduling.</p>
                    </div>

                    {/* Dim 3 */}
                    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-300">3. Business Reachability</span>
                        <span className="font-bold text-emerald-400">{lead.scoreBreakdown?.businessReachability || 0} / 15 pts</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${((lead.scoreBreakdown?.businessReachability || 0) / 15) * 100}%` }}></div>
                      </div>
                      <p className="text-[11px] text-slate-400">Direct phone accessibility, physical locality, and lawful contact points.</p>
                    </div>

                    {/* Dim 4 */}
                    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-300">4. Digital Presence Improvement Opportunity</span>
                        <span className="font-bold text-amber-400">{lead.scoreBreakdown?.digitalPresenceOpportunity || 0} / 20 pts</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: `${((lead.scoreBreakdown?.digitalPresenceOpportunity || 0) / 20) * 100}%` }}></div>
                      </div>
                      <p className="text-[11px] text-slate-400">Public rating gaps, review volume, and mobile-friendly web absence.</p>
                    </div>

                    {/* Dim 5 */}
                    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 md:col-span-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-300">5. Freshness & Human Verification</span>
                        <span className="font-bold text-purple-400">{lead.scoreBreakdown?.freshnessVerification || 0} / 15 pts</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full" style={{ width: `${((lead.scoreBreakdown?.freshnessVerification || 0) / 15) * 100}%` }}></div>
                      </div>
                      <p className="text-[11px] text-slate-400">Recent provider discovery and sales verification confidence status.</p>
                    </div>
                  </div>

                  {/* Transparent Explanations */}
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-750 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Explanation Log</h4>
                    <div className="space-y-1.5">
                      {lead.scoreBreakdown?.explanations?.map((exp, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>{exp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TIMELINE & ACTIVITY LOGGING */}
              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  {/* Log new activity box */}
                  <form onSubmit={handleAddActivity} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-blue-400" />
                      Log Activity (Call, Meeting, Note, Proposal)
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Activity Type</label>
                        <select
                          value={activityType}
                          onChange={(e) => setActivityType(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                        >
                          <option value="call">Call</option>
                          <option value="meeting">In-Person / Video Meeting</option>
                          <option value="proposal">Proposal Dispatched</option>
                          <option value="note">Internal Research Note</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Outcome</label>
                        <input
                          type="text"
                          value={activityOutcome}
                          onChange={(e) => setActivityOutcome(e.target.value)}
                          placeholder="e.g. Interested, Scheduled Demo, Voicemail"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={activitySummary}
                        onChange={(e) => setActivitySummary(e.target.value)}
                        placeholder="Brief summary of what happened..."
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                        required
                      />
                    </div>

                    <div>
                      <textarea
                        rows={2}
                        value={activityDetails}
                        onChange={(e) => setActivityDetails(e.target.value)}
                        placeholder="Additional details or client requests..."
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                      />
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <input
                        type="text"
                        value={activityNextStep}
                        onChange={(e) => setActivityNextStep(e.target.value)}
                        placeholder="Agreed next step..."
                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 w-2/3"
                      />
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                      >
                        Log Activity
                      </button>
                    </div>
                  </form>

                  {/* Chronological Activity List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Activity History</h4>
                    {activities.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No activities logged yet.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {activities.map((act) => (
                          <div key={act.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-750 flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 shrink-0 mt-0.5">
                              {act.type === 'call' ? <Phone className="w-4 h-4 text-emerald-400" /> :
                               act.type === 'meeting' ? <Calendar className="w-4 h-4 text-purple-400" /> :
                               act.type === 'email' ? <Mail className="w-4 h-4 text-blue-400" /> :
                               act.type === 'proposal' ? <DollarSign className="w-4 h-4 text-amber-400" /> :
                               <FileText className="w-4 h-4 text-slate-400" />}
                            </div>

                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-200">{act.summary}</span>
                                <span className="text-[10px] text-slate-500">
                                  {new Date(act.occurredAt || act.createdAt).toLocaleString()}
                                </span>
                              </div>
                              {act.details && <p className="text-xs text-slate-400">{act.details}</p>}
                              {act.nextStep && (
                                <p className="text-[11px] text-blue-400 font-medium">Next: {act.nextStep}</p>
                              )}
                              {act.providerMessageId && (
                                <p className="text-[10px] text-slate-500 font-mono">Provider ID: {act.providerMessageId} • {act.deliveryStatus || 'Sent'}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: TASKS & FOLLOW-UPS */}
              {activeTab === 'tasks' && (
                <form onSubmit={handleAddTask} className="p-6 rounded-xl bg-slate-800/50 border border-slate-750 space-y-4 max-w-xl mx-auto">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    Schedule Next Action Date (PRD 7.6)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Follow-ups make sales measurable instead of relying on memory. This will appear on your dashboard when due.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Task Title / Agenda</label>
                      <input
                        type="text"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        placeholder="e.g. Call Dr. Vivek regarding appointment bot demo"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-300 block mb-1">Task Type</label>
                        <select
                          value={taskType}
                          onChange={(e) => setTaskType(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                        >
                          <option value="call">Phone Call</option>
                          <option value="meeting">Meeting</option>
                          <option value="email">Email Follow-up</option>
                          <option value="review">Audit / Prep</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-slate-300 block mb-1">Due Date & Time</label>
                        <input
                          type="datetime-local"
                          value={taskDueDate}
                          onChange={(e) => setTaskDueDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition"
                      >
                        Create Task & Set Lead Follow-up
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
