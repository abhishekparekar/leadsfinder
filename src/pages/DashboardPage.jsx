import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  PhoneCall, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  ShieldAlert, 
  Compass, 
  DollarSign, 
  Zap,
  Target,
  Sparkles,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StageBadge, PriorityBadge } from '../components/common/Badge';

export function DashboardPage() {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [health, setHealth] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const queryParams = currentUser?.uid ? { owner: currentUser.uid } : {};
      const [analyticsData, tasksData, healthData, leadsData] = await Promise.all([
        api.getAnalytics(queryParams),
        api.getTasks(queryParams),
        api.getHealth(),
        api.getLeads(queryParams)
      ]);
      setAnalytics(analyticsData);
      setTasks(tasksData);
      setHealth(healthData);
      setRecentLeads(leadsData.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.uid]);

  const handleCompleteTask = async (taskId) => {
    try {
      await api.updateTask(taskId, {
        status: 'Completed',
        outcome: 'Completed from Dashboard'
      });
      loadData();
    } catch (err) {
      alert('Error updating task: ' + err.message);
    }
  };

  const metrics = analytics?.metrics || {};
  const funnel = analytics?.funnel || [];

  const now = new Date();
  const overdueTasks = tasks.filter(t => t.status === 'Pending' && new Date(t.dueAt) < now);
  const tasksDueToday = tasks.filter(t => {
    if (t.status !== 'Pending') return false;
    const d = new Date(t.dueAt);
    return d.toDateString() === now.toDateString();
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome & Quick Stats */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/40 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-cyan-400 border border-blue-500/20">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Workspace: {currentUser?.companyName || 'LeadPilot Workspace'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome, {currentUser?.displayName || 'User'} 👋
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Your personalized B2B client acquisition workspace. Find businesses, track conversions, and close deals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <NavLink
              to="/discover"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Discover Prospects</span>
            </NavLink>
            <NavLink
              to="/pipeline"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>Pipeline Kanban</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* KPI 1: Discovered & Saved */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Discovered Leads</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {metrics.totalDiscovered || 0}
            </div>
            <p className="text-xs text-slate-400">
              <strong className="text-emerald-400">{metrics.totalSavedLeads || 0}</strong> saved into CRM
            </p>
          </div>
        </div>

        {/* KPI 2: Qualified Leads */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Qualified Prospects</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {metrics.totalQualified || 0}
            </div>
            <p className="text-xs text-slate-400">Hot & Warm priority fit</p>
          </div>
        </div>

        {/* KPI 3: Recorded Won Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 hover:border-emerald-500/50 transition shadow-lg bg-gradient-to-br from-slate-900 to-emerald-950/20">
          <div className="flex items-center justify-between text-emerald-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Recorded Won Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">
              ₹{(metrics.totalWonRevenue || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400">
              Cash Collected: <strong className="text-white">₹{(metrics.totalCashCollected || 0).toLocaleString()}</strong>
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Pipeline In-Flight</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              ₹{(metrics.pipelinePotentialValue || 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-400">
              {metrics.totalProposals || 0} active proposal(s)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span>Conversion Funnel Analysis </span>
              </h3>
              <p className="text-xs text-slate-400">Tracking progress from discovery to closed-won cash</p>
            </div>
            <NavLink to="/reports" className="text-xs text-blue-400 hover:underline">
              Detailed Reports →
            </NavLink>
          </div>

          <div className="space-y-3 pt-2">
            {funnel.map((step, idx) => (
              <div key={step.stage} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">{step.stage}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white">{step.count} leads</span>
                    <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                      {step.conversion}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      idx === 0 ? 'bg-blue-600' :
                      idx === 1 ? 'bg-indigo-500' :
                      idx === 2 ? 'bg-cyan-500' :
                      idx === 3 ? 'bg-teal-500' :
                      idx === 4 ? 'bg-purple-500' :
                      idx === 5 ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(5, step.conversion)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Follow-ups Attention Box (1 col) */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Action Due Today & Overdue</span>
            </h3>
            <NavLink to="/tasks" className="text-xs text-blue-400 hover:underline">
              All Tasks →
            </NavLink>
          </div>

          <div className="space-y-3">
            {/* Overdue alert */}
            {overdueTasks.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span><strong>{overdueTasks.length}</strong> overdue task(s) require attention!</span>
              </div>
            )}

            {tasksDueToday.length === 0 && overdueTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
                <p>All scheduled tasks are completed.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {[...overdueTasks, ...tasksDueToday].map(task => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl bg-slate-800/50 border border-slate-750 flex items-start justify-between gap-2 text-xs"
                  >
                    <div className="space-y-1 flex-1">
                      <p className="font-semibold text-slate-200">{task.title}</p>
                      <p className="text-[11px] text-slate-400">
                        Due: {new Date(task.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white transition"
                      title="Mark Complete"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Discovered & In-Pipeline Leads */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Active Prospects in Chhatrapati Sambhajinagar</span>
            </h3>
            <p className="text-xs text-slate-400">Latest discovered and verified clinics</p>
          </div>
          <NavLink to="/leads" className="text-xs text-blue-400 hover:underline">
            View All in Lead CRM →
          </NavLink>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/60 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Business Name</th>
                <th className="px-4 py-3">Category & Locality</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Deal Potential</th>
                <th className="px-4 py-3 text-right">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {recentLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Compass className="w-8 h-8 text-blue-500/40 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-300">No leads in your workspace yet</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Search local businesses by category or location and save high-potential prospects to your CRM.
                    </p>
                    <NavLink
                      to="/discover"
                      className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Discover Prospects</span>
                    </NavLink>
                  </td>
                </tr>
              ) : (
                recentLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-850/50 transition">
                    <td className="px-4 py-3 font-semibold text-white">
                      {lead.businessName}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {lead.category} • <span className="text-slate-400">{lead.locality}</span>
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={lead.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <StageBadge stage={lead.pipelineStage} />
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                      {lead.dealValue ? `₹${lead.dealValue.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 font-medium">
                      {lead.ownerName || 'Admin'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}







