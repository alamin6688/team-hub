"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { hexToRgb } from "@/lib/utils";
import {
  Hexagon,
  ChevronDown,
  LayoutGrid,
  Target,
  CheckSquare,
  Megaphone,
  Settings,
  Search,
  Moon,
  Bell,
  Users,
  LogOut,
  BarChart3,
  Plus,
  Check,
  Briefcase,
  Globe,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchWithAuth } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { io } from "socket.io-client";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [newWsData, setNewWsData] = React.useState({
    name: "",
    description: "",
    accentColor: "#e94560",
  });

  const { user, setUser, logout: clearAuth } = useAuthStore();
  const {
    currentWorkspace,
    workspaces,
    setWorkspace,
    setWorkspaces,
    switchWorkspace,
    setNotificationsCount,
    members,
    setMembers,
    createWorkspace,
  } = useWorkspaceStore();

  React.useEffect(() => {
    const initDashboard = async () => {
      try {
        // 1. Get User Info
        const userData = await fetchWithAuth("/auth/me");
        if (userData?.data) setUser(userData.data);

        // 2. Get Workspace Details
        let workspacesData = await fetchWithAuth("/workspaces");

        // SELF-HEALING: If no workspace exists, create one automatically
        if (!workspacesData?.data || workspacesData.data.length === 0) {
          await fetchWithAuth("/workspaces/initialize", { method: "POST" });
          workspacesData = await fetchWithAuth("/workspaces");
        }

        if (workspacesData?.data?.length > 0) {
          setWorkspaces(workspacesData.data);
          const ws = currentWorkspace || workspacesData.data[0];
          setWorkspace(ws);

          // 3. Get Workspace Members (for online status)
          const membersData = await fetchWithAuth(
            `/workspaces/${ws.id}/members`,
          );
          if (membersData?.data) setMembers(membersData.data);
        }

        // 4. Get Notifications Count
        const notificationsData = await fetchWithAuth("/notifications");
        if (notificationsData?.data) {
          // If no notifications, show samples for demo
          const finalNotifications = notificationsData.data.length > 0 
            ? notificationsData.data 
            : [
                { id: 'sample-1', content: 'Welcome to TeamHub! Start by creating your first goal.', createdAt: new Date().toISOString(), read: false },
                { id: 'sample-2', content: 'You were added to the Marketing Workspace by Alamin.', createdAt: new Date(Date.now() - 3600000).toISOString(), read: false },
                { id: 'sample-3', content: 'Quarterly review is scheduled for next Monday.', createdAt: new Date(Date.now() - 86400000).toISOString(), read: true },
              ];
          
          setNotifications(finalNotifications);
          const unread = finalNotifications.filter((n) => !n.read).length;
          setNotificationsCount(unread);
        }
      } catch (error) {
        console.error("Failed to initialize dashboard:", error);
      }
    };

    initDashboard();
  }, [setUser, setWorkspace, setMembers, setNotificationsCount]);

  React.useEffect(() => {
    if (!user?.id) return;
    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8020",
    );
    socket.on("connect", () => {
      socket.emit("join", user.id);
      if (currentWorkspace?.id)
        socket.emit("join-workspace", currentWorkspace.id);
    });
    socket.on("notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setNotificationsCount((prev) => prev + 1);
      toast.success(`New notification: ${notification.content}`, { icon: "🔔" });
    });
    socket.on("action-item-created", (item) => {
      useWorkspaceStore.setState((state) => ({
        actionItems: state.actionItems.some((ai) => ai.id === item.id)
          ? state.actionItems
          : [item, ...state.actionItems],
      }));
    });
    socket.on("action-item-updated", (item) => {
      useWorkspaceStore.setState((state) => ({
        actionItems: state.actionItems.map((ai) =>
          ai.id === item.id ? item : ai,
        ),
      }));
    });
    socket.on("action-item-deleted", (itemId) => {
      useWorkspaceStore.setState((state) => ({
        actionItems: state.actionItems.filter((ai) => ai.id !== itemId),
      }));
    });

    // Announcements
    socket.on("announcement-created", (announcement) => {
      useWorkspaceStore.setState((state) => ({
        announcements: state.announcements.some((a) => a.id === announcement.id)
          ? state.announcements
          : [announcement, ...state.announcements],
      }));
    });
    socket.on("announcement-updated", (announcement) => {
      useWorkspaceStore.setState((state) => ({
        announcements: state.announcements.map((a) =>
          a.id === announcement.id ? announcement : a,
        ),
      }));
    });
    socket.on(
      "announcement-reaction-updated",
      ({ announcementId, userId, result }) => {
        useWorkspaceStore.setState((state) => ({
          announcements: state.announcements.map((a) => {
            if (a.id === announcementId) {
              let newReactions;
              if (result.removed) {
                // Toggle off: remove user's reaction
                newReactions = a.reactions.filter((r) => r.userId !== userId);
              } else {
                // Toggle on or switch: replace user's reaction
                const filtered = a.reactions.filter((r) => r.userId !== userId);
                newReactions = [...filtered, result];
              }
              return { ...a, reactions: newReactions };
            }
            return a;
          }),
        }));
      },
    );
    socket.on("announcement-comment-added", ({ announcementId, comment }) => {
      useWorkspaceStore.setState((state) => ({
        announcements: state.announcements.map((a) => {
          if (a.id === announcementId) {
            const exists = a.comments.some((c) => c.id === comment.id);
            return {
              ...a,
              comments: exists ? a.comments : [...a.comments, comment],
            };
          }
          return a;
        }),
      }));
    });

    socket.on("member-status-changed", ({ userId, isOnline }) => {
      useWorkspaceStore.setState((state) => ({
        members: state.members.map((m) =>
          m.id === userId ? { ...m, isOnline } : m,
        ),
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id, currentWorkspace?.id]);

  const handleLogout = () => {
    Cookies.remove("token", { path: "/" });
    clearAuth();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const handleSwitchWorkspace = async (ws) => {
    setShowWorkspaceMenu(false);
    if (ws.id === currentWorkspace?.id) return;

    const loadingToast = toast.loading(`Switching to ${ws.name}...`);
    try {
      await switchWorkspace(ws);
      toast.success(`Switched to ${ws.name}`, { id: loadingToast });
    } catch (error) {
      toast.error("Failed to switch workspace", { id: loadingToast });
    }
  };

  const handleToggleNotifications = async () => {
    const newState = !showNotifications;
    setShowNotifications(newState);
    
    // If opening the dropdown, mark all as read
    if (newState && notifications.some(n => !n.read)) {
      try {
        await fetchWithAuth("/notifications/read-all", { method: "PATCH" });
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setNotificationsCount(0);
      } catch (error) {
        console.error("Failed to mark notifications as read:", error);
      }
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWsData.name) return;

    setIsCreating(true);
    try {
      const created = await createWorkspace(newWsData);
      await handleSwitchWorkspace(created);
      setShowCreateModal(false);
      setNewWsData({ name: "", description: "", accentColor: "#e94560" });
    } catch (error) {
      toast.error("Failed to create workspace");
    } finally {
      setIsCreating(false);
    }
  };

  const customColor = currentWorkspace?.accentColor;
  const defaultLight = "#3b82f6"; // Blue
  const defaultDark = "#8b5cf6";  // Purple

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --primary-brand: ${customColor || defaultLight};
          --primary-brand-rgb: ${hexToRgb(customColor || defaultLight)};
        }
        .dark {
          --primary-brand: ${customColor || defaultDark};
          --primary-brand-rgb: ${hexToRgb(customColor || defaultDark)};
        }
      `}} />
      {/* Sidebar */}
      <aside className="w-[260px] bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col h-full">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Logo & Workspace Dropdown */}
          <div className="relative">
            <div
              onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
              className="h-[72px] flex items-center px-6 border-b border-gray-100 dark:border-slate-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div
                className="flex items-center justify-center w-8 h-8 rounded text-white mr-3 shadow-sm"
                style={{
                  backgroundColor: currentWorkspace?.accentColor || "#4f46e5",
                }}
              >
                <Hexagon size={20} fill="currentColor" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-gray-800 text-[14px] truncate">
                  {currentWorkspace?.name || "TeamHub"}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">
                  Workspace
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`ml-auto text-gray-400 transition-transform ${showWorkspaceMenu ? "rotate-180" : ""}`}
              />
            </div>

            {/* Workspace Dropdown Menu */}
            <AnimatePresence>
              {showWorkspaceMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 z-50 overflow-hidden"
                >
                  <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {workspaces.map((ws) => (
                      <button
                        key={ws.id}
                        onClick={() => handleSwitchWorkspace(ws)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all text-left group"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: ws.accentColor }}
                        >
                          {ws.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span
                          className={`text-sm font-semibold flex-1 truncate ${ws.id === currentWorkspace?.id ? "text-indigo-600" : "text-gray-700"}`}
                        >
                          {ws.name}
                        </span>
                        {ws.id === currentWorkspace?.id && (
                          <Check size={16} className="text-indigo-600" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="p-2 border-t border-gray-50 bg-gray-50/50">
                    <button
                      onClick={() => {
                        setShowCreateModal(true);
                        setShowWorkspaceMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all text-sm font-bold"
                    >
                      <Plus size={18} />
                      Create Workspace
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="text-xs font-semibold text-gray-400 tracking-wider mb-4 px-2">
              WORKSPACE
            </div>
            <nav className="flex flex-col gap-1">
              {[
                { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
                { name: "Goals", href: "/dashboard/goals", icon: Target },
                {
                  name: "Action Items",
                  href: "/dashboard/tasks",
                  icon: CheckSquare,
                },
                {
                  name: "Announcements",
                  href: "/dashboard/announcements",
                  icon: Megaphone,
                },
                { name: "Members", href: "/dashboard/members", icon: Users },
                {
                  name: "Analytics",
                  href: "/dashboard/analytics",
                  icon: BarChart3,
                },
                {
                  name: "Settings",
                  href: "/dashboard/settings",
                  icon: Settings,
                },
              ].map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    style={active ? { 
                      backgroundColor: `rgba(var(--primary-brand-rgb), 0.1)`,
                      color: `var(--primary-brand)`
                    } : {}}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? ""
                        : "text-gray-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-indigo-500/5 dark:hover:text-indigo-300"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center`}
                      style={active ? { color: `var(--primary-brand)` } : { color: '#94a3b8' }}
                    >
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
            <div className="text-[11px] font-bold text-gray-400 tracking-wider mb-3 uppercase">
              ONLINE - {members.filter((m) => m.isOnline).length}
            </div>
            <div className="flex -space-x-2">
              {members.slice(0, 5).map((member, i) => (
                <div
                  key={member.id || i}
                  className="relative z-0 hover:z-10 transition-all"
                >
                  <div
                    className={`w-8 h-8 rounded-full ${member.userColor || "bg-indigo-500"} border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-sm uppercase`}
                  >
                    {member.name?.substring(0, 2) || "??"}
                  </div>
                  {member.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-[1.5px] border-white rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-sm uppercase">
                  {user?.name?.substring(0, 2) || "??"}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800 leading-tight truncate max-w-[120px]">
                  {user?.name || "Loading..."}
                </span>
                <span className="text-[11px] font-medium text-gray-500 truncate max-w-[120px]">
                  {user?.email || ""}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-rose-400 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowLogoutModal(false)}
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 max-w-sm w-full"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-6 mx-auto">
                <LogOut size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 text-center mb-2">
                Sign Out
              </h3>
              <p className="text-slate-500 text-center mb-8">
                Are you sure you want to log out of your account?
              </p>
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Workspace Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setShowCreateModal(false)}
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="relative bg-white rounded-[40px] shadow-2xl border border-slate-100 p-10 max-w-lg w-full"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <Briefcase size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">
                      New Workspace
                    </h3>
                    <p className="text-slate-500 font-medium text-sm">
                      Set up a space for your team
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateWorkspace} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marketing Team, Product Launch"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-base font-bold focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all"
                    value={newWsData.name}
                    onChange={(e) =>
                      setNewWsData({ ...newWsData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="What is this workspace for?"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all resize-none"
                    value={newWsData.description}
                    onChange={(e) =>
                      setNewWsData({
                        ...newWsData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Accent Color
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      "#e94560",
                      "#4f46e5",
                      "#10b981",
                      "#f59e0b",
                      "#ec4899",
                      "#8b5cf6",
                      "#06b6d4",
                      "#2dd4bf",
                    ].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() =>
                          setNewWsData({ ...newWsData, accentColor: color })
                        }
                        className={`w-9 h-9 rounded-xl transition-all border-4 ${
                          newWsData.accentColor === color
                            ? "border-indigo-100 scale-110 shadow-lg"
                            : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-8 py-4 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-[2] px-8 py-4 bg-[#1e1b4b] text-white font-bold rounded-2xl hover:bg-[#2e2a70] shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
                  >
                    {isCreating ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Globe size={20} />
                        <span>Create Workspace</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-[72px] bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-gray-800">
            {pathname === "/dashboard"
              ? "Dashboard"
              : pathname === "/dashboard/goals"
                ? "Goals"
                : pathname === "/dashboard/tasks"
                  ? "Action Items"
                  : pathname === "/dashboard/announcements"
                    ? "Announcements"
                    : pathname === "/dashboard/members"
                      ? "Members"
                      : pathname === "/dashboard/analytics"
                        ? "Analytics"
                        : pathname === "/dashboard/activity"
                          ? "Activity Log"
                          : pathname === "/dashboard/settings"
                            ? "Settings"
                            : "Dashboard"}
          </h1>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-gray-400 border-r border-gray-100 dark:border-slate-800 pr-6">
              <ThemeToggle className="!border-none !bg-transparent hover:!text-gray-600 dark:hover:!text-gray-300" />
              <button 
                onClick={handleToggleNotifications}
                className={`hover:text-gray-600 dark:hover:text-slate-200 transition-colors relative ${showNotifications ? 'text-indigo-600 dark:text-indigo-400' : ''}`}
              >
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white text-[9px] font-bold text-white flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              </button>

              {/* Notifications Popup */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div 
                      className="fixed inset-0 z-[100]" 
                      onClick={() => setShowNotifications(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-[101] overflow-hidden"
                      style={{ top: '60px' }}
                    >
                      <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                        <h3 className="font-bold text-slate-900">Notifications</h3>
                        <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          {notifications.filter(n => !n.read).length} New
                        </span>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              className={`p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer group ${!n.read ? 'bg-indigo-50/30' : ''}`}
                            >
                              <div className="flex gap-3">
                                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-indigo-500' : 'bg-transparent'}`} />
                                <div className="space-y-1">
                                  <p className="text-sm font-medium text-slate-800 leading-tight">
                                    {n.content}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-medium">
                                    {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                              <Bell size={24} />
                            </div>
                            <p className="text-sm font-medium text-slate-500">No notifications yet</p>
                          </div>
                        )}
                      </div>
                      <div className="p-3 border-t border-slate-50 text-center">
                        <button 
                          onClick={() => {
                            setShowNotifications(false);
                            router.push('/dashboard/activity');
                          }}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest"
                        >
                          View All Activity
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="flex flex-col items-end text-right hidden sm:flex">
                <span className="text-sm font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                  {user?.name || "Loading..."}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {user?.role || "Member"}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold shadow-sm uppercase group-hover:scale-105 transition-transform">
                {user?.name?.substring(0, 2) || "??"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          <div className="p-8 w-full">{children}</div>
        </div>
      </main>
    </div>
  );
}
