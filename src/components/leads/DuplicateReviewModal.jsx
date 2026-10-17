import React from 'react';
import { AlertTriangle, Copy, ArrowRight, X } from 'lucide-react';
import { StageBadge, PriorityBadge } from '../common/Badge';

export function DuplicateReviewModal({ isOpen, newLead, existingLead, onClose, onForceSave, onViewExisting }) {
  if (!isOpen || !existingLead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Possible Duplicate Detected</h3>
              <p className="text-xs text-slate-400">
                PRD Section 7.4: Matching records require human review before saving to prevent duplicate contacts.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          {/* New Discovered Lead */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">New Discovered Business</span>
            <p className="font-bold text-white text-sm">{newLead.businessName}</p>
            <p className="text-slate-300">Category: {newLead.category}</p>
            <p className="text-slate-300 font-mono">Phone: {newLead.businessPhone || 'None'}</p>
            <p className="text-slate-300 truncate">Website: {newLead.businessWebsite || 'None'}</p>
            <p className="text-slate-400">{newLead.address || newLead.locality}</p>
          </div>

          {/* Existing CRM Record */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Existing In CRM</span>
              <StageBadge stage={existingLead.pipelineStage} />
            </div>
            <p className="font-bold text-white text-sm">{existingLead.businessName}</p>
            <p className="text-slate-300">Category: {existingLead.category}</p>
            <p className="text-slate-300 font-mono">Phone: {existingLead.businessPhone || 'None'}</p>
            <p className="text-slate-300 truncate">Website: {existingLead.businessWebsite || 'None'}</p>
            <p className="text-slate-400">{existingLead.address || existingLead.locality}</p>
            <p className="text-[11px] text-amber-400/90 font-medium">Owner: {existingLead.ownerName || 'Pooja Deshmukh'}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onClose();
              onViewExisting(existingLead.id);
            }}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-600 transition flex items-center gap-1.5"
          >
            <span>View Existing Lead</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              onClose();
              onForceSave();
            }}
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white transition"
          >
            Force Save as Separate Branch
          </button>
        </div>
      </div>
    </div>
  );
}
