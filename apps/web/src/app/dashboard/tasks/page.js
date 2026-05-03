"use client";

import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, Plus, Search, Calendar, User, MoreHorizontal, Trash2, Edit2, X } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import toast from 'react-hot-toast';

const priorityConfig = {
  HIGH: { dot: "bg-red-400", border: "border-red-400", text: "text-red-500", label: "High" },
  MEDIUM: { dot: "bg-amber-400", border: "border-amber-400", text: "text-amber-500", label: "Medium" },
  LOW: { dot: "bg-emerald-400", border: "border-emerald-400", text: "text-emerald-500", label: "Low" }
};

const statusConfig = {
  TODO: { bg: "bg-gray-100", text: "text-gray-600", label: "Todo" },
  IN_PROGRESS: { bg: "bg-orange-100", text: "text-orange-700", label: "In Progress" },
  DONE: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Done" }
};

export default function TasksPage() {
  const [view, setView] = useState('board');
  const [isMounted, setIsMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, taskId: null });
  
  const { 
    currentWorkspace, 
    actionItems, 
    fetchActionItems, 
    createActionItem, 
    updateActionItem, 
    deleteActionItem,
    members,
    goals
  } = useWorkspaceStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    assigneeId: '',
    dueDate: '',
    goalId: ''
  });

  useEffect(() => {
    setIsMounted(true);
    if (currentWorkspace?.id) {
      fetchActionItems(currentWorkspace.id);
    }
  }, [currentWorkspace?.id, fetchActionItems]);

  const columns = [
    { id: 'TODO', title: 'TO DO' },
    { id: 'IN_PROGRESS', title: 'IN PROGRESS' },
    { id: 'DONE', title: 'DONE' }
  ];

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    
    try {
      await updateActionItem(currentWorkspace.id, draggableId, { status: newStatus });
      toast.success(`Moved to ${statusConfig[newStatus].label}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingTask) {
        await updateActionItem(currentWorkspace.id, editingTask.id, formData);
        toast.success("Task updated");
      } else {
        await createActionItem(currentWorkspace.id, formData);
        toast.success("Task created");
      }
      setShowAddModal(false);
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'TODO',
        assigneeId: '',
        dueDate: '',
        goalId: ''
      });
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      assigneeId: task.assigneeId || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      goalId: task.goalId || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    setDeleteModal({ isOpen: true, taskId: id });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteActionItem(currentWorkspace.id, deleteModal.taskId);
      toast.success("Task deleted");
      setDeleteModal({ isOpen: false, taskId: null });
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  if (!isMounted) return null;

  return (
    <div className="p-8">
      {/* Header controls */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
          <button 
            onClick={() => setView('board')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              view === 'board' ? 'bg-[#1e1b4b] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <LayoutGrid size={16} />
            Board
          </button>
          <button 
            onClick={() => setView('list')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              view === 'list' ? 'bg-[#1e1b4b] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <List size={16} />
            List
          </button>
        </div>
        
        <button 
          onClick={() => {
            setEditingTask(null);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#f43f5e] hover:bg-[#e11d48] text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-100 active:scale-95"
        >
          <Plus size={18} strokeWidth={3} />
          Add Item
        </button>
      </div>

      {/* Board View */}
      {view === 'board' && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 items-start overflow-x-auto pb-4">
            {columns.map(column => (
              <div key={column.id} className="flex-1 min-w-[320px] bg-gray-50/50 rounded-2xl p-4 border border-gray-100 flex flex-col min-h-[70vh]">
                <div className="flex justify-between items-center mb-5 px-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">{column.title}</h3>
                    <span className="bg-white border border-gray-200 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      {actionItems.filter(t => t.status === column.id).length}
                    </span>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div 
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex flex-col gap-4 flex-1 transition-colors rounded-xl ${snapshot.isDraggingOver ? 'bg-indigo-50/30' : ''}`}
                    >
                      {actionItems
                        .filter(task => task.status === column.id)
                        .map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white border border-gray-100 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-indigo-200 hover:shadow-md transition-all ${snapshot.isDragging ? 'rotate-2 shadow-xl border-indigo-400 ring-2 ring-indigo-50' : ''}`}
                                onClick={() => handleEdit(task)}
                              >
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${priorityConfig[task.priority]?.dot || 'bg-gray-400'}`}></div>
                                
                                <div className="flex justify-between items-start mb-4 ml-2">
                                  <div className="flex flex-col gap-1 pr-4">
                                    <span className={`text-sm font-bold leading-tight ${task.status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                      {task.title}
                                    </span>
                                    {task.goal && (
                                      <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full w-max mt-1 border border-indigo-100">
                                        Goal: {task.goal.title}
                                      </span>
                                    )}
                                    {task.description && (
                                      <p className="text-xs text-gray-500 line-clamp-2 mt-1 font-medium">{task.description}</p>
                                    )}
                                  </div>
                                  
                                  <div className="flex-shrink-0">
                                    {task.assignee ? (
                                      <div className="relative group/avatar">
                                        <div className={`w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm border-2 border-white`}>
                                          {task.assignee.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                      </div>
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                                        <User size={12} />
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="ml-2 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 text-gray-400">
                                      <Calendar size={12} />
                                      <span className="text-[11px] font-bold">
                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'No date'}
                                      </span>
                                    </div>
                                    {task.priority && (
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityConfig[task.priority].text} bg-white border ${priorityConfig[task.priority].border}`}>
                                        {task.priority}
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}
                                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-5 font-bold text-gray-400 text-[11px] uppercase tracking-wider w-[40%]">Task Title</th>
                <th className="px-8 py-5 font-bold text-gray-400 text-[11px] uppercase tracking-wider w-[15%]">Priority</th>
                <th className="px-8 py-5 font-bold text-gray-400 text-[11px] uppercase tracking-wider w-[15%]">Status</th>
                <th className="px-8 py-5 font-bold text-gray-400 text-[11px] uppercase tracking-wider w-[15%]">Assignee</th>
                <th className="px-8 py-5 font-bold text-gray-400 text-[11px] uppercase tracking-wider w-[10%]">Due</th>
                <th className="px-8 py-5 font-bold text-gray-400 text-[11px] uppercase tracking-wider w-[5%]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {actionItems.map((task) => (
                <tr 
                  key={task.id} 
                  className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                  onClick={() => handleEdit(task)}
                >
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <span className={`font-bold text-gray-800 ${task.status === 'DONE' ? 'line-through text-gray-400' : ''}`}>{task.title}</span>
                      {task.goal && (
                        <span className="text-[10px] font-bold text-indigo-500 truncate w-max max-w-[200px]">
                          Goal: {task.goal.title}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${priorityConfig[task.priority]?.dot || 'bg-gray-300'}`}></div>
                      <span className={`text-xs font-bold ${priorityConfig[task.priority]?.text || 'text-gray-500'}`}>{priorityConfig[task.priority]?.label || task.priority}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-tight uppercase ${statusConfig[task.status]?.bg || 'bg-gray-100'} ${statusConfig[task.status]?.text || 'text-gray-600'}`}>
                      {statusConfig[task.status]?.label || task.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      {task.assignee ? (
                        <>
                          <div className="relative">
                            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm">
                              {task.assignee.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-[1.5px] border-white rounded-full"></div>
                          </div>
                          <span className="text-gray-700 font-bold text-xs">{task.assignee.name}</span>
                        </>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Unassigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-gray-500 font-bold text-xs">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB') : '-'}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {actionItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-400 font-medium">
                    No action items found. Click "+ Add Item" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowAddModal(false)}
          ></div>
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 max-w-xl w-full animate-scale-in">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                {editingTask ? <Edit2 size={20} /> : <Plus size={20} />}
              </div>
              {editingTask ? 'Edit Action Item' : 'Create New Item'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Title</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all"
                  placeholder="What needs to be done?"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all h-24 resize-none"
                  placeholder="Add some details..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Priority</label>
                  <select 
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Assignee</label>
                  <select 
                    value={formData.assigneeId}
                    onChange={(e) => setFormData({...formData, assigneeId: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all"
                  >
                    <option value="">Select Assignee</option>
                    {members.map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}

                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Due Date</label>
                  <input 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Link to Goal (Optional)</label>
                <select 
                  value={formData.goalId}
                  onChange={(e) => setFormData({...formData, goalId: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all"
                >
                  <option value="">No Goal</option>
                  {goals.map(goal => (
                    <option key={goal.id} value={goal.id}>{goal.title}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-4 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] px-6 py-4 bg-[#1e1b4b] text-white font-bold rounded-2xl hover:bg-[#2e2a70] shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{editingTask ? 'Updating...' : 'Creating...'}</span>
                    </>
                  ) : (
                    editingTask ? 'Update Task' : 'Create Task'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setDeleteModal({ isOpen: false, taskId: null })}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 max-w-sm w-full animate-scale-in text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Task?</h3>
            <p className="text-slate-500 mb-8 text-sm">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModal({ isOpen: false, taskId: null })}
                className="flex-1 px-4 py-3 bg-slate-50 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
