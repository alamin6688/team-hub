"use client";

import React from 'react';
import { Target, CheckCircle2, Clock, AlertCircle, Download } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { fetchWithAuth } from '@/lib/api';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

const weeklyChartData = [
  { name: 'W14', value: 3 },
  { name: 'W15', value: 5 },
  { name: 'W16', value: 4 },
  { name: 'W17', value: 7 },
  { name: 'W18', value: 6 },
  { name: 'W19', value: 9 },
];

export default function DashboardPage() {
  const { 
    currentWorkspace, 
    goals, setGoals, 
    announcements, setAnnouncements,
    actionItems, setActionItems,
    isLoading, setLoading 
  } = useWorkspaceStore();

  React.useEffect(() => {
    if (!currentWorkspace?.id) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [goalsRes, announcementsRes, actionItemsRes] = await Promise.all([
          fetchWithAuth(`/workspaces/${currentWorkspace.id}/goals`),
          fetchWithAuth(`/workspaces/${currentWorkspace.id}/announcements`),
          fetchWithAuth(`/workspaces/${currentWorkspace.id}/action-items`),
        ]);

        if (goalsRes?.data) setGoals(goalsRes.data);
        if (announcementsRes?.data) setAnnouncements(announcementsRes.data);
        if (actionItemsRes?.data) setActionItems(actionItemsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentWorkspace?.id]);

  // Derived stats
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 'COMPLETED').length;
  const inProgressGoals = goals.filter(g => g.status === 'IN_PROGRESS').length;
  const overdueGoalsCount = goals.filter(g => g.status === 'OVERDUE' || (new Date(g.dueDate) < new Date() && g.status !== 'COMPLETED')).length;

  // Chart data formatting
  const actionItemsByStatus = [
    { name: 'To Do', value: actionItems.filter(i => i.status === 'TODO').length, color: '#9ca3af' },
    { name: 'In Progress', value: actionItems.filter(i => i.status === 'IN_PROGRESS').length, color: '#f59e0b' },
    { name: 'Done', value: actionItems.filter(i => i.status === 'DONE').length, color: '#22c55e' },
  ];

  const overdueList = goals.filter(g => new Date(g.dueDate) < new Date() && g.status !== 'COMPLETED').slice(0, 5);

  return (
    <div className="p-8">

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-[13px] font-medium text-gray-500">Total Goals</span>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
              <Target size={16} />
            </div>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-gray-800">{totalGoals}</span>
            <span className="text-[13px] font-medium text-emerald-500 pb-1">Active</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-[13px] font-medium text-gray-500">Completed</span>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-gray-800">{completedGoals}</span>
            <span className="text-[13px] font-medium text-emerald-500 pb-1">Total</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-[13px] font-medium text-gray-500">In Progress</span>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
              <Clock size={16} />
            </div>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-gray-800">{inProgressGoals}</span>
            <span className="text-[13px] font-medium text-amber-500 pb-1">Active</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-[13px] font-medium text-gray-500">Overdue</span>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
              <AlertCircle size={16} />
            </div>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-gray-800">{overdueGoalsCount}</span>
            <span className="text-[13px] font-medium text-red-500 pb-1">Requires attention</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Goal Completion (Bar Chart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-800 mb-6">Goal Completion (last 6 weeks)</h2>
          <div className="h-[240px] w-full pr-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={true} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  ticks={[0, 3, 6, 9, 12]}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#f43f5e" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Items by Status (Donut Chart) */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-base font-bold text-gray-800 mb-6">Action Items by Status</h2>
          <div className="h-[240px] w-full flex items-center justify-between relative flex-1 pr-6">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={actionItemsByStatus}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {actionItemsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Legend to match image */}
            <div className="w-1/2 flex flex-col gap-3 ml-4">
              {actionItemsByStatus.map((entry, index) => (
                <div key={index} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-sm text-gray-600">{entry.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overdue Goals */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-800 mb-6">Overdue Goals</h2>
          <div className="flex flex-col gap-3">
            {overdueList.map((goal) => (
              <div key={goal.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
                    Overdue
                  </span>
                  <span className="text-sm font-medium text-gray-800">{goal.title}</span>
                </div>
                <span className="text-sm text-gray-500">Due {new Date(goal.dueDate).toLocaleDateString()}</span>
              </div>
            ))}
            {overdueList.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No overdue goals right now. Great job!</p>
            )}
          </div>
        </div>

        {/* Recent Activity (Announcements Feed) */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-800 mb-6">Announcements</h2>
          <div className="flex flex-col gap-6">
            {announcements.slice(0, 5).map((announcement) => (
              <div key={announcement.id} className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center text-white font-bold text-xs ${announcement.userColor || 'bg-indigo-500'}`}>
                  {announcement.author?.name?.substring(0, 2) || 'AN'}
                </div>
                <div>
                  <p className="text-[13px] text-gray-600 leading-snug">
                    <span className="font-semibold text-gray-800">{announcement.author?.name}</span>:{" "}
                    <span className="text-gray-800 font-medium">{announcement.title}</span>
                  </p>
                  <p className="text-[12px] text-gray-400 mt-1">{new Date(announcement.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No recent announcements.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
