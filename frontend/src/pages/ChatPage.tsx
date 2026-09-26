import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { useModelStore } from '../store/modelStore';
import { MessageItem } from '../components/chat/MessageItem';
import { ChatInput } from '../components/chat/ChatInput';
import { Bot, Sparkles, BookOpen, Brain, Shield, ChevronDown } from 'lucide-react';

export const ChatPage: React.FC = () => {
  const { messages, isStreaming, streamingMessageId, activeConversationId, conversations } = useChatStore();
  const { models, currentModel, selectModel } = useModelStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  return (
    <div className="flex-1 flex flex-col h-screen bg-background relative overflow-hidden">
      {/* Top Header */}
      <header className="h-14 border-b border-border/60 px-6 flex items-center justify-between bg-card/40 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-foreground truncate max-w-sm">
            {activeConv?.title || 'Personal Assistant'}
          </h2>
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
              className="appearance-none bg-secondary/60 hover:bg-secondary border border-border/60 text-xs font-mono py-1.5 pl-3 pr-8 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground transition-colors"
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

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto divide-y divide-border/20">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-foreground">How can I help you today?</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                PersonalGPT runs privately with local or cloud models, integrated long-term memory, RAG document knowledge, and tool execution.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 w-full text-left pt-2">
              <div className="p-3 rounded-lg bg-secondary/30 border border-border/40 text-xs space-y-1">
                <div className="font-medium text-foreground flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-primary" /> RAG Knowledge
                </div>
                <p className="text-[11px] text-muted-foreground">Upload PDFs or docs to ground responses in your private data.</p>
              </div>

              <div className="p-3 rounded-lg bg-secondary/30 border border-border/40 text-xs space-y-1">
                <div className="font-medium text-foreground flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-primary" /> Long-Term Memory
                </div>
                <p className="text-[11px] text-muted-foreground">Remembers user preferences, workflows, and facts across chats.</p>
              </div>
            </div>
          </div>
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
