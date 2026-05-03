"use client";

import React, { useState, useEffect } from 'react';
import { 
  History, Download, Filter, Search, 
  Calendar, User as UserIcon, Tag,
  ArrowRight, FileText, Users, Target, Layout,
  CheckCircle2, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import toast from 'react-hot-toast';

const actionIcons = {
  GOAL_CREATED: { icon: Target, color: 'bg-emerald-100 text-emerald-600' },
  GOAL_UPDATED: { icon: Target, color: 'bg-blue-100 text-blue-600' },
  GOAL_DELETED: { icon: Target, color: 'bg-rose-100 text-rose-600' },
  TASK_CREATED: { icon: CheckCircle2, color: 'bg-indigo-100 text-indigo-600' },
  TASK_UPDATED: { icon: CheckCircle2, color: 'bg-sky-100 text-sky-600' },
  TASK_DELETED: { icon: CheckCircle2, color: 'bg-rose-100 text-rose-600' },
  MEMBER_INVITED: { icon: Users, color: 'bg-purple-100 text-purple-600' },
  MEMBER_ROLE_UPDATED: { icon: Shield, color: 'bg-amber-100 text-amber-600' },
  MEMBER_REMOVED: { icon: Users, color: 'bg-rose-100 text-rose-600' },
  ANNOUNCEMENT_CREATED: { icon: FileText, color: 'bg-pink-100 text-pink-600' },
  WORKSPACE_UPDATED: { icon: Layout, color: 'bg-slate-100 text-slate-600' },
};

export default function AuditLogTimeline() {
  const { currentWorkspace, fetchAuditLogs, exportAuditLogs } = useWorkspaceStore();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    startDate: '',
    endDate: '',
  });

  const loadLogs = async () => {
    if (!currentWorkspace) return;
    setIsLoading(true);
    try {
      const data = await fetchAuditLogs(currentWorkspace.id, filters);
      setLogs(data);
    } catch (error) {
      toast.error("Failed to load audit logs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [currentWorkspace, filters.action, filters.entityType, filters.startDate, filters.endDate]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csvContent = await exportAuditLogs(currentWorkspace.id, filters);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `audit-log-${currentWorkspace.id}-${Date.now()}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Audit log exported successfully");
    } catch (error) {
      toast.error("Failed to export audit logs");
    } finally {
      setIsExporting(false);
    }
  };

  const getIcon = (action) => {
    const config = actionIcons[action] || { icon: History, color: 'bg-slate-100 text-slate-500' };
    const Icon = config.icon;
    return (
      <div className={`p-2 rounded-xl ${config.color}`}>
        <Icon size={16} />
      </div>
    );
  };

  const formatMetadata = (metadata) => {
    if (!metadata) return null;
    return Object.entries(metadata).map(([key, value]) => (
      <span key={key} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-500 border border-slate-100">
        <span className="capitalize opacity-60 mr-1">{key}:</span>
        <span className="truncate max-w-[100px]">{String(value)}</span>
      </span>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 p-4 rounded-[24px] border border-slate-100">
        <div className="flex flex-wrap gap-3">
          <select 
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-100 outline-none"
          >
            <option value="">All Actions</option>
            <option value="GOAL_CREATED">Goal Created</option>
            <option value="TASK_CREATED">Task Created</option>
            <option value="MEMBER_INVITED">Member Invited</option>
            <option value="WORKSPACE_UPDATED">Workspace Updated</option>
          </select>

          <select 
            value={filters.entityType}
            onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-100 outline-none"
          >
            <option value="">All Entities</option>
            <option value="GOAL">Goals</option>
            <option value="TASK">Tasks</option>
            <option value="MEMBER">Members</option>
            <option value="WORKSPACE">Workspace</option>
          </select>
        </div>

        <button 
          onClick={handleExport}
          disabled={isExporting || logs.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
        >
          {isExporting ? <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" /> : <Download size={14} />}
          Export CSV
        </button>
      </div>

      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-slate-100" />

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-400">
            <div className="w-8 h-8 border-3 border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-xs font-bold uppercase tracking-widest">Loading history...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200">
            <History size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 font-bold">No activity logs found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-8">
            {logs.map((log, idx) => (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="relative flex items-start gap-4 pl-1"
              >
                {/* Icon Circle */}
                <div className="relative z-10 w-10 h-10 bg-white rounded-full border-4 border-white shadow-sm flex items-center justify-center shrink-0">
                  {getIcon(log.action)}
                </div>

                <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{log.action.replace(/_/g, ' ')}</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider">
                        {log.entityType}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center overflow-hidden">
                      {log.actor.avatarUrl ? (
                        <img src={log.actor.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-indigo-600">{log.actor.name.substring(0, 1)}</span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-600">
                      Performed by <span className="text-slate-900">{log.actor.name}</span>
                    </span>
                  </div>

                  {log.metadata && (
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-50">
                      {formatMetadata(log.metadata)}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
