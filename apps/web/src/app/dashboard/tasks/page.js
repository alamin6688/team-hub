"use client";

import React, { useState } from 'react';
import { LayoutGrid, List, Plus } from 'lucide-react';

const tasksData = [
  {
    id: 1,
    title: "Draft launch email copy",
    priority: "HIGH",
    status: "TO DO",
    assignee: "Aria Chen",
    assigneeInitials: "AC",
    assigneeColor: "bg-[#208b73]",
    dueDateStr: "4 May",
    dueDateFull: "04/05/2026"
  },
  {
    id: 2,
    title: "Audit competitor pricing",
    priority: "MEDIUM",
    status: "TO DO",
    assignee: "Sofia Park",
    assigneeInitials: "SP",
    assigneeColor: "bg-[#4f46e5]",
    dueDateStr: "7 May",
    dueDateFull: "07/05/2026"
  },
  {
    id: 3,
    title: "Set up Stripe webhooks",
    priority: "HIGH",
    status: "IN PROGRESS",
    assignee: "Marcus Iyer",
    assigneeInitials: "MI",
    assigneeColor: "bg-[#f97316]",
    dueDateStr: "3 May",
    dueDateFull: "03/05/2026"
  },
  {
    id: 4,
    title: "Refactor session middleware",
    priority: "MEDIUM",
    status: "IN PROGRESS",
    assignee: "Theo Nakamura",
    assigneeInitials: "TN",
    assigneeColor: "bg-[#059669]",
    dueDateStr: "9 May",
    dueDateFull: "09/05/2026"
  },
  {
    id: 5,
    title: "Design tour empty states",
    priority: "LOW",
    status: "IN PROGRESS",
    assignee: "Lina Okafor",
    assigneeInitials: "LO",
    assigneeColor: "bg-[#ea580c]",
    dueDateStr: "12 May",
    dueDateFull: "12/05/2026"
  },
  {
    id: 6,
    title: "Publish v2.0 changelog",
    priority: "LOW",
    status: "DONE",
    assignee: "Theo Nakamura",
    assigneeInitials: "TN",
    assigneeColor: "bg-[#059669]",
    dueDateStr: "30 Apr",
    dueDateFull: "30/04/2026"
  },
  {
    id: 7,
    title: "Brand audit report",
    priority: "MEDIUM",
    status: "DONE",
    assignee: "Aria Chen",
    assigneeInitials: "AC",
    assigneeColor: "bg-[#208b73]",
    dueDateStr: "22 Apr",
    dueDateFull: "22/04/2026"
  },
  {
    id: 8,
    title: "Schedule security kickoff",
    priority: "HIGH",
    status: "DONE",
    assignee: "Demo User",
    assigneeInitials: "DU",
    assigneeColor: "bg-[#a855f7]",
    dueDateStr: "18 Apr",
    dueDateFull: "18/04/2026"
  }
];

const priorityConfig = {
  HIGH: { dot: "bg-red-400", border: "border-red-400", text: "text-red-500" },
  MEDIUM: { dot: "bg-amber-400", border: "border-amber-400", text: "text-amber-500" },
  LOW: { dot: "bg-emerald-400", border: "border-emerald-400", text: "text-emerald-500" }
};

const statusConfig = {
  "TO DO": { bg: "bg-gray-100", text: "text-gray-600", label: "Todo" },
  "IN PROGRESS": { bg: "bg-orange-100", text: "text-orange-700", label: "In Progress" },
  "DONE": { bg: "bg-emerald-100", text: "text-emerald-700", label: "Done" }
};

export default function TasksPage() {
  const [view, setView] = useState('board');

  const columns = [
    { id: 'TO DO', title: 'TO DO' },
    { id: 'IN PROGRESS', title: 'IN PROGRESS' },
    { id: 'DONE', title: 'DONE' }
  ];

  return (
    <div className="p-8">
      {/* Header controls */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
          <button 
            onClick={() => setView('board')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === 'board' ? 'bg-[#1e1b4b] text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <LayoutGrid size={16} />
            Board
          </button>
          <button 
            onClick={() => setView('list')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === 'list' ? 'bg-[#1e1b4b] text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <List size={16} />
            List
          </button>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-[#f43f5e] hover:bg-[#e11d48] text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} />
          Add Item
        </button>
      </div>

      {/* Board View */}
      {view === 'board' && (
        <div className="flex gap-6 items-start">
          {columns.map(column => {
            const columnTasks = tasksData.filter(t => t.status === column.id);
            return (
              <div key={column.id} className="flex-1 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm min-h-[500px]">
                <div className="flex justify-between items-center mb-4 px-2">
                  <h3 className="text-[13px] font-bold text-gray-400">{column.title}</h3>
                  <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
                
                <div className="flex flex-col gap-3">
                  {columnTasks.map(task => (
                    <div 
                      key={task.id} 
                      className="bg-[#fcfcfc] border border-gray-100 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-gray-200 transition-colors cursor-pointer"
                    >
                      {/* Priority left border indicator */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${priorityConfig[task.priority].dot}`}></div>
                      
                      <div className="flex justify-between items-start mb-3 ml-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${priorityConfig[task.priority].dot}`}></div>
                          <span className={`text-sm font-medium ${task.status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                            {task.title}
                          </span>
                        </div>
                        <div className="relative flex-shrink-0">
                          <div className={`w-6 h-6 rounded-full ${task.assigneeColor} text-white flex items-center justify-center text-[10px] font-bold`}>
                            {task.assigneeInitials}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                      </div>
                      
                      <div className="ml-2">
                        <span className="text-xs text-gray-400">Due {task.dueDateStr}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-500 text-xs w-[35%]">TITLE</th>
                <th className="px-6 py-4 font-bold text-gray-500 text-xs w-[15%]">PRIORITY</th>
                <th className="px-6 py-4 font-bold text-gray-500 text-xs w-[15%]">STATUS</th>
                <th className="px-6 py-4 font-bold text-gray-500 text-xs w-[20%]">ASSIGNEE</th>
                <th className="px-6 py-4 font-bold text-gray-500 text-xs w-[15%]">DUE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasksData.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{task.title}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${priorityConfig[task.priority].dot}`}></div>
                      <span className={`text-xs font-semibold ${priorityConfig[task.priority].text}`}>{task.priority}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusConfig[task.status].bg} ${statusConfig[task.status].text}`}>
                      {statusConfig[task.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-6 h-6 rounded-full ${task.assigneeColor} text-white flex items-center justify-center text-[10px] font-bold`}>
                          {task.assigneeInitials}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border border-white rounded-full"></div>
                      </div>
                      <span className="text-gray-600 font-medium text-sm">{task.assignee}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-medium">{task.dueDateFull}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
