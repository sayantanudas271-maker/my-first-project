import React, { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext.tsx';
import {
  ScrollText,
  Search,
  Bot,
  Filter,
  Download,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Brain,
  Code2,
  Lock,
} from 'lucide-react';
import { AuditLog, AgentName } from '../types.ts';

export const AuditTrailPage: React.FC = () => {
  const { auditLogs } = useWorkflow();
  const [selectedAgent, setSelectedAgent] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAgent = selectedAgent === 'ALL' || log.agentId === selectedAgent;
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.decisionReasoning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.workflowId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAgent && matchesSearch;
  });

  const exportToJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `autoops_audit_trail_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const agents: Array<{ id: string; label: string }> = [
    { id: 'ALL', label: 'All Agents' },
    { id: 'InventoryMonitorAgent', label: 'Inventory Monitor' },
    { id: 'VendorNegotiatorAgent', label: 'Vendor Negotiator' },
    { id: 'ComplianceAgent', label: 'Compliance Guard' },
    { id: 'ApprovalRouterAgent', label: 'Approval Router' },
    { id: 'DispatcherAgent', label: 'EDI Dispatcher' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ScrollText className="h-6 w-6 text-indigo-400" />
            Enterprise Audit Trail & Agent Decision Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable log of agent decisions, tool invocations, token consumption, and confidence scores
          </p>
        </div>

        <button
          onClick={exportToJson}
          className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          <span>Export Audit Log (JSON)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search decisions, tool actions, or workflow IDs..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs pb-1 md:pb-0">
          {agents.map((ag) => (
            <button
              key={ag.id}
              onClick={() => setSelectedAgent(ag.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition shrink-0 ${
                selectedAgent === ag.id
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {ag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Agent Actor</th>
                <th className="py-3 px-4">Action / Tool</th>
                <th className="py-3 px-4">Decision Reasoning</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Tokens</th>
                <th className="py-3 px-4 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No audit records match the current filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        className="hover:bg-slate-800/30 transition cursor-pointer"
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      >
                        <td className="py-3 px-4 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-semibold text-indigo-300 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/30 font-mono text-[11px]">
                            {log.agentId.replace('Agent', '')}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono text-[11px] text-slate-300">
                            {log.toolInvoked || log.action}
                          </span>
                        </td>

                        <td className="py-3 px-4 max-w-md">
                          <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                            {log.decisionReasoning}
                          </p>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono text-[11px] font-bold text-emerald-400">
                            {log.confidenceScore}%
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                          {log.tokensUsed}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedLogId(isExpanded ? null : log.id);
                            }}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Row Inspector */}
                      {isExpanded && (
                        <tr className="bg-slate-950/90">
                          <td colSpan={7} className="p-4 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* Tool Input */}
                              <div className="space-y-1">
                                <span className="font-mono text-[10px] uppercase text-slate-400 flex items-center gap-1">
                                  <Code2 className="h-3 w-3 text-slate-400" />
                                  Tool Input Parameters:
                                </span>
                                <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-48">
                                  {JSON.stringify(log.toolInput || {}, null, 2)}
                                </pre>
                              </div>

                              {/* Tool Output */}
                              <div className="space-y-1">
                                <span className="font-mono text-[10px] uppercase text-emerald-400 flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3 text-emerald-400" />
                                  Tool Execution Result:
                                </span>
                                <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[10px] text-emerald-300/90 overflow-x-auto max-h-48">
                                  {JSON.stringify(log.toolOutput || {}, null, 2)}
                                </pre>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                              <span>Audit ID: {log.id}</span>
                              <span>Target Workflow: {log.workflowId}</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
