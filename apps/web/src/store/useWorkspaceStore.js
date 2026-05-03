import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useWorkspaceStore = create(
  persist(
    (set, get) => ({
      currentWorkspace: null,
      goals: [],
      announcements: [],
      actionItems: [],
      members: [],
      workspaces: [],
      notificationsCount: 0,
      isLoading: false,

      fetchWorkspaces: async () => {
        const { fetchWithAuth } = await import("@/lib/api");
        try {
          const response = await fetchWithAuth("/workspaces");
          set({ workspaces: response.data });
          return response.data;
        } catch (error) {
          console.error("Fetch workspaces error:", error);
        }
      },

      createWorkspace: async (data) => {
        const { fetchWithAuth } = await import("@/lib/api");
        try {
          const response = await fetchWithAuth("/workspaces", {
            method: "POST",
            body: JSON.stringify(data),
          });
          set((state) => ({ workspaces: [...state.workspaces, response.data] }));
          return response.data;
        } catch (error) {
          console.error("Create workspace error:", error);
          throw error;
        }
      },

      setWorkspace: (workspace) => set({ currentWorkspace: workspace }),

      switchWorkspace: async (workspace) => {
        const { fetchWithAuth } = await import("@/lib/api");
        set({ currentWorkspace: workspace, isLoading: true });
        try {
          const [goals, announcements, actionItems, members] = await Promise.all([
            fetchWithAuth(`/workspaces/${workspace.id}/goals`),
            fetchWithAuth(`/workspaces/${workspace.id}/announcements`),
            fetchWithAuth(`/workspaces/${workspace.id}/action-items`),
            fetchWithAuth(`/workspaces/${workspace.id}/members`),
          ]);
          set({ 
            goals: goals.data, 
            announcements: announcements.data, 
            actionItems: actionItems.data, 
            members: members.data,
            isLoading: false 
          });
        } catch (error) {
          console.error("Switch workspace error:", error);
          set({ isLoading: false });
        }
      },
      setGoals: (goals) => set({ goals }),
      setAnnouncements: (announcements) => set({ announcements }),
      setActionItems: (items) => set({ actionItems: items }),
      setMembers: (members) => set({ members }),
      setWorkspaces: (workspaces) => set({ workspaces }),
      setNotificationsCount: (count) => set({ notificationsCount: count }),
      setLoading: (loading) => set({ isLoading: loading }),

      // Action Items Actions
      fetchActionItems: async (workspaceId) => {
        const { fetchWithAuth } = await import("@/lib/api");
        set({ isLoading: true });
        try {
          const response = await fetchWithAuth(
            `/workspaces/${workspaceId}/action-items`,
          );
          set({ actionItems: response.data });
        } catch (error) {
          console.error("Fetch action items error:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      createActionItem: async (workspaceId, data) => {
        const { fetchWithAuth } = await import("@/lib/api");
        const previousActionItems = get().actionItems;
        const tempId = `temp-${Date.now()}`;
        
        // Optimistic update
        const optimisticItem = { 
          ...data, 
          id: tempId, 
          createdAt: new Date().toISOString(), 
          updatedAt: new Date().toISOString(),
          assignee: data.assigneeId ? get().members.find(m => m.id === data.assigneeId) : null,
          goal: data.goalId ? get().goals.find(g => g.id === data.goalId) : null
        };
        
        set((state) => ({
          actionItems: [optimisticItem, ...state.actionItems],
        }));

        try {
          const response = await fetchWithAuth(
            `/workspaces/${workspaceId}/action-items`,
            {
              method: "POST",
              body: JSON.stringify(data),
            },
          );
          // Replace temp item with real item
          set((state) => ({
            actionItems: state.actionItems.map(item => item.id === tempId ? response.data : item)
          }));
          return response.data;
        } catch (error) {
          // Rollback
          set({ actionItems: previousActionItems });
          console.error("Create action item error:", error);
          throw error;
        }
      },

      updateActionItem: async (workspaceId, id, data) => {
        const { fetchWithAuth } = await import("@/lib/api");
        const previousActionItems = get().actionItems;

        // Optimistic update
        set((state) => ({
          actionItems: state.actionItems.map((item) =>
            item.id === id ? { ...item, ...data } : item,
          ),
        }));

        try {
          const response = await fetchWithAuth(
            `/workspaces/${workspaceId}/action-items/${id}`,
            {
              method: "PATCH",
              body: JSON.stringify(data),
            },
          );
          // Sync with server response
          set((state) => ({
            actionItems: state.actionItems.map((item) =>
              item.id === id ? { ...item, ...response.data } : item,
            ),
          }));
          return response.data;
        } catch (error) {
          // Rollback
          set({ actionItems: previousActionItems });
          console.error("Update action item error:", error);
          throw error;
        }
      },

      deleteActionItem: async (workspaceId, id) => {
        const { fetchWithAuth } = await import("@/lib/api");
        const previousActionItems = get().actionItems;

        // Optimistic update
        set((state) => ({
          actionItems: state.actionItems.filter((item) => item.id !== id),
        }));

        try {
          await fetchWithAuth(`/workspaces/${workspaceId}/action-items/${id}`, {
            method: "DELETE",
          });
        } catch (error) {
          // Rollback
          set({ actionItems: previousActionItems });
          console.error("Delete action item error:", error);
          throw error;
        }
      },

      // Announcements Actions
      fetchAnnouncements: async (workspaceId) => {
        const { fetchWithAuth } = await import("@/lib/api");
        set({ isLoading: true });
        try {
          const response = await fetchWithAuth(
            `/workspaces/${workspaceId}/announcements`,
          );
          set({ announcements: response.data });
        } catch (error) {
          console.error("Fetch announcements error:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      createAnnouncement: async (workspaceId, data) => {
        const { fetchWithAuth } = await import("@/lib/api");
        const previousAnnouncements = get().announcements;
        const tempId = `temp-${Date.now()}`;

        // Optimistic update
        const optimisticAnnouncement = {
          ...data,
          id: tempId,
          createdAt: new Date().toISOString(),
          reactions: [],
          comments: [],
          author: { name: "You" } // Simplified for UI
        };

        set((state) => ({
          announcements: [optimisticAnnouncement, ...state.announcements],
        }));

        try {
          const response = await fetchWithAuth(
            `/workspaces/${workspaceId}/announcements`,
            {
              method: "POST",
              body: JSON.stringify(data),
            },
          );
          set((state) => ({
            announcements: state.announcements.map(a => a.id === tempId ? response.data : a),
          }));
          return response.data;
        } catch (error) {
          // Rollback
          set({ announcements: previousAnnouncements });
          console.error("Create announcement error:", error);
          throw error;
        }
      },

      addReaction: async (workspaceId, announcementId, emoji) => {
        const { fetchWithAuth } = await import("@/lib/api");
        const { useAuthStore } = await import("./useAuthStore");
        const previousAnnouncements = get().announcements;
        const currentUser = useAuthStore.getState().user;

        if (!currentUser) return;

        // Optimistic update
        set((state) => ({
          announcements: state.announcements.map((a) => {
            if (a.id === announcementId) {
              const reactions = [...(a.reactions || [])];
              const existingIdx = reactions.findIndex((r) => r.userId === currentUser.id);

              if (existingIdx > -1) {
                if (reactions[existingIdx].emoji === emoji) {
                  // Remove if same emoji (toggle off)
                  reactions.splice(existingIdx, 1);
                } else {
                  // Update emoji if different
                  reactions[existingIdx] = { ...reactions[existingIdx], emoji };
                }
              } else {
                // Add new reaction
                reactions.push({ userId: currentUser.id, emoji });
              }
              return { ...a, reactions };
            }
            return a;
          }),
        }));

        try {
          const response = await fetchWithAuth(
            `/workspaces/${workspaceId}/announcements/${announcementId}/reactions`,
            {
              method: "POST",
              body: JSON.stringify({ emoji }),
            },
          );
          return response.data;
        } catch (error) {
          // Rollback
          set({ announcements: previousAnnouncements });
          console.error("Add reaction error:", error);
          throw error;
        }
      },

      addComment: async (workspaceId, announcementId, content) => {
        const { fetchWithAuth } = await import("@/lib/api");
        const { useAuthStore } = await import("./useAuthStore");
        const previousAnnouncements = get().announcements;
        const currentUser = useAuthStore.getState().user;
        const tempId = `temp-comment-${Date.now()}`;

        if (!currentUser) return;

        // Optimistic update
        const optimisticComment = {
          id: tempId,
          content,
          createdAt: new Date().toISOString(),
          author: { name: currentUser.name, id: currentUser.id },
        };

        set((state) => ({
          announcements: state.announcements.map((a) =>
            a.id === announcementId
              ? { ...a, comments: [...(a.comments || []), optimisticComment] }
              : a,
          ),
        }));

        try {
          const response = await fetchWithAuth(
            `/workspaces/${workspaceId}/announcements/${announcementId}/comments`,
            {
              method: "POST",
              body: JSON.stringify({ content }),
            },
          );
          // Replace temp comment with real one
          set((state) => ({
            announcements: state.announcements.map((a) =>
              a.id === announcementId
                ? {
                    ...a,
                    comments: a.comments.map((c) =>
                      c.id === tempId ? response.data : c,
                    ),
                  }
                : a,
            ),
          }));
          return response.data;
        } catch (error) {
          // Rollback
          set({ announcements: previousAnnouncements });
          console.error("Add comment error:", error);
          throw error;
        }
      },

      // Members Actions
      fetchMembers: async (workspaceId) => {
        const { fetchWithAuth } = await import("@/lib/api");
        try {
          const response = await fetchWithAuth(`/workspaces/${workspaceId}/members`);
          set({ members: response.data });
        } catch (error) {
          console.error("Fetch members error:", error);
        }
      },

      inviteMember: async (workspaceId, data) => {
        const { fetchWithAuth } = await import("@/lib/api");
        try {
          return await fetchWithAuth(`/workspaces/${workspaceId}/invite`, {
            method: "POST",
            body: JSON.stringify(data),
          });
        } catch (error) {
          console.error("Invite member error:", error);
          throw error;
        }
      },

      updateMemberRole: async (workspaceId, userId, role) => {
        const { fetchWithAuth } = await import("@/lib/api");
        const previousMembers = get().members;

        // Optimistic update
        set((state) => ({
          members: state.members.map((m) => m.id === userId ? { ...m, role } : m),
        }));

        try {
          const response = await fetchWithAuth(`/workspaces/${workspaceId}/members/${userId}`, {
            method: "PATCH",
            body: JSON.stringify({ role }),
          });
          return response.data;
        } catch (error) {
          // Rollback
          set({ members: previousMembers });
          console.error("Update member role error:", error);
          throw error;
        }
      },

      removeMember: async (workspaceId, userId) => {
        const { fetchWithAuth } = await import("@/lib/api");
        const previousMembers = get().members;

        // Optimistic update
        set((state) => ({
          members: state.members.filter((m) => m.id !== userId),
        }));

        try {
          await fetchWithAuth(`/workspaces/${workspaceId}/members/${userId}`, {
            method: "DELETE",
          });
        } catch (error) {
          // Rollback
          set({ members: previousMembers });
          console.error("Remove member error:", error);
          throw error;
        }
      },

      blockMember: async (workspaceId, userId, isBlocked) => {
        const { fetchWithAuth } = await import("@/lib/api");
        const previousMembers = get().members;

        // Optimistic update
        set((state) => ({
          members: state.members.map((m) => m.id === userId ? { ...m, isBlocked } : m),
        }));

        try {
          const response = await fetchWithAuth(`/workspaces/${workspaceId}/members/${userId}/block`, {
            method: "PATCH",
            body: JSON.stringify({ isBlocked }),
          });
          return response.data;
        } catch (error) {
          // Rollback
          set({ members: previousMembers });
          console.error("Block member error:", error);
          throw error;
        }
      },

      updateWorkspace: async (workspaceId, data) => {
        const { fetchWithAuth } = await import("@/lib/api");
        const previousWorkspace = get().currentWorkspace;
        const previousWorkspaces = get().workspaces;

        // Optimistic update
        set((state) => ({
          currentWorkspace: state.currentWorkspace ? { ...state.currentWorkspace, ...data } : null,
          workspaces: state.workspaces.map((ws) =>
            ws.id === workspaceId ? { ...ws, ...data } : ws,
          ),
        }));

        try {
          const response = await fetchWithAuth(`/workspaces/${workspaceId}`, {
            method: "PATCH",
            body: JSON.stringify(data),
          });
          set((state) => ({
            currentWorkspace: response.data,
            workspaces: state.workspaces.map((ws) =>
              ws.id === workspaceId ? response.data : ws,
            ),
          }));
          return response.data;
        } catch (error) {
          // Rollback
          set({
            currentWorkspace: previousWorkspace,
            workspaces: previousWorkspaces,
          });
          console.error("Update workspace error:", error);
          throw error;
        }
      },

      deleteWorkspace: async (workspaceId) => {
        const { fetchWithAuth } = await import("@/lib/api");
        try {
          await fetchWithAuth(`/workspaces/${workspaceId}`, {
            method: "DELETE",
          });
          set((state) => {
            const remaining = state.workspaces.filter(ws => ws.id !== workspaceId);
            return {
              workspaces: remaining,
              currentWorkspace: remaining.length > 0 ? remaining[0] : null
            };
          });
        } catch (error) {
          console.error("Delete workspace error:", error);
          throw error;
        }
      },

      fetchAnalytics: async (workspaceId) => {
        const { fetchWithAuth } = await import("@/lib/api");
        try {
          const response = await fetchWithAuth(`/workspaces/${workspaceId}/analytics`);
          return response.data;
        } catch (error) {
          console.error("Fetch analytics error:", error);
          throw error;
        }
      },

      fetchAuditLogs: async (workspaceId, params = {}) => {
        const { fetchWithAuth } = await import("@/lib/api");
        try {
          const query = new URLSearchParams(params).toString();
          const response = await fetchWithAuth(`/workspaces/${workspaceId}/audit-logs?${query}`);
          return response.data;
        } catch (error) {
          console.error("Fetch audit logs error:", error);
          throw error;
        }
      },

      exportAuditLogs: async (workspaceId, params = {}) => {
        const { API_URL } = await import("@/lib/api");
        const Cookies = (await import("js-cookie")).default;
        const token = Cookies.get("token");

        try {
          const query = new URLSearchParams(params).toString();
          const response = await fetch(`${API_URL || 'http://localhost:8020/api/v1'}/workspaces/${workspaceId}/audit-logs/export?${query}`, {
            headers: {
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          });
          
          if (!response.ok) throw new Error("Failed to export CSV");
          
          return await response.text();
        } catch (error) {
          console.error("Export audit logs error:", error);
          throw error;
        }
      },

      // Goals Actions
      fetchGoals: async (workspaceId) => {
        const { fetchWithAuth } = await import("@/lib/api");
        try {
          const response = await fetchWithAuth(`/workspaces/${workspaceId}/goals`);
          set({ goals: response.data });
          return response.data;
        } catch (error) {
          console.error("Fetch goals error:", error);
        }
      },

      createGoal: async (workspaceId, data) => {
        const { fetchWithAuth } = await import("@/lib/api");
        const previousGoals = get().goals;
        const tempId = `temp-${Date.now()}`;

        // Optimistic update
        const optimisticGoal = {
          ...data,
          id: tempId,
          createdAt: new Date().toISOString(),
          milestones: []
        };

        set((state) => ({
          goals: [...state.goals, optimisticGoal],
        }));

        try {
          const response = await fetchWithAuth(`/workspaces/${workspaceId}/goals`, {
            method: "POST",
            body: JSON.stringify(data),
          });
          set((state) => ({
            goals: state.goals.map(g => g.id === tempId ? response.data : g)
          }));
          return response.data;
        } catch (error) {
          // Rollback
          set({ goals: previousGoals });
          console.error("Create goal error:", error);
          throw error;
        }
      },

      updateGoal: async (workspaceId, goalId, data) => {
        const { fetchWithAuth } = await import("@/lib/api");
        const previousGoals = get().goals;

        // Optimistic update
        set((state) => ({
          goals: state.goals.map(g => g.id === goalId ? { ...g, ...data } : g)
        }));

        try {
          const response = await fetchWithAuth(`/workspaces/${workspaceId}/goals/${goalId}`, {
            method: "PATCH",
            body: JSON.stringify(data),
          });
          set((state) => ({
            goals: state.goals.map(g => g.id === goalId ? { ...g, ...response.data } : g)
          }));
          return response.data;
        } catch (error) {
          // Rollback
          set({ goals: previousGoals });
          console.error("Update goal error:", error);
          throw error;
        }
      },

      deleteGoal: async (workspaceId, goalId) => {
        const { fetchWithAuth } = await import("@/lib/api");
        const previousGoals = get().goals;

        // Optimistic update
        set((state) => ({
          goals: state.goals.filter(g => g.id !== goalId)
        }));

        try {
          await fetchWithAuth(`/workspaces/${workspaceId}/goals/${goalId}`, {
            method: "DELETE",
          });
        } catch (error) {
          // Rollback
          set({ goals: previousGoals });
          console.error("Delete goal error:", error);
          throw error;
        }
      },
    }),
    {
      name: "workspace-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
