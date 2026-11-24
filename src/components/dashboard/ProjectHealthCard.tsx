import React from 'react';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Coins,
  FileSignature,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Props {
  projectId: string;
}

export const ProjectHealthCard: React.FC<Props> = ({ projectId }) => {
  const { getProjectHealth, projects, setSelectedProjectId, setActiveTab } = useApp();

  const project = projects.find((p) => p.id === projectId) || projects[0];
  const health = getProjectHealth(project?.id || 'proj-1');

  const getStatusBadge = () => {
    switch (health.status) {
      case 'Healthy':
        return {
          bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
          dot: 'bg-emerald-500',
          icon: ShieldCheck,
          label: 'Healthy Scope',
        };
      case 'Needs Attention':
        return {
          bg: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
          dot: 'bg-amber-500',
          icon: AlertTriangle,
          label: 'Needs Attention',
        };
      case 'At Risk':
        return {
          bg: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
          dot: 'bg-rose-500',
          icon: AlertCircle,
          label: 'At Risk',
        };
    }
  };

  const badge = getStatusBadge();
  const Icon = badge.icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-slate-900 text-base">Project Health Index</h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase border flex items-center space-x-1.5 ${badge.bg}`}
              >
                <span className={`w-2 h-2 rounded-full ${badge.dot} animate-pulse`} />
                <span>{health.status}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic health score computed from contract stability, milestone releases & deadlines.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Health Score</span>
          <div className="text-2xl font-black text-slate-900">{health.score} / 100</div>
        </div>
      </div>

      {/* 5 Health Factor Gauges (FEATURE 4) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Factor 1: Scope Stability */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="font-bold">Scope Stability</span>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-lg font-black text-slate-900">{health.scopeStabilityPct}%</div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                health.scopeStabilityPct > 80 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${health.scopeStabilityPct}%` }}
            />
          </div>
        </div>

        {/* Factor 2: Pending Approvals */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="font-bold">Pending Addendums</span>
            <FileSignature className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-lg font-black text-slate-900">{health.pendingApprovalsCount}</div>
          <span className="text-[10px] text-slate-400">
            {health.pendingApprovalsCount === 0 ? 'None pending' : 'Awaiting client'}
          </span>
        </div>

        {/* Factor 3: Milestone Progress */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="font-bold">Milestones</span>
            <Coins className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-lg font-black text-emerald-600">{health.milestoneCompletionPct}%</div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${health.milestoneCompletionPct}%` }}
            />
          </div>
        </div>

        {/* Factor 4: Deadline Status */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="font-bold">Deadline Status</span>
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-lg font-black text-indigo-900">{health.daysRemaining} Days</div>
          <span className="text-[10px] text-slate-400">Target buffer ok</span>
        </div>

        {/* Factor 5: Outstanding Scope Alerts */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="font-bold">Change Requests</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-lg font-black text-slate-900">{health.outstandingRequestsCount}</div>
          <span className="text-[10px] text-slate-400">
            {health.outstandingRequestsCount > 0 ? 'Action needed' : 'All addressed'}
          </span>
        </div>
      </div>

      {/* Explanations List from actual project records */}
      <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 space-y-2">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Health Diagnostic Explanations:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {health.reasons.map((reason, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action Button if scope creep alert exists */}
      {health.outstandingRequestsCount > 0 && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              setSelectedProjectId(project.id);
              setActiveTab('scopeguard');
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Resolve Outstanding Scope Request with ScopeGuard</span>
          </button>
        </div>
      )}
    </div>
  );
};
