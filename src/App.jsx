import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { DashboardPage } from './pages/DashboardPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { LeadsPage } from './pages/LeadsPage';
import { PipelinePage } from './pages/PipelinePage';
import { TasksPage } from './pages/TasksPage';
import { OutreachPage } from './pages/OutreachPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [outreachTargetLead, setOutreachTargetLead] = useState(null);

  const handleOpenOutreach = (lead) => {
    setOutreachTargetLead(lead);
    navigate('/outreach');
  };

  return (
    <div className="flex h-screen h-[100dvh] w-full overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Left Sidebar (Desktop persistent + Mobile slide-over drawer) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main View Area (Strictly fixed height) */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Stationary Fixed Header that NEVER scrolls */}
        <TopHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Scrollable Content Container (Only this view scrolls!) */}
        <main id="main-content-scroll" className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-7 scroll-smooth">
          <Routes>
            <Route path="/" element={<DiscoverPage onOpenOutreach={handleOpenOutreach} />} />
            <Route path="/find" element={<DiscoverPage onOpenOutreach={handleOpenOutreach} />} />
            <Route path="/discover" element={<DiscoverPage onOpenOutreach={handleOpenOutreach} />} />
            <Route path="/saved" element={<LeadsPage onOpenOutreach={handleOpenOutreach} />} />
            <Route path="/leads" element={<LeadsPage onOpenOutreach={handleOpenOutreach} />} />
            <Route path="/outreach" element={<OutreachPage prefilledLead={outreachTargetLead} />} />
            <Route path="/pipeline" element={<PipelinePage onOpenOutreach={handleOpenOutreach} />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage onOpenOutreach={handleOpenOutreach} />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>

        <footer className="shrink-0 border-t border-slate-900 bg-slate-950/95 py-2.5 px-4 sm:px-6 text-[11px] sm:text-xs text-slate-500 z-20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1">
            <span>iCoded LeadPilot &copy; 2026 — B2B Sales &amp; Pipeline Engine</span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Firestore Cloud Connected
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
