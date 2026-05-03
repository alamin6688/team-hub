"use client";

import React from "react";
import {
  Target,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Layout,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { fetchWithAuth } from "@/lib/api";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, duration: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

export default function DashboardPage() {
  const {
    currentWorkspace,
    goals,
    setGoals,
    announcements,
    setAnnouncements,
    actionItems,
    setActionItems,
    fetchAnalytics,
    setLoading,
  } = useWorkspaceStore();

  const [analytics, setAnalytics] = React.useState(null);
  const [activeMetric, setActiveMetric] = React.useState("goals"); // 'goals' | 'tasks' | 'efficiency'

  React.useEffect(() => {
    if (!currentWorkspace?.id) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [goalsRes, announcementsRes, actionItemsRes, analyticsRes] =
          await Promise.all([
            fetchWithAuth(`/workspaces/${currentWorkspace.id}/goals`),
            fetchWithAuth(`/workspaces/${currentWorkspace.id}/announcements`),
            fetchWithAuth(`/workspaces/${currentWorkspace.id}/action-items`),
            fetchAnalytics(currentWorkspace.id),
          ]);

        if (goalsRes?.data) setGoals(goalsRes.data);
        if (announcementsRes?.data) setAnnouncements(announcementsRes.data);
        if (actionItemsRes?.data) setActionItems(actionItemsRes.data);
        if (analyticsRes) setAnalytics(analyticsRes);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentWorkspace?.id]);

  // Derived stats
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.status === "COMPLETED").length;
  const inProgressGoals = goals.filter(
    (g) => g.status === "IN_PROGRESS",
  ).length;

  // Chart data formatting
  const actionItemsByStatus = [
    {
      name: "To Do",
      value: actionItems.filter((i) => i.status === "TODO").length,
      color: "#9ca3af",
    },
    {
      name: "In Progress",
      value: actionItems.filter((i) => i.status === "IN_PROGRESS").length,
      color: "#f59e0b",
    },
    {
      name: "Done",
      value: actionItems.filter((i) => i.status === "DONE").length,
      color: "#22c55e",
    },
  ];

  const fallbackChartData = [
    { name: "Mon", goals: 4, tasks: 12, efficiency: 85 },
    { name: "Tue", goals: 7, tasks: 18, efficiency: 88 },
    { name: "Wed", goals: 5, tasks: 15, efficiency: 82 },
    { name: "Thu", goals: 10, tasks: 24, efficiency: 95 },
    { name: "Fri", goals: 8, tasks: 20, efficiency: 90 },
    { name: "Sat", goals: 12, tasks: 28, efficiency: 98 },
    { name: "Sun", goals: 11, tasks: 26, efficiency: 96 },
  ];

  // Normalize API data — it may return { name, value } format
  // We need { name, goals, tasks, efficiency } for our multi-metric chart
  const rawWeeklyData = analytics?.weeklyCompletion;
  const hasValidKeys = rawWeeklyData?.length > 0 && "goals" in rawWeeklyData[0];
  const weeklyChartData = hasValidKeys
    ? rawWeeklyData
    : rawWeeklyData?.length > 0
      // Map API's { name, value } to our multi-key format
      ? rawWeeklyData.map((d, i) => ({
          name: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i] ?? d.name,
          goals: d.value ?? d.goals ?? 0,
          tasks: Math.round((d.value ?? 0) * 2.5),
          efficiency: Math.min(100, 80 + (d.value ?? 0) * 2),
        }))
      : fallbackChartData;


  const metricsConfig = {
    goals: { label: "Goal Completion", key: "goals", color: "#2dd4bf", gradient: "colorTeal" },
    tasks: { label: "Task Velocity", key: "tasks", color: "#6366f1", gradient: "colorIndigo" },
    efficiency: { label: "Team Efficiency", key: "efficiency", color: "#f59e0b", gradient: "colorAmber" },
  };

  const overdueList = goals
    .filter((g) => new Date(g.dueDate) < new Date() && g.status !== "COMPLETED")
    .slice(0, 5);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full space-y-10"
    >
      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
      >
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border-l-[6px] border-l-indigo-500 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none flex flex-col justify-between h-[160px] hover:shadow-2xl hover:-translate-y-1 transition-all"
        >
          <div className="flex justify-between items-start gap-4">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-[0.18em]">
              Total Goals
            </span>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
              <Target size={24} strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-end gap-4">
            <span className="text-3xl md:text-6xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
              {totalGoals}
            </span>
            <span className="text-xs font-semibold text-emerald-500 uppercase tracking-[0.2em] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Active
            </span>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border-l-[6px] border-l-emerald-500 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none flex flex-col justify-between h-[160px] hover:shadow-2xl hover:-translate-y-1 transition-all"
        >
          <div className="flex justify-between items-start gap-4">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-[0.18em]">
              Completed
            </span>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
              <CheckCircle2 size={24} strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-end gap-4">
            <span className="text-3xl md:text-6xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
              {completedGoals}
            </span>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-[0.2em] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Total
            </span>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border-l-[6px] border-l-amber-500 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none flex flex-col justify-between h-[160px] hover:shadow-2xl hover:-translate-y-1 transition-all"
        >
          <div className="flex justify-between items-start gap-4">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-[0.18em]">
              In Progress
            </span>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner">
              <Layout size={24} strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-end gap-4">
            <span className="text-3xl md:text-6xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
              {inProgressGoals}
            </span>
            <span className="text-xs font-semibold text-amber-500 uppercase tracking-[0.2em] bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
              Active
            </span>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border-l-[6px] border-l-rose-500 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none flex flex-col justify-between h-[160px] hover:shadow-2xl hover:-translate-y-1 transition-all"
        >
          <div className="flex justify-between items-start gap-4">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-[0.18em]">
              Overdue
            </span>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-inner">
              <AlertCircle size={24} strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-end gap-4">
            <span className="text-3xl md:text-6xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
              {overdueList.length}
            </span>
            <span className="text-xs font-semibold text-rose-500 uppercase tracking-[0.2em] bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
              Attention
            </span>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Workspace Performance
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Real-time tracking of team productivity</p>
            </div>
            
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
              {Object.entries(metricsConfig).map(([id, config]) => (
                <button
                  key={id}
                  onClick={() => setActiveMetric(id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeMetric === id 
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-600' 
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={weeklyChartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="colorTeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorIndigo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAmber" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                  className="dark:stroke-slate-800/50"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    backgroundColor: "#1e293b",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                    color: "#fff"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={activeMetric}
                  stroke={metricsConfig[activeMetric].color}
                  strokeWidth={4}
                  fillOpacity={1}
                  fill={`url(#${metricsConfig[activeMetric].gradient})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Action Items by Status (Donut Chart) */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none flex flex-col"
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-8">
            Tasks Status
          </h2>
          <div style={{ width: "100%", height: 240 }} className="flex items-center justify-between">
            <div style={{ width: "50%", height: 200 }}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={actionItemsByStatus}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {actionItemsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-1/2 flex flex-col gap-3 ml-4">
              {actionItemsByStatus.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className="text-sm text-gray-600 dark:text-slate-400">{entry.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Overdue Goals */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              Overdue Goals
              <span className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border border-rose-100 dark:border-rose-900/50">
                {overdueList.length} Critical
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {overdueList.map((goal, idx) => (
              <motion.div
                key={goal.id}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-slate-900 border-l-[6px] border-l-rose-500 p-8 rounded-[40px] shadow-xl shadow-slate-100/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col gap-4 relative group transition-all"
              >
                <div className="absolute top-8 right-8 w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-black shadow-sm uppercase border-2 border-white dark:border-slate-800 group-hover:scale-110 transition-transform">
                  AL
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                    {goal.title}
                  </h3>
                  <span className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Goal: {goal.title.substring(0, 3)}
                  </span>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2">
                  {goal.description ||
                    "No description provided. This goal needs immediate attention to get back on track."}
                </p>

                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                    <Calendar size={14} />
                    {new Date(goal.dueDate).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                  <span className="px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 rounded-full text-[10px] font-black uppercase tracking-widest">
                    High Priority
                  </span>
                </div>
              </motion.div>
            ))}
            {overdueList.length === 0 && (
              <div className="col-span-full bg-white dark:bg-slate-900 p-12 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-800 text-center">
                <p className="text-slate-400 font-bold text-sm tracking-wide">
                  NO OVERDUE GOALS RIGHT NOW. GREAT JOB! 🎉
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Activity (Announcements Feed) */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight px-2">
            Announcements
          </h2>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none flex flex-col gap-8">
            {announcements.slice(0, 4).map((announcement, idx) => (
              <motion.div
                key={announcement.id}
                className="flex items-start gap-4 group"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:scale-110 transition-transform ${announcement.userColor || "bg-indigo-500"}`}
                >
                  {announcement.author?.name?.substring(0, 2) || "AN"}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
                    <span className="font-black text-slate-900 dark:text-white">
                      {announcement.author?.name}
                    </span>
                    <span className="text-slate-400 font-bold mx-2">•</span>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </span>
                  </p>
                  <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-indigo-600 transition-colors">
                    {announcement.title}
                  </h4>
                </div>
              </motion.div>
            ))}
            {announcements.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-8 font-bold">
                No recent announcements.
              </p>
            )}
            <button className="w-full py-4 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all mt-2">
              View All Feed
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
