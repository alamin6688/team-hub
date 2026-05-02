"use client";

import React from 'react';
import { Plus, Pin, MessageCircle } from 'lucide-react';

const announcementsData = [
  {
    id: 1,
    pinned: true,
    user: "Demo User",
    initials: "DU",
    color: "bg-purple-600",
    date: "29/04/2026, 16:12:00",
    title: "All-hands moved to Thursday",
    content: "Heads up — this week's all-hands is moving to Thursday 10am PT to make room for the launch rehearsal.",
    reactions: [
      { emoji: "👍", count: 12 },
      { emoji: "🎉", count: 4 },
      { emoji: "❤️", count: 7 }
    ],
    comments: 5
  },
  {
    id: 2,
    pinned: false,
    user: "Aria Chen",
    initials: "AC",
    color: "bg-teal-600",
    date: "28/04/2026, 22:40:00",
    title: "Q2 marketing campaign kicks off Monday",
    content: "The brand refresh and landing page go live Monday. Final review deck is in the shared drive.",
    reactions: [
      { emoji: "🎉", count: 9 },
      { emoji: "🔥", count: 6 }
    ],
    comments: 3
  },
  {
    id: 3,
    pinned: false,
    user: "Sofia Park",
    initials: "SP",
    color: "bg-indigo-600",
    date: "25/04/2026, 15:00:00",
    title: "Welcome Lina to the team!",
    content: "Lina joins as our new product designer focused on onboarding. Say hi in #welcome.",
    reactions: [
      { emoji: "👍", count: 18 },
      { emoji: "🎉", count: 11 }
    ],
    comments: 12
  }
];

const availableReactions = ["🚀", "🔥", "👋", "❤️"];

export default function AnnouncementsPage() {
  return (
    <div className="p-8 h-full">
      {/* Top action bar */}
      <div className="flex justify-end mb-8 max-w-4xl mx-auto">
        <button className="flex items-center gap-2 px-4 py-2 bg-[#f43f5e] hover:bg-[#e11d48] text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} />
          Post Announcement
        </button>
      </div>

      {/* Announcements List */}
      <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
        {announcementsData.map((announcement) => (
          <div 
            key={announcement.id} 
            className={`bg-white rounded-2xl p-6 shadow-sm border ${
              announcement.pinned ? 'border-red-300 shadow-red-100/50' : 'border-gray-100'
            }`}
          >
            {announcement.pinned && (
              <div className="flex items-center gap-1.5 text-red-500 font-bold text-[11px] tracking-wider mb-4">
                <Pin size={12} className="fill-current" />
                PINNED
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className={`w-10 h-10 rounded-full ${announcement.color} text-white flex items-center justify-center text-sm font-bold`}>
                  {announcement.initials}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <div className="font-semibold text-gray-800 text-sm">{announcement.user}</div>
                <div className="text-gray-400 text-xs mt-0.5">{announcement.date}</div>
              </div>
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {announcement.title}
            </h2>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              {announcement.content}
            </p>

            <div className="flex items-center justify-between border-t border-gray-50 pt-4">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Active Reactions */}
                {announcement.reactions.map((reaction, i) => (
                  <button 
                    key={i} 
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-100 transition-colors"
                  >
                    <span className="text-sm leading-none">{reaction.emoji}</span>
                    <span className="text-xs font-semibold text-gray-600">{reaction.count}</span>
                  </button>
                ))}
                
                {/* Divider if we have active reactions */}
                {announcement.reactions.length > 0 && (
                  <div className="w-px h-4 bg-gray-200 mx-1"></div>
                )}

                {/* Available Reactions to click */}
                {availableReactions.map((emoji, i) => (
                  <button 
                    key={`avail-${i}`}
                    className="flex items-center justify-center w-7 h-7 bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-100 transition-colors opacity-70 hover:opacity-100 grayscale hover:grayscale-0"
                  >
                    <span className="text-sm leading-none">{emoji}</span>
                  </button>
                ))}
              </div>

              <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium">
                <MessageCircle size={16} />
                {announcement.comments} comments
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
