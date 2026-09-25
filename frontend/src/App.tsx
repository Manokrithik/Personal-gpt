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
  
  const { fetchConversations } = useChatStore();
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
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Persistent App Sidebar */}
      <Sidebar currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab as any)} />

      {/* Main Workspace Routed by Tab */}
      <main className="flex-1 flex overflow-hidden">
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
