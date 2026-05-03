"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Filter, Plus, Trash2, Loader2, X, AlertCircle } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import toast from 'react-hot-toast';

export default function GoalsPage() {
  const { currentWorkspace, goals, setGoals } = useWorkspaceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, goalId: null });
  const [isLoading, setIsLoading] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "NOT_STARTED",
  });

  const fetchGoals = async () => {
    if (!currentWorkspace?.id) return;
    try {
      const res = await fetchWithAuth(`/workspaces/${currentWorkspace.id}/goals`);
      if (res?.data) setGoals(res.data);
    } catch (err) {
      console.error("Failed to fetch goals:", err);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [currentWorkspace?.id]);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!currentWorkspace?.id) {
      toast.error("Please select or create a workspace first");
      return;
    }
    setIsLoading(true);

    try {
      await fetchWithAuth(`/workspaces/${currentWorkspace.id}/goals`, {
        method: 'POST',
        body: JSON.stringify(newGoal),
      });
      toast.success("Goal created successfully!");
      setIsModalOpen(false);
      setNewGoal({ title: "", description: "", dueDate: "", status: "NOT_STARTED" });
      fetchGoals();
    } catch (err) {
      toast.error(err.message || "Failed to create goal");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGoal = async () => {
    const { goalId } = deleteModal;
    if (!goalId) return;

    try {
      await fetchWithAuth(`/workspaces/${currentWorkspace.id}/goals/${goalId}`, {
        method: 'DELETE',
      });
      toast.success("Goal deleted successfully");
      setDeleteModal({ isOpen: false, goalId: null });
      fetchGoals();
    } catch (err) {
      toast.error(err.message || "Failed to delete goal");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700';
      case 'OVERDUE': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

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
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
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
              <th className="px-6 py-4 font-semibold text-gray-500 w-[40%]">Goal Name</th>
              <th className="px-6 py-4 font-semibold text-gray-500 w-[20%]">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-500 w-[20%]">Due Date</th>
              <th className="px-6 py-4 font-semibold text-gray-500 w-[10%] text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {goals.map((goal) => (
              <tr key={goal.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-800">
                  <Link href={`/dashboard/goals/${goal.id}`} className="hover:text-indigo-600 transition-colors block">
                    {goal.title}
                  </Link>
                  <span className="text-xs text-gray-400 font-normal">{goal.description?.substring(0, 50)}...</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${getStatusStyle(goal.status)}`}>
                    {goal.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {goal.dueDate ? new Date(goal.dueDate).toLocaleDateString() : 'No due date'}
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => setDeleteModal({ isOpen: true, goalId: goal.id })}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete Goal"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {goals.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-500 italic">
                  No goals found. Click "New Goal" to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setDeleteModal({ isOpen: false, goalId: null })}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 max-w-sm w-full animate-scale-in text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Goal?</h3>
            <p className="text-slate-500 mb-8 text-sm">
              Are you sure you want to delete this goal? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModal({ isOpen: false, goalId: null })}
                className="flex-1 px-4 py-3 bg-slate-50 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteGoal}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 max-w-md w-full animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Create New Goal</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateGoal} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Launch Q4 Marketing"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all resize-none"
                  placeholder="What is this goal about?"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                    value={newGoal.dueDate}
                    onChange={(e) => setNewGoal({ ...newGoal, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all bg-white"
                    value={newGoal.status}
                    onChange={(e) => setNewGoal({ ...newGoal, status: e.target.value })}
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-slate-50 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Create Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
