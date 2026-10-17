import React from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  Send, 
  Sparkles,
  Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function TopHeader({ onToggleSidebar }) {
  const location = useLocation();
  const { currentUser } = useAuth();

  const getPageMeta = (pathname) => {
    switch (pathname) {
      case '/':
      case '/find':
      case '/discover':
        return { title: 'Find Leads', subtitle: 'Search business category & location' };
      case '/saved':
      case '/leads':
        return { title: 'Saved Leads', subtitle: 'Your client prospects & 1-click CSV export' };
      case '/outreach':
        return { title: 'Quick Outreach', subtitle: 'WhatsApp & 1-to-1 client outreach' };
      case '/pipeline':
        return { title: 'Sales Pipeline', subtitle: 'Track deal discussions & conversions' };
      default:
        return { title: 'Lead Finder', subtitle: 'Business Leads & Client Acquisition' };
    }
  };

  const meta = getPageMeta(location.pathname);

  return (
    <header className="shrink-0 sticky top-0 z-30 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-3 shadow-md shadow-slate-950/80">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Hamburger menu (mobile) + Page Title & Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95"
            aria-label="Open navigation sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-flex text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                iCoded /
              </span>
              <h1 className="text-base sm:text-lg lg:text-xl font-extrabold text-white tracking-tight truncate">
                {meta.title}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-cyan-400 border border-blue-500/20 shrink-0">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Live</span>
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate hidden xs:block">{meta.subtitle}</p>
          </div>
        </div>

        {/* Right: Quick Actions & Profile info */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <NavLink
            to="/saved"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold text-emerald-300 transition shadow-sm"
            title="Download your saved leads as CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Saved Leads</span>
          </NavLink>

          <NavLink
            to="/outreach"
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Outreach</span>
          </NavLink>

          {/* Quick User Avatar in Header */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
              {currentUser?.displayName?.charAt(0) || 'U'}
            </div>
            <span className="text-xs text-slate-300 font-medium truncate max-w-[90px]">
              {currentUser?.displayName?.split(' ')[0]}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
