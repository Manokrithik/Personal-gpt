import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { useModelStore } from '../store/modelStore';
import { useThemeStore } from '../store/themeStore';
import { MessageItem } from '../components/chat/MessageItem';
import { ChatInput } from '../components/chat/ChatInput';
import { WelcomeHero } from '../components/chat/WelcomeHero';
import { ChevronDown, Sparkles, Menu, Frame, Hash, Layers, Maximize2, RefreshCw } from 'lucide-react';

export const ChatPage: React.FC = () => {
  const {
    messages,
    isStreaming,
    streamingMessageId,
    activeConversationId,
    conversations,
    sendMessage,
    setCameraModalOpen,
    setMobileSidebarOpen,
    fetchConversations,
    selectConversation,
  } = useChatStore();
  const { models, currentModel, currentProvider, selectModel } = useModelStore();
  const { currentTheme } = useThemeStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  return (
    <div
      className={`flex-1 flex flex-col h-full relative overflow-hidden transition-colors ${
        currentTheme.canvasPattern === 'dots'
          ? 'figma-canvas-grid'
          : currentTheme.canvasPattern === 'grid'
          ? 'figma-canvas-grid-square'
          : ''
      }`}
      style={{
        backgroundColor: currentTheme.chatBg || 'var(--theme-chat-bg, #1e1e1e)',
      }}
    >
      {/* Top Header Bar */}
      <header className="h-10 bg-[#242424] border-b border-[#383838] px-3 sm:px-4 flex items-center justify-between z-10 shrink-0 select-none">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden p-1.5 -ml-1 rounded text-[#888888] hover:text-white hover:bg-[#333333] transition-colors"
            title="Open chats"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Conversation Title & Status */}
          <div className="flex items-center gap-1.5 text-xs text-white">
            <Hash className="w-3.5 h-3.5 text-[#0d99ff] shrink-0" />
            <span className="font-medium truncate max-w-[140px] sm:max-w-xs">
              {activeConv?.title || 'Current Conversation'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[10px] text-[#888888] font-mono border-l border-[#383838] pl-2.5">
            <span>PersonalGPT</span>
            <span className="text-[#555]">•</span>
            <span className="text-emerald-400 font-medium">Online</span>
          </div>
        </div>

        {/* Model Selector & Refresh in Header */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded bg-[#1e1e1e] hover:bg-[#2c2c2c] border border-[#383838] hover:border-[#0d99ff] text-[#888888] hover:text-[#0d99ff] transition-all cursor-pointer shadow-xs active:scale-95"
            title="Reload page"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#0d99ff]' : ''}`} />
          </button>

          <div className="relative">
            <select
              value={currentModel}
              onChange={(e) => {
                const targetModel = models.find((m) => m.id === e.target.value);
                selectModel(e.target.value, targetModel?.provider);
              }}
              className="appearance-none bg-[#1e1e1e] hover:bg-[#2c2c2c] border border-[#383838] text-[11px] font-mono py-1 pl-2.5 pr-7 rounded cursor-pointer focus:outline-none focus:border-[#0d99ff] text-white transition-all shadow-xs"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.is_local ? 'Local' : 'Cloud'})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2 top-2 text-[#888888] pointer-events-none" />
          </div>
        </div>
      </header>

      {/* Main Artboard Scroll Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <div ref={scrollRef} className="flex-1 overflow-y-auto divide-y divide-[#2a2a2a] px-2 sm:px-4 py-2">
          {messages.length === 0 ? (
            <WelcomeHero
              onSelectPrompt={(prompt) => {
                sendMessage(prompt, {
                  model: currentModel,
                  provider: currentProvider,
                });
              }}
              onOpenCamera={() => setCameraModalOpen(true)}
            />
          ) : (
            <div className="max-w-4xl mx-auto w-full py-2 space-y-4">
              {messages.map((m) => (
                <MessageItem
                  key={m.id}
                  message={m}
                  isStreaming={isStreaming && m.id === streamingMessageId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Figma UI3 Floating Dock Input Area */}
        <ChatInput />
      </div>
    </div>
  );
};
