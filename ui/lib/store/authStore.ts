import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  mobileNumber: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHydrated: (hydrated: boolean) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isUser: () => boolean;
  getDashboardPath: () => string;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isHydrated: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
      logout: () => set({ user: null, token: null, error: null }),
      isAdmin: () => {
        const roles = get().user?.roles || [];
        return roles.includes('OWNER') || roles.includes('ADMIN');
      },
      isUser: () => {
        const roles = get().user?.roles || [];
        return roles.includes('USER');
      },
      getDashboardPath: () => {
        const user = get().user;
        if (!user) return '/auth/login';

        const roles = user.roles || [];
        if (roles.includes('ADMIN')) return '/admin/dashboard';
        if (roles.includes('OWNER')) return '/owner/dashboard';
        return '/user/dashboard';
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
