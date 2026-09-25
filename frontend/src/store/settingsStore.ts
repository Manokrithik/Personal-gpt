import { create } from 'zustand';
import { AppSettings, SystemHealth, MemoryItem } from '../types';
import { settingsService } from '../services/settings';
import { memoryService } from '../services/memory';

interface SettingsState {
  settings: AppSettings | null;
  health: SystemHealth | null;
  memories: MemoryItem[];
  theme: 'dark' | 'light';
  isLoading: boolean;

  fetchSettings: () => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  fetchHealth: () => Promise<void>;
  fetchMemories: () => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  clearAllMemories: () => Promise<void>;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  health: null,
  memories: [],
  theme: (localStorage.getItem('personalgpt-theme') as 'dark' | 'light') || 'dark',
  isLoading: false,

  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const s = await settingsService.getSettings();
      set({ settings: s, isLoading: false });
    } catch (e) {
      console.error('Failed to load settings', e);
      set({ isLoading: false });
    }
  },

  updateSettings: async (updates) => {
    try {
      const s = await settingsService.updateSettings(updates);
      set({ settings: s });
    } catch (e) {
      console.error('Failed to update settings', e);
    }
  },

  fetchHealth: async () => {
    try {
      const h = await settingsService.checkHealth();
      set({ health: h });
    } catch (e) {
      console.error('Failed to check health', e);
    }
  },

  fetchMemories: async () => {
    try {
      const mems = await memoryService.listMemories();
      set({ memories: mems });
    } catch (e) {
      console.error('Failed to fetch memories', e);
    }
  },

  deleteMemory: async (id: string) => {
    try {
      await memoryService.deleteMemory(id);
      set((state) => ({
        memories: state.memories.filter((m) => m.id !== id),
      }));
    } catch (e) {
      console.error('Failed to delete memory', e);
    }
  },

  clearAllMemories: async () => {
    try {
      await memoryService.clearAll();
      set({ memories: [] });
    } catch (e) {
      console.error('Failed to clear memories', e);
    }
  },

  setTheme: (theme: 'dark' | 'light') => {
    localStorage.setItem('personalgpt-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },
}));
