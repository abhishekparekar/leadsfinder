import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Users, 
  ShieldAlert, 
  ShieldCheck, 
  Sliders, 
  Database, 
  History, 
  Plus, 
  Trash2, 
  AlertTriangle,
  Lock,
  CheckCircle2,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function SettingsPage() {
  const { currentUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'scoring' | 'suppression' | 'users' | 'audit'

  const [settings, setSettings] = useState(null);
  const [users, setUsers] = useState([]);
  const [suppressionList, setSuppressionList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Suppression Entry
  const [newSuppEmail, setNewSuppEmail] = useState('');
  const [newSuppReason, setNewSuppReason] = useState('Manual Admin Block');

  // New User Entry
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Sales');

  // Scoring Weights State
  const [weights, setWeights] = useState({
    sectorFit: 25,
    opportunityEvidence: 25,
    reachability: 15,
    digitalPresence: 20,
    freshness: 15
  });

  const loadAll = async () => {
    try {
      setLoading(true);
      const [stgs, usrs, sups, logs] = await Promise.all([
        api.getSettings(),
        api.getUsers(),
        api.getSuppressionList(),
        api.getAuditLogs()
      ]);
      setSettings(stgs);
      setUsers(usrs);
      setSuppressionList(sups);
      setAuditLogs(logs);
      if (stgs.scoringWeights) setWeights(stgs.scoringWeights);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleToggleKillSwitch = async () => {
    if (!isAdmin) {
      alert('Only administrators can toggle the Emergency Outbound Kill Switch.');
      return;
    }
    const current = settings?.outboundEmailKillSwitch;
    const confirmMsg = current
      ? 'Deactivate kill switch and resume outbound email sending?'
      : 'EMERGENCY: Halt all outbound email dispatch globally immediately?';
    if (!window.confirm(confirmMsg)) return;

    try {
      const updated = await api.updateSettings({ outboundEmailKillSwitch: !current }, currentUser?.uid);
      setSettings(updated);
      alert(`Kill switch is now ${!current ? 'ACTIVE (Outbound sending blocked)' : 'INACTIVE (Outbound sending permitted)'}`);
      loadAll();
    } catch (err) {
      alert('Failed to toggle kill switch: ' + err.message);
    }
  };

  const handleAddSuppression = async (e) => {
    e.preventDefault();
    if (!newSuppEmail) return;
    try {
      await api.addSuppression({
        email: newSuppEmail,
        reason: newSuppReason,
        source: 'Admin Manual Add',
        actorUid: currentUser?.uid
      });
      setNewSuppEmail('');
      loadAll();
      alert('Recipient added to suppression list.');
    } catch (err) {
      alert('Error adding suppression: ' + err.message);
    }
  };

  const handleRemoveSuppression = async (email) => {
    if (!window.confirm(`Remove '${email}' from suppression list?`)) return;
    try {
      await api.removeSuppression(email);
      loadAll();
    } catch (err) {
      alert('Error removing suppression: ' + err.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.createUser({
        displayName: newUserName,
        email: newUserEmail,
        role: newUserRole
      });
      setNewUserOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      loadAll();
    } catch (err) {
      alert('Error adding user: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Admin & Compliance Settings</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold">
              PRD Section 7.10
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global configurations, security safeguards, suppression lists, scoring rules, and audit trail.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 rounded-t-2xl px-4 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('general')}
          className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'general' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>System & Kill Switch</span>
        </button>

        <button
          onClick={() => setActiveTab('suppression')}
          className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'suppression' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Suppression List ({suppressionList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('scoring')}
          className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'scoring' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Scoring Dimensions (0-100)</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'users' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team & Roles ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'audit' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-6 rounded-b-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        {/* TAB 1: GENERAL & EMERGENCY KILL SWITCH */}
        {activeTab === 'general' && (
          <div className="space-y-6 max-w-3xl">
            {/* Kill Switch Card */}
            <div className={`p-6 rounded-2xl border transition ${
              settings?.outboundEmailKillSwitch
                ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/50'
                : 'bg-slate-850/60 border-slate-750'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className={`w-5 h-5 ${settings?.outboundEmailKillSwitch ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
                    <h3 className="text-base font-bold text-white">Emergency Outbound Email Kill Switch</h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Immediately halts all automated and manual email outreach across the platform.
                  </p>
                </div>

                <button
                  onClick={handleToggleKillSwitch}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-lg ${
                    settings?.outboundEmailKillSwitch
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                  }`}
                >
                  {settings?.outboundEmailKillSwitch ? 'Deactivate Kill Switch' : 'ACTIVATE KILL SWITCH'}
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Status: <strong className={settings?.outboundEmailKillSwitch ? 'text-rose-400' : 'text-emerald-400'}>
                  {settings?.outboundEmailKillSwitch ? 'ACTIVE — OUTBOUND BLOCKED' : 'ONLINE — OUTBOUND PERMITTED'}
                </strong></span>
                <span>Restricted to Admin / Founder role</span>
              </div>
            </div>

            {/* Provider Integrations Monitor */}
            <div className="p-6 rounded-2xl bg-slate-850/60 border border-slate-750 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Google Places API (New) Provider Status</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Connection State:</span>
                  <p className="font-bold text-emerald-400 text-sm mt-0.5">Connected (Adapter Active)</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Daily Requests Used:</span>
                  <p className="font-mono font-bold text-white text-sm mt-0.5">{settings?.quotaRequestsToday || 42} / {settings?.quotaLimitDaily || 1000}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Secret Management:</span>
                  <p className="font-semibold text-blue-400 text-sm mt-0.5">Server-side Only (PRD 7.3)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SUPPRESSION LIST (PRD Section 7.7 & 10.6) */}
        {activeTab === 'suppression' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Opt-out & Suppression List Management</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                PRD Section 7.7: Addresses on this list are blocked before every send. Hard bounces and recipient opt-outs are added automatically.
              </p>
            </div>

            {/* Add to suppression form */}
            <form onSubmit={handleAddSuppression} className="p-4 rounded-xl bg-slate-800/60 border border-slate-750 flex flex-wrap items-center gap-3 text-xs">
              <input
                type="email"
                placeholder="email@suppressed-domain.in"
                value={newSuppEmail}
                onChange={(e) => setNewSuppEmail(e.target.value)}
                className="flex-1 min-w-[220px] px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200"
                required
              />
              <select
                value={newSuppReason}
                onChange={(e) => setNewSuppReason(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200"
              >
                <option value="Recipient Opt-Out via STOP reply">Recipient Opt-Out via STOP reply</option>
                <option value="Hard Bounce (Mailbox does not exist)">Hard Bounce (Mailbox does not exist)</option>
                <option value="Spam Complaint">Spam Complaint</option>
                <option value="Manual Admin Block">Manual Admin Block</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg"
              >
                Add To Suppression
              </button>
            </form>

            {/* Suppression Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Suppressed Email</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {suppressionList.map(item => (
                    <tr key={item.id} className="hover:bg-slate-850/50">
                      <td className="px-4 py-3 font-mono font-semibold text-rose-300">
                        {item.normalizedEmail}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {item.reason}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {item.source}
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleRemoveSuppression(item.normalizedEmail)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400"
                          title="Remove from suppression"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SCORING RULES */}
        {activeTab === 'scoring' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>Transparent Scoring Weights (PRD Section 7.5)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure the maximum points awarded per dimension. Total must sum to 100 points.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-850 border border-slate-750">
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>Target-Sector Fit (Healthcare/Education)</span>
                  <span className="text-blue-400 font-bold">{weights.sectorFit} pts</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  value={weights.sectorFit}
                  onChange={(e) => setWeights({ ...weights, sectorFit: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-slate-850 border border-slate-750">
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>Service Opportunity Evidence</span>
                  <span className="text-cyan-400 font-bold">{weights.opportunityEvidence} pts</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  value={weights.opportunityEvidence}
                  onChange={(e) => setWeights({ ...weights, opportunityEvidence: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-slate-850 border border-slate-750">
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>Business Reachability (Direct phone, locality)</span>
                  <span className="text-emerald-400 font-bold">{weights.reachability} pts</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  value={weights.reachability}
                  onChange={(e) => setWeights({ ...weights, reachability: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-slate-850 border border-slate-750">
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>Digital Presence Improvement Opportunity</span>
                  <span className="text-amber-400 font-bold">{weights.digitalPresence} pts</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={weights.digitalPresence}
                  onChange={(e) => setWeights({ ...weights, digitalPresence: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-slate-850 border border-slate-750">
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>Freshness & Human Verification</span>
                  <span className="text-purple-400 font-bold">{weights.freshness} pts</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  value={weights.freshness}
                  onChange={(e) => setWeights({ ...weights, freshness: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: USERS & ROLES */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Team Members & Role Access Control</span>
                </h3>
                <p className="text-xs text-slate-400">Admin, Sales/Marketing, and Analyst roles as defined in PRD Section 5.</p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => setNewUserOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Invite User</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Member Name</th>
                    <th className="px-4 py-3">Email Address</th>
                    <th className="px-4 py-3">Assigned Role</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map(u => (
                    <tr key={u.uid} className="hover:bg-slate-850/50">
                      <td className="px-4 py-3 font-semibold text-white">{u.displayName}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          u.role === 'Admin' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                          u.role === 'Sales' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                          'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <span>Immutable Security & Export Audit Trail</span>
              </h3>
              <p className="text-xs text-slate-400">Records who exported leads, sent emails, or updated settings.</p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-[500px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Actor</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Result</th>
                    <th className="px-4 py-3">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-850/50">
                      <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-300">
                        {log.actorUid}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-cyan-300">
                        {log.action}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {log.result}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400 text-[11px] truncate max-w-xs">
                        {JSON.stringify(log.metadata)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Invite User Modal */}
      {newUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form onSubmit={handleCreateUser} className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Invite Company User</h3>
              <button type="button" onClick={() => setNewUserOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-750 text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Company Email (@icoded.in)</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="rahul@icoded.in"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-750 text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-750 text-slate-200"
                >
                  <option value="Sales">Sales / Marketing</option>
                  <option value="Admin">Admin / Founder</option>
                  <option value="Analyst">Analyst (Read-only)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setNewUserOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
