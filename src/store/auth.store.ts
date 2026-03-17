import { create } from "zustand";
import { clearTokens, getSubFromToken, getToken, saveTokens } from "@/lib/auth";

interface AuthState {
  isAuthenticated: boolean;
  hasHydrated: boolean;
  userId: string | null;
  hydrate: () => void;
  setAuthenticated: (userId: string, idToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  hasHydrated: false,
  userId: null,

  hydrate: () => {
    const token = getToken();
    const userId = token ? getSubFromToken(token) : null;
    set({ isAuthenticated: !!userId, userId, hasHydrated: true });
  },

  setAuthenticated: (userId, idToken, refreshToken) => {
    saveTokens(idToken, refreshToken);
    set({ isAuthenticated: true, userId });
  },

  logout: () => {
    clearTokens();
    set({ isAuthenticated: false, userId: null });
  },
}));
