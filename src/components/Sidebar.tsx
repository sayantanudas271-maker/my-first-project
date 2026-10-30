import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GitBranch,
  PlaySquare,
  Boxes,
  ScrollText,
  Bot,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Box,
  Globe,
  Sparkles,
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext.tsx';

interface SidebarProps {
  onOpenCopilot?: () => void;
  onOpenMarketSearch?: () => void;
  onOpenMediaStudio?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenCopilot,
  onOpenMarketSearch,
  onOpenMediaStudio,
}) => {
  const { workflows } = useWorkflow();
  const pendingApprovals = workflows.filter((w) => w.status === 'NEEDS_APPROVAL').length;
  const runningCount = workflows.filter((w) => w.status === 'IN_PROGRESS').length;

  const navItems = [
    {
      to: '/',
      label: 'Control Center',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/digital-twin',
      label: '3D Warehouse Twin',
      icon: Box,
      badge: 'Three.js',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      to: '/workflows',
      label: 'Autonomous Workflows',
      icon: GitBranch,
      badge: runningCount > 0 ? `${runningCount} Active` : null,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      to: '/simulator',
      label: 'Workflow Simulator',
      icon: PlaySquare,
      badge: pendingApprovals > 0 ? `${pendingApprovals} Action Req` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      to: '/inventory',
      label: 'Inventory & Vendors',
      icon: Boxes,
      badge: null,
    },
    {
      to: '/audit',
      label: 'Audit Trail & Reasoning',
      icon: ScrollText,
      badge: null,
    },
  ];

  const agentFleet = [
    { name: 'Inventory Monitor', role: 'Telemetry & Sizing', status: 'idle' },
    { name: 'Vendor Negotiator', role: 'Dynamic RFQ Bidding', status: 'active' },
    { name: 'Compliance Guard', role: 'ESG & ISO Auditor', status: 'idle' },
    { name: 'Approval Router', role: 'HITL Risk Gate', status: 'idle' },
    { name: 'EDI Dispatcher', role: 'PO & Ledger Sync', status: 'idle' },
  ];

  return (
    <aside className="w-64 bg-slate-900/60 border-r border-slate-800 flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="p-4 space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Specialized Domain Agent Fleet Overview */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="px-3 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5 text-indigo-400" />
              Agent Fleet
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </div>

          <div className="space-y-1.5 px-2">
            {agentFleet.map((agent, i) => (
              <div
                key={i}
                className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="text-slate-200 font-medium text-[11px]">{agent.name}</div>
                  <div className="text-slate-500 text-[10px]">{agent.role}</div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
                  <span className="text-[10px] text-slate-400 font-mono">Ready</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Copilot & Market Search Quick Launcher */}
        <div className="px-2 pt-2 border-t border-slate-800/80 space-y-1.5">
          {onOpenMediaStudio && (
            <button
              onClick={onOpenMediaStudio}
              className="w-full p-2 rounded-lg bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-medium flex items-center justify-between transition"
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                <span>Media Studio</span>
              </div>
              <span className="text-[9px] font-mono px-1 rounded bg-purple-500/20 text-purple-300">
                CAD & Video
              </span>
            </button>
          )}

          {onOpenCopilot && (
            <button
              onClick={onOpenCopilot}
              className="w-full p-2 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 text-xs font-medium flex items-center justify-between transition"
            >
              <div className="flex items-center space-x-2">
                <Bot className="h-3.5 w-3.5 text-indigo-400" />
                <span>Agentic Copilot</span>
              </div>
              <span className="text-[9px] font-mono px-1 rounded bg-indigo-500/20 text-indigo-300">
                Gemini
              </span>
            </button>
          )}

          {onOpenMarketSearch && (
            <button
              onClick={onOpenMarketSearch}
              className="w-full p-2 rounded-lg bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-500/30 text-cyan-300 text-xs font-medium flex items-center justify-between transition"
            >
              <div className="flex items-center space-x-2">
                <Globe className="h-3.5 w-3.5 text-cyan-400" />
                <span>Market Intelligence</span>
              </div>
              <span className="text-[9px] font-mono px-1 rounded bg-cyan-500/20 text-cyan-300">
                Search
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/30">
        <div className="rounded-xl p-3 bg-gradient-to-b from-indigo-950/30 to-slate-900 border border-indigo-500/20 text-xs">
          <div className="flex items-center space-x-2 text-indigo-300 font-semibold mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span>HITL Governance Policy</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Automated delegation cap: <strong className="text-slate-200">$5,000 USD</strong>. Dynamic risk index ceiling:{' '}
            <strong className="text-slate-200">60/100</strong>. High-risk POs require manager approval.
          </p>
        </div>
      </div>
    </aside>
  );
};
