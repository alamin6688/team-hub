"use client";

import React from 'react';
import { 
  ArrowLeft, Target, Calendar, Clock, User, 
  CheckCircle2, Circle, MessageSquare, Paperclip, Plus 
} from 'lucide-react';
import Link from 'next/link';

export default function SingleGoalPage({ params }) {
  // Using unwrapped params because this is a simulated demo page
  // In Next.js 15+ we might need React.use(params) but this is just standard react usage here.
  const goalId = "Q3-Growth"; 

  const milestones = [
    { id: 1, title: 'Finalize Marketing Strategy', date: 'Oct 15', status: 'completed' },
    { id: 2, title: 'Launch Ad Campaigns', date: 'Nov 01', status: 'in-progress' },
    { id: 3, title: 'Reach 10k Active Users', date: 'Dec 15', status: 'pending' },
  ];

  const activities = [
    { id: 1, user: 'Demo User', action: 'completed milestone', target: 'Finalize Marketing Strategy', time: '2 days ago', initials: 'DU', bg: 'bg-purple-600' },
    { id: 2, user: 'Alice Chen', action: 'commented on', target: 'Launch Ad Campaigns', time: '3 days ago', initials: 'AC', bg: 'bg-teal-600' },
    { id: 3, user: 'Mark Irvine', action: 'updated the status to', target: 'In Progress', time: '1 week ago', initials: 'MI', bg: 'bg-orange-500' },
  ];

  return (
    <div className="p-6 md:p-8 animate-fade-in max-w-5xl mx-auto">
      
      {/* Back Navigation */}
      <Link href="/dashboard/goals" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-6">
        <ArrowLeft size={16} />
        Back to Goals
      </Link>

      {/* Goal Header */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full">IN PROGRESS</span>
              <span className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                <Target size={14} /> Marketing Team
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Accelerate Q3 User Growth
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
              Drive acquisition through targeted ad campaigns and partnership integrations. The objective is to hit our 10k MAU target before end of the year.
            </p>
          </div>
          
          <div className="flex flex-col gap-3 min-w-[200px]">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="text-xs font-bold text-gray-500 mb-1">PROGRESS</div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-2xl font-bold text-gray-900">35%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600 bg-white border border-gray-100 rounded-xl px-4 py-3">
              <span className="flex items-center gap-2"><Calendar size={16} className="text-gray-400"/> Due Date</span>
              <span className="font-medium text-gray-900">Dec 31, 2026</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Milestones */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Milestones</h2>
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                <Plus size={16} /> Add Milestone
              </button>
            </div>
            <div className="p-0">
              {milestones.map((ms, idx) => (
                <div key={ms.id} className={`flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors ${idx !== milestones.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <button className={`mt-0.5 ${ms.status === 'completed' ? 'text-emerald-500' : 'text-gray-300 hover:text-gray-400'}`}>
                    {ms.status === 'completed' ? <CheckCircle2 size={20} className="fill-emerald-50" /> : <Circle size={20} />}
                  </button>
                  <div className="flex-1">
                    <h3 className={`text-sm font-semibold mb-1 ${ms.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {ms.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {ms.date}
                      </span>
                      {ms.status === 'in-progress' && (
                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded">In Progress</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Activity Feed</h2>
            </div>
            <div className="p-6">
              <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pb-4">
                {activities.map((activity, idx) => (
                  <div key={activity.id} className="relative pl-6">
                    <div className={`absolute -left-[17px] top-0.5 w-8 h-8 rounded-full ${activity.bg} flex items-center justify-center text-white text-[10px] font-bold shadow-sm border-2 border-white`}>
                      {activity.initials}
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">
                        <span className="font-bold">{activity.user}</span> {activity.action} <span className="font-medium text-gray-900">{activity.target}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock size={12} /> {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 p-4 border-t border-gray-100">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Add a comment..." 
                  className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors p-1">
                  <Paperclip size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
