"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { 
  Hexagon, ChevronDown, LayoutGrid, Target, CheckSquare, Megaphone, 
  Settings, Search, Moon, Bell, Users, LogOut, BarChart3
} from "lucide-react";
import { fetchWithAuth } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { io } from "socket.io-client";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  
  const { user, setUser, logout: clearAuth } = useAuthStore();
  const { currentWorkspace, setWorkspace, setNotificationsCount, members, setMembers } = useWorkspaceStore();

  React.useEffect(() => {
    const initDashboard = async () => {
      try {
        // 1. Get User Info
        const userData = await fetchWithAuth('/auth/me');
        if (userData?.data) setUser(userData.data);

        // 2. Get Workspace Details
        let workspaces = await fetchWithAuth('/workspaces');
        
        // SELF-HEALING: If no workspace exists, create one automatically
        if (!workspaces?.data || workspaces.data.length === 0) {
          await fetchWithAuth('/workspaces/initialize', { method: 'POST' });
          workspaces = await fetchWithAuth('/workspaces');
        }

        if (workspaces?.data?.length > 0) {
          const ws = workspaces.data[0];
          setWorkspace(ws);

          // 3. Get Workspace Members (for online status)
          const membersData = await fetchWithAuth(`/workspaces/${ws.id}/members`);
          if (membersData?.data) setMembers(membersData.data);
        }

        // 4. Get Notifications Count
        const notifications = await fetchWithAuth('/notifications');
        if (notifications?.data) {
          const unread = notifications.data.filter(n => !n.read).length;
          setNotificationsCount(unread);
        }

      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
      }
    };

    initDashboard();

    // 5. Initialize Socket.io
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8020');
    
    socket.on('connect', () => {
      console.log('Connected to socket server');
      if (user?.id) {
        socket.emit('join', user.id);
      }
    });

    socket.on('notification', (notification) => {
      setNotificationsCount((prev) => prev + 1);
      toast.success(`New notification: ${notification.title}`, {
        icon: '🔔',
      });
    });

    if (localStorage.getItem("show_login_toast") === "true") {
      toast.success("Welcome back!");
      localStorage.removeItem("show_login_toast");
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove('token', { path: '/' });
    clearAuth();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-[260px] bg-white border-r border-gray-100 flex flex-col h-full">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Logo & Workspace Dropdown */}
          <div className="h-[72px] flex items-center px-6 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-indigo-600 text-white mr-3">
              <Hexagon size={20} fill="currentColor" />
            </div>
            <span className="font-semibold text-gray-800 text-[15px]">Acme Corp</span>
            <ChevronDown size={16} className="ml-auto text-gray-400" />
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="text-xs font-semibold text-gray-400 tracking-wider mb-4 px-2">WORKSPACE</div>
            <nav className="flex flex-col gap-1">
              {[
                { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
                { name: "Goals", href: "/dashboard/goals", icon: Target },
                { name: "Action Items", href: "/dashboard/tasks", icon: CheckSquare },
                { name: "Announcements", href: "/dashboard/announcements", icon: Megaphone },
                { name: "Members", href: "/dashboard/members", icon: Users },
                { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
                { name: "Settings", href: "/dashboard/settings", icon: Settings },
              ].map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`flex items-center justify-center ${active ? "text-indigo-600" : "text-gray-400"}`}>
                      <item.icon size={18} />
                    </div>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="shrink-0">
          {/* Online Users */}
          <div className="px-6 pb-6">
            <div className="text-[11px] font-bold text-gray-400 tracking-wider mb-3 uppercase">ONLINE - {members.filter(m => m.isOnline).length}</div>
            <div className="flex -space-x-2">
              {members.slice(0, 5).map((member, i) => (
                <div key={member.id || i} className="relative z-0 hover:z-10 transition-all">
                  <div className={`w-8 h-8 rounded-full ${member.userColor || 'bg-indigo-500'} border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-sm uppercase`}>
                    {member.name?.substring(0, 2) || '??'}
                  </div>
                  {member.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-[1.5px] border-white rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-sm uppercase">
                  {user?.name?.substring(0, 2) || '??'}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800 leading-tight truncate max-w-[120px]">
                  {user?.name || 'Loading...'}
                </span>
                <span className="text-[11px] font-medium text-gray-500 truncate max-w-[120px]">
                  {user?.email || ''}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setShowLogoutModal(true)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowLogoutModal(false)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 max-w-sm w-full animate-scale-in">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-6 mx-auto">
              <LogOut size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Sign Out</h3>
            <p className="text-slate-500 text-center mb-8">Are you sure you want to log out of your account?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-3 bg-slate-50 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-colors"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-8">
          <h1 className="text-lg font-bold text-gray-800">
            {pathname === '/dashboard' ? 'Dashboard' : 
             pathname === '/dashboard/goals' ? 'Goals' :
             pathname === '/dashboard/tasks' ? 'Action Items' :
             pathname === '/dashboard/announcements' ? 'Announcements' :
             pathname === '/dashboard/members' ? 'Members' : 
             pathname === '/dashboard/analytics' ? 'Analytics' : 
             pathname === '/dashboard/settings' ? 'Settings' : 'Dashboard'}
          </h1>
          
          <div className="flex items-center gap-6">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-3" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-64 pl-9 pr-14 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-[10px] font-sans font-medium text-gray-500 bg-white border border-gray-200 rounded shadow-sm">⌘</kbd>
                <kbd className="px-1.5 py-0.5 text-[10px] font-sans font-medium text-gray-500 bg-white border border-gray-200 rounded shadow-sm">K</kbd>
              </div>
            </div>

            <div className="flex items-center gap-4 text-gray-400">
              <button className="hover:text-gray-600 transition-colors">
                <Moon size={20} />
              </button>
              <button className="hover:text-gray-600 transition-colors relative">
                <Bell size={20} />
                {useWorkspaceStore.getState().notificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[9px] font-bold text-white flex items-center justify-center">
                    {useWorkspaceStore.getState().notificationsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          {children}
        </div>
      </main>
    </div>
  );
}
