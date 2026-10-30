import React, { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext.tsx';
import { WorkflowGraph } from '../components/WorkflowGraph.tsx';
import { ExecutionStream } from '../components/ExecutionStream.tsx';
import { StepDetailDrawer } from '../components/StepDetailDrawer.tsx';
import {
  Play,
  RotateCw,
  FastForward,
  ShieldAlert,
  FileText,
  DollarSign,
  Building,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronDown,
  Layers,
} from 'lucide-react';

interface WorkflowDetailProps {
  onOpenNewWorkflow: () => void;
}

export const WorkflowDetailPage: React.FC<WorkflowDetailProps> = ({ onOpenNewWorkflow }) => {
  const {
    workflows,
    activeWorkflow,
    setActiveWorkflow,
    executeStep,
    runAutonomous,
    setHitlWorkflowToApprove,
    selectedStepId,
    setSelectedStepId,
    isExecuting,
  } = useWorkflow();

  const [workflowSelectOpen, setWorkflowSelectOpen] = useState(false);

  // Default to first workflow if none active
  const currentWorkflow = activeWorkflow || workflows[0];
  const selectedStep = currentWorkflow
    ? currentWorkflow.agentPlan.steps.find((s) => s.stepId === selectedStepId) || null
    : null;

  if (!currentWorkflow) {
    return (
      <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/40">
        <Layers className="h-12 w-12 text-indigo-400 mx-auto mb-3 opacity-60" />
        <h3 className="text-lg font-bold text-white">No Autonomous Workflows Available</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">
          Trigger your first multi-agent supply chain workflow to inspect execution.
        </p>
        <button
          onClick={onOpenNewWorkflow}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
        >
          Create New Task
        </button>
      </div>
    );
  }

  const nextPendingStep = currentWorkflow.agentPlan.steps.find((s) => s.status === 'PENDING');
  const isAwaitingApproval = currentWorkflow.status === 'NEEDS_APPROVAL';

  return (
    <div className="space-y-6">
      {/* Sandbox Control Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Workflow Switcher Dropdown */}
        <div className="relative">
          <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
            Active Simulator Target:
          </label>
          <button
            onClick={() => setWorkflowSelectOpen(!workflowSelectOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs font-semibold hover:border-indigo-500 transition max-w-sm sm:max-w-md truncate"
          >
            <span className="truncate">{currentWorkflow.title}</span>
            <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
          </button>

          {workflowSelectOpen && (
            <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50 text-xs max-h-60 overflow-y-auto">
              {workflows.map((wf) => (
                <button
                  key={wf.id}
                  onClick={() => {
                    setActiveWorkflow(wf);
                    setSelectedStepId(null);
                    setWorkflowSelectOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-slate-800 transition flex items-center justify-between ${
                    wf.id === currentWorkflow.id ? 'bg-indigo-950/40 text-indigo-300' : 'text-slate-300'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="font-semibold truncate">{wf.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      SKU: {wf.targetSku || 'N/A'} • Status: {wf.status}
                    </div>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                      wf.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : wf.status === 'NEEDS_APPROVAL'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {wf.status.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          {isAwaitingApproval && (
            <button
              onClick={() => setHitlWorkflowToApprove(currentWorkflow)}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/30 flex items-center space-x-1.5 transition animate-pulse"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Manager Sign-Off Gate</span>
            </button>
          )}

          {nextPendingStep && !isAwaitingApproval && (
            <button
              onClick={() => executeStep(currentWorkflow.id, nextPendingStep.stepId)}
              disabled={isExecuting}
              className="px-3.5 py-2 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white font-semibold text-xs border border-indigo-500/40 flex items-center space-x-1.5 transition disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Step-by-Step ({nextPendingStep.agent.replace('Agent', '')})</span>
            </button>
          )}

          {currentWorkflow.status !== 'COMPLETED' && !isAwaitingApproval && (
            <button
              onClick={() => runAutonomous(currentWorkflow.id)}
              disabled={isExecuting}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition disabled:opacity-50"
            >
              <FastForward className="h-4 w-4" />
              <span>{isExecuting ? 'Agent Reasoning...' : 'Auto-Run Complete Loop'}</span>
            </button>
          )}

          <button
            onClick={onOpenNewWorkflow}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            New Workflow
          </button>
        </div>
      </div>

      {/* DAG Visualizer */}
      <WorkflowGraph
        workflow={currentWorkflow}
        selectedStepId={selectedStepId}
        onSelectStep={(stepId) => setSelectedStepId(stepId)}
        onExecuteStep={(stepId) => executeStep(currentWorkflow.id, stepId)}
        onOpenHitl={() => setHitlWorkflowToApprove(currentWorkflow)}
        isExecuting={isExecuting}
      />

      {/* Grid: Purchase Order Preview Card & Execution Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* PO Card */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">Purchase Order & ERP State</h3>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                  currentWorkflow.purchaseOrder?.status === 'DISPATCHED'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : currentWorkflow.purchaseOrder?.status === 'APPROVED'
                    ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}
              >
                {currentWorkflow.purchaseOrder?.status || 'NOT DRAFTED'}
              </span>
            </div>

            {currentWorkflow.purchaseOrder ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">PO Number</span>
                    <span className="font-mono font-bold text-slate-200">
                      {currentWorkflow.purchaseOrder.poNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">Total Spend</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      ${currentWorkflow.purchaseOrder.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">Vendor</span>
                    <span className="font-semibold text-slate-200">
                      {currentWorkflow.purchaseOrder.vendorName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">Rate</span>
                    <span className="text-slate-300">
                      ${currentWorkflow.purchaseOrder.unitPrice}/unit ({currentWorkflow.purchaseOrder.quantity} units)
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Vendor Email EDI:</span>
                    <span className="font-mono text-slate-300">
                      {currentWorkflow.purchaseOrder.vendorEmail}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Expected Delivery SLA:</span>
                    <span className="text-slate-300">{currentWorkflow.purchaseOrder.deliveryDate}</span>
                  </div>
                  {currentWorkflow.purchaseOrder.approvedBy && (
                    <div className="flex items-center justify-between text-[11px] text-emerald-400">
                      <span>HITL Approved By:</span>
                      <span className="font-medium">{currentWorkflow.purchaseOrder.approvedBy}</span>
                    </div>
                  )}
                  {currentWorkflow.purchaseOrder.dispatchedAt && (
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Electronic EDI Transmitted:</span>
                      <span className="font-mono text-slate-400">
                        {new Date(currentWorkflow.purchaseOrder.dispatchedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 italic">
                Purchase Order has not been drafted yet. Execute steps to synthesize rates and negotiate terms.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono flex items-center justify-between">
            <span>Workflow ID: {currentWorkflow.id}</span>
            <span>Risk Score: {currentWorkflow.riskScore}/100</span>
          </div>
        </div>

        {/* Live Execution Logs Feed */}
        <ExecutionStream logs={currentWorkflow.executionLogs || []} maxHeight="h-80" />
      </div>

      {/* Step Detail Drawer */}
      <StepDetailDrawer
        step={selectedStep}
        onClose={() => setSelectedStepId(null)}
        onExecuteStep={(stepId) => executeStep(currentWorkflow.id, stepId)}
        isExecuting={isExecuting}
      />
    </div>
  );
};
