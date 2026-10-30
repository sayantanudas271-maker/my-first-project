import React from 'react';
import { useWorkflow } from '../context/WorkflowContext.tsx';
import { StatCards } from '../components/StatCards.tsx';
import { ExecutionStream } from '../components/ExecutionStream.tsx';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  GitBranch,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Play,
  CheckCircle2,
  Boxes,
} from 'lucide-react';

interface DashboardProps {
  onOpenNewWorkflow: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenNewWorkflow }) => {
  const {
    analytics,
    workflows,
    auditLogs,
    setActiveWorkflow,
    setHitlWorkflowToApprove,
  } = useWorkflow();
  const navigate = useNavigate();

  const pendingHitlWorkflows = workflows.filter((w) => w.status === 'NEEDS_APPROVAL');
  const recentWorkflows = workflows.slice(0, 5);

  const allExecutionLogs = workflows
    .flatMap((w) => w.executionLogs || [])
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Autonomous Operations Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-agent procurement orchestration, dynamic bidding & risk governance
          </p>
        </div>

        <button
          onClick={onOpenNewWorkflow}
          className="self-start sm:self-auto px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition"
        >
          <GitBranch className="h-4 w-4" />
          <span>New Autonomous Task</span>
        </button>
      </div>

      {/* HITL Urgent Attention Banner if pending approvals exist */}
      {pendingHitlWorkflows.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-300">
                {pendingHitlWorkflows.length} Autonomous Workflow(s) Awaiting Human-in-the-Loop Sign-Off
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Dynamic risk score &gt; 60 or Purchase Order value &gt; $5,000 policy threshold. Manager approval required before electronic EDI dispatch.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setHitlWorkflowToApprove(pendingHitlWorkflows[0]);
            }}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition shadow-lg shadow-amber-500/20"
          >
            Review & Sign Off Now
          </button>
        </div>
      )}

      {/* KPI Stat Cards */}
      <StatCards
        metrics={analytics?.metrics}
        onOpenHitl={() => {
          if (pendingHitlWorkflows.length > 0) {
            setHitlWorkflowToApprove(pendingHitlWorkflows[0]);
          }
        }}
      />

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart 1: Agent Execution Throughput Trend */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-400" />
                Autonomous Agent Throughput & Policy Escalations
              </h3>
              <p className="text-[11px] text-slate-400">
                Monthly count of autonomous completions vs human approvals vs legacy manual orders
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Last 5 Months
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analytics?.charts?.throughputTrend || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorAuto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorHitl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="autonomous"
                  name="Autonomous Executions"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAuto)"
                />
                <Area
                  type="monotone"
                  dataKey="hitlEscalated"
                  name="HITL Manager Escalations"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorHitl)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Negotiated Savings by Commodity Category */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Boxes className="h-4 w-4 text-emerald-400" />
              Savings by Category
            </h3>
            <p className="text-[11px] text-slate-400">
              Procurement discounts secured by Vendor Negotiation Agent
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics?.charts?.categorySavings || []}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={10} tickFormatter={(v) => `$${v}`} />
                <YAxis dataKey="category" type="category" stroke="#64748b" fontSize={10} width={90} />
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Savings']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="savings" radius={[0, 4, 4, 0]}>
                  {(analytics?.charts?.categorySavings || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Workflows & Live Execution Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Workflows Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-indigo-400" />
                Recent Autonomous Workflows
              </h3>
              <button
                onClick={() => navigate('/workflows')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                <span>View All ({workflows.length})</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentWorkflows.map((wf) => (
                <div
                  key={wf.id}
                  onClick={() => {
                    setActiveWorkflow(wf);
                    navigate('/simulator');
                  }}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-xs text-slate-200 group-hover:text-indigo-300 transition truncate">
                        {wf.title}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                          wf.status === 'COMPLETED'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : wf.status === 'NEEDS_APPROVAL'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                            : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                        }`}
                      >
                        {wf.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-1">
                      <span>SKU: {wf.targetSku || 'N/A'}</span>
                      <span>•</span>
                      <span>Risk: {wf.riskScore}/100</span>
                      <span>•</span>
                      <span>{wf.agentPlan.steps.length} Steps</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center space-x-2">
                    {wf.status === 'NEEDS_APPROVAL' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setHitlWorkflowToApprove(wf);
                        }}
                        className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold text-[10px] hover:bg-amber-400 transition"
                      >
                        Sign Off
                      </button>
                    ) : (
                      <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 group-hover:text-indigo-400 transition">
                        <span>Inspect DAG</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Execution Stream */}
        <ExecutionStream logs={allExecutionLogs} maxHeight="h-96" />
      </div>
    </div>
  );
};
