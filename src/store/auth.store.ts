import { create } from "zustand";
import { getCurrentSession, signOutCognito } from "@/lib/auth";

interface AuthState {
  isAuthenticated: boolean;
  hasHydrated: boolean;
  userId: string | null;
  email: string | null;
  picture: string | null;
  hydrate: () => Promise<void>;
  setAuthenticated: (userId: string, email?: string | null, picture?: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  hasHydrated: false,
  userId: null,
  email: null,
  picture: null,

  hydrate: async () => {
    const session = await getCurrentSession();
    set({
      isAuthenticated: !!session,
      userId: session?.userId ?? null,
      email: session?.email ?? null,
      picture: session?.picture ?? null,
      hasHydrated: true,
    });
  },

  setAuthenticated: (userId, email, picture) => {
    set({ isAuthenticated: true, userId, email: email ?? null, picture: picture ?? null, hasHydrated: true });
  },

  logout: () => {
    signOutCognito();
    set({ isAuthenticated: false, userId: null, email: null, picture: null });
  },
}));
