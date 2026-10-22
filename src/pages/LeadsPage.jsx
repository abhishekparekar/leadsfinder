import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye, 
  Send, 
  CheckSquare, 
  Square,
  Sparkles,
  Phone,
  Globe,
  MessageCircle,
  ExternalLink,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PriorityBadge, StageBadge } from '../components/common/Badge';
import { ScorePill } from '../components/common/ScorePill';
import { LeadDetailModal } from '../components/leads/LeadDetailModal';
import { getCategoryIcon } from './DiscoverPage';

export function LeadsPage({ onOpenOutreach }) {
  const { currentUser, isSales, isAdmin, canExport } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');
  const [hasWebsiteFilter, setHasWebsiteFilter] = useState('all');

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeLeadId, setActiveLeadId] = useState(null);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await api.getLeads({
        search,
        priority: priorityFilter,
        stage: stageFilter,
        hasWebsite: hasWebsiteFilter,
        ...(currentUser?.uid ? { owner: currentUser.uid } : {})
      });
      setLeads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [stageFilter, priorityFilter, hasWebsiteFilter, currentUser?.uid]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadLeads();
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === leads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map(l => l.id));
    }
  };

  const toggleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleInstantExport = async () => {
    try {
      setExporting(true);
      await api.exportCsv({
        leadIds: selectedIds.length > 0 ? selectedIds : leads.map(l => l.id)
      });
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleStageChange = async (leadId, newStage) => {
    try {
      await api.updateLeadStage(leadId, {
        stage: newStage,
        actorUid: currentUser?.uid || 'user_sales_01'
      });
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, pipelineStage: newStage } : l));
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete '${name}'? This is permanent.`)) return;
    try {
      await api.deleteLead(id, currentUser?.uid);
      loadLeads();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Saved Leads Database</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-600/20 text-cyan-400 border border-blue-500/30 font-semibold font-mono">
              {leads.length} Saved
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Your saved prospective business clients. Call, WhatsApp, or export to CSV with 1 click.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleInstantExport}
            disabled={exporting || leads.length === 0}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 active:scale-95"
            title="Download all or selected leads as a clean CSV file"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Generating CSV...' : `Export to CSV ${selectedIds.length > 0 ? `(${selectedIds.length} Selected)` : `(All ${leads.length})`}`}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3 text-xs">
          {/* Free text search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search business name, phone, category, locality..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Priorities</option>
            <option value="Hot">Hot Priority</option>
            <option value="Warm">Warm Priority</option>
            <option value="Cold">Cold Priority</option>
            <option value="Unqualified">Unqualified</option>
          </select>

          {/* Pipeline Stage filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Stages</option>
            <option value="New">New</option>
            <option value="Researching">Researching</option>
            <option value="Qualified">Qualified</option>
            <option value="Contacted">Contacted</option>
            <option value="Interested">Interested</option>
            <option value="Meeting Booked">Meeting Booked</option>
            <option value="Proposal Sent">Proposal Sent</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>

          {/* Website Filter */}
          <select
            value={hasWebsiteFilter}
            onChange={(e) => setHasWebsiteFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Website: All</option>
            <option value="no">Missing Website</option>
            <option value="yes">Has Website</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Main CRM Leads Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/70 border-b border-slate-800">
              <tr>
                <th className="p-4 w-10 text-center">
                  <button type="button" onClick={toggleSelectAll}>
                    {selectedIds.length === leads.length && leads.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3">Business Details</th>
                <th className="px-4 py-3">Phone & WhatsApp</th>
                <th className="px-4 py-3">Website</th>
                <th className="px-4 py-3">Lead Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-slate-500">
                    <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p>Loading your saved leads...</p>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-slate-500">
                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-base font-bold text-white">No saved leads in your database yet</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      Search local businesses category-wise & location-wise on the Find Leads page, then click "Save Lead" to build your client list here.
                    </p>
                    <Link
                      to="/"
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition"
                    >
                      <Search className="w-4 h-4" />
                      <span>Find Leads Now</span>
                    </Link>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const isSelected = selectedIds.includes(lead.id);
                  const cleanPhone = lead.businessPhone ? lead.businessPhone.replace(/[^0-9]/g, '') : '';
                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-slate-850/60 transition ${isSelected ? 'bg-blue-950/20' : ''}`}
                    >
                      <td className="p-4 text-center">
                        <button type="button" onClick={() => toggleSelectRow(lead.id)}>
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600" />
                          )}
                        </button>
                      </td>

                      {/* Business Details */}
                      <td className="px-4 py-3 space-y-1">
                        <button
                          onClick={() => setActiveLeadId(lead.id)}
                          className="font-bold text-white hover:text-blue-400 text-sm text-left transition block"
                        >
                          {lead.businessName}
                        </button>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                          <span className="inline-flex items-center gap-1 text-cyan-400 font-semibold">
                            {getCategoryIcon(lead.category, "w-3 h-3 text-cyan-400")}
                            <span>{lead.category}</span>
                          </span>
                          <span>•</span>
                          <span>{lead.locality || lead.city}</span>
                        </div>
                      </td>

                      {/* Phone & WhatsApp */}
                      <td className="px-4 py-3">
                        {lead.businessPhone ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-200 text-xs font-medium">{lead.businessPhone}</span>
                            <div className="flex items-center gap-1">
                              <a
                                href={`tel:${lead.businessPhone}`}
                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                                title="Call Business"
                              >
                                <Phone className="w-3.5 h-3.5 text-blue-400" />
                              </a>
                              {cleanPhone && (
                                <a
                                  href={`https://wa.me/${cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition flex items-center gap-1"
                                  title="Chat on WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                                </a>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">No phone listed</span>
                        )}
                      </td>

                      {/* Website */}
                      <td className="px-4 py-3">
                        {lead.businessWebsite ? (
                          <a
                            href={lead.businessWebsite}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-400 hover:underline max-w-[160px] truncate"
                          >
                            <Globe className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{lead.businessWebsite.replace('https://', '').replace('http://', '')}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                          </a>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                            Website missing
                          </span>
                        )}
                      </td>

                      {/* Lead Status Dropdown */}
                      <td className="px-4 py-3">
                        <select
                          value={lead.pipelineStage || 'New'}
                          onChange={(e) => handleStageChange(lead.id, e.target.value)}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                        >
                          <option value="New">New Lead</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Interested">Interested</option>
                          <option value="Meeting Scheduled">Meeting</option>
                          <option value="Closed Won">Closed / Won</option>
                          <option value="Closed Lost">Lost</option>
                        </select>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3">
                        <PriorityBadge priority={lead.priority} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveLeadId(lead.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {onOpenOutreach && (
                            <button
                              onClick={() => onOpenOutreach(lead)}
                              className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white transition"
                              title="Send Email Outreach"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(lead.id, lead.businessName)}
                            className="p-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white transition"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>


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
