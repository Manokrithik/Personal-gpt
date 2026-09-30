import { create } from 'zustand';
import { User } from '../types';
import { authService } from '../services/auth';
import { useChatStore } from './chatStore';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';

  initAuth: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  register: (
    username: string,
    password: string,
    email?: string,
    displayName?: string,
    avatarColor?: string
  ) => Promise<boolean>;
  resetPassword: (username: string, newPassword: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    display_name?: string;
    email?: string;
    avatar_color?: string;
  }) => Promise<boolean>;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('personalgpt_token'),
  isAuthenticated: !!localStorage.getItem('personalgpt_token'),
  isLoading: false,
  error: null,
  isAuthModalOpen: false,
  authModalMode: 'login',

  initAuth: async () => {
    const token = localStorage.getItem('personalgpt_token');
    if (!token) {
      set({ user: null, isAuthenticated: false });
      useChatStore.getState().clearGuestHistory();
      return;
    }

    set({ isLoading: true });
    try {
      const user = await authService.getMe();
      set({ user, isAuthenticated: true, isLoading: false, error: null });
      await useChatStore.getState().fetchConversations();
    } catch (e: any) {
      console.warn('Session expired or invalid token:', e);
      localStorage.removeItem('personalgpt_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      useChatStore.getState().clearGuestHistory();
    }
  },

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const resp = await authService.login(username, password);
      set({
        token: resp.access_token,
        user: resp.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isAuthModalOpen: false,
      });
      await useChatStore.getState().fetchConversations();
      return true;
    } catch (e: any) {
      const msg = typeof e?.message === 'string' ? e.message : 'Login failed. Please check your credentials.';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  register: async (
    username: string,
    password: string,
    email?: string,
    displayName?: string,
    avatarColor?: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const resp = await authService.register(username, password, email, displayName, avatarColor);
      set({
        token: resp.access_token,
        user: resp.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isAuthModalOpen: false,
      });
      await useChatStore.getState().fetchConversations();
      return true;
    } catch (e: any) {
      const msg = typeof e?.message === 'string' ? e.message : 'Registration failed. Username may already exist.';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  resetPassword: async (username: string, newPassword: string) => {
    set({ isLoading: true, error: null });
    try {
      const resp = await authService.resetPassword(username, newPassword);
      set({
        token: resp.access_token,
        user: resp.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isAuthModalOpen: false,
      });
      await useChatStore.getState().fetchConversations();
      return true;
    } catch (e: any) {
      const msg = typeof e?.message === 'string' ? e.message : 'Password reset failed.';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('personalgpt_token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      useChatStore.getState().clearGuestHistory();
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await authService.updateProfile(data);
      set({ user: updated, isLoading: false });
      return true;
    } catch (e: any) {
      set({ error: e?.message || 'Failed to update profile', isLoading: false });
      return false;
    }
  },

  openAuthModal: (mode = 'login') => {
    set({ isAuthModalOpen: true, authModalMode: mode, error: null });
  },

  closeAuthModal: () => {
    set({ isAuthModalOpen: false, error: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
