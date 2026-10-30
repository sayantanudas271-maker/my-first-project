import React from 'react';
import { WorkflowStep, StepStatus } from '../types.ts';
import {
  X,
  Bot,
  Wrench,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Code2,
  Brain,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface StepDetailDrawerProps {
  step: WorkflowStep | null;
  onClose: () => void;
  onExecuteStep?: (stepId: number) => void;
  isExecuting?: boolean;
}

export const StepDetailDrawer: React.FC<StepDetailDrawerProps> = ({
  step,
  onClose,
  onExecuteStep,
  isExecuting,
}) => {
  if (!step) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col backdrop-blur-xl">
      {/* Drawer Header */}
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-white">
                Step {step.stepId}: {step.agent.replace('Agent', '')}
              </h3>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase ${
                  step.status === 'COMPLETED'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : step.status === 'NEEDS_APPROVAL'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : step.status === 'RUNNING'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {step.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-[11px] font-mono text-indigo-400 mt-0.5">
              tool: {step.toolToExecute || step.action}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
        {/* KPI Row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Confidence Score:</span>
            <span className="font-mono font-bold text-emerald-400">
              {step.confidenceScore || 95}%
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Tokens Used:</span>
            <span className="font-mono font-bold text-indigo-400">
              {step.tokensUsed || 0} tokens
            </span>
          </div>
        </div>

        {/* Agent Chain-of-Thought Reasoning */}
        <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-1.5">
          <div className="flex items-center space-x-2 text-indigo-300 font-semibold text-[11px]">
            <Brain className="h-4 w-4 text-indigo-400" />
            <span>Agent Chain of Thought & Reasoning</span>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed font-sans">{step.reasoning}</p>
        </div>

        {/* Tool Input Payload */}
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] font-semibold uppercase font-mono">
            <Code2 className="h-3.5 w-3.5 text-slate-400" />
            <span>Dynamic Tool Input Parameters</span>
          </div>
          <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
            {step.toolInput ? JSON.stringify(step.toolInput, null, 2) : '{\n  "status": "pending_invocation"\n}'}
          </pre>
        </div>

        {/* Tool Output Result */}
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5 text-emerald-400 text-[11px] font-semibold uppercase font-mono">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Tool Execution Result Payload</span>
          </div>
          <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-300/90 overflow-x-auto">
            {step.toolOutput ? JSON.stringify(step.toolOutput, null, 2) : '{\n  "status": "not_yet_executed"\n}'}
          </pre>
        </div>
      </div>

      {/* Drawer Footer Actions */}
      <div className="px-5 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 font-mono">
          Agent: {step.agent}
        </span>
        {onExecuteStep && (
          <button
            onClick={() => onExecuteStep(step.stepId)}
            disabled={isExecuting}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition disabled:opacity-50"
          >
            {step.status === 'COMPLETED' ? 'Re-execute Step' : 'Execute This Step'}
          </button>
        )}
      </div>
    </div>
  );
};
