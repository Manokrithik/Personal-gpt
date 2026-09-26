import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { ChatPage } from './pages/ChatPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { ModelsPage } from './pages/ModelsPage';
import { SettingsPage } from './pages/SettingsPage';
import { DashboardPage } from './pages/DashboardPage';
import { useChatStore } from './store/chatStore';
import { useModelStore } from './store/modelStore';
import { useSettingsStore } from './store/settingsStore';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'chat' | 'knowledge' | 'models' | 'settings' | 'dashboard'>('chat');
  
  const { fetchConversations, isMobileSidebarOpen, setMobileSidebarOpen } = useChatStore();
  const { fetchModels } = useModelStore();
  const { fetchSettings, fetchHealth, theme } = useSettingsStore();

  useEffect(() => {
    // Apply persisted theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Initialize application stores
    fetchConversations();
    fetchModels();
    fetchSettings();
    fetchHealth();
  }, []);

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background text-foreground font-sans relative">
      {/* Desktop Persistent Sidebar (Windows / Mac / Large Tablets) */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab as any)} />
      </div>

      {/* Mobile Slide-over Drawer Sidebar (Android / iPhone) */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop blur overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          {/* Drawer content */}
          <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl">
            <Sidebar
              currentTab={currentTab}
              onSelectTab={(tab) => {
                setCurrentTab(tab as any);
                setMobileSidebarOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Workspace Routed by Tab (Adapts dynamically to screen resolution) */}
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {currentTab === 'chat' && <ChatPage />}
        {currentTab === 'knowledge' && <KnowledgePage />}
        {currentTab === 'models' && <ModelsPage />}
        {currentTab === 'settings' && <SettingsPage />}
        {currentTab === 'dashboard' && <DashboardPage />}
      </main>
    </div>
  );
};

export default App;
