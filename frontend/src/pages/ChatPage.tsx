import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { useModelStore } from '../store/modelStore';
import { MessageItem } from '../components/chat/MessageItem';
import { ChatInput } from '../components/chat/ChatInput';
import { WelcomeHero } from '../components/chat/WelcomeHero';
import { ChevronDown, Sparkles, Menu } from 'lucide-react';

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
  } = useChatStore();
  const { models, currentModel, currentProvider, selectModel } = useModelStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  return (
    <div className="flex-1 flex flex-col h-[100dvh] bg-background relative overflow-hidden">
      {/* Top Header */}
      <header className="h-14 border-b border-border/50 px-3 sm:px-6 flex items-center justify-between bg-card/50 backdrop-blur-xl z-10 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          {/* Mobile Hamburger Menu Toggle (Android / Small Screens) */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden p-2 -ml-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary active:scale-95 transition-all"
            title="Open conversations and menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="System Ready" />
          <h2 className="text-sm font-semibold text-foreground truncate max-w-[140px] xs:max-w-xs sm:max-w-sm">
            {activeConv?.title || 'MUmu AI Assistant'}
          </h2>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono text-muted-foreground bg-secondary/60 border border-border/40">
            <Sparkles className="w-2.5 h-2.5 text-primary" />
            AI Online
          </span>
        </div>

        {/* Model Selector Pill */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={currentModel}
              onChange={(e) => {
                const targetModel = models.find((m) => m.id === e.target.value);
                selectModel(e.target.value, targetModel?.provider);
              }}
              className="appearance-none bg-secondary/70 hover:bg-secondary border border-border/60 text-xs font-mono py-1.5 pl-3 pr-8 rounded-xl cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground transition-all shadow-xs"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.is_local ? 'Local' : 'Cloud'})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </header>

      {/* Messages Scroll Area / Unique Opening Interface */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto divide-y divide-border/20">
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
          messages.map((m) => (
            <MessageItem
              key={m.id}
              message={m}
              isStreaming={isStreaming && m.id === streamingMessageId}
            />
          ))
        )}
      </div>

      {/* Input Field */}
      <ChatInput />
    </div>
  );
};
