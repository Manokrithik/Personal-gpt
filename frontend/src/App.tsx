import React, { useState, useEffect } from 'react';
import { FigmaTopNav } from './components/figma/FigmaTopNav';
import { FigmaLeftPanel } from './components/figma/FigmaLeftPanel';
import { FigmaRightPanel } from './components/figma/FigmaRightPanel';
import { FigmaShareModal } from './components/figma/FigmaShareModal';
import { FigmaCommandPalette } from './components/figma/FigmaCommandPalette';
import { FigmaAuthModal } from './components/figma/FigmaAuthModal';
import { ChatPage } from './pages/ChatPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { ModelsPage } from './pages/ModelsPage';
import { SettingsPage } from './pages/SettingsPage';
import { DashboardPage } from './pages/DashboardPage';
import { ThemePage } from './pages/ThemePage';
import { useChatStore } from './store/chatStore';
import { useModelStore } from './store/modelStore';
import { useSettingsStore } from './store/settingsStore';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { X } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'chat' | 'knowledge' | 'models' | 'settings' | 'dashboard' | 'theme'>('chat');
  const [activeTool, setActiveTool] = useState<'select' | 'frame' | 'text' | 'component' | 'ai' | 'comment' | 'hand'>('select');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  const { fetchConversations, isMobileSidebarOpen, setMobileSidebarOpen, newChat } = useChatStore();
  const { fetchModels } = useModelStore();
  const { fetchSettings, fetchHealth, theme } = useSettingsStore();
  const { initAuth } = useAuthStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    // Apply persisted theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Initialize application stores, authentication session, and custom studio themes
    initTheme();
    initAuth();
    fetchModels();
    fetchSettings();
    fetchHealth();
  }, []);

  // Global Figma keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing inside input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'v') {
        setActiveTool('select');
      } else if (e.key.toLowerCase() === 'f') {
        setActiveTool('frame');
        newChat();
        setCurrentTab('chat');
      } else if (e.key.toLowerCase() === 't') {
        setActiveTool('text');
        setCurrentTab('chat');
      } else if (e.key.toLowerCase() === 'h') {
        setActiveTool('hand');
      } else if (e.key.toLowerCase() === 'c') {
        setActiveTool('comment');
      } else if (e.key === 'Escape') {
        if (isFocusMode) setIsFocusMode(false);
      } else if (e.altKey && e.key === '1') {
        setCurrentTab('chat');
      } else if (e.altKey && e.key === '2') {
        setCurrentTab('knowledge');
      } else if (e.altKey && e.key === '3') {
        setCurrentTab('models');
      } else if (e.altKey && e.key === '4') {
        setCurrentTab('dashboard');
      } else if (e.altKey && e.key === '5') {
        setCurrentTab('settings');
      } else if (e.altKey && e.key === '6') {
        setCurrentTab('theme');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode, newChat]);

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-[#1e1e1e] text-[#f5f5f5] font-sans relative">
      {/* Global Figma Top Navigation Header */}
      {!isFocusMode && (
        <FigmaTopNav
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab as any)}
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
          isRightPanelOpen={isRightPanelOpen}
          setIsRightPanelOpen={setIsRightPanelOpen}
          isFocusMode={isFocusMode}
          setIsFocusMode={setIsFocusMode}
          onOpenShareModal={() => setIsShareModalOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />
      )}

      {/* Main Workspace Body */}
      <div className="flex-1 flex w-full overflow-hidden relative">
        {/* Desktop Figma Left Panel (Layers & Pages) */}
        {!isFocusMode && (
          <div className="hidden md:flex h-full shrink-0">
            <FigmaLeftPanel
              currentTab={currentTab}
              onSelectTab={(tab) => setCurrentTab(tab as any)}
            />
          </div>
        )}

        {/* Mobile Slide-over Drawer */}
        {isMobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl">
              <FigmaLeftPanel
                currentTab={currentTab}
                onSelectTab={(tab) => {
                  setCurrentTab(tab as any);
                  setMobileSidebarOpen(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Center Figma Canvas (Transform with Zoom Level) */}
        <main
          className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-[#1e1e1e] relative"
          style={{
            zoom: zoomLevel !== 100 ? `${zoomLevel}%` : undefined,
          }}
        >
          {currentTab === 'chat' && <ChatPage />}
          {currentTab === 'knowledge' && <KnowledgePage />}
          {currentTab === 'models' && <ModelsPage />}
          {currentTab === 'settings' && <SettingsPage />}
          {currentTab === 'dashboard' && <DashboardPage />}
          {currentTab === 'theme' && <ThemePage />}

          {/* Floating Exit Focus Mode Button */}
          {isFocusMode && (
            <button
              onClick={() => setIsFocusMode(false)}
              className="absolute top-4 right-4 z-50 px-3 py-1.5 rounded-full bg-[#2c2c2c]/90 hover:bg-[#383838] border border-[#444444] text-xs font-medium text-white shadow-xl flex items-center gap-1.5 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              <span>Exit Present (Esc)</span>
            </button>
          )}
        </main>

        {/* Desktop Figma Right Panel (Design / Prototype / Inspect) */}
        {!isFocusMode && isRightPanelOpen && (
          <div className="hidden xl:flex h-full shrink-0">
            <FigmaRightPanel currentTab={currentTab} />
          </div>
        )}
      </div>

      {/* Share & Export Modal */}
      <FigmaShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Command Palette (Ctrl+K) */}
      <FigmaCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={(tab) => setCurrentTab(tab as any)}
      />

      {/* Figma Authentication Modal (Sign In / Register / Demo) */}
      <FigmaAuthModal />
    </div>
  );
};

export default App;
