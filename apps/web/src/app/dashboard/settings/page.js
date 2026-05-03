"use client";

import React, { useState, useEffect } from 'react';
import { 
  User, Settings, Shield, Trash2, Camera, 
  Save, Globe, Lock, Bell, Mail, Info,
  CheckCircle2, AlertCircle, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import AuditLogTimeline from '@/components/Dashboard/AuditLogTimeline';

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateProfile, updateAvatar } = useAuthStore();
  const { currentWorkspace, updateWorkspace, deleteWorkspace, members } = useWorkspaceStore();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'workspace' | 'security'
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });

  const [workspaceData, setWorkspaceData] = useState({
    name: currentWorkspace?.name || '',
    description: currentWorkspace?.description || '',
    accentColor: currentWorkspace?.accentColor || '#e94560',
  });

  useEffect(() => {
    if (currentWorkspace) {
      setWorkspaceData({
        name: currentWorkspace.name || '',
        description: currentWorkspace.description || '',
        accentColor: currentWorkspace.accentColor || '#e94560',
      });
    }
  }, [currentWorkspace]);

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  const currentMember = members.find(m => m.id === user?.id);
  const isAdmin = currentMember?.role === 'ADMIN';

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await updateAvatar(file);
      toast.success("Avatar updated successfully");
    } catch (error) {
      toast.error("Failed to upload avatar");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(profileData);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateWorkspace = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateWorkspace(currentWorkspace.id, workspaceData);
      toast.success("Workspace updated successfully");
    } catch (error) {
      toast.error("Failed to update workspace");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    try {
      await deleteWorkspace(currentWorkspace.id);
      toast.success("Workspace deleted");
      router.push('/dashboard');
    } catch (error) {
      toast.error("Failed to delete workspace");
    }
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'workspace', label: 'Workspace', icon: Globe },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'audit-log', label: 'Activity Log', icon: History },
  ];

  return (
    <div>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mb-10"
      >
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1 font-normal text-sm">Manage your account and workspace preferences</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 shrink-0">
          <nav className="flex flex-col gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                      : "text-gray-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-indigo-500/5 dark:hover:text-indigo-300"
                  }`}
                >
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {isAdmin && activeTab === 'workspace' && (
            <div className="mt-10 pt-6 border-t border-slate-100">
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
              >
                <Trash2 size={18} />
                Delete Workspace
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="bg-white dark:bg-slate-900/40 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-8"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-8">Personal Information</h3>
                
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex items-center gap-6 mb-10">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-[32px] bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl overflow-hidden relative">
                        {user?.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          user?.name?.substring(0, 2).toUpperCase()
                        )}
                        {isUploading && (
                          <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-sm flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <button 
                        type="button"
                        onClick={handleAvatarClick}
                        disabled={isUploading}
                        className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all disabled:opacity-50"
                      >
                        <Camera size={18} />
                      </button>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Profile Picture</h4>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG or GIF. Max 5MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                      <input 
                        type="email" 
                        disabled
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-400 cursor-not-allowed"
                        value={profileData.email}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Bio</label>
                    <textarea 
                      rows={4}
                      placeholder="Tell us a little about yourself..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all resize-none"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      type="submit"
                      disabled={isSaving}
                      style={{ backgroundColor: 'var(--primary-brand)' }}
                      className="flex items-center gap-2 px-8 py-3 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-indigo-100 disabled:opacity-70 hover:brightness-110 active:scale-95"
                    >
                      {isSaving ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <Save size={18} />
                      )}
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'workspace' && (
              <motion.div
                key="workspace"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="bg-white dark:bg-slate-900/40 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold text-slate-900">Workspace Settings</h3>
                  <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    ID: {currentWorkspace?.id?.substring(0, 8)}
                  </div>
                </div>
                
                <form onSubmit={handleUpdateWorkspace} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Workspace Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all"
                      value={workspaceData.name}
                      onChange={(e) => setWorkspaceData({ ...workspaceData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                    <textarea 
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all resize-none"
                      value={workspaceData.description}
                      onChange={(e) => setWorkspaceData({ ...workspaceData, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Accent Color</label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        '#e94560', '#4f46e5', '#10b981', '#f59e0b', 
                        '#ec4899', '#8b5cf6', '#06b6d4', '#2dd4bf'
                      ].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setWorkspaceData({ ...workspaceData, accentColor: color })}
                          className={`w-10 h-10 rounded-xl transition-all border-4 ${
                            workspaceData.accentColor === color ? 'border-indigo-100 scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <div className="flex items-center gap-3 ml-2">
                        <input 
                          type="color" 
                          value={workspaceData.accentColor}
                          onChange={(e) => setWorkspaceData({ ...workspaceData, accentColor: e.target.value })}
                          className="w-10 h-10 bg-transparent cursor-pointer rounded-lg border-0 p-0"
                        />
                        <span className="text-xs font-mono text-slate-500 uppercase">{workspaceData.accentColor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      type="submit"
                      disabled={isSaving || !isAdmin}
                      style={{ backgroundColor: 'var(--primary-brand)' }}
                      className="flex items-center gap-2 px-8 py-3 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 hover:brightness-110 active:scale-95"
                    >
                      {isSaving ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <Save size={18} />
                      )}
                      Update Workspace
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'audit-log' && (
              <motion.div
                key="audit-log"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="bg-white dark:bg-slate-900/40 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Workspace Activity</h3>
                    <p className="text-xs text-slate-500 mt-1">Detailed history of all changes made to this workspace</p>
                  </div>
                </div>
                
                <AuditLogTimeline />
              </motion.div>
            )}

            {(activeTab === 'security' || activeTab === 'notifications') && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-12 text-center"
              >
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Info size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Coming Soon</h3>
                <p className="text-slate-500 text-sm font-medium">This section is currently under development.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 15 }}
              transition={{ duration: 0.25, ease: "circOut" }}
              className="relative bg-white rounded-[40px] shadow-2xl border border-slate-100 p-10 max-w-md w-full text-center"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-[20px] flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Delete Workspace?</h3>
              <p className="text-slate-500 font-medium mb-8">
                This action is irreversible. All data, including goals, tasks, and announcements, will be permanently deleted.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-4 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteWorkspace}
                  className="flex-1 px-6 py-4 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 shadow-lg shadow-rose-100 transition-all active:scale-[0.98]"
                >
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
