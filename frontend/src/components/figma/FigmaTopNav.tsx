import React, { useState } from 'react';
import {
  MousePointer2,
  Frame,
  Type,
  Component,
  Sparkles,
  MessageSquare,
  Hand,
  Play,
  Share2,
  ChevronDown,
  Sun,
  Moon,
  PanelRight,
  Sliders,
  Check,
  Download,
  FolderOpen,
  Plus,
  Trash2,
  User as UserIcon,
  LogIn,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';

export interface FigmaTopNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeTool: 'select' | 'frame' | 'text' | 'component' | 'ai' | 'comment' | 'hand';
  setActiveTool: (tool: 'select' | 'frame' | 'text' | 'component' | 'ai' | 'comment' | 'hand') => void;
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
  isRightPanelOpen: boolean;
  setIsRightPanelOpen: (open: boolean) => void;
  isFocusMode: boolean;
  setIsFocusMode: (focus: boolean) => void;
  onOpenShareModal: () => void;
  onOpenCommandPalette: () => void;
}

export const FigmaTopNav: React.FC<FigmaTopNavProps> = ({
  currentTab,
  onSelectTab,
  activeTool,
  setActiveTool,
  zoomLevel,
  setZoomLevel,
  isRightPanelOpen,
  setIsRightPanelOpen,
  isFocusMode,
  setIsFocusMode,
  onOpenShareModal,
  onOpenCommandPalette,
}) => {
  const { theme, setTheme } = useSettingsStore();
  const { activeConversationId, conversations, newChat, deleteConversation } = useChatStore();
  const { user, isAuthenticated, logout, openAuthModal } = useAuthStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isZoomMenuOpen, setIsZoomMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  const zoomOptions = [50, 75, 90, 100, 110, 125, 150];

  return (
    <header className="h-11 bg-[#2c2c2c] text-[#f5f5f5] border-b border-[#383838] flex items-center justify-between px-2.5 z-40 select-none text-xs shrink-0 shadow-sm relative">
      {/* LEFT: Figma Logo & Document Title */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Figma 4-color Logo Button */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-7 h-7 rounded hover:bg-[#383838] flex items-center justify-center transition-colors"
            title="Main Menu (Ctrl + /)"
          >
            <svg className="w-4 h-5" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EA4C1D" d="M19 0H9.5C4.253 0 0 4.253 0 9.5S4.253 19 9.5 19H19V0z" />
              <path fill="#F24E1E" d="M19 0h9.5C33.747 0 38 4.253 38 9.5S33.747 19 28.5 19H19V0z" />
              <path fill="#A259FF" d="M0 28.5C0 23.253 4.253 19 9.5 19H19v19H9.5C4.253 38 0 33.747 0 28.5z" />
              <path fill="#1ABCFE" d="M19 19h9.5c5.247 0 9.5 4.253 9.5 9.5s-4.253 9.5-9.5 9.5H19V19z" />
              <path fill="#0ACF83" d="M0 47.5C0 42.253 4.253 38 9.5 38H19v9.5c0 5.247-4.253 9.5-9.5 9.5S0 52.747 0 47.5z" />
            </svg>
          </button>

          {/* Figma Dropdown Menu */}
          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
              <div className="absolute top-9 left-0 w-56 bg-[#222222] border border-[#383838] rounded-md shadow-2xl py-1.5 z-50 text-[11px] font-normal">
                <div className="px-3 py-1.5 text-[#757575] font-semibold text-[10px] uppercase tracking-wider">
                  PersonalGPT Studio
                </div>
                <button
                  onClick={() => {
                    newChat();
                    onSelectTab('chat');
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-3.5 h-3.5" />
                    New Conversation Frame
                  </span>
                  <span className="text-[#888] hover:text-white font-mono text-[10px]">F</span>
                </button>

                <button
                  onClick={() => {
                    onOpenCommandPalette();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5" />
                    Quick Actions...
                  </span>
                  <span className="text-[#888] hover:text-white font-mono text-[10px]">Ctrl+K</span>
                </button>

                <div className="my-1 border-t border-[#383838]" />

                <button
                  onClick={() => {
                    onSelectTab('knowledge');
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white transition-colors"
                >
                  <Component className="w-3.5 h-3.5" />
                  RAG Component Library
                </button>

                <button
                  onClick={() => {
                    onSelectTab('models');
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white transition-colors"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Model Manager
                </button>

                <div className="my-1 border-t border-[#383838]" />

                <button
                  onClick={() => {
                    onOpenShareModal();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Conversation (JSON / MD)
                </button>

                {activeConversationId && (
                  <button
                    onClick={() => {
                      if (confirm('Delete current active chat frame?')) {
                        deleteConversation(activeConversationId);
                      }
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Active Frame
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* File / Canvas Title */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-medium text-[#f5f5f5] truncate max-w-[180px] sm:max-w-xs hover:bg-[#383838] px-1.5 py-0.5 rounded cursor-pointer transition-colors" title="Double click to rename in Layers">
            {activeConv?.title || 'PersonalGPT / AI Canvas'}
          </span>
          <span className="text-[10px] text-[#888888] font-mono px-1.5 py-0.2 rounded bg-[#202020] border border-[#383838] hidden sm:inline-block">
            Draft
          </span>
        </div>
      </div>

      {/* CENTER: Iconic Figma Toolbar Dock */}
      <div className="hidden md:flex items-center bg-[#222222] border border-[#383838] rounded-md p-0.5 gap-0.5 shadow-inner">
        <button
          onClick={() => setActiveTool('select')}
          className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
            activeTool === 'select' ? 'bg-[#0d99ff] text-white' : 'text-[#b3b3b3] hover:text-white hover:bg-[#333333]'
          }`}
          title="Move Tool (V)"
        >
          <MousePointer2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => {
            setActiveTool('frame');
            newChat();
            onSelectTab('chat');
          }}
          className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
            activeTool === 'frame' ? 'bg-[#0d99ff] text-white' : 'text-[#b3b3b3] hover:text-white hover:bg-[#333333]'
          }`}
          title="Frame / New Chat (F)"
        >
          <Frame className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => {
            setActiveTool('component');
            onSelectTab('knowledge');
          }}
          className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
            activeTool === 'component' || currentTab === 'knowledge' ? 'bg-[#0d99ff] text-white' : 'text-[#b3b3b3] hover:text-white hover:bg-[#333333]'
          }`}
          title="Components / RAG Knowledge (Alt + 2)"
        >
          <Component className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => {
            setActiveTool('text');
            onSelectTab('chat');
          }}
          className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
            activeTool === 'text' ? 'bg-[#0d99ff] text-white' : 'text-[#b3b3b3] hover:text-white hover:bg-[#333333]'
          }`}
          title="Text / Prompt Tool (T)"
        >
          <Type className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-[#383838] mx-0.5" />

        {/* Figma AI Sparkle tool button */}
        <button
          onClick={() => {
            setActiveTool('ai');
            onOpenCommandPalette();
          }}
          className={`px-2 h-7 rounded flex items-center gap-1.5 transition-all text-xs font-medium ${
            activeTool === 'ai'
              ? 'bg-gradient-to-r from-[#9747ff] to-[#0d99ff] text-white shadow-sm'
              : 'text-[#e0e0e0] hover:bg-[#333333] hover:text-white'
          }`}
          title="Figma AI Assistant (Ctrl + K)"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#a259ff] animate-pulse" />
          <span className="font-semibold text-[11px]">AI Copilot</span>
        </button>

        <div className="w-[1px] h-4 bg-[#383838] mx-0.5" />

        <button
          onClick={() => {
            setActiveTool('comment');
            onSelectTab('chat');
          }}
          className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
            activeTool === 'comment' ? 'bg-[#0d99ff] text-white' : 'text-[#b3b3b3] hover:text-white hover:bg-[#333333]'
          }`}
          title="Comment / Feedback (C)"
        >
          <MessageSquare className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setActiveTool('hand')}
          className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
            activeTool === 'hand' ? 'bg-[#0d99ff] text-white' : 'text-[#b3b3b3] hover:text-white hover:bg-[#333333]'
          }`}
          title="Hand / Pan Tool (H)"
        >
          <Hand className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* RIGHT: Multiplayer, Present, Share, Zoom, and Inspector Toggle */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Figma Multiplayer Collaborator Avatars & Account Profile */}
        <div className="flex items-center gap-1.5 pr-1">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-1.5 p-1 rounded-md hover:bg-[#383838] transition-colors group"
                title={`${user.display_name || user.username} (${user.email || 'Studio User'})`}
              >
                <div
                  className="w-6 h-6 rounded-full border-2 border-[#2c2c2c] flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-white/10 group-hover:ring-[#0d99ff]"
                  style={{ backgroundColor: user.avatar_color || '#0d99ff' }}
                >
                  {(user.display_name || user.username).slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:inline-block max-w-[90px] truncate text-[11px] font-medium text-[#cccccc] group-hover:text-white">
                  {user.display_name || user.username}
                </span>
                <ChevronDown className="w-3 h-3 text-[#888888] group-hover:text-white hidden sm:block" />
              </button>

              {/* Profile dropdown menu */}
              {isProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-9 w-60 bg-[#222222] border border-[#383838] rounded-lg shadow-2xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-[#383838]">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                          style={{ backgroundColor: user.avatar_color || '#0d99ff' }}
                        >
                          {(user.display_name || user.username).slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-white truncate text-xs">
                            {user.display_name || user.username}
                          </div>
                          <div className="text-[10px] text-[#888888] truncate">
                            @{user.username} {user.email ? `• ${user.email}` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded bg-[#1e1e1e] border border-[#333333] text-[10px] text-emerald-400">
                        <ShieldCheck className="w-3 h-3" />
                        <span>JWT Authenticated Session</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          openAuthModal('register');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[#cccccc] hover:bg-[#0d99ff] hover:text-white transition-colors"
                      >
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>Create / Switch Account</span>
                      </button>

                      <button
                        onClick={async () => {
                          setIsProfileMenuOpen(false);
                          await logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>

                    {/* Connected Engines (AI Engine & Knowledge Base) moved neatly into account menu */}
                    <div className="px-3 py-2 border-t border-[#383838] bg-[#191919]">
                      <div className="text-[9px] uppercase font-bold text-[#777777] mb-1 tracking-wider">
                        Workspace Engines
                      </div>
                      <div className="space-y-1 text-[10px]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#00b574]" />
                            <span className="text-[#cccccc]">AI Engine</span>
                          </div>
                          <span className="text-[9px] text-emerald-400 font-mono font-semibold">Active</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#9747ff]" />
                            <span className="text-[#cccccc]">Knowledge Base (KB)</span>
                          </div>
                          <span className="text-[9px] text-purple-400 font-mono font-semibold">Ready</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="h-7 px-2.5 rounded bg-[#383838] hover:bg-[#0d99ff] text-white font-medium text-[11px] flex items-center gap-1.5 transition-colors shadow-sm"
              title="Sign in to your PersonalGPT account"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>

        {/* Figma Presentation / Focus Mode ▶ */}
        <button
          onClick={() => setIsFocusMode(!isFocusMode)}
          className={`h-7 px-2 sm:px-2.5 rounded flex items-center gap-1 font-medium transition-colors ${
            isFocusMode ? 'bg-[#0d99ff] text-white' : 'hover:bg-[#383838] text-[#e0e0e0]'
          }`}
          title={isFocusMode ? 'Exit Presentation Mode (Esc)' : 'Present / Full Canvas Focus (Ctrl + \\)'}
        >
          <Play className="w-3 h-3 fill-current" />
          <span className="hidden sm:inline text-[11px]">{isFocusMode ? 'Exit' : 'Present'}</span>
        </button>

        {/* Figma Iconic Blue Share Button */}
        <button
          onClick={onOpenShareModal}
          className="h-7 px-3 rounded bg-[#0d99ff] hover:bg-[#007be5] text-white font-semibold text-[11px] flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          title="Share canvas & export chat"
        >
          <Share2 className="w-3 h-3" />
          <span>Share</span>
        </button>

        {/* Zoom Dropdown */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setIsZoomMenuOpen(!isZoomMenuOpen)}
            className="h-7 px-2 rounded hover:bg-[#383838] text-[#cccccc] flex items-center gap-1 font-mono text-[11px] transition-colors"
            title="Zoom settings"
          >
            <span>{zoomLevel}%</span>
            <ChevronDown className="w-3 h-3 text-[#888888]" />
          </button>

          {isZoomMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsZoomMenuOpen(false)} />
              <div className="absolute right-0 top-8 w-28 bg-[#222222] border border-[#383838] rounded-md shadow-2xl py-1 z-50 text-[11px] font-mono">
                {zoomOptions.map((z) => (
                  <button
                    key={z}
                    onClick={() => {
                      setZoomLevel(z);
                      setIsZoomMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1 text-left hover:bg-[#0d99ff] hover:text-white transition-colors ${
                      zoomLevel === z ? 'text-[#0d99ff] font-bold' : 'text-[#cccccc]'
                    }`}
                  >
                    <span>{z}%</span>
                    {zoomLevel === z && <Check className="w-3 h-3" />}
                  </button>
                ))}
                <div className="my-1 border-t border-[#383838]" />
                <button
                  onClick={() => {
                    setZoomLevel(100);
                    setIsZoomMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-1 text-left text-[#cccccc] hover:bg-[#0d99ff] hover:text-white transition-colors"
                >
                  Reset (100%)
                </button>
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-7 h-7 rounded hover:bg-[#383838] text-[#b3b3b3] hover:text-white flex items-center justify-center transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Canvas`}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Toggle Inspector / Design Panel */}
        <button
          onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
          className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
            isRightPanelOpen ? 'bg-[#383838] text-white' : 'text-[#b3b3b3] hover:text-white hover:bg-[#383838]'
          }`}
          title="Toggle Properties Panel"
        >
          <PanelRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
