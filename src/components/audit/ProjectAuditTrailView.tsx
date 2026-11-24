import React, { useState } from 'react';
import {
  History,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User as UserIcon,
  Filter,
  FileSignature,
  Coins,
  ArrowRight,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AuditEvent } from '../../types';

interface Props {
  projectId?: string;
}

export const ProjectAuditTrailView: React.FC<Props> = ({ projectId }) => {
  const { projects, selectedProjectId } = useApp();

  const currentProject =
    projects.find((p) => p.id === (projectId || selectedProjectId)) || projects[0];

  const auditEvents = currentProject?.auditTrail || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'freelancer' | 'client' | 'admin'>('all');

  const filteredEvents = auditEvents.filter((ev) => {
    const matchesSearch =
      ev.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.userName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || ev.userRole === filterRole;

    return matchesSearch && matchesRole;
  });

  const getEventBadge = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('accept') || lower.includes('release') || lower.includes('signed')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
    if (lower.includes('scope') || lower.includes('alert') || lower.includes('requirement')) {
      return 'bg-amber-100 text-amber-800 border-amber-300';
    }
    if (lower.includes('decline') || lower.includes('reject')) {
      return 'bg-rose-100 text-rose-800 border-rose-300';
    }
    if (lower.includes('agreement') || lower.includes('proposal')) {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    }
    return 'bg-slate-100 text-slate-800 border-slate-300';
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
              Audit Trail Ledger
            </span>
            <span className="text-xs text-slate-400">Append-Only Immutable Records</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Project Activity History</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Project: <strong className="text-slate-800">{currentProject?.title}</strong> • Complete lifecycle events, scope negotiations & payment clearances.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200">
            Total Logged Events: {auditEvents.length}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events, users, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Role:</span>
          </span>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-1.5 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="freelancer">Freelancers</option>
            <option value="client">Clients</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Audit Log Timeline Table (FEATURE 6) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm">Chronological Audit Events</h3>
          <span className="text-xs text-slate-400">Zero record deletions permitted</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No audit events found matching your criteria.
            </div>
          ) : (
            filteredEvents.map((ev) => (
              <div key={ev.id} className="p-4 hover:bg-slate-50/80 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{ev.eventName}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getEventBadge(
                          ev.eventName
                        )}`}
                      >
                        {ev.userRole}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">{ev.details}</p>

                    {/* Previous -> New status transition */}
                    {ev.previousStatus && ev.newStatus && ev.previousStatus !== 'unchanged' && (
                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 pt-1">
                        <span className="font-semibold text-slate-600">Status Change:</span>
                        <span className="px-1.5 py-0.2 bg-slate-100 rounded text-slate-600 font-mono text-[10px]">
                          {ev.previousStatus}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-mono text-[10px] font-bold">
                          {ev.newStatus}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-800 flex items-center justify-end space-x-1">
                      <UserIcon className="w-3 h-3 text-slate-400" />
                      <span>{ev.userName}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {new Date(ev.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
