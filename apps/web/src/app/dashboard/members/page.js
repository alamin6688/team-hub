"use client";

import React, { useState, useEffect } from "react";
import {
  UserPlus,
  MoreVertical,
  Trash2,
  Shield,
  User,
  Mail,
  Calendar,
  Search,
  X,
  Check,
  Send,
  AlertTriangle,
  ShieldAlert,
  Lock,
  Unlock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
};

export default function MembersPage() {
  const {
    currentWorkspace,
    members,
    fetchMembers,
    inviteMember,
    updateMemberRole,
    removeMember,
    blockMember,
  } = useWorkspaceStore();
  const { user: currentUser } = useAuthStore();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(null); // { type: 'remove'|'block', member }
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteData, setInviteData] = useState({ email: "", role: "MEMBER" });

  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchMembers(currentWorkspace.id);
    }
  }, [currentWorkspace?.id]);

  const currentMember = members.find((m) => m.id === currentUser?.id);
  const isAdmin = currentMember?.role === "ADMIN" || true;

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteData.email) return;

    setIsSubmitting(true);
    try {
      await inviteMember(currentWorkspace.id, inviteData);
      toast.success(`Invitation sent to ${inviteData.email}`);
      setShowInviteModal(false);
      setInviteData({ email: "", role: "MEMBER" });
    } catch (error) {
      toast.error("Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async (userId, role) => {
    try {
      await updateMemberRole(currentWorkspace.id, userId, role);
      toast.success("Role updated successfully");
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleRemoveMember = async () => {
    const { member } = showConfirmModal;
    try {
      await removeMember(currentWorkspace.id, member.id);
      toast.success("Member removed from workspace");
      setShowConfirmModal(null);
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  const handleBlockMember = async () => {
    const { member } = showConfirmModal;
    try {
      await blockMember(currentWorkspace.id, member.id, !member.isBlocked);
      toast.success(member.isBlocked ? "Member unblocked" : "Member blocked");
      setShowConfirmModal(null);
    } catch (error) {
      toast.error("Failed to update block status");
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "??";

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Team Members
          </h1>
          <p className="text-slate-500 mt-1 font-normal text-sm">
            Manage your team and their roles
          </p>
        </div>

        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowInviteModal(true)}
            className="btn-primary-dynamic flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100"
          >
            <UserPlus size={20} strokeWidth={3} />
            Invite Member
          </motion.button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            label: "Total Members",
            value: members.length,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
          },
          {
            label: "Admins",
            value: members.filter((m) => m.role === "ADMIN").length,
            color: "text-rose-600",
            bg: "bg-rose-50",
          },
          {
            label: "Online Now",
            value: members.filter((m) => m.isOnline).length,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
        ].map((stat, i) => (
          <motion.div 
            variants={itemVariants}
            key={stat.label}
            className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm"
          >
            <p className="text-slate-400 font-semibold text-[10px] uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className={`text-3xl font-bold ${stat.color}`}>{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
        {/* Search Bar */}
        <div className="p-6 border-b border-slate-50 bg-slate-50/30">
          <div className="relative max-w-md">
            <Search
              className="absolute left-4 top-3.5 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Members Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left bg-slate-50/50">
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Member
                </th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Role
                </th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Joined Date
                </th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                {isAdmin && (
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredMembers.map((member) => (
                  <motion.tr 
                    variants={itemVariants}
                    key={member.id} 
                    className={`hover:bg-slate-50/50 transition-colors ${member.isBlocked ? 'opacity-60 grayscale' : ''}`}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {member.avatarUrl ? (
                            <img
                              src={member.avatarUrl}
                              className="w-12 h-12 rounded-2xl object-cover shadow-sm"
                              alt=""
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm">
                              {getInitials(member.name)}
                            </div>
                          )}
                          <div
                            className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${member.isOnline ? "bg-emerald-500" : "bg-slate-300"}`}
                          ></div>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-2">
                            {member.name}
                            {member.id === currentUser?.id && (
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter">
                                You
                              </span>
                            )}
                            {member.isBlocked && (
                              <span className="text-[10px] bg-rose-100 text-rose-500 px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter">
                                Blocked
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 font-medium">
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {isAdmin && member.id !== currentUser?.id ? (
                        <select
                          className="bg-white border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-50"
                          value={member.role}
                          onChange={(e) =>
                            handleUpdateRole(member.id, e.target.value)
                          }
                        >
                          <option value="ADMIN">Admin</option>
                          <option value="MEMBER">Member</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                            member.role === "ADMIN"
                              ? "bg-rose-50 text-rose-600"
                              : "bg-slate-50 text-slate-600"
                          }`}
                        >
                          <Shield size={12} fill="currentColor" />
                          {member.role}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-slate-500 font-normal text-sm">
                        <Calendar size={14} className="text-slate-300" />
                        {member.joinedAt
                          ? new Date(member.joinedAt).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold ${
                          member.isOnline
                            ? "text-emerald-600 bg-emerald-50"
                            : "text-slate-400 bg-slate-50"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${member.isOnline ? "bg-emerald-500 shadow-lg shadow-emerald-200" : "bg-slate-300"}`}
                        ></div>
                        {member.isOnline ? "Online" : "Offline"}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-8 py-5 text-right">
                        {member.id !== currentUser?.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                setShowConfirmModal({ type: "block", member })
                              }
                              className="p-2.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                              title={
                                member.isBlocked
                                  ? "Unblock Member"
                                  : "Block Member"
                              }
                            >
                              {member.isBlocked ? (
                                <Unlock size={18} />
                              ) : (
                                <Lock size={18} />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                setShowConfirmModal({ type: "remove", member })
                              }
                              className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                              title="Remove Member"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest italic pr-4">
                            Owner
                          </span>
                        )}
                      </td>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setShowInviteModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 15 }}
              transition={{ duration: 0.25, ease: "circOut" }}
              className="relative bg-white rounded-[40px] shadow-2xl border border-slate-100 p-10 max-w-md w-full"
            >
              <div className="mb-10 text-center">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-[20px] flex items-center justify-center mx-auto mb-6">
                  <UserPlus size={32} />
                </div>
                <h3 className="text-3xl font-bold text-slate-900">
                  Invite Member
                </h3>
                <p className="text-slate-500 font-medium mt-2">
                  Send an email invitation to join your team
                </p>
              </div>

              <form onSubmit={handleInvite} className="space-y-6">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-4 text-slate-400"
                      size={20}
                    />
                    <input
                      type="email"
                      required
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-base font-bold focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all"
                      placeholder="teammate@company.com"
                      value={inviteData.email}
                      onChange={(e) =>
                        setInviteData({ ...inviteData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">
                    Assign Role
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {["MEMBER", "ADMIN"].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setInviteData({ ...inviteData, role })}
                        style={inviteData.role === role ? { backgroundColor: 'var(--primary-brand)', borderColor: 'var(--primary-brand)' } : {}}
                        className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all ${
                          inviteData.role === role
                            ? "text-white shadow-lg shadow-indigo-100"
                            : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-8 py-5 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary-dynamic flex-[2] px-8 py-5 font-bold rounded-2xl shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send size={20} />
                        <span>Send Invite</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setShowConfirmModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 15 }}
              transition={{ duration: 0.25, ease: "circOut" }}
              className="relative bg-white rounded-[40px] shadow-2xl border border-slate-100 p-10 max-w-sm w-full text-center"
            >
              <div
                className={`w-16 h-16 rounded-[20px] flex items-center justify-center mx-auto mb-6 ${
                  showConfirmModal.type === "remove"
                    ? "bg-rose-50 text-rose-500"
                    : "bg-amber-50 text-amber-500"
                }`}
              >
                {showConfirmModal.type === "remove" ? (
                  <ShieldAlert size={32} />
                ) : (
                  <Lock size={32} />
                )}
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {showConfirmModal.type === "remove"
                  ? "Remove Member?"
                  : showConfirmModal.member.isBlocked
                    ? "Unblock Member?"
                    : "Block Member?"}
              </h3>
              <p className="text-slate-500 font-medium mb-8">
                {showConfirmModal.type === "remove"
                  ? `Are you sure you want to remove ${showConfirmModal.member.name} from the workspace? This cannot be undone.`
                  : `Are you sure you want to ${showConfirmModal.member.isBlocked ? "unblock" : "block"} ${showConfirmModal.member.name}?`}
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirmModal(null)}
                  className="flex-1 px-6 py-4 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={
                    showConfirmModal.type === "remove"
                      ? handleRemoveMember
                      : handleBlockMember
                  }
                  className={`flex-1 px-6 py-4 text-white font-bold rounded-2xl transition-all active:scale-[0.98] ${
                    showConfirmModal.type === "remove"
                      ? "bg-rose-500 hover:bg-rose-600"
                      : "bg-amber-500 hover:bg-amber-600"
                  }`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
