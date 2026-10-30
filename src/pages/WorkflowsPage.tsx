import React, { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext.tsx';
import { useNavigate } from 'react-router-dom';
import {
  GitBranch,
  Search,
  Filter,
  PlusCircle,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { WorkflowStatus, WorkflowTask } from '../types.ts';

interface WorkflowsPageProps {
  onOpenNewWorkflow: () => void;
}

export const WorkflowsPage: React.FC<WorkflowsPageProps> = ({ onOpenNewWorkflow }) => {
  const {
    workflows,
    setActiveWorkflow,
    setHitlWorkflowToApprove,
    runAutonomous,
    deleteWorkflow,
    isExecuting,
  } = useWorkflow();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredWorkflows = workflows.filter((w) => {
    const matchesSearch =
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.targetSku && w.targetSku.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Autonomous Workflows & Multi-Agent Tasks
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Orchestration registry for end-to-end procurement, supplier negotiation, and purchase orders
          </p>
        </div>

        <button
          onClick={onOpenNewWorkflow}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Autonomous Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by SKU, goal, or workflow title..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs pb-1 md:pb-0">
          {['ALL', 'NEEDS_APPROVAL', 'IN_PROGRESS', 'COMPLETED', 'FAILED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-mono text-[11px] uppercase transition shrink-0 ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Workflows Table / List */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Task & Objective</th>
                <th className="py-3 px-4">Target SKU</th>
                <th className="py-3 px-4">Risk Index</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">PO Spend & Savings</th>
                <th className="py-3 px-4">Initiator</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredWorkflows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No autonomous workflows match your criteria.
                  </td>
                </tr>
              ) : (
                filteredWorkflows.map((wf) => (
                  <tr
                    key={wf.id}
                    className="hover:bg-slate-800/30 transition cursor-pointer"
                    onClick={() => {
                      setActiveWorkflow(wf);
                      navigate('/simulator');
                    }}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200 hover:text-indigo-300 transition">
                        {wf.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 max-w-sm mt-0.5">
                        {wf.description}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-slate-300">
                      {wf.targetSku || 'N/A'}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              wf.riskScore > 60
                                ? 'bg-amber-400'
                                : wf.riskScore > 30
                                ? 'bg-blue-400'
                                : 'bg-emerald-400'
                            }`}
                            style={{ width: `${wf.riskScore}%` }}
                          />
                        </div>
                        <span
                          className={`font-mono text-[11px] font-bold ${
                            wf.riskScore > 60
                              ? 'text-amber-400'
                              : wf.riskScore > 30
                              ? 'text-blue-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {wf.riskScore}/100
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                          wf.status === 'COMPLETED'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : wf.status === 'NEEDS_APPROVAL'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                            : wf.status === 'IN_PROGRESS'
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {wf.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {wf.purchaseOrder ? (
                        <div>
                          <span className="font-semibold text-slate-200">
                            ${wf.purchaseOrder.totalAmount.toLocaleString()}
                          </span>
                          {wf.estimatedSavings > 0 && (
                            <span className="text-[10px] text-emerald-400 block">
                              +${wf.estimatedSavings} saved
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 font-mono text-[11px]">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px]">{wf.createdBy}</td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-2">
                        {wf.status === 'NEEDS_APPROVAL' ? (
                          <button
                            onClick={() => setHitlWorkflowToApprove(wf)}
                            className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] transition"
                          >
                            Sign Off
                          </button>
                        ) : wf.status === 'PENDING' || wf.status === 'IN_PROGRESS' ? (
                          <button
                            onClick={() => runAutonomous(wf.id)}
                            disabled={isExecuting}
                            className="p-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50"
                            title="Run Autonomous Agent Loop"
                          >
                            <Play className="h-3.5 w-3.5" />
                          </button>
                        ) : null}

                        <button
                          onClick={() => {
                            setActiveWorkflow(wf);
                            navigate('/simulator');
                          }}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title="View Interactive DAG"
                        >
                          <GitBranch className="h-3.5 w-3.5 text-indigo-400" />
                        </button>

                        <button
                          onClick={() => deleteWorkflow(wf.id)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                          title="Delete Workflow"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
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
};
