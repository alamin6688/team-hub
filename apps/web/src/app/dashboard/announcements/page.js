"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, Pin, MessageCircle, Heart, ThumbsUp, PartyPopper, 
  Rocket, Flame, Send, X, Smile, MoreHorizontal, Edit2, Trash2, Megaphone 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const EMOJI_OPTIONS = ["👍", "❤️", "🎉", "🚀", "🔥"];

export default function AnnouncementsPage() {
  const { 
    currentWorkspace, 
    announcements, 
    fetchAnnouncements, 
    createAnnouncement,
    addReaction,
    addComment,
    members 
  } = useWorkspaceStore();
  const { user } = useAuthStore();

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [mentionQuery, setMentionQuery] = useState(null); // null = closed, string = active query
  const [mentionAnchor, setMentionAnchor] = useState(0); // cursor position of '@'
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    pinned: false
  });

  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchAnnouncements(currentWorkspace.id);
    }
  }, [currentWorkspace?.id]);

  const isAdmin = members.find(m => m.userId === user?.id)?.role === 'ADMIN' || user?.role === 'ADMIN';

  const handlePost = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    setIsSubmitting(true);
    try {
      await createAnnouncement(currentWorkspace.id, formData);
      toast.success("Announcement posted!");
      setShowModal(false);
      setFormData({ title: '', content: '', pinned: false });
    } catch (error) {
      toast.error("Failed to post announcement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddReaction = async (announcementId, emoji) => {
    try {
      await addReaction(currentWorkspace.id, announcementId, emoji);
    } catch (error) {
      toast.error("Failed to update reaction");
    }
  };

  const handleAddComment = async (announcementId) => {
    if (!commentText.trim()) return;
    try {
      await addComment(currentWorkspace.id, announcementId, commentText);
      setCommentText("");
      setMentionQuery(null);
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const handleCommentChange = (e) => {
    const val = e.target.value;
    setCommentText(val);
    const cursor = e.target.selectionStart;
    // Find the last '@' before the cursor
    const textUpToCursor = val.slice(0, cursor);
    const atIndex = textUpToCursor.lastIndexOf('@');
    if (atIndex !== -1) {
      const query = textUpToCursor.slice(atIndex + 1);
      // Only show if no space in query (single word/name typing)
      if (!query.includes(' ') || query.length < 15) {
        setMentionQuery(query);
        setMentionAnchor(atIndex);
        return;
      }
    }
    setMentionQuery(null);
  };

  const insertMention = (name) => {
    const before = commentText.slice(0, mentionAnchor);
    const after = commentText.slice(mentionAnchor + 1 + (mentionQuery?.length || 0));
    setCommentText(`${before}@${name} ${after}`);
    setMentionQuery(null);
  };

  const mentionSuggestions = mentionQuery !== null
    ? (members || []).filter(m =>
        m.user?.name?.toLowerCase().includes(mentionQuery.toLowerCase()) &&
        m.userId !== user?.id
      ).slice(0, 5)
    : [];

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';

  return (
    <div className="min-h-full">
      {/* Header section */}
      <motion.div 
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Announcements</h1>
          <p className="text-slate-500 mt-1 font-medium">Stay updated with the latest team news</p>
        </div>
        
        {isAdmin && (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
            className="btn-primary-dynamic flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100"
          >
            <Plus size={20} strokeWidth={3} />
            Post Announcement
          </motion.button>
        )}
      </motion.div>

      {/* Announcements List */}
      <div className="space-y-8 pb-20">
        <AnimatePresence mode="popLayout">
          {announcements.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                <Rocket size={32} />
              </div>
              <p className="text-slate-400 font-bold">No announcements yet.</p>
            </motion.div>
          ) : (
            announcements.map((announcement, index) => {
              const userReaction = announcement.reactions?.find(r => r.userId === user?.id)?.emoji;
              
              return (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  key={announcement.id}
                  className={`bg-white rounded-[32px] border transition-all duration-500 ${
                    announcement.pinned 
                      ? 'border-rose-100 shadow-xl shadow-rose-50/50 ring-1 ring-rose-50' 
                      : 'border-slate-100 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="p-8">
                    {announcement.pinned && (
                      <div className="flex items-center gap-2 text-rose-500 font-bold text-[10px] tracking-widest mb-6 bg-rose-50 w-fit px-3 py-1 rounded-full uppercase">
                        <Pin size={12} fill="currentColor" />
                        Pinned
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                            {getInitials(announcement.author?.name)}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 leading-tight">{announcement.author?.name}</h4>
                          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                            {new Date(announcement.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight">{announcement.title}</h3>
                    <div className="text-slate-600 leading-relaxed max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          strong: ({node, ...props}) => <span className="font-black text-slate-900" {...props} />,
                          em: ({node, ...props}) => <span className="italic text-slate-800 underline decoration-indigo-200 underline-offset-2" {...props} />,
                          a: ({node, ...props}) => <a className="text-indigo-600 font-bold hover:underline" target="_blank" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc ml-4 space-y-1 my-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal ml-4 space-y-1 my-2" {...props} />,
                          li: ({node, ...props}) => <li className="pl-1" {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-200 pl-4 py-1 italic bg-indigo-50/30 rounded-r-lg my-3" {...props} />,
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        }}
                      >
                        {announcement.content}
                      </ReactMarkdown>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-50 flex flex-wrap items-center justify-between gap-4">
                      {/* Reactions Section */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {EMOJI_OPTIONS.map(emoji => {
                          const count = announcement.reactions?.filter(r => r.emoji === emoji).length || 0;
                          const isActive = userReaction === emoji;
                          
                          if (count === 0 && !isActive) return (
                            <motion.button 
                              key={emoji}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleAddReaction(announcement.id, emoji)}
                              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all grayscale opacity-40 hover:opacity-100"
                            >
                              <span className="text-lg">{emoji}</span>
                            </motion.button>
                          );

                          return (
                            <motion.button 
                              key={emoji}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAddReaction(announcement.id, emoji)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                                isActive 
                                  ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                                  : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                              }`}
                            >
                              <span className={`text-base ${!isActive && 'grayscale'}`}>{emoji}</span>
                              <span className={`text-xs font-bold ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>{count}</span>
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Comments Count */}
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setExpandedPost(expandedPost === announcement.id ? null : announcement.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                          expandedPost === announcement.id 
                            ? 'bg-indigo-50 text-indigo-600' 
                            : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                        }`}
                      >
                        <MessageCircle size={18} fill={expandedPost === announcement.id ? "currentColor" : "none"} />
                        {announcement.comments?.length || 0} Comments
                      </motion.button>
                    </div>
                  </div>

                  {/* Comments Section (Expanded) */}
                  <AnimatePresence>
                    {expandedPost === announcement.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "circOut" }}
                        className="overflow-hidden border-t border-slate-50 bg-slate-50/30 rounded-b-[32px]"
                      >
                        <div className="p-8 space-y-6">
                          {/* Comments List */}
                          <div className="space-y-6">
                            <AnimatePresence mode="popLayout">
                              {announcement.comments?.map((comment) => (
                                <motion.div 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  key={comment.id} 
                                  className="flex gap-4"
                                >
                                  <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-[10px] shrink-0">
                                    {getInitials(comment.author?.name)}
                                  </div>
                                  <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="font-bold text-xs text-slate-900">{comment.author?.name}</span>
                                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium">{comment.content}</p>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>

                          {/* Add Comment Input */}
                          <div className="flex gap-4 pt-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md">
                              {getInitials(user?.name)}
                            </div>
                            <div className="flex-1 relative">
                              <input 
                                type="text" 
                                placeholder="Write a comment... Use @name to mention"
                                className="w-full h-10 pl-4 pr-12 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-sm"
                                value={commentText}
                                onChange={handleCommentChange}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && mentionSuggestions.length === 0) handleAddComment(announcement.id);
                                  if (e.key === 'Escape') setMentionQuery(null);
                                }}
                              />
                              <button 
                                onClick={() => handleAddComment(announcement.id)}
                                className="absolute right-2 top-1.5 p-1 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                              >
                                <Send size={18} />
                              </button>

                              {/* @Mention Autocomplete Dropdown */}
                              {mentionSuggestions.length > 0 && (
                                <div className="absolute bottom-12 left-0 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
                                  <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Mention a teammate</p>
                                  {mentionSuggestions.map(m => (
                                    <button
                                      key={m.userId}
                                      onMouseDown={(e) => { e.preventDefault(); insertMention(m.user.name); }}
                                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-indigo-50 transition-colors text-left"
                                    >
                                      <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                        {getInitials(m.user?.name)}
                                      </div>
                                      <span className="text-sm font-semibold text-slate-700">{m.user?.name}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Post Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setShowModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 15 }}
              transition={{ duration: 0.25, ease: "circOut" }}
              className="relative bg-white rounded-[40px] shadow-2xl border border-slate-100 p-10 max-w-2xl w-full"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
              
              <div className="mb-10">
                <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4">
                  <Megaphone size={28} />
                </div>
                <h3 className="text-3xl font-bold text-slate-900">Post Announcement</h3>
                <p className="text-slate-500 font-medium">Broadcast news to everyone in the workspace</p>
              </div>
              
              <form onSubmit={handlePost} className="space-y-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Title</label>
                    <input 
                      type="text" 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-base font-bold focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-400 transition-all"
                      placeholder="E.g. Q4 Kick-off Meeting"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Content</label>
                    <textarea 
                      required
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-base font-medium focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-400 transition-all h-48 resize-none"
                      placeholder="What's the news?"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${formData.pinned ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        <Pin size={18} fill={formData.pinned ? "currentColor" : "none"} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Pin Announcement</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Always stays at the top</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, pinned: !formData.pinned})}
                      className={`w-12 h-6 rounded-full relative transition-all ${formData.pinned ? 'bg-rose-500' : 'bg-slate-300'}`}
                    >
                      <motion.div 
                        animate={{ left: formData.pinned ? 28 : 4 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-8 py-5 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary-dynamic flex-[2] px-8 py-5 font-semibold rounded-2xl shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Posting...</span>
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        <span>Post Announcement</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
