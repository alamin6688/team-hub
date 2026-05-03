import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
    }),
    {
      name: 'workspace-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
