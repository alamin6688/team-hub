import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setUser: (user) => set({ user }),
      setAccessToken: (token) => set({ accessToken: token }),
      logout: () => set({ user: null, accessToken: null }),
      updateProfile: async (data) => {
        const { fetchWithAuth } = await import("@/lib/api");
        const response = await fetchWithAuth("/users/profile", {
          method: "PATCH",
          body: JSON.stringify(data),
        });
        set({ user: response.data });
        return response.data;
      },
      updateAvatar: async (file) => {
        const { fetchWithAuth } = await import("@/lib/api");
        const formData = new FormData();
        formData.append("avatar", file);

        const response = await fetchWithAuth("/users/avatar", {
          method: "POST",
          body: formData,
          // Note: fetchWithAuth might need to handle FormData (not setting Content-Type)
        });
        set({ user: response.data });
        return response.data;
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
