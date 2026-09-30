import React, { useState, useEffect } from 'react';
import {
  Search,
  MessageSquare,
  BookOpen,
  Cpu,
  LayoutDashboard,
  Settings as SettingsIcon,
  Plus,
  Moon,
  Sun,
  Download,
  Trash2,
  X,
  Sparkles,
  Command,
  LogIn,
  LogOut,
  User as UserIcon,
  Palette,
} from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { useModelStore } from '../../store/modelStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';

export interface FigmaCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
}

export const FigmaCommandPalette: React.FC<FigmaCommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
}) => {
  const [query, setQuery] = useState('');
  const { newChat, activeConversationId, deleteConversation } = useChatStore();
  const { models, currentModel, selectModel } = useModelStore();
  const { theme, setTheme } = useSettingsStore();
  const { isAuthenticated, user, openAuthModal, logout } = useAuthStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'auth_account',
      label: isAuthenticated
        ? `Account: ${user?.display_name || user?.username} (Switch / Register)`
        : 'Sign In to PersonalGPT Studio',
      category: 'Account',
      icon: isAuthenticated ? UserIcon : LogIn,
      shortcut: isAuthenticated ? 'Active' : '',
      action: () => {
        openAuthModal(isAuthenticated ? 'register' : 'login');
        onClose();
      },
    },
    ...(isAuthenticated
      ? [
          {
            id: 'auth_signout',
            label: 'Sign Out of PersonalGPT',
            category: 'Account',
            icon: LogOut,
            shortcut: '',
            action: () => {
              logout();
              onClose();
            },
          },
        ]
      : []),
    {
      id: 'new_chat',
      label: 'New Conversation Frame',
      category: 'Canvas',
      icon: Plus,
      shortcut: 'F',
      action: () => {
        newChat();
        onSelectTab('chat');
        onClose();
      },
    },
    {
      id: 'tab_chat',
      label: 'Go to Chat Canvas',
      category: 'Navigation',
      icon: MessageSquare,
      shortcut: 'Alt+1',
      action: () => {
        onSelectTab('chat');
        onClose();
      },
    },
    {
      id: 'tab_knowledge',
      label: 'Go to Knowledge Base (RAG)',
      category: 'Navigation',
      icon: BookOpen,
      shortcut: 'Alt+2',
      action: () => {
        onSelectTab('knowledge');
        onClose();
      },
    },
    {
      id: 'tab_models',
      label: 'Go to Model Management',
      category: 'Navigation',
      icon: Cpu,
      shortcut: 'Alt+3',
      action: () => {
        onSelectTab('models');
        onClose();
      },
    },
    {
      id: 'tab_dashboard',
      label: 'Go to System Dashboard',
      category: 'Navigation',
      icon: LayoutDashboard,
      shortcut: 'Alt+4',
      action: () => {
        onSelectTab('dashboard');
        onClose();
      },
    },
    {
      id: 'tab_settings',
      label: 'Go to Settings & Memory',
      category: 'Navigation',
      icon: SettingsIcon,
      shortcut: 'Alt+5',
      action: () => {
        onSelectTab('settings');
        onClose();
      },
    },
    {
      id: 'tab_theme',
      label: 'Theme & Canvas Colors (Custom Palette)',
      category: 'Navigation',
      icon: Palette,
      shortcut: 'Alt+6',
      action: () => {
        onSelectTab('theme');
        onClose();
      },
    },
    {
      id: 'toggle_theme',
      label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      category: 'Preferences',
      icon: theme === 'dark' ? Sun : Moon,
      shortcut: '',
      action: () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        onClose();
      },
    },
    ...models.map((m) => ({
      id: `model_${m.id}`,
      label: `Switch Model to ${m.name} (${m.provider})`,
      category: 'Models',
      icon: Cpu,
      shortcut: m.id === currentModel ? 'Active' : '',
      action: () => {
        selectModel(m.id, m.provider);
        onClose();
      },
    })),
  ];

  const filteredActions = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#222222] border border-[#383838] rounded-xl shadow-2xl overflow-hidden z-10 text-xs">
        {/* Search Input Bar */}
        <div className="flex items-center px-3.5 py-3 border-b border-[#383838] gap-2.5">
          <Search className="w-4 h-4 text-[#888888] shrink-0" />
          <input
            type="text"
            placeholder="Search commands, frames, and models..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white placeholder-[#777777] focus:outline-none text-xs"
            autoFocus
          />
          <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-[#1e1e1e] border border-[#383838] text-[10px] text-[#888888] font-mono">
            ESC
          </kbd>
        </div>

        {/* Actions List */}
        <div className="max-h-72 overflow-y-auto p-1.5 space-y-0.5">
          {filteredActions.length === 0 ? (
            <div className="p-4 text-center text-[#777777] text-xs">
              No matching commands or actions found.
            </div>
          ) : (
            filteredActions.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-[#0d99ff] hover:text-white text-[#cccccc] transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-3.5 h-3.5 text-[#888888] group-hover:text-white shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-[#777777] group-hover:text-white/80 font-medium">
                      {item.category}
                    </span>
                    {item.shortcut && (
                      <kbd className="px-1.5 py-0.5 rounded bg-[#1e1e1e] group-hover:bg-white/20 border border-[#383838] group-hover:border-transparent text-[9px] font-mono text-[#aaaaaa] group-hover:text-white">
                        {item.shortcut}
                      </kbd>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-3 py-2 border-t border-[#383838] bg-[#1a1a1a] flex items-center justify-between text-[10px] text-[#777777]">
          <span>Tip: Press <kbd className="font-mono text-[#aaaaaa]">F</kbd> for New Frame, <kbd className="font-mono text-[#aaaaaa]">T</kbd> for Text</span>
          <span>Figma UI3 Studio</span>
        </div>
      </div>
    </div>
  );
};
