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
    }),
    {
      name: "workspace-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
