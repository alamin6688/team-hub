"use client";

import React, { useState } from "react";
import { Plus, MoreHorizontal } from "lucide-react";

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Design System", status: "todo", priority: "high" },
    { id: 2, title: "API Integration", status: "in-progress", priority: "medium" },
    { id: 3, title: "Deployment", status: "done", priority: "low" },
  ]);

  const columns = [
    { id: "todo", title: "To Do" },
    { id: "in-progress", title: "In Progress" },
    { id: "done", title: "Done" },
  ];

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div key={column.id} className="w-80 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">{column.title}</h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              {tasks.filter((t) => t.status === column.id).length}
            </span>
          </div>
          <div className="space-y-4">
            {tasks
              .filter((task) => task.status === column.id)
              .map((task) => (
                <div
                  key={task.id}
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        task.priority === "high"
                          ? "bg-red-50 text-red-600"
                          : task.priority === "medium"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {task.priority}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{task.title}</p>
                </div>
              ))}
            <button className="w-full py-2 flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border-2 border-dashed border-gray-100">
              <Plus size={16} />
              Add Task
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
