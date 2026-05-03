"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Target, Calendar, User, Clock, CheckCircle2, 
  Plus, MessageSquare, MoreHorizontal, Edit2, 
  Trash2, ChevronRight, LayoutList, History, Loader2, X, AlertCircle
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import toast from 'react-hot-toast';

export default function GoalDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { currentWorkspace } = useWorkspaceStore();
  
  const [goal, setGoal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState({ isOpen: false, type: null, targetId: null });
  
  const [newUpdate, setNewUpdate] = useState("");
  const [editingUpdate, setEditingUpdate] = useState({ id: null, content: "" });
  const [editingMilestone, setEditingMilestone] = useState({ id: null, title: "", dueDate: "", progress: 0 });
  const [newMilestone, setNewMilestone] = useState({ title: "", dueDate: "", progress: 0 });
  const [editGoal, setEditGoal] = useState({ title: "", description: "", dueDate: "", status: "" });

  const fetchGoalDetails = async () => {
    if (!id || !currentWorkspace?.id) return;
    try {
      const res = await fetchWithAuth(`/workspaces/${currentWorkspace.id}/goals/${id}`);
      if (res?.data) {
        setGoal(res.data);
        setEditGoal({
          title: res.data.title,
          description: res.data.description,
          dueDate: res.data.dueDate ? new Date(res.data.dueDate).toISOString().split('T')[0] : "",
          status: res.data.status
        });
      }
    } catch (err) {
      toast.error("Failed to load goal details");
      router.push('/dashboard/goals');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'IN_REVIEW': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'NOT_STARTED': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'OVERDUE': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  useEffect(() => {
    fetchGoalDetails();
  }, [id, currentWorkspace?.id]);

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    if (!newUpdate.trim()) return;

    try {
      const res = await fetchWithAuth(`/workspaces/${currentWorkspace.id}/goals/${id}/updates`, {
        method: 'POST',
        body: JSON.stringify({ content: newUpdate }),
      });
      if (res?.data) {
        setGoal(prev => ({
          ...prev,
          updates: [res.data, ...(prev.updates || [])]
        }));
        setNewUpdate("");
        toast.success("Update posted");
      }
    } catch (err) {
      toast.error("Failed to post update");
    }
  };

  const handleUpdateGoalUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth(`/workspaces/${currentWorkspace.id}/goals/${id}/updates/${editingUpdate.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ content: editingUpdate.content }),
      });
      if (res?.data) {
        setGoal(prev => ({
          ...prev,
          updates: prev.updates.map(u => u.id === editingUpdate.id ? res.data : u)
        }));
        setEditingUpdate({ id: null, content: "" });
        toast.success("Update changed");
      }
    } catch (err) {
      toast.error("Failed to update post");
    }
  };

  const handleDeleteUpdate = async (updateId) => {
    try {
      await fetchWithAuth(`/workspaces/${currentWorkspace.id}/goals/${id}/updates/${updateId}`, {
        method: 'DELETE',
      });
      setGoal(prev => ({
        ...prev,
        updates: prev.updates.filter(u => u.id !== updateId)
      }));
      toast.success("Post removed");
    } catch (err) {
      toast.error("Failed to delete post");
    }
  };

  const handleUpdateGoal = async (e) => {
    e.preventDefault();

    if (editGoal.dueDate && goal.milestones?.length > 0) {
      const newGoalDate = new Date(editGoal.dueDate);
      const latestMilestone = goal.milestones.reduce((latest, current) => {
        if (!current.dueDate) return latest;
        const currentDate = new Date(current.dueDate);
        return (!latest || currentDate > latest) ? currentDate : latest;
      }, null);

      if (latestMilestone && newGoalDate < latestMilestone) {
        toast.error(`Goal due date cannot be earlier than your latest milestone (${latestMilestone.toLocaleDateString()})`);
        return;
      }
    }

    try {
      const res = await fetchWithAuth(`/workspaces/${currentWorkspace.id}/goals/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(editGoal),
      });
      if (res?.data) {
        setGoal(prev => ({ ...prev, ...res.data }));
        setIsEditModalOpen(false);
        toast.success("Goal updated successfully");
      }
    } catch (err) {
      toast.error("Failed to update goal");
    }
  };

  const handleDeleteGoal = async () => {
    try {
      await fetchWithAuth(`/workspaces/${currentWorkspace.id}/goals/${id}`, {
        method: 'DELETE',
      });
      toast.success("Goal deleted");
      router.push('/dashboard/goals');
    } catch (err) {
      toast.error("Failed to delete goal");
    }
  };

  const handleToggleMilestone = async (milestoneId, currentProgress) => {
    const newProgress = currentProgress === 100 ? 0 : 100;
    try {
      const res = await fetchWithAuth(`/workspaces/${currentWorkspace.id}/goals/${id}/milestones/${milestoneId}`, {
        method: 'PATCH',
        body: JSON.stringify({ progress: newProgress, completed: newProgress === 100 }),
      });
      if (res?.data) {
        setGoal(prev => ({
          ...prev,
          milestones: prev.milestones.map(m => m.id === milestoneId ? res.data : m)
        }));
      }
    } catch (err) {
      toast.error("Failed to update milestone");
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    
    if (newMilestone.dueDate && goal.dueDate) {
      const milestoneDate = new Date(newMilestone.dueDate);
      const goalDate = new Date(goal.dueDate);
      if (milestoneDate > goalDate) {
        toast.error(`Milestone due date cannot be after the goal due date (${goalDate.toLocaleDateString()})`);
        return;
      }
    }

    try {
      const res = await fetchWithAuth(`/workspaces/${currentWorkspace.id}/goals/${id}/milestones`, {
        method: 'POST',
        body: JSON.stringify({
          ...newMilestone,
          progress: parseInt(newMilestone.progress || 0),
          completed: parseInt(newMilestone.progress || 0) === 100
        }),
      });
      if (res?.data) {
        setGoal(prev => ({
          ...prev,
          milestones: [...(prev.milestones || []), res.data]
        }));
        setNewMilestone({ title: "", dueDate: "", progress: 0 });
        setIsMilestoneModalOpen(false);
        toast.success("Milestone added");
      }
    } catch (err) {
      toast.error("Failed to add milestone");
    }
  };

  const handleSaveMilestoneEdit = async (e) => {
    e.preventDefault();

    if (editingMilestone.dueDate && goal.dueDate) {
      const milestoneDate = new Date(editingMilestone.dueDate);
      const goalDate = new Date(goal.dueDate);
      if (milestoneDate > goalDate) {
        toast.error(`Milestone due date cannot be after the goal due date (${goalDate.toLocaleDateString()})`);
        return;
      }
    }

    try {
      const res = await fetchWithAuth(`/workspaces/${currentWorkspace.id}/goals/${id}/milestones/${editingMilestone.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          title: editingMilestone.title, 
          dueDate: editingMilestone.dueDate, 
          progress: parseInt(editingMilestone.progress),
          completed: parseInt(editingMilestone.progress) === 100
        }),
      });
      if (res?.data) {
        setGoal(prev => ({
          ...prev,
          milestones: prev.milestones.map(m => m.id === editingMilestone.id ? res.data : m)
        }));
        setEditingMilestone({ id: null, title: "", dueDate: "", progress: 0 });
        toast.success("Milestone updated");
      }
    } catch (err) {
      toast.error("Failed to save milestone");
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    try {
      await fetchWithAuth(`/workspaces/${currentWorkspace.id}/goals/${id}/milestones/${milestoneId}`, {
        method: 'DELETE',
      });
      setGoal(prev => ({
        ...prev,
        milestones: prev.milestones.filter(m => m.id !== milestoneId)
      }));
      toast.success("Milestone removed");
    } catch (err) {
      toast.error("Failed to delete milestone");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!goal) return null;
  
  const totalProgress = goal.milestones?.reduce((acc, m) => acc + (m.progress || 0), 0) || 0;
  const totalMilestones = goal.milestones?.length || 0;
  const progressPercent = totalMilestones > 0 ? Math.round(totalProgress / totalMilestones) : 0;
  const completedMilestones = goal.milestones?.filter(m => (m.progress || 0) === 100).length || 0;
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* Header Area */}
      <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
        <Link href="/dashboard/goals" className="hover:text-indigo-600">Goals</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium truncate max-w-[300px]">{goal.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Goal Header Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{goal.title}</h1>
                <p className="text-gray-500 leading-relaxed">{goal.description || "No description provided."}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-indigo-600 transition-all"
                  title="Edit Goal"
                >
                  <Edit2 size={20} />
                </button>
                <button 
                  onClick={() => setIsDeleteModalOpen({ isOpen: true, type: 'goal', targetId: goal.id })}
                  className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-all"
                  title="Delete Goal"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            {/* Progress Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-gray-700">Overall Progress</span>
                <span className="text-2xl font-black text-indigo-600">{progressPercent}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Milestones Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <div className="flex items-center gap-2">
                <LayoutList size={18} className="text-indigo-600" />
                <h2 className="text-base font-bold text-gray-900">Milestones</h2>
                <span className="ml-2 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full">
                  {completedMilestones}/{totalMilestones}
                </span>
              </div>
              <button 
                onClick={() => setIsMilestoneModalOpen(true)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
              >
                <Plus size={14} /> Add Milestone
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {goal.milestones?.map((milestone) => (
                <div 
                  key={milestone.id}
                  className={`group flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    milestone.completed ? 'bg-emerald-50/30 border-emerald-100' : 'bg-white border-gray-100 hover:border-indigo-100 hover:shadow-sm'
                  }`}
                >
                  {editingMilestone.id === milestone.id ? (
                    <form onSubmit={handleSaveMilestoneEdit} className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <input 
                          type="text"
                          className="flex-1 px-3 py-1.5 text-sm border border-indigo-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                          value={editingMilestone.title}
                          onChange={(e) => setEditingMilestone({ ...editingMilestone, title: e.target.value })}
                          autoFocus
                        />
                        <input 
                          type="date"
                          min={today}
                          className="px-2 py-1.5 text-xs border border-indigo-200 rounded-lg outline-none"
                          value={editingMilestone.dueDate}
                          onChange={(e) => setEditingMilestone({ ...editingMilestone, dueDate: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center gap-4 px-1">
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          step="5"
                          className="flex-1 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          value={editingMilestone.progress}
                          onChange={(e) => setEditingMilestone({ ...editingMilestone, progress: e.target.value })}
                        />
                        <span className="text-xs font-black text-indigo-600 w-8">{editingMilestone.progress}%</span>
                        <div className="flex gap-1 ml-auto">
                          <button type="submit" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                            <CheckCircle2 size={18} />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setEditingMilestone({ id: null, title: "", dueDate: "", progress: 0 })}
                            className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg transition-all"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleToggleMilestone(milestone.id, milestone.progress || 0)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          (milestone.progress || 0) === 100
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'border-gray-200 group-hover:border-indigo-500'
                        }`}
                      >
                        {(milestone.progress || 0) === 100 && <CheckCircle2 size={14} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className={`text-sm font-bold truncate ${milestone.progress === 100 ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                            {milestone.title}
                          </h3>
                          <span className="text-[10px] font-black text-indigo-600">{milestone.progress || 0}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                          <div 
                            className="h-full bg-indigo-500 rounded-full transition-all"
                            style={{ width: `${milestone.progress || 0}%` }}
                          ></div>
                        </div>
                        {milestone.dueDate && (
                          <p className="text-[11px] text-gray-400 mt-0.5">Due {new Date(milestone.dueDate).toLocaleDateString()}</p>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => setEditingMilestone({ 
                            id: milestone.id, 
                            title: milestone.title, 
                            dueDate: milestone.dueDate ? new Date(milestone.dueDate).toISOString().split('T')[0] : "" ,
                            progress: milestone.progress || 0
                          })}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => setIsDeleteModalOpen({ isOpen: true, type: 'milestone', targetId: milestone.id })}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {totalMilestones === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400 italic">No milestones defined yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <History size={18} className="text-indigo-600" />
              <h2 className="text-base font-bold text-gray-900">Activity Feed</h2>
            </div>

            {/* Post Update Box */}
            <form onSubmit={handlePostUpdate} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <textarea 
                placeholder="Post a status update..."
                className="w-full p-3 text-sm border-none outline-none resize-none min-h-[100px] placeholder:text-gray-400"
                value={newUpdate}
                onChange={(e) => setNewUpdate(e.target.value)}
              ></textarea>
              <div className="flex justify-end pt-3 border-t border-gray-50">
                <button 
                  type="submit"
                  disabled={!newUpdate.trim()}
                  className="px-6 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >
                  Post Update
                </button>
              </div>
            </form>

            {/* Updates List */}
            <div className="space-y-4">
              {goal.updates?.map((update) => (
                <div key={update.id} className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs uppercase">
                      {update.author?.name?.substring(0, 2) || "AN"}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900">{update.author?.name}</h4>
                          <span className="text-[11px] text-gray-400">{new Date(update.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => setEditingUpdate({ id: update.id, content: update.content })}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => setIsDeleteModalOpen({ isOpen: true, type: 'update', targetId: update.id })}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      
                      {editingUpdate.id === update.id ? (
                        <form onSubmit={handleUpdateGoalUpdate} className="mt-2 space-y-2">
                          <textarea 
                            className="w-full p-3 text-sm border border-indigo-200 rounded-xl outline-none resize-none focus:ring-1 focus:ring-indigo-500"
                            rows="3"
                            value={editingUpdate.content}
                            onChange={(e) => setEditingUpdate({ ...editingUpdate, content: e.target.value })}
                          ></textarea>
                          <div className="flex justify-end gap-2">
                            <button 
                              type="button" 
                              onClick={() => setEditingUpdate({ id: null, content: "" })}
                              className="px-3 py-1 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-lg"
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit"
                              className="px-3 py-1 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                              Save
                            </button>
                          </div>
                        </form>
                      ) : (
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{update.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar Metadata */}
        <div className="space-y-8">
          {/* Metadata Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Goal Metadata</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase">Owner</p>
                  <p className="text-sm font-bold text-gray-800">{goal.owner?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase">Due Date</p>
                  <p className="text-sm font-bold text-gray-800">
                    {goal.dueDate ? new Date(goal.dueDate).toLocaleDateString() : "No deadline"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase">Status</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase mt-1 border ${getStatusStyle(goal.status)}`}>
                    {goal.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Items Preview */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-900">Linked Action Items</h2>
              <span className="text-[10px] font-black text-gray-400 bg-white px-2 py-1 rounded-full border border-gray-100">
                {goal.actionItems?.length || 0}
              </span>
            </div>
            <div className="p-4 space-y-3">
              {goal.actionItems?.map((item) => (
                <div key={item.id} className="p-3 bg-white border border-gray-100 rounded-xl hover:border-indigo-100 transition-all flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    item.status === 'DONE' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}></div>
                  <span className="text-xs font-bold text-gray-700 truncate flex-1">{item.title}</span>
                </div>
              ))}
              {(!goal.actionItems || goal.actionItems.length === 0) && (
                <p className="text-xs text-gray-400 text-center py-4 italic">No linked action items.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Goal Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 max-w-md w-full animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Edit Goal</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateGoal} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Goal Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                  value={editGoal.title}
                  onChange={(e) => setEditGoal({ ...editGoal, title: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all resize-none"
                  value={editGoal.description}
                  onChange={(e) => setEditGoal({ ...editGoal, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    min={today}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                    value={editGoal.dueDate}
                    onChange={(e) => setEditGoal({ ...editGoal, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all bg-white"
                    value={editGoal.status}
                    onChange={(e) => setEditGoal({ ...editGoal, status: e.target.value })}
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-50 text-slate-600 font-semibold rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsDeleteModalOpen({ isOpen: false, type: null, targetId: null })}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 max-w-sm w-full animate-scale-in text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Are you sure?</h3>
            <p className="text-slate-500 mb-8 text-sm">
              This action cannot be undone. All related data will be lost.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen({ isOpen: false, type: null, targetId: null })} className="flex-1 px-4 py-3 bg-slate-50 text-slate-600 font-semibold rounded-xl">Cancel</button>
              <button 
                onClick={() => {
                  if (isDeleteModalOpen.type === 'goal') handleDeleteGoal();
                  else if (isDeleteModalOpen.type === 'milestone') handleDeleteMilestone(isDeleteModalOpen.targetId);
                  else if (isDeleteModalOpen.type === 'update') handleDeleteUpdate(isDeleteModalOpen.targetId);
                  setIsDeleteModalOpen({ isOpen: false, type: null, targetId: null });
                }}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Modal */}
      {isMilestoneModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsMilestoneModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 max-w-md w-full animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Add Milestone</h3>
              <button onClick={() => setIsMilestoneModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddMilestone} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Milestone Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design Phase Complete"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Date (Optional)</label>
                <input
                  type="date"
                  min={today}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                  value={newMilestone.dueDate}
                  onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Initial Progress</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="5"
                    className="flex-1 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    value={newMilestone.progress}
                    onChange={(e) => setNewMilestone({ ...newMilestone, progress: e.target.value })}
                  />
                  <span className="text-sm font-black text-indigo-600 w-10">{newMilestone.progress}%</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsMilestoneModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-50 text-slate-600 font-semibold rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-colors">Add Milestone</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
