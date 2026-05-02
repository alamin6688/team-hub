"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Hexagon, ChevronDown, LayoutGrid, Target, CheckSquare, Megaphone, 
  Settings, Search, Moon, Bell, Users, LogOut
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-[260px] bg-white border-r border-gray-100 flex flex-col justify-between">
        <div>
          {/* Logo & Workspace Dropdown */}
          <div className="h-[72px] flex items-center px-6 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-indigo-600 text-white mr-3">
              <Hexagon size={20} fill="currentColor" />
            </div>
            <span className="font-semibold text-gray-800 text-[15px]">Acme Corp</span>
            <ChevronDown size={16} className="ml-auto text-gray-400" />
          </div>

          {/* Navigation */}
          <div className="p-4">
            <div className="text-xs font-semibold text-gray-400 tracking-wider mb-4 px-2">WORKSPACE</div>
            <nav className="flex flex-col gap-1">
              {[
                { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
                { name: "Goals", href: "/dashboard/goals", icon: Target },
                { name: "Action Items", href: "/dashboard/tasks", icon: CheckSquare },
                { name: "Announcements", href: "/dashboard/announcements", icon: Megaphone },
                { name: "Members", href: "/dashboard/members", icon: Users },
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

        <div>
          {/* Online Users */}
          <div className="px-6 pb-6">
            <div className="text-[11px] font-bold text-gray-400 tracking-wider mb-3">ONLINE - 4</div>
            <div className="flex -space-x-2">
              {[
                { initials: 'DU', bg: 'bg-purple-600' },
                { initials: 'AC', bg: 'bg-teal-600' },
                { initials: 'MI', bg: 'bg-orange-500' },
                { initials: 'TN', bg: 'bg-emerald-600' },
              ].map((user, i) => (
                <div key={i} className="relative z-0 hover:z-10 transition-all">
                  <div className={`w-8 h-8 rounded-full ${user.bg} border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}>
                    {user.initials}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-[1.5px] border-white rounded-full"></div>
                </div>
              ))}
            </div>
          </div>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  DU
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800 leading-tight">Demo User</span>
                <span className="text-[11px] font-medium text-gray-500">demo@teamhub.com</span>
              </div>
            </div>
            <LogOut size={18} className="text-gray-400 hover:text-gray-600 transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-8">
          <h1 className="text-lg font-bold text-gray-800">
            {pathname === '/dashboard' ? 'Dashboard' : 
             pathname === '/dashboard/goals' ? 'Goals' :
             pathname === '/dashboard/tasks' ? 'Action Items' :
             pathname === '/dashboard/announcements' ? 'Announcements' :
             pathname === '/dashboard/members' ? 'Members' : 'Dashboard'}
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
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
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
