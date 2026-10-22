import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Compass, 
  Users, 
  Kanban, 
  CheckSquare, 
  Mail, 
  BarChart3, 
  Settings, 
  LayoutDashboard, 
  ShieldAlert, 
  Zap, 
  ChevronDown,
  Layers,
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export function Navbar() {
  const { currentUser, isAdmin } = useAuth();
  const [health, setHealth] = useState(null);
  const location = useLocation();

  useEffect(() => {
    api.getHealth().then(setHealth).catch(console.error);
    const interval = setInterval(() => {
      api.getHealth().then(setHealth).catch(console.error);
    }, 15000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Discover Leads', path: '/discover', icon: Compass },
    { name: 'Lead CRM', path: '/leads', icon: Users },
    { name: 'Pipeline', path: '/pipeline', icon: Kanban },
    { name: 'Tasks & Follow-ups', path: '/tasks', icon: CheckSquare },
    { name: 'Outreach', path: '/outreach', icon: Mail },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const killSwitchActive = health?.outreach?.killSwitchActive;

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  iCoded <span className="text-blue-500 font-black">LeadPilot</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase -mt-1">
                  B2B Intelligence & Sales CRM
                </span>
              </div>
            </NavLink>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action / System Status & User Profile */}
          <div className="flex items-center gap-3">
            {/* Status Pills */}
            <div className="hidden lg:flex items-center gap-2">
              {killSwitchActive ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Kill Switch ACTIVE</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Outreach Ready</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-950/70 text-cyan-300 border border-blue-800 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span className="font-mono text-[11px]">Tenant: icoded-leads-abhi</span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                <Database className="w-3 h-3 text-cyan-400" />
                <span>Places API: {health?.provider?.requestsToday || 0}/{health?.provider?.dailyQuota || 1000}</span>
              </div>
            </div>

            {/* User Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-850 border border-slate-750 text-xs font-medium text-slate-200">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                {currentUser?.displayName?.charAt(0) || 'A'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="font-semibold text-slate-200 leading-tight">{currentUser?.displayName || 'Admin'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
