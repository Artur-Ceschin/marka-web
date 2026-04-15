import { create } from "zustand";
import { getCurrentSession, signOutCognito } from "@/lib/auth";

interface AuthState {
  isAuthenticated: boolean;
  hasHydrated: boolean;
  userId: string | null;
  email: string | null;
  hydrate: () => Promise<void>;
  setAuthenticated: (userId: string, email?: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  hasHydrated: false,
  userId: null,
  email: null,

  hydrate: async () => {
    const session = await getCurrentSession();
    set({
      isAuthenticated: !!session,
      userId: session?.userId ?? null,
      email: session?.email ?? null,
      hasHydrated: true,
    });
  },

  setAuthenticated: (userId, email) => {
    set({ isAuthenticated: true, userId, email: email ?? null, hasHydrated: true });
  },

  logout: () => {
    signOutCognito();
    set({ isAuthenticated: false, userId: null, email: null });
  },
}));
