"use client";

import React from 'react';
import AuditLogTimeline from '@/components/Dashboard/AuditLogTimeline';
import { motion } from 'framer-motion';

export default function ActivityPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Activity Log</h1>
        <p className="text-slate-500 mt-1 font-normal text-sm">Monitor all actions and changes across your workspace</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none overflow-hidden">
        <AuditLogTimeline />
      </div>
    </motion.div>
  );
}
