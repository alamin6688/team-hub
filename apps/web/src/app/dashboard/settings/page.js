"use client";

import React, { useState } from 'react';
import { User, Briefcase, Bell, Shield, Key, Save, Upload, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'workspace', label: 'Workspace', icon: Briefcase },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Settings Navigation */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-600 shadow-sm border border-gray-100'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                }`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-slide-up">
              <div className="p-6 md:p-8 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Profile Information</h2>
                <p className="text-sm text-gray-500">Update your account's profile information and email address.</p>
              </div>
              
              <div className="p-6 md:p-8">
                {/* Avatar Section */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                      DU
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors">
                      <Upload size={16} />
                      Change Avatar
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors">
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-5 max-w-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                      <input 
                        type="text" 
                        defaultValue="Demo"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                      <input 
                        type="text" 
                        defaultValue="User"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                    <input 
                      type="email" 
                      defaultValue="demo@teamhub.com"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Role / Title</label>
                    <input 
                      type="text" 
                      defaultValue="Product Manager"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                    <textarea 
                      rows={4}
                      placeholder="Write a short bio about yourself..."
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 md:px-8 flex justify-end gap-3 border-t border-gray-100">
                <button className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors">
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'workspace' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-slide-up">
              <div className="p-6 md:p-8 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Workspace Settings</h2>
                <p className="text-sm text-gray-500">Manage your team workspace preferences and details.</p>
              </div>
              
              <div className="p-6 md:p-8">
                <div className="space-y-6 max-w-xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Workspace Name</label>
                    <input 
                      type="text" 
                      defaultValue="Acme Corp"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Workspace URL</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 py-2.5 rounded-l-lg border border-r-0 border-gray-200 bg-gray-100 text-gray-500 text-sm">
                        teamhub.com/
                      </span>
                      <input 
                        type="text" 
                        defaultValue="acme"
                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4 mt-6 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-red-600 mb-2">Danger Zone</h3>
                    <p className="text-xs text-gray-500 mb-4">Once you delete a workspace, there is no going back. Please be certain.</p>
                    <button className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                      Delete Workspace
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-slide-up">
              <div className="p-6 md:p-8 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Security & Password</h2>
                <p className="text-sm text-gray-500">Update your password and secure your account.</p>
              </div>
              
              <div className="p-6 md:p-8">
                <div className="space-y-5 max-w-xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                    <input 
                      type="password" 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                    <input 
                      type="password" 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                    <input 
                      type="password" 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="pt-2">
                     <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors">
                      <Key size={16} />
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-slide-up">
              <div className="p-6 md:p-8 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Notification Preferences</h2>
                <p className="text-sm text-gray-500">Choose what you want to be notified about.</p>
              </div>
              
              <div className="p-6 md:p-8">
                <div className="space-y-6 max-w-2xl">
                  
                  {/* Toggle items */}
                  {[
                    { title: "Email Notifications", desc: "Receive daily summary emails.", defaultChecked: true },
                    { title: "Push Notifications", desc: "Get notified in real-time when mentioned.", defaultChecked: true },
                    { title: "Task Updates", desc: "When a task assigned to you changes status.", defaultChecked: true },
                    { title: "New Announcements", desc: "When someone posts a new announcement.", defaultChecked: false },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={item.defaultChecked} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  ))}

                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
