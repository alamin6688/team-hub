"use client";

import React from 'react';
import { UserPlus, MoreHorizontal } from 'lucide-react';

const membersData = [
  {
    id: 1,
    name: "Demo User",
    email: "demo@teamhub.com",
    initials: "DU",
    color: "bg-purple-600",
    role: "ADMIN",
    joined: "12/01/2024",
    status: "Online",
    isOnline: true
  },
  {
    id: 2,
    name: "Aria Chen",
    email: "aria@teamhub.com",
    initials: "AC",
    color: "bg-teal-600",
    role: "MEMBER",
    joined: "03/02/2024",
    status: "Online",
    isOnline: true
  },
  {
    id: 3,
    name: "Marcus Iyer",
    email: "marcus@teamhub.com",
    initials: "MI",
    color: "bg-orange-500",
    role: "MEMBER",
    joined: "19/02/2024",
    status: "Online",
    isOnline: true
  },
  {
    id: 4,
    name: "Sofia Park",
    email: "sofia@teamhub.com",
    initials: "SP",
    color: "bg-indigo-600",
    role: "ADMIN",
    joined: "08/03/2024",
    status: "Offline",
    isOnline: false
  },
  {
    id: 5,
    name: "Theo Nakamura",
    email: "theo@teamhub.com",
    initials: "TN",
    color: "bg-emerald-600",
    role: "MEMBER",
    joined: "22/04/2024",
    status: "Online",
    isOnline: true
  },
  {
    id: 6,
    name: "Lina Okafor",
    email: "lina@teamhub.com",
    initials: "LO",
    color: "bg-orange-600",
    role: "MEMBER",
    joined: "15/05/2024",
    status: "Offline",
    isOnline: false
  }
];

export default function MembersPage() {
  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="flex justify-end mb-8">
        <button className="flex items-center gap-2 px-4 py-2 bg-[#f43f5e] hover:bg-[#e11d48] text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <UserPlus size={16} />
          Invite Member
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50/50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-500 text-xs w-[25%]">MEMBER</th>
              <th className="px-6 py-4 font-bold text-gray-500 text-xs w-[25%]">EMAIL</th>
              <th className="px-6 py-4 font-bold text-gray-500 text-xs w-[15%]">ROLE</th>
              <th className="px-6 py-4 font-bold text-gray-500 text-xs w-[15%]">JOINED</th>
              <th className="px-6 py-4 font-bold text-gray-500 text-xs w-[15%]">STATUS</th>
              <th className="px-6 py-4 w-[5%]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {membersData.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-8 h-8 rounded-full ${member.color} text-white flex items-center justify-center text-xs font-bold`}>
                        {member.initials}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-white rounded-full ${member.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    </div>
                    <span className="font-semibold text-gray-800">{member.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500 font-medium">
                  {member.email}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                    member.role === 'ADMIN' 
                      ? 'bg-red-50 text-red-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 font-medium">
                  {member.joined}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${member.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-gray-700 text-sm font-medium">{member.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
