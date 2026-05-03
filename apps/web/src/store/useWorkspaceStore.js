import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useWorkspaceStore = create(
  persist(
    (set) => ({
      currentWorkspace: null,
      goals: [],
      announcements: [],
      actionItems: [],
      members: [],
      notificationsCount: 0,
      isLoading: false,

      setWorkspace: (workspace) => set({ currentWorkspace: workspace }),
      setGoals: (goals) => set({ goals }),
      setAnnouncements: (announcements) => set({ announcements }),
      setActionItems: (items) => set({ actionItems: items }),
      setMembers: (members) => set({ members }),
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
        try {
          const response = await fetchWithAuth(
            `/workspaces/${workspaceId}/action-items`,
            {
              method: "POST",
              body: JSON.stringify(data),
            },
          );
          // Update will be handled by socket or manually
          set((state) => ({
            actionItems: state.actionItems.some(ai => ai.id === response.data.id)
              ? state.actionItems
              : [response.data, ...state.actionItems],
          }));
          return response.data;
        } catch (error) {
          console.error("Create action item error:", error);
          throw error;
        }
      },

      updateActionItem: async (workspaceId, id, data) => {
        const { fetchWithAuth } = await import("@/lib/api");
        try {
          const response = await fetchWithAuth(
            `/workspaces/${workspaceId}/action-items/${id}`,
            {
              method: "PATCH",
              body: JSON.stringify(data),
            },
          );
          set((state) => ({
            actionItems: state.actionItems.map((item) =>
              item.id === id ? { ...item, ...response.data } : item,
            ),
          }));
          return response.data;
        } catch (error) {
          console.error("Update action item error:", error);
          throw error;
        }
      },

      deleteActionItem: async (workspaceId, id) => {
        const { fetchWithAuth } = await import("@/lib/api");
        try {
          await fetchWithAuth(`/workspaces/${workspaceId}/action-items/${id}`, {
            method: "DELETE",
          });
          set((state) => ({
            actionItems: state.actionItems.filter((item) => item.id !== id),
          }));
        } catch (error) {
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
        try {
          const response = await fetchWithAuth(
            `/workspaces/${workspaceId}/announcements`,
            {
              method: "POST",
              body: JSON.stringify(data),
            },
          );
          set((state) => ({
            announcements: state.announcements.some(a => a.id === response.data.id)
              ? state.announcements
              : [response.data, ...state.announcements],
          }));
          return response.data;
        } catch (error) {
          console.error("Create announcement error:", error);
          throw error;
        }
      },

      addReaction: async (workspaceId, announcementId, emoji) => {
        const { fetchWithAuth } = await import("@/lib/api");
        try {
          const response = await fetchWithAuth(
            `/workspaces/${workspaceId}/announcements/${announcementId}/reactions`,
            {
              method: "POST",
              body: JSON.stringify({ emoji }),
            },
          );
          // Socket will handle update
          return response.data;
        } catch (error) {
          console.error("Add reaction error:", error);
          throw error;
        }
      },

      addComment: async (workspaceId, announcementId, content) => {
        const { fetchWithAuth } = await import("@/lib/api");
        try {
          const response = await fetchWithAuth(
            `/workspaces/${workspaceId}/announcements/${announcementId}/comments`,
            {
              method: "POST",
              body: JSON.stringify({ content }),
            },
          );
          // Socket will handle update
          return response.data;
        } catch (error) {
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
        try {
          const response = await fetchWithAuth(`/workspaces/${workspaceId}/members/${userId}`, {
            method: "PATCH",
            body: JSON.stringify({ role }),
          });
          set((state) => ({
            members: state.members.map((m) => m.id === userId ? { ...m, role } : m),
          }));
          return response.data;
        } catch (error) {
          console.error("Update member role error:", error);
          throw error;
        }
      },

      removeMember: async (workspaceId, userId) => {
        const { fetchWithAuth } = await import("@/lib/api");
        try {
          await fetchWithAuth(`/workspaces/${workspaceId}/members/${userId}`, {
            method: "DELETE",
          });
          set((state) => ({
            members: state.members.filter((m) => m.id !== userId),
          }));
        } catch (error) {
          console.error("Remove member error:", error);
          throw error;
        }
      },

      blockMember: async (workspaceId, userId, isBlocked) => {
        const { fetchWithAuth } = await import("@/lib/api");
        try {
          const response = await fetchWithAuth(`/workspaces/${workspaceId}/members/${userId}/block`, {
            method: "PATCH",
            body: JSON.stringify({ isBlocked }),
          });
          set((state) => ({
            members: state.members.map((m) => m.id === userId ? { ...m, isBlocked } : m),
          }));
          return response.data;
        } catch (error) {
          console.error("Block member error:", error);
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
