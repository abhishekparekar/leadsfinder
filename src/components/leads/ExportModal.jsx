import React, { useState } from 'react';
import { Download, ShieldCheck, CheckSquare, Square, X, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AVAILABLE_COLUMNS = [
  { key: 'businessName', label: 'Business Name', default: true },
  { key: 'category', label: 'Category', default: true },
  { key: 'locality', label: 'Locality', default: true },
  { key: 'city', label: 'City', default: true },
  { key: 'businessPhone', label: 'Verified Phone', default: true },
  { key: 'businessWebsite', label: 'Website', default: true },
  { key: 'publicBusinessEmail', label: 'Public Email (Lawful)', default: true },
  { key: 'score', label: 'Transparent Score (0-100)', default: true },
  { key: 'priority', label: 'Priority (Hot/Warm/Cold)', default: true },
  { key: 'pipelineStage', label: 'Pipeline Stage', default: true },
  { key: 'dealValue', label: 'Deal Potential (INR)', default: true },
  { key: 'ownerName', label: 'Assigned Lead Owner', default: true },
  { key: 'opportunityTypes', label: 'Identified Opportunities', default: true },
  { key: 'notes', label: 'Internal Sales Notes', default: true },
  { key: 'lastVerifiedAt', label: 'Last Verified Date', default: true },
  { key: 'nextFollowUpAt', label: 'Next Follow-up Due', default: false },
  { key: 'sourceName', label: 'Source Attribution', default: false }
];

export function ExportModal({ isOpen, onClose, selectedLeadIds = [], totalLeadsCount = 0 }) {
  const { currentUser } = useAuth();
  const [selectedCols, setSelectedCols] = useState(
    AVAILABLE_COLUMNS.filter(c => c.default).map(c => c.key)
  );
  const [exporting, setExporting] = useState(false);

  if (!isOpen) return null;

  const countToExport = selectedLeadIds.length > 0 ? selectedLeadIds.length : totalLeadsCount;

  const toggleCol = (key) => {
    if (selectedCols.includes(key)) {
      if (selectedCols.length === 1) return; // Keep at least one
      setSelectedCols(selectedCols.filter(k => k !== key));
    } else {
      setSelectedCols([...selectedCols, key]);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const chosenColumnObjects = AVAILABLE_COLUMNS.filter(c => selectedCols.includes(c.key));
      await api.exportCsv({
        leadIds: selectedLeadIds,
        columns: chosenColumnObjects,
        actorUid: currentUser?.uid
      });
      onClose();
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-400" />
              Authorized CSV Lead Export
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Exporting <strong className="text-blue-400">{countToExport}</strong> records with strict formula injection mitigation.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Alert: Formula injection & audit notice */}
        <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-900/60 flex items-start gap-2.5 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-cyan-300">PRD Compliance & Security Safeguards Active</p>
            <p className="text-slate-400 text-[11px]">
              Cells starting with <code className="text-blue-300">=</code>, <code className="text-blue-300">+</code>, <code className="text-blue-300">-</code>, or <code className="text-blue-300">@</code> are sanitized with single quotes to prevent CSV spreadsheet injection attacks. This export action is recorded in the immutable audit log.
            </p>
          </div>
        </div>

        {/* Column checklist */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">Choose Columns To Include:</span>
            <span>{selectedCols.length} selected</span>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-2 bg-slate-950/60 rounded-xl border border-slate-800">
            {AVAILABLE_COLUMNS.map(col => {
              const isChecked = selectedCols.includes(col.key);
              return (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => toggleCol(col.key)}
                  className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition ${
                    isChecked ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30' : 'text-slate-400 hover:bg-slate-800/80'
                  }`}
                >
                  {isChecked ? <CheckSquare className="w-3.5 h-3.5 text-blue-400 shrink-0" /> : <Square className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                  <span className="truncate">{col.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || selectedCols.length === 0}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 transition disabled:opacity-50 flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting ? 'Generating CSV...' : `Download CSV (${countToExport} Leads)`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
