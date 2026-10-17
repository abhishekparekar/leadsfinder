import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  Filter,
  Layers,
  Award
} from 'lucide-react';
import { api } from '../services/api';

export function ReportsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getAnalytics(), api.getLeads()]).then(([an, lds]) => {
      setAnalytics(an);
      setLeads(lds);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const metrics = analytics?.metrics || {};
  const funnel = analytics?.funnel || [];

  // Service line breakdown
  const serviceStats = {};
  leads.forEach(l => {
    (l.opportunityTypes || ['General Automation']).forEach(opp => {
      if (!serviceStats[opp]) serviceStats[opp] = { count: 0, won: 0, revenue: 0 };
      serviceStats[opp].count += 1;
      if (l.pipelineStage === 'Won') {
        serviceStats[opp].won += 1;
        serviceStats[opp].revenue += Number(l.dealValue) || 0;
      }
    });
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Sales Analytics & Performance Reports</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 font-semibold">
              PRD Section 7.9
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Conversion metrics, pipeline velocity, won revenue, and cash collected reconciliation.
          </p>
        </div>
      </div>

      {/* Revenue Audit Comparison Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950/40 border border-slate-800 shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Total Recorded Won Revenue
          </span>
          <div className="text-3xl font-extrabold text-white">
            ₹{(metrics.totalWonRevenue || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">Strictly counts contracts moved to Closed Won.</p>
        </div>

        <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-800 md:pl-6">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-cyan-400" />
            Actual Cash Collected
          </span>
          <div className="text-3xl font-extrabold text-cyan-300">
            ₹{(metrics.totalCashCollected || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">Deposited into company account via bank transfer.</p>
        </div>

        <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-800 md:pl-6">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            In-Flight Pipeline Value
          </span>
          <div className="text-3xl font-extrabold text-indigo-200">
            ₹{(metrics.pipelinePotentialValue || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">Unweighted sum of active proposals & negotiations.</p>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span>End-to-End Sales Pipeline Funnel</span>
          </h3>
          <p className="text-xs text-slate-400">Conversion percentages through each step of the iCoded workflow</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {funnel.map((item, idx) => (
            <div key={item.stage} className="p-4 rounded-xl bg-slate-850/80 border border-slate-750 text-center space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                {item.stage}
              </span>
              <div className="text-xl font-extrabold text-white">
                {item.count}
              </div>
              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-950 text-blue-400 border border-blue-900">
                {item.conversion}% conv.
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Service Catalog Performance Breakdown */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Performance by iCoded Service Line</span>
          </h3>
          <p className="text-xs text-slate-400">Which service offerings generate the highest conversions</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/70 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Service Line</th>
                <th className="px-4 py-3">Opportunities Identified</th>
                <th className="px-4 py-3">Deals Closed Won</th>
                <th className="px-4 py-3 font-right text-right">Won Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {Object.entries(serviceStats).map(([svc, stats]) => (
                <tr key={svc} className="hover:bg-slate-850/50">
                  <td className="px-4 py-3 font-semibold text-white">{svc}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono">{stats.count}</td>
                  <td className="px-4 py-3 font-mono font-bold text-emerald-400">{stats.won}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-white">
                    {stats.revenue > 0 ? `₹${stats.revenue.toLocaleString()}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
