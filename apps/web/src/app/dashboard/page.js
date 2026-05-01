import KanbanBoard from "@/components/Dashboard/KanbanBoard";
import { LayoutDashboard, Users, Target, Bell, CheckSquare } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="text-white" size={20} />
          </div>
          <span className="font-bold text-xl text-slate-800">TeamHub</span>
        </div>

        <nav className="flex flex-col gap-2">
          {[
            { name: "Dashboard", icon: LayoutDashboard, active: true },
            { name: "Goals", icon: Target },
            { name: "Tasks", icon: CheckSquare },
            { name: "Announcements", icon: Bell },
            { name: "Team", icon: Users },
          ].map((item) => (
            <button
              key={item.name}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.active
                  ? "bg-primary-50 text-primary-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Project Workspace</h1>
            <p className="text-slate-500 text-sm">Overview of your team's current status</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
              New Project
            </button>
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
              <img src="https://ui-avatars.com/api/?name=Admin+User" alt="Avatar" />
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          {[
            { label: "Active Goals", value: "12", trend: "+2", color: "blue" },
            { label: "Pending Tasks", value: "48", trend: "+5", color: "amber" },
            { label: "Team Members", value: "8", trend: "0", color: "green" },
            { label: "Completion Rate", value: "84%", trend: "+12%", color: "indigo" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  stat.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-600'
                }`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Board */}
        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-bold text-slate-800">Task Board</h2>
            <div className="flex gap-2">
              <button className="text-xs font-medium px-3 py-1.5 bg-slate-50 text-slate-600 rounded-md">Filter</button>
              <button className="text-xs font-medium px-3 py-1.5 bg-slate-50 text-slate-600 rounded-md">Sort</button>
            </div>
          </div>
          <KanbanBoard />
        </section>
      </main>
    </div>
  );
}
