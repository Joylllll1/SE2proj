import { create } from 'zustand';
import * as authService from '../services/authService';

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: true, // starts as true — checking stored token on mount
  error: null,

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      set({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true,
        loading: false,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  register: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.register(email, password);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      set({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true,
        loading: false,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // Even if the API call fails, clear local state
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  },

  restoreSession: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ loading: false, isAuthenticated: false });
      return;
    }

    set({ loading: true });
    try {
      const data = await authService.getMe();
      set({
        user: data.user,
        accessToken: token,
        isAuthenticated: true,
        loading: false,
      });
    } catch (err) {
      // Access token expired — try refresh
      if (err.status === 401) {
        try {
          const refreshData = await authService.refreshToken();
          localStorage.setItem('accessToken', refreshData.accessToken);
          localStorage.setItem('refreshToken', refreshData.refreshToken);

          // Retry fetching user with new token
          const data = await authService.getMe();
          set({
            user: data.user,
            accessToken: refreshData.accessToken,
            isAuthenticated: true,
            loading: false,
          });
          return;
        } catch {
          // Refresh also failed — clear everything
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  },
}));

export default useAuthStore;
