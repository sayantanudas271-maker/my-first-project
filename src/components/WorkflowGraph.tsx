import React from 'react';
import {
  WorkflowTask,
  WorkflowStep,
  StepStatus,
  AgentName,
} from '../types.ts';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  RotateCw,
  Search,
  Scale,
  ShieldCheck,
  FileCheck,
  Send,
  ArrowRight,
  Info,
  ChevronRight,
} from 'lucide-react';

interface WorkflowGraphProps {
  workflow: WorkflowTask;
  selectedStepId: number | null;
  onSelectStep: (stepId: number) => void;
  onExecuteStep?: (stepId: number) => void;
  onOpenHitl?: () => void;
  isExecuting?: boolean;
}

export const WorkflowGraph: React.FC<WorkflowGraphProps> = ({
  workflow,
  selectedStepId,
  onSelectStep,
  onExecuteStep,
  onOpenHitl,
  isExecuting,
}) => {
  const steps = workflow.agentPlan.steps;

  const getAgentIcon = (agent: AgentName) => {
    switch (agent) {
      case 'InventoryMonitorAgent':
        return Search;
      case 'VendorNegotiatorAgent':
        return Scale;
      case 'ComplianceAgent':
        return ShieldCheck;
      case 'ApprovalRouterAgent':
        return AlertTriangle;
      case 'DispatcherAgent':
        return Send;
      default:
        return FileCheck;
    }
  };

  const getStatusStyles = (status: StepStatus) => {
    switch (status) {
      case 'COMPLETED':
        return {
          border: 'border-emerald-500/50 bg-emerald-950/20 shadow-emerald-500/10',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          indicator: 'bg-emerald-400',
          label: 'Completed',
          iconColor: 'text-emerald-400',
        };
      case 'RUNNING':
        return {
          border: 'border-indigo-500/80 bg-indigo-950/30 shadow-indigo-500/20 ring-2 ring-indigo-500/30',
          badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 animate-pulse',
          indicator: 'bg-indigo-400 animate-ping',
          label: 'Executing...',
          iconColor: 'text-indigo-400',
        };
      case 'NEEDS_APPROVAL':
        return {
          border: 'border-amber-500/80 bg-amber-950/30 shadow-amber-500/20 ring-2 ring-amber-500/40',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse',
          indicator: 'bg-amber-400 animate-ping',
          label: 'HITL Gate Awaiting',
          iconColor: 'text-amber-400',
        };
      case 'FAILED':
        return {
          border: 'border-rose-500/50 bg-rose-950/20 shadow-rose-500/10',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          indicator: 'bg-rose-400',
          label: 'Failed',
          iconColor: 'text-rose-400',
        };
      default:
        return {
          border: 'border-slate-800 bg-slate-900/40 hover:border-slate-700',
          badge: 'bg-slate-800 text-slate-400 border-slate-700',
          indicator: 'bg-slate-600',
          label: 'Pending',
          iconColor: 'text-slate-400',
        };
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Workflow Header Banner */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h3 className="font-bold text-base text-white">{workflow.title}</h3>
            <span
              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                workflow.status === 'COMPLETED'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : workflow.status === 'NEEDS_APPROVAL'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  : workflow.status === 'IN_PROGRESS'
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {workflow.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">{workflow.description}</p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center space-x-2">
            <span className="text-slate-500">Risk Score:</span>
            <span
              className={`font-mono font-bold ${
                workflow.riskScore > 60
                  ? 'text-amber-400'
                  : workflow.riskScore > 30
                  ? 'text-blue-400'
                  : 'text-emerald-400'
              }`}
            >
              {workflow.riskScore}/100
            </span>
          </div>

          {workflow.estimatedSavings > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-medium">
              +${workflow.estimatedSavings.toFixed(2)} Saved
            </div>
          )}
        </div>
      </div>

      {/* DAG Visualizer Nodes (Horizontal on Desktop, Vertical on Mobile) */}
      <div className="relative overflow-x-auto pb-4 pt-2">
        <div className="min-w-[840px] flex items-center justify-between gap-3 relative px-2">
          {/* Background Connecting Pipe line */}
          <div className="absolute top-[48px] left-10 right-10 h-[2px] bg-slate-800 -z-0" />

          {steps.map((step, idx) => {
            const Icon = getAgentIcon(step.agent);
            const style = getStatusStyles(step.status);
            const isSelected = selectedStepId === step.stepId;
            const canRunNext =
              step.status === 'PENDING' &&
              (idx === 0 || steps[idx - 1].status === 'COMPLETED');

            return (
              <div key={step.stepId} className="flex-1 flex flex-col items-center relative z-10">
                {/* Node Box */}
                <div
                  onClick={() => onSelectStep(step.stepId)}
                  className={`w-full max-w-[210px] rounded-xl border p-3 cursor-pointer transition-all duration-200 shadow-lg ${
                    style.border
                  } ${
                    isSelected ? 'ring-2 ring-indigo-400 scale-[1.02]' : 'hover:scale-[1.01]'
                  }`}
                >
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">
                      STEP {step.stepId} of {steps.length}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${style.badge}`}
                    >
                      {style.label}
                    </span>
                  </div>

                  {/* Agent Title & Icon */}
                  <div className="flex items-center space-x-2 mb-2">
                    <div
                      className={`h-8 w-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 ${style.iconColor}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-semibold text-slate-100 truncate">
                        {step.agent.replace('Agent', '')}
                      </div>
                      <div className="text-[10px] font-mono text-indigo-400 truncate">
                        {step.toolToExecute || step.action}
                      </div>
                    </div>
                  </div>

                  {/* Reasoning snippet */}
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed min-h-[32px]">
                    {step.reasoning}
                  </p>

                  {/* Node footer */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                    <div className="flex items-center space-x-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>{step.confidenceScore || 95}% conf</span>
                    </div>

                    {step.status === 'NEEDS_APPROVAL' && onOpenHitl ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenHitl();
                        }}
                        className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] animate-pulse"
                      >
                        Sign Off
                      </button>
                    ) : canRunNext && onExecuteStep ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onExecuteStep(step.stepId);
                        }}
                        disabled={isExecuting}
                        className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[10px] flex items-center gap-1 disabled:opacity-50"
                      >
                        <Play className="h-2.5 w-2.5" />
                        Run
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">
                        {step.tokensUsed ? `${step.tokensUsed} tokens` : 'Inspect'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow connector to next node */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-12 text-slate-600">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
