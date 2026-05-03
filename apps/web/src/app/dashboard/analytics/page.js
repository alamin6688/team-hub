"use client";

import React from 'react';
import { 
  BarChart3, TrendingUp, Users, Target, Download, 
  Calendar, ChevronDown, Activity, Filter 
} from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="p-6 md:p-8 animate-fade-in max-w-7xl mx-auto">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Track your team's performance and productivity.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <Calendar size={16} />
            Last 30 Days
            <ChevronDown size={14} className="ml-1 text-gray-400" />
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Total Tasks Completed", value: "248", trend: "+12%", up: true, icon: CheckCircleIcon, color: "text-emerald-600", bg: "bg-emerald-50" },
          { title: "Active Goals", value: "12", trend: "0%", up: true, icon: Target, color: "text-indigo-600", bg: "bg-indigo-50" },
          { title: "Team Velocity", value: "48", trend: "+5%", up: true, icon: Activity, color: "text-purple-600", bg: "bg-purple-50" },
          { title: "Total Hours Logged", value: "1,204", trend: "-2%", up: false, icon: Calendar, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.bg} ${kpi.color}`}>
                <kpi.icon size={20} />
              </div>
              <div className={`text-xs font-bold px-2 py-1 rounded-full ${kpi.up ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {kpi.trend}
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900">{kpi.value}</h3>
              <p className="text-sm font-medium text-gray-500 mt-1">{kpi.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-900">Productivity Trend</h2>
            <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors">
              <Filter size={18} />
            </button>
          </div>
          
          {/* Simulated Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-2">
            {[40, 70, 45, 90, 65, 85, 100, 75, 55, 80, 60, 95].map((height, i) => (
              <div key={i} className="w-full flex flex-col items-center gap-2 group">
                <div className="relative w-full flex justify-center">
                   {/* Tooltip on hover */}
                   <div className="absolute -top-10 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                     {height} tasks
                   </div>
                   <div 
                    className="w-full max-w-[2.5rem] bg-indigo-100 hover:bg-indigo-600 rounded-t-sm transition-colors duration-300" 
                    style={{ height: `${height}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Task Distribution</h2>
          
          {/* Simulated Doughnut / Progress Bars */}
          <div className="space-y-6">
            {[
              { label: 'Engineering', value: 45, color: 'bg-indigo-600', light: 'bg-indigo-50' },
              { label: 'Design', value: 25, color: 'bg-purple-600', light: 'bg-purple-50' },
              { label: 'Marketing', value: 20, color: 'bg-pink-500', light: 'bg-pink-50' },
              { label: 'Operations', value: 10, color: 'bg-emerald-500', light: 'bg-emerald-50' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                  <span className="text-sm font-bold text-gray-900">{stat.value}%</span>
                </div>
                <div className={`w-full h-2.5 rounded-full ${stat.light}`}>
                  <div 
                    className={`h-full rounded-full ${stat.color}`} 
                    style={{ width: `${stat.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
              View Detailed Report →
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

// Inline CheckCircle icon component to avoid adding more lucide imports
function CheckCircleIcon(props) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={props.size || 24} 
      height={props.size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
