import React from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { AnalyticsMetrics } from '../types.ts';

interface StatCardsProps {
  metrics?: AnalyticsMetrics;
  onOpenHitl?: () => void;
}

export const StatCards: React.FC<StatCardsProps> = ({ metrics, onOpenHitl }) => {
  const cards = [
    {
      title: 'Active Workflows',
      value: (metrics?.inProgress || 0) + (metrics?.pendingApproval || 0),
      subtitle: `${metrics?.inProgress || 0} executing, ${metrics?.pendingApproval || 0} paused`,
      icon: Activity,
      color: 'indigo',
      badge: '+12% this week',
    },
    {
      title: 'Autonomous Success Rate',
      value: `${metrics?.successRate || 98.4}%`,
      subtitle: `${metrics?.completed || 0} completed with zero manual flaws`,
      icon: CheckCircle2,
      color: 'emerald',
      badge: '99.8% precision',
    },
    {
      title: 'Procurement Hours Saved',
      value: `${metrics?.hoursSaved || 480} hrs`,
      subtitle: '4.5 hrs saved per autonomous order',
      icon: Clock,
      color: 'cyan',
      badge: '3.8x team leverage',
    },
    {
      title: 'Negotiated Savings',
      value: `$${(metrics?.totalSavings || 24800).toLocaleString()}`,
      subtitle: 'Dynamic volume discount capture',
      icon: TrendingDown,
      color: 'blue',
      badge: '8.4% avg discount',
    },
    {
      title: 'Pending HITL Approvals',
      value: metrics?.pendingApproval || 0,
      subtitle: 'Risk score > 60 or Spend > $5,000',
      icon: ShieldAlert,
      color: metrics && metrics.pendingApproval > 0 ? 'amber' : 'slate',
      badge: metrics && metrics.pendingApproval > 0 ? 'Action Required' : 'All Clear',
      clickable: metrics && metrics.pendingApproval > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            onClick={card.clickable ? onOpenHitl : undefined}
            className={`p-4 rounded-xl border bg-slate-900/60 backdrop-blur-sm transition relative overflow-hidden group ${
              card.clickable
                ? 'cursor-pointer hover:border-amber-500/50 hover:bg-amber-950/20 ring-1 ring-amber-500/20'
                : 'border-slate-800 hover:border-slate-700/80'
            }`}
          >
            {/* Top row */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium text-slate-300 truncate">{card.title}</span>
              <div
                className={`p-1.5 rounded-lg border ${
                  card.color === 'emerald'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : card.color === 'amber'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
                    : card.color === 'cyan'
                    ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                    : card.color === 'blue'
                    ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                    : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>

            {/* Value */}
            <div className="text-2xl font-bold text-white tracking-tight mb-1">
              {card.value}
            </div>

            {/* Subtitle & Badge */}
            <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-800/60">
              <span className="text-slate-400 truncate max-w-[130px]">{card.subtitle}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded border whitespace-nowrap ${
                  card.color === 'amber' && card.clickable
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
