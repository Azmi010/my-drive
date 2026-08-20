import { create } from "zustand";
import { persist } from "zustand/middleware";

import { api, ApiError } from "@/lib/api";
import { getTokenCookie, removeTokenCookie, setTokenCookie } from "@/lib/cookies";
import type { AuthUser } from "@/lib/types";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      loading: false,

      async login(email, password) {
        set({ loading: true });
        try {
          const res = await api.login({ email, password });
          setTokenCookie(res.accessToken);
          set({ token: res.accessToken, user: res.user });
        } finally {
          set({ loading: false });
        }
      },

      async register(name, email, password) {
        set({ loading: true });
        try {
          const res = await api.register({ name, email, password });
          setTokenCookie(res.accessToken);
          set({ token: res.accessToken, user: res.user });
        } finally {
          set({ loading: false });
        }
      },

      logout() {
        removeTokenCookie();
        set({ token: null, user: null });
      },

      async fetchMe() {
        const token = get().token ?? getTokenCookie();
        if (!token) return;

        try {
          const user = await api.me(token);
          set({ token, user });
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            get().logout();
          }
        }
      },
    }),
    {
      name: "mydrive-auth",
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);
