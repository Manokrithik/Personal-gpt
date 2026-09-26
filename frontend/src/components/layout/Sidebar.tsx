import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  BookOpen,
  Cpu,
  Settings as SettingsIcon,
  LayoutDashboard,
  Trash2,
  Pin,
  Edit2,
  Check,
  X,
  Database,
  Moon,
  Sun,
  ShieldCheck
} from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { useSettingsStore } from '../../store/settingsStore';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const {
    conversations,
    activeConversationId,
    selectConversation,
    newChat,
    deleteConversation,
    updateConversationTitle,
    togglePinConversation,
  } = useChatStore();

  const { theme, setTheme, health } = useSettingsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinned = filteredConversations.filter((c) => c.is_pinned);
  const recent = filteredConversations.filter((c) => !c.is_pinned);

  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      updateConversationTitle(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      deleteConversation(id);
    }
  };

  const handleTogglePin = (id: string, isPinned: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    togglePinConversation(id, !isPinned);
  };

  return (
    <aside className="w-72 bg-card/60 backdrop-blur-xl border-r border-border flex flex-col h-screen select-none">
      {/* Brand & New Chat */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-cyan-400 p-[1.5px] shadow-sm">
              <div className="w-full h-full rounded-[10px] bg-card flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5">
                PersonalGPT
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                  Private
                </span>
              </h1>
            </div>
          </div>
          
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <button
          onClick={() => {
            onSelectTab('chat');
            newChat();
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs flex items-center justify-center gap-2 shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Conversation
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-3 pt-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground/70"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {pinned.length > 0 && (
          <div>
            <div className="px-2 pb-1 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
              Pinned
            </div>
            <div className="space-y-0.5">
              {pinned.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectTab('chat');
                    selectConversation(conv.id);
                  }}
                  className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                    activeConversationId === conv.id && currentTab === 'chat'
                      ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                      : 'hover:bg-accent/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <Pin className="w-3.5 h-3.5 text-primary rotate-45 shrink-0" />
                    {editingId === conv.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-background border border-primary/50 px-1 py-0.5 rounded text-xs w-32 focus:outline-none text-foreground"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="truncate">{conv.title}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingId === conv.id ? (
                      <>
                        <button onClick={(e) => handleSaveRename(conv.id, e)} className="p-1 hover:text-primary">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="p-1 hover:text-destructive">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={(e) => handleStartRename(conv.id, conv.title, e)} className="p-1 hover:text-foreground" title="Rename">
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button onClick={(e) => handleTogglePin(conv.id, true, e)} className="p-1 hover:text-foreground" title="Unpin">
                          <Pin className="w-3 h-3 text-primary" />
                        </button>
                        <button onClick={(e) => handleDelete(conv.id, e)} className="p-1 hover:text-destructive text-muted-foreground" title="Delete">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="px-2 pb-1 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
            Conversations
          </div>
          {recent.length === 0 && pinned.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground/60">
              No conversations yet.<br />Click "+ New Conversation"
            </div>
          ) : (
            <div className="space-y-0.5">
              {recent.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectTab('chat');
                    selectConversation(conv.id);
                  }}
                  className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                    activeConversationId === conv.id && currentTab === 'chat'
                      ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                      : 'hover:bg-accent/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    {editingId === conv.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-background border border-primary/50 px-1 py-0.5 rounded text-xs w-32 focus:outline-none text-foreground"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="truncate">{conv.title}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingId === conv.id ? (
                      <>
                        <button onClick={(e) => handleSaveRename(conv.id, e)} className="p-1 hover:text-primary">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="p-1 hover:text-destructive">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={(e) => handleStartRename(conv.id, conv.title, e)} className="p-1 hover:text-foreground" title="Rename">
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button onClick={(e) => handleTogglePin(conv.id, false, e)} className="p-1 hover:text-foreground" title="Pin">
                          <Pin className="w-3 h-3" />
                        </button>
                        <button onClick={(e) => handleDelete(conv.id, e)} className="p-1 hover:text-red-400 text-muted-foreground" title="Delete">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Links */}
      <div className="p-2 border-t border-border/50 bg-secondary/20 space-y-0.5">
        <button
          onClick={() => onSelectTab('chat')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
            currentTab === 'chat' ? 'bg-accent text-accent-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Chat Assistant
        </button>

        <button
          onClick={() => onSelectTab('knowledge')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
            currentTab === 'knowledge' ? 'bg-accent text-accent-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Knowledge Base (RAG)
        </button>

        <button
          onClick={() => onSelectTab('models')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
            currentTab === 'models' ? 'bg-accent text-accent-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Model Manager
        </button>

        <button
          onClick={() => onSelectTab('dashboard')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
            currentTab === 'dashboard' ? 'bg-accent text-accent-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          System Health
        </button>

        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
            currentTab === 'settings' ? 'bg-accent text-accent-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          Settings & Memory
        </button>
      </div>

      {/* System Status Footer */}
      <div className="px-3 py-2.5 border-t border-border/50 text-[11px] flex items-center justify-between text-muted-foreground/80">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${health?.status === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span>{health?.llm_provider || 'Local Mode'}</span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground/60">v0.1.0</span>
      </div>
    </aside>
  );
};
