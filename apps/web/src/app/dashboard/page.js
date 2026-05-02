"use client";

import React from 'react';
import { Target, CheckCircle2, Clock, AlertCircle, Download } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';

const weeklyChartData = [
  { name: 'W14', value: 3 },
  { name: 'W15', value: 5 },
  { name: 'W16', value: 4 },
  { name: 'W17', value: 7 },
  { name: 'W18', value: 6 },
  { name: 'W19', value: 9 },
];

const actionItemsData = [
  { name: 'To Do', value: 2, color: '#9ca3af' },
  { name: 'In Progress', value: 3, color: '#f59e0b' },
  { name: 'Done', value: 3, color: '#22c55e' },
];

const recentActivity = [
  {
    id: 1,
    user: "Sarah Chen",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    action: "completed task",
    target: "Update brand assets in Figma",
    time: "2 hours ago"
  },
  {
    id: 2,
    user: "Marcus Johnson",
    avatar: "https://i.pravatar.cc/150?u=marcus",
    action: "commented on",
    target: "Review PR #402",
    time: "4 hours ago"
  },
  {
    id: 3,
    user: "Emma Wilson",
    avatar: "https://i.pravatar.cc/150?u=emma",
    action: "created a new goal",
    target: "Reduce customer churn by 5%",
    time: "Yesterday"
  },
  {
    id: 4,
    user: "Alex Rivera",
    avatar: "https://i.pravatar.cc/150?u=alex",
    action: "moved task to Done",
    target: "Finalize Q4 OKRs",
    time: "Yesterday"
  }
];

const overdueGoals = [
  { id: 1, title: 'Quarterly Security Audit', dueDate: '20/04/2026' }
];

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Top Action Bar */}
      <div className="flex justify-end mb-6">
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Download size={16} />
          Export CSV
        </button>
      </div>

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
            <span className="text-3xl font-bold text-gray-800">24</span>
            <span className="text-[13px] font-medium text-emerald-500 pb-1">+12% this month</span>
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
            <span className="text-3xl font-bold text-gray-800">18</span>
            <span className="text-[13px] font-medium text-emerald-500 pb-1">+5% this month</span>
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
            <span className="text-3xl font-bold text-gray-800">4</span>
            <span className="text-[13px] font-medium text-red-500 pb-1">-2% this month</span>
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
            <span className="text-3xl font-bold text-gray-800">2</span>
            <span className="text-[13px] font-medium text-red-500 pb-1">+1 this week</span>
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
                    data={actionItemsData}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {actionItemsData.map((entry, index) => (
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
              {actionItemsData.map((entry, index) => (
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
            {overdueGoals.map((goal) => (
              <div key={goal.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
                    Overdue
                  </span>
                  <span className="text-sm font-medium text-gray-800">{goal.title}</span>
                </div>
                <span className="text-sm text-gray-500">Due {goal.dueDate}</span>
              </div>
            ))}
            {overdueGoals.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No overdue goals right now. Great job!</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-800 mb-6">Recent Activity</h2>
          <div className="flex flex-col gap-6">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <img 
                  src={activity.avatar} 
                  alt={activity.user} 
                  className="w-8 h-8 rounded-full flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-[13px] text-gray-600 leading-snug">
                    <span className="font-semibold text-gray-800">{activity.user}</span> {activity.action}{" "}
                    <span className="font-semibold text-gray-800">{activity.target}</span>
                  </p>
                  <p className="text-[12px] text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
