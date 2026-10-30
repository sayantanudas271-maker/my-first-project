import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useWorkflow } from '../context/WorkflowContext.tsx';
import {
  Cpu,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Activity,
  PlusCircle,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { UserRole } from '../types.ts';

interface NavbarProps {
  onOpenNewWorkflow: () => void;
  onOpenCopilot?: () => void;
  onOpenMarketSearch?: () => void;
  onOpenMediaStudio?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewWorkflow,
  onOpenCopilot,
  onOpenMarketSearch,
  onOpenMediaStudio,
}) => {
  const { user, logout, quickLogin } = useAuth();
  const { workflows, refreshAll, isLoading } = useWorkflow();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const pendingHitlCount = workflows.filter((w) => w.status === 'NEEDS_APPROVAL').length;

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'MANAGER':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'AGENT_OPERATOR':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
      {/* Brand & Status */}
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20">
          <div className="h-full w-full bg-slate-950 rounded-xl flex items-center justify-center">
            <Cpu className="h-5 w-5 text-indigo-400 animate-pulse" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-base md:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              AutoOps AI
            </span>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              v2.4 Autonomous
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Enterprise Supply Chain & Vendor Operations Orchestrator
          </p>
        </div>
      </div>

      {/* Center status indicators */}
      <div className="hidden lg:flex items-center space-x-4">
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="h-2 w-2 rounded-full bg-emerald-500 -ml-4" />
          <span>5 Specialized Domain Agents Active</span>
        </div>

        {pendingHitlCount > 0 && (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 animate-pulse">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span>{pendingHitlCount} HITL Approvals Pending</span>
          </div>
        )}
      </div>

      {/* Action CTA & User controls */}
      <div className="flex items-center space-x-2.5">
        {onOpenMediaStudio && (
          <button
            onClick={onOpenMediaStudio}
            title="CAD Image Generator (gemini-nano-banana-2.1) & Video Animator (gemini-omni-1.1-flash)"
            className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border border-purple-500/30 text-xs font-semibold transition"
          >
            <span>Media Studio</span>
          </button>
        )}

        {onOpenMarketSearch && (
          <button
            onClick={onOpenMarketSearch}
            title="Google Search Grounded Market Intelligence & Maps"
            className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition"
          >
            <span>Search Market & Maps</span>
          </button>
        )}

        {onOpenCopilot && (
          <button
            onClick={onOpenCopilot}
            title="Multi-Turn Gemini Agent Chatbot"
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition"
          >
            <span>AI Copilot</span>
          </button>
        )}

        <button
          onClick={onOpenNewWorkflow}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">New Task</span>
          <span className="sm:hidden">New</span>
        </button>

        <button
          onClick={() => refreshAll()}
          title="Refresh Data"
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
        </button>

        {/* User Role Switcher Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition text-left"
            >
              <div className="h-7 w-7 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-semibold text-xs">
                {user.name.charAt(0)}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-medium text-slate-200 leading-tight">{user.name}</div>
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <span className={`px-1 rounded border text-[9px] ${getRoleBadge(user.role)}`}>
                    {user.role}
                  </span>
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl py-2 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Quick-Switch Role (Demo Mode)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Test role-based permissions & manager approval gates
                  </p>
                </div>

                <button
                  onClick={() => {
                    quickLogin('ADMIN');
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-800 ${
                    user.role === 'ADMIN' ? 'bg-indigo-950/40 text-indigo-300' : 'text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-semibold">Sarah Chen (Admin)</div>
                    <div className="text-[10px] text-slate-400">Full system & override authority</div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded border border-purple-500/40 bg-purple-500/10 text-purple-300">
                    ADMIN
                  </span>
                </button>

                <button
                  onClick={() => {
                    quickLogin('MANAGER');
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-800 ${
                    user.role === 'MANAGER' ? 'bg-indigo-950/40 text-indigo-300' : 'text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-semibold">Marcus Vance (Manager)</div>
                    <div className="text-[10px] text-slate-400">Can approve HITL gates & POs</div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded border border-blue-500/40 bg-blue-500/10 text-blue-300">
                    MANAGER
                  </span>
                </button>

                <button
                  onClick={() => {
                    quickLogin('AGENT_OPERATOR');
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-800 ${
                    user.role === 'AGENT_OPERATOR' ? 'bg-indigo-950/40 text-indigo-300' : 'text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-semibold">Elena Rostova (Operator)</div>
                    <div className="text-[10px] text-slate-400">Triggers tasks, requires manager sign-off</div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
                    OPERATOR
                  </span>
                </button>

                <div className="my-1 border-t border-slate-800" />

                <button
                  onClick={() => {
                    logout();
                    setRoleMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center space-x-2 text-rose-400 hover:bg-rose-500/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
