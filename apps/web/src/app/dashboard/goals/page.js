"use client";

import React from 'react';
import { Filter, Plus } from 'lucide-react';

const goalsData = [
  {
    id: 1,
    name: "Launch Q3 Marketing Campaign",
    progress: 75,
    status: "On Track",
    statusColor: "bg-emerald-100 text-emerald-700",
    assignees: [
      "https://i.pravatar.cc/150?u=a1",
      "https://i.pravatar.cc/150?u=a2"
    ],
    dueDate: "2023-10-15"
  },
  {
    id: 2,
    name: "Migrate to new CI/CD pipeline",
    progress: 100,
    status: "Completed",
    statusColor: "bg-indigo-100 text-indigo-700",
    assignees: [
      "https://i.pravatar.cc/150?u=a3"
    ],
    dueDate: "2023-09-30"
  },
  {
    id: 3,
    name: "Reduce customer churn by 5%",
    progress: 30,
    status: "At Risk",
    statusColor: "bg-red-100 text-red-700",
    assignees: [
      "https://i.pravatar.cc/150?u=a4",
      "https://i.pravatar.cc/150?u=a5"
    ],
    dueDate: "2023-12-31"
  },
  {
    id: 4,
    name: "Hire 3 new Senior Engineers",
    progress: 10,
    status: "On Track",
    statusColor: "bg-emerald-100 text-emerald-700",
    assignees: [
      "https://i.pravatar.cc/150?u=a6"
    ],
    dueDate: "2023-11-30"
  }
];

export default function GoalsPage() {
  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Company Goals</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage high-level objectives.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
            <Filter size={16} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus size={16} />
            New Goal
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50/50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-500 w-[35%]">Goal Name</th>
              <th className="px-6 py-4 font-semibold text-gray-500 w-[20%]">Progress</th>
              <th className="px-6 py-4 font-semibold text-gray-500 w-[15%]">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-500 w-[15%]">Assignees</th>
              <th className="px-6 py-4 font-semibold text-gray-500 w-[10%]">Due Date</th>
              <th className="px-6 py-4 font-semibold text-gray-500 w-[5%]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {goalsData.map((goal) => (
              <tr key={goal.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-800">{goal.name}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${goal.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`} 
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-500 w-8">{goal.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${goal.statusColor}`}>
                    {goal.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center -space-x-2">
                    {goal.assignees.map((avatar, i) => (
                      <img 
                        key={i} 
                        src={avatar} 
                        alt="Assignee" 
                        className="w-7 h-7 rounded-full border-2 border-white relative hover:z-10"
                      />
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">{goal.dueDate}</td>
                <td className="px-6 py-4">
                  {/* Empty for actions as in design */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
