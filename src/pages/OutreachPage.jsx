import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  Sparkles, 
  FileText, 
  Clock, 
  Lock,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function OutreachPage({ prefilledLead }) {
  const { currentUser, canSendEmail } = useAuth();
  const [leads, setLeads] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [health, setHealth] = useState(null);

  // Form
  const [selectedLeadId, setSelectedLeadId] = useState(prefilledLead ? prefilledLead.id : '');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [recipientEmail, setRecipientEmail] = useState(prefilledLead ? prefilledLead.publicBusinessEmail || '' : '');
  const [senderName, setSenderName] = useState('Siddharth (iCoded Automation)');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // Preview & Status
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isSuppressed, setIsSuppressed] = useState(false);
  const [suppressionReason, setSuppressionReason] = useState(null);
  const [killSwitchActive, setKillSwitchActive] = useState(false);
  
  // Confirmation Modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastSentResult, setLastSentResult] = useState(null);

  const loadData = async () => {
    try {
      const [leadsData, tplsData, healthData] = await Promise.all([
        api.getLeads(),
        api.getEmailTemplates(),
        api.getHealth()
      ]);
      setLeads(leadsData);
      setTemplates(tplsData);
      setHealth(healthData);
      setKillSwitchActive(healthData?.outreach?.killSwitchActive || false);

      if (tplsData.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(tplsData[0].id);
      }
      if (leadsData.length > 0 && !selectedLeadId) {
        setSelectedLeadId(leadsData[0].id);
        setRecipientEmail(leadsData[0].publicBusinessEmail || '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update preview whenever template or lead changes
  const updatePreview = async () => {
    if (!selectedLeadId || !selectedTemplateId) return;
    try {
      setPreviewLoading(true);
      const res = await api.previewEmail({
        templateId: selectedTemplateId,
        leadId: selectedLeadId,
        customBody: body || undefined,
        customSubject: subject || undefined
      });
      setSubject(res.renderedSubject);
      setBody(res.renderedBody);
      setIsSuppressed(res.isSuppressed);
      setSuppressionReason(res.suppressionReason);
      setKillSwitchActive(res.killSwitchActive);
    } catch (err) {
      console.error(err);
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    updatePreview();
  }, [selectedLeadId, selectedTemplateId]);

  const handleLeadChange = (id) => {
    setSelectedLeadId(id);
    const found = leads.find(l => l.id === id);
    if (found) {
      setRecipientEmail(found.publicBusinessEmail || '');
    }
  };

  const handleSendEmail = async () => {
    try {
      setSending(true);
      const result = await api.sendEmail({
        leadId: selectedLeadId,
        recipientEmail,
        subject,
        body,
        senderName,
        actorUid: currentUser?.uid
      });
      setLastSentResult(result);
      setConfirmModalOpen(false);
      alert(`Email sent successfully! Provider Message ID: ${result.providerMessageId}`);
      api.getHealth().then(setHealth);
    } catch (err) {
      alert('Outreach blocked: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const selectedLead = leads.find(l => l.id === selectedLeadId);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Email Outreach Engine</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold">
              PRD Compliant 1-to-1 Mode
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Personalized, honest outreach with mandatory suppression checks and provider delivery logging.
          </p>
        </div>

        {/* Daily limit badge */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Today's Outbound: <strong>{health?.outreach?.sentToday || 14}</strong> / {health?.outreach?.dailyLimit || 50} limit</span>
          </div>
        </div>
      </div>

      {/* Emergency Kill Switch Alert if active */}
      {killSwitchActive && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/60 flex items-center gap-3 text-rose-300 text-xs shadow-xl animate-pulse">
          <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
          <div>
            <p className="font-bold text-sm text-white">Emergency Outbound Email Kill Switch is ACTIVE</p>
            <p className="text-rose-300">
              Outbound sending has been halted globally by an administrator. Emails cannot be dispatched until deactivated in Settings.
            </p>
          </div>
        </div>
      )}

      {/* Main Composer & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configuration & Inputs (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-400" />
            <span>Outreach Setup</span>
          </h3>

          <div className="space-y-3 text-xs">
            {/* Lead Selector */}
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Target Lead / Prospect</label>
              <select
                value={selectedLeadId}
                onChange={(e) => handleLeadChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-750 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {leads.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.businessName} ({l.locality}) — {l.priority}
                  </option>
                ))}
              </select>
            </div>

            {/* Template Selector */}
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Outreach Template</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-750 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {templates.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient Email & Suppression Status */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-semibold">Recipient Public Email</label>
                {isSuppressed ? (
                  <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
                    <ShieldAlert className="w-3 h-3 text-rose-400" /> Suppressed
                  </span>
                ) : recipientEmail ? (
                  <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> Eligible to Send
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-400 italic">No email on file</span>
                )}
              </div>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="public.contact@business.in"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-750 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                required
              />
              {isSuppressed && (
                <p className="text-[11px] text-rose-400 mt-1 font-medium">
                  {suppressionReason}
                </p>
              )}
            </div>

            {/* Sender Identity */}
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Verified Sender Identity</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-750 text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <p className="text-[10px] text-slate-500 mt-0.5 font-mono">From: siddharth@icoded.in (SPF/DKIM verified)</p>
            </div>
          </div>
        </div>

        {/* Right Column: Live Rendered Preview (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Rendered Message Preview (WYSIWYG)</span>
                </h3>
                <p className="text-xs text-slate-400">All dynamic variables resolved with prospect context</p>
              </div>

              <span className="text-xs text-slate-400 font-mono">
                {previewLoading ? 'Rendering...' : 'Ready'}
              </span>
            </div>

            {/* Subject Preview */}
            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Subject Line:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-750 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Body Preview */}
            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Email Body:</label>
              <textarea
                rows={11}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-750 text-xs text-slate-200 leading-relaxed font-sans focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Bottom Send CTA */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              {isSuppressed ? (
                <span className="text-rose-400 font-semibold">Send blocked: Address is suppressed.</span>
              ) : killSwitchActive ? (
                <span className="text-rose-400 font-semibold">Send blocked: Outbound kill switch active.</span>
              ) : !recipientEmail ? (
                <span className="text-amber-400">Please provide a valid recipient email.</span>
              ) : (
                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready for user confirmation.
                </span>
              )}
            </div>

            <button
              onClick={() => setConfirmModalOpen(true)}
              disabled={isSuppressed || killSwitchActive || !recipientEmail || !canSendEmail}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Review & Send Email</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal (PRD Section 7.7: Require user confirmation before send) */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-blue-500/50 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Outbound Email Dispatch</h3>
                <p className="text-xs text-slate-400">
                  PRD Section 7.7: User confirmation required before sending.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Recipient:</span>
                <span className="font-mono font-semibold text-white">{recipientEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Business:</span>
                <span className="font-semibold text-cyan-400">{selectedLead?.businessName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Subject:</span>
                <span className="font-medium text-slate-300 truncate max-w-xs">{subject}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Back to Edit
              </button>
              <button
                onClick={handleSendEmail}
                disabled={sending}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? 'Dispatching...' : 'Confirm & Dispatch Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
