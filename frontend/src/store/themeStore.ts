import { create } from 'zustand';

export interface CustomTheme {
  id: string;
  name: string;
  appAccent: string;       // Brand & active accents
  appBg: string;           // Overall studio canvas background
  chatBg: string;          // Chat frame background
  userBubbleBg: string;    // User chat bubble background
  userText: string;        // User chat text color
  aiBubbleBg: string;      // AI response card background
  aiText: string;          // AI response text color
  borderColor: string;     // Borders & separators
  canvasPattern: 'dots' | 'grid' | 'none';
}

export const PRESET_THEMES: CustomTheme[] = [
  {
    id: 'figma-dark',
    name: 'Figma Studio Pro (Perfect)',
    appAccent: '#0d99ff',
    appBg: '#16171a',
    chatBg: '#1a1c21',
    userBubbleBg: '#242832',
    userText: '#ffffff',
    aiBubbleBg: '#1e2128',
    aiText: '#f1f3f7',
    borderColor: '#2f3440',
    canvasPattern: 'dots',
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    appAccent: '#00f0ff',
    appBg: '#08090f',
    chatBg: '#0d0f18',
    userBubbleBg: '#1c1538',
    userText: '#ff77e9',
    aiBubbleBg: '#0f1f2e',
    aiText: '#00f0ff',
    borderColor: '#262940',
    canvasPattern: 'grid',
  },
  {
    id: 'midnight-oled',
    name: 'Midnight Pure OLED',
    appAccent: '#a855f7',
    appBg: '#000000',
    chatBg: '#050505',
    userBubbleBg: '#161618',
    userText: '#ffffff',
    aiBubbleBg: '#101012',
    aiText: '#e4e4e7',
    borderColor: '#26262a',
    canvasPattern: 'none',
  },
  {
    id: 'nordic-frost',
    name: 'Nordic Frost',
    appAccent: '#88c0d0',
    appBg: '#242933',
    chatBg: '#2e3440',
    userBubbleBg: '#3b4252',
    userText: '#eceff4',
    aiBubbleBg: '#434c5e',
    aiText: '#e5e9f0',
    borderColor: '#4c566a',
    canvasPattern: 'dots',
  },
  {
    id: 'warm-amber',
    name: 'Warm Espresso & Gold',
    appAccent: '#f59e0b',
    appBg: '#141210',
    chatBg: '#1a1715',
    userBubbleBg: '#26221f',
    userText: '#fef3c7',
    aiBubbleBg: '#201d1a',
    aiText: '#fef9c3',
    borderColor: '#3d3731',
    canvasPattern: 'dots',
  },
  {
    id: 'emerald-matrix',
    name: 'Emerald Matrix',
    appAccent: '#10b981',
    appBg: '#041711',
    chatBg: '#062118',
    userBubbleBg: '#0a3325',
    userText: '#d1fae5',
    aiBubbleBg: '#082b1f',
    aiText: '#ecfdf5',
    borderColor: '#114633',
    canvasPattern: 'dots',
  },
  {
    id: 'clean-light',
    name: 'Minimalist Clean Light',
    appAccent: '#0d99ff',
    appBg: '#f3f4f6',
    chatBg: '#ffffff',
    userBubbleBg: '#0d99ff',
    userText: '#ffffff',
    aiBubbleBg: '#f9fafb',
    aiText: '#111827',
    borderColor: '#e5e7eb',
    canvasPattern: 'dots',
  },
];

interface ThemeState {
  currentTheme: CustomTheme;
  isCustomized: boolean;

  applyTheme: (theme: CustomTheme) => void;
  updateColor: (key: keyof Omit<CustomTheme, 'id' | 'name' | 'canvasPattern'>, color: string) => void;
  setPattern: (pattern: 'dots' | 'grid' | 'none') => void;
  selectPreset: (presetId: string) => void;
  resetToDefault: () => void;
  initTheme: () => void;
}

const STORAGE_KEY = 'personalgpt_custom_theme';

function applyCssVariables(t: CustomTheme) {
  const root = document.documentElement;
  root.style.setProperty('--theme-app-accent', t.appAccent);
  root.style.setProperty('--theme-app-bg', t.appBg);
  root.style.setProperty('--theme-chat-bg', t.chatBg);
  root.style.setProperty('--theme-user-bubble-bg', t.userBubbleBg);
  root.style.setProperty('--theme-user-text', t.userText);
  root.style.setProperty('--theme-ai-bubble-bg', t.aiBubbleBg);
  root.style.setProperty('--theme-ai-text', t.aiText);
  root.style.setProperty('--theme-border', t.borderColor);
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  currentTheme: PRESET_THEMES[0],
  isCustomized: false,

  initTheme: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.appAccent) {
          applyCssVariables(parsed);
          set({ currentTheme: parsed, isCustomized: parsed.id === 'custom' });
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved theme:', e);
    }
    applyCssVariables(PRESET_THEMES[0]);
  },

  applyTheme: (theme: CustomTheme) => {
    applyCssVariables(theme);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
    set({ currentTheme: theme, isCustomized: theme.id === 'custom' });
  },

  updateColor: (key, color) => {
    const { currentTheme } = get();
    const updated: CustomTheme = {
      ...currentTheme,
      id: 'custom',
      name: 'Custom Theme',
      [key]: color,
    };
    applyCssVariables(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ currentTheme: updated, isCustomized: true });
  },

  setPattern: (pattern) => {
    const { currentTheme } = get();
    const updated: CustomTheme = {
      ...currentTheme,
      canvasPattern: pattern,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ currentTheme: updated });
  },

  selectPreset: (presetId: string) => {
    const preset = PRESET_THEMES.find((p) => p.id === presetId);
    if (preset) {
      applyCssVariables(preset);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preset));
      set({ currentTheme: preset, isCustomized: false });
    }
  },

  resetToDefault: () => {
    const defaultTheme = PRESET_THEMES[0];
    applyCssVariables(defaultTheme);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTheme));
    set({ currentTheme: defaultTheme, isCustomized: false });
  },
}));
