import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Search, 
  BookmarkCheck, 
  Mail, 
  Kanban, 
  Zap, 
  ChevronDown, 
  ChevronRight,
  Download,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Sidebar({ isOpen, onClose }) {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    if (onClose) onClose();
  }, [location.pathname]);

  const navSections = [
    {
      title: 'LEAD FINDER',
      items: [
        { name: 'Find Leads', path: '/', icon: Search, badge: 'Live' },
        { name: 'Saved Leads', path: '/saved', icon: BookmarkCheck, badge: 'CSV Export' },
      ]
    },
    {
      title: 'CLIENT OUTREACH',
      items: [
        { name: 'Quick Outreach', path: '/outreach', icon: Mail },
        { name: 'Pipeline', path: '/pipeline', icon: Kanban },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[2px] shadow-lg shadow-blue-600/30 group-hover:shadow-blue-500/50 transition">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  iCoded <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-black">LeadPilot</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  B2B Sales Platform
                </span>
              </div>
            </NavLink>

            {/* Close button on mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600/25 to-indigo-600/15 text-blue-300 border border-blue-500/35 shadow-md shadow-blue-950/40'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 hover:border hover:border-slate-800/60'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 transition group-hover:scale-110" />
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition text-slate-500" />
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer / User Profile & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/90">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800/90 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-blue-600/20 shrink-0">
                {currentUser?.displayName?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{currentUser?.displayName || 'User'}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">{currentUser?.email || ''}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition shrink-0"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
