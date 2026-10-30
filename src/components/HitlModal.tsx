import React, { useState } from 'react';
import { WorkflowTask } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  ShieldAlert,
  X,
  CheckCircle,
  AlertTriangle,
  FileText,
  DollarSign,
  Building,
  Calendar,
  Lock,
} from 'lucide-react';

interface HitlModalProps {
  workflow: WorkflowTask;
  onClose: () => void;
  onApprove: (workflowId: string, notes?: string, decision?: 'APPROVE' | 'REJECT') => Promise<void>;
  isExecuting?: boolean;
}

export const HitlModal: React.FC<HitlModalProps> = ({
  workflow,
  onClose,
  onApprove,
  isExecuting,
}) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState('Authorized pursuant to Q4 procurement policy');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const po = workflow.purchaseOrder;
  const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const handleAction = async (decision: 'APPROVE' | 'REJECT') => {
    setErrorMsg(null);
    if (!isManagerOrAdmin) {
      setErrorMsg(
        'Manager or Admin authorization required. Please switch to Marcus Vance (Manager) using the top-right profile switcher.'
      );
      return;
    }

    try {
      await onApprove(workflow.id, notes, decision);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit decision');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-2xl border border-amber-500/40 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-amber-500/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Human-in-the-Loop Authorization Gate
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Manager Sign-Off Required
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Automated spending policy exceeded. Verification required before electronic dispatch.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Risk Score & Policy Breach Alert */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-slate-400 mb-1 flex items-center justify-between">
                <span>Dynamic Risk Score</span>
                <span className="font-mono text-amber-400 font-bold">{workflow.riskScore}/100</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full"
                  style={{ width: `${workflow.riskScore}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Threshold: &gt; 60 enforces mandatory human review.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-slate-400 mb-1 flex items-center justify-between">
                <span>Total Exposure Value</span>
                <span className="font-mono text-emerald-400 font-bold">
                  ${po?.totalAmount?.toLocaleString() || '7,275'}
                </span>
              </div>
              <div className="text-[11px] text-amber-300 flex items-center gap-1.5 mt-1">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>Exceeds $5,000 autonomous delegation cap</span>
              </div>
            </div>
          </div>

          {/* Purchase Order Summary Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-indigo-400" />
                <span className="font-semibold text-slate-200">
                  {po?.poNumber || 'PO-2026-9020'}
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">STATUS: DRAFT PO</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500 block text-[10px]">SELECTED VENDOR</span>
                <span className="font-semibold text-slate-200">
                  {po?.vendorName || 'Quantum Precision Corp'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">TARGET SKU</span>
                <span className="font-mono font-semibold text-slate-200">
                  {po?.sku || workflow.targetSku || 'SKU-9020'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">ORDER QUANTITY</span>
                <span className="font-semibold text-slate-200">{po?.quantity || 150} Units</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">NEGOTIATED RATE</span>
                <span className="font-semibold text-emerald-400">
                  ${po?.unitPrice || 48.5} / unit
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">ESTIMATED SAVINGS</span>
                <span className="font-semibold text-emerald-400">
                  +${workflow.estimatedSavings || 825} USD
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">DELIVERY ETA</span>
                <span className="font-semibold text-slate-200">
                  {po?.deliveryDate || 'Within 4 business days'}
                </span>
              </div>
            </div>
          </div>

          {/* Agent Rationale */}
          <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-slate-300 space-y-1">
            <span className="text-[10px] font-mono uppercase text-indigo-400 font-semibold block">
              Autonomous Recommendation Rationale
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {workflow.agentPlan.riskAssessmentSummary}
            </p>
          </div>

          {/* Manager Role Check Note */}
          {!isManagerOrAdmin && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-2">
              <Lock className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <span className="font-semibold">Operator Account Detected:</span>
                <p className="text-[11px] text-amber-200/80 mt-0.5">
                  Your current account ({user?.name} - {user?.role}) has operator permissions. Switch
                  to <strong className="underline cursor-pointer">Marcus Vance (Manager)</strong> via
                  the top-right role dropdown to authorize high-value purchase orders.
                </p>
              </div>
            </div>
          )}

          {/* Manager Notes Input */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Manager Approval Endorsement / Audit Note:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Approved per Q4 procurement policy..."
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={() => handleAction('REJECT')}
            disabled={isExecuting}
            className="px-4 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition"
          >
            Reject & Abort
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={() => handleAction('APPROVE')}
              disabled={isExecuting}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5 transition disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{isExecuting ? 'Processing...' : 'Authorize & Dispatch PO'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
