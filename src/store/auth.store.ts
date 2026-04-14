import { create } from "zustand";
import { getCurrentSession, signOutCognito } from "@/lib/auth";

interface AuthState {
  isAuthenticated: boolean;
  hasHydrated:     boolean;
  userId:          string | null;
  hydrate:         () => Promise<void>;
  setAuthenticated:(userId: string) => void;
  logout:          () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  hasHydrated:     false,
  userId:          null,

  hydrate: async () => {
    const session = await getCurrentSession();
    set({
      isAuthenticated: !!session,
      userId:          session?.userId ?? null,
      hasHydrated:     true,
    });
  },

  setAuthenticated: (userId) => {
    set({ isAuthenticated: true, userId, hasHydrated: true });
  },

  logout: () => {
    signOutCognito();
    set({ isAuthenticated: false, userId: null });
  },
}));
