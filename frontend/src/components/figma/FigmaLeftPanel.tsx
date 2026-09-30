import React, { useState } from 'react';
import {
  Layers,
  Component,
  FileText,
  Search,
  Plus,
  Pin,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Edit2,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Hash,
  Type,
  Sparkles,
  Image,
  Database,
  BookOpen,
  Cpu,
  LayoutDashboard,
  Settings as SettingsIcon,
  ShieldCheck,
  Palette,
  Sliders,
  Download,
  Brain,
  Wrench,
  RefreshCw,
} from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useModelStore } from '../../store/modelStore';

export interface FigmaLeftPanelProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const FigmaLeftPanel: React.FC<FigmaLeftPanelProps> = ({ currentTab, onSelectTab }) => {
  const [activeTab, setActiveTab] = useState<'layers' | 'properties' | 'assets'>('layers');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPagesExpanded, setIsPagesExpanded] = useState(true);
  const [isFramesExpanded, setIsFramesExpanded] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [lockedFrames, setLockedFrames] = useState<Record<string, boolean>>({});
  const [hiddenFrames, setHiddenFrames] = useState<Record<string, boolean>>({});
  const [exportFormat, setExportFormat] = useState<'md' | 'json' | 'txt'>('md');
  const [isStartersExpanded, setIsStartersExpanded] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    conversations,
    activeConversationId,
    selectConversation,
    newChat,
    deleteConversation,
    updateConversationTitle,
    togglePinConversation,
    messages,
    sendMessage,
    fetchConversations,
  } = useChatStore();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchConversations();
      if (activeConversationId) {
        await selectConversation(activeConversationId);
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const sidebarStarters = [
    {
      icon: '✨',
      title: 'Generate Visual Artwork',
      desc: 'Photorealistic 3D studio render',
      prompt: 'Generate a photorealistic cinematic render of a futuristic glass workspace with neon ambient lighting and floating holographic UI.',
    },
    {
      icon: '💻',
      title: 'Code Architecture & Review',
      desc: 'TypeScript async state machine',
      prompt: 'Write a complete TypeScript async state machine with error boundary, retry logic, and clean type guards.',
    },
    {
      icon: '💡',
      title: 'Explain Complex Concept',
      desc: 'Step-by-step breakdown',
      prompt: 'Explain quantum computing and superposition in a short, accurate, step-by-step breakdown.',
    },
    {
      icon: '📐',
      title: 'Math & Logic Solver',
      desc: 'Solve equations step-by-step',
      prompt: 'Solve the equation 2x² - 8x + 6 = 0 step-by-step with clean calculations and exact roots.',
    },
  ];

  const { settings, updateSettings, health } = useSettingsStore();
  const { models, currentModel, currentProvider, selectModel } = useModelStore();

  const activeModelObj = models.find((m) => m.id === currentModel) || models[0];
  const activeConv = conversations.find((c) => c.id === activeConversationId);

  const handleExport = () => {
    if (!messages.length) {
      alert('No messages to export in active conversation frame.');
      return;
    }

    let content = '';
    let mimeType = 'text/plain';
    let ext = exportFormat;

    if (exportFormat === 'json') {
      content = JSON.stringify({
        conversation_id: activeConversationId,
        title: activeConv?.title || 'PersonalGPT Conversation',
        date: new Date().toISOString(),
        model: currentModel,
        messages: messages,
      }, null, 2);
      mimeType = 'application/json';
    } else if (exportFormat === 'md') {
      content = `# ${activeConv?.title || 'PersonalGPT Conversation'}\n\n`;
      content += `*Generated on ${new Date().toLocaleString()} using ${currentModel} (${currentProvider})*\n\n---\n\n`;
      messages.forEach((m) => {
        content += `### ${m.role === 'user' ? '🧑 User' : '🤖 Assistant'}\n\n${m.content}\n\n`;
      });
      mimeType = 'text/markdown';
    } else {
      content = messages.map((m) => `${m.role.toUpperCase()}:\n${m.content}\n\n`).join('---\n\n');
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(activeConv?.title || 'chat').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const pages = [
    { id: 'chat', label: 'Chat Canvas', icon: Hash, badge: `${conversations.length} frames` },
    { id: 'knowledge', label: 'Knowledge Base (RAG)', icon: BookOpen, badge: 'Components' },
    { id: 'models', label: 'Model Manager', icon: Cpu, badge: 'Engines' },
    { id: 'dashboard', label: 'System Health', icon: LayoutDashboard, badge: health?.status || 'Online' },
    { id: 'settings', label: 'Settings & Memory', icon: SettingsIcon, badge: 'Config' },
    { id: 'theme', label: 'Theme & Colors', icon: Palette, badge: 'Custom' },
  ];

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinned = filteredConversations.filter((c) => c.is_pinned);
  const unpinned = filteredConversations.filter((c) => !c.is_pinned);

  const toggleLock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLockedFrames((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHiddenFrames((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStartRename = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(title);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      updateConversationTitle(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <aside className="w-64 bg-[#2c2c2c] text-[#cccccc] border-r border-[#383838] flex flex-col h-full select-none text-xs shrink-0">
      {/* Top Tab Bar: Layers vs Properties vs Assets */}
      <div className="h-9 border-b border-[#383838] flex items-center px-1.5 bg-[#262626]">
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-1.5 text-center font-medium transition-colors flex items-center justify-center gap-1 text-[11px] ${
            activeTab === 'layers'
              ? 'text-white border-b-2 border-[#0d99ff] -mb-[1px]'
              : 'text-[#888888] hover:text-[#cccccc]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Layers</span>
        </button>

        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 py-1.5 text-center font-medium transition-colors flex items-center justify-center gap-1 text-[11px] ${
            activeTab === 'properties'
              ? 'text-white border-b-2 border-[#0d99ff] -mb-[1px]'
              : 'text-[#888888] hover:text-[#cccccc]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Properties</span>
        </button>

        <button
          onClick={() => setActiveTab('assets')}
          className={`flex-1 py-1.5 text-center font-medium transition-colors flex items-center justify-center gap-1 text-[11px] ${
            activeTab === 'assets'
              ? 'text-white border-b-2 border-[#0d99ff] -mb-[1px]'
              : 'text-[#888888] hover:text-[#cccccc]'
          }`}
        >
          <Component className="w-3.5 h-3.5" />
          <span>Assets</span>
        </button>
      </div>

      {activeTab === 'layers' ? (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {/* PAGES SECTION */}
          <div className="border-b border-[#383838]">
            <div
              onClick={() => setIsPagesExpanded(!isPagesExpanded)}
              className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[#333333] text-[#888888] text-[11px] font-semibold uppercase tracking-wider"
            >
              <div className="flex items-center gap-1">
                {isPagesExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                <span>Pages</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRefresh();
                  }}
                  disabled={isRefreshing}
                  className="hover:text-white p-0.5 text-[#777777] hover:text-[#0d99ff] transition-colors cursor-pointer"
                  title="Refresh frames & layers"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-[#0d99ff]' : ''}`} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    newChat();
                    onSelectTab('chat');
                  }}
                  className="hover:text-white p-0.5 cursor-pointer"
                  title="Create new frame"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {isPagesExpanded && (
              <div className="pb-1.5 px-1 space-y-0.5">
                {pages.map((p) => {
                  const Icon = p.icon;
                  const isActive = currentTab === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => onSelectTab(p.id)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-[#0d99ff]/20 text-[#0d99ff] font-medium'
                          : 'hover:bg-[#333333] text-[#cccccc] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{p.label}</span>
                      </div>
                      <span className="text-[10px] text-[#777777] font-mono shrink-0">
                        {p.badge}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SEARCH IN LAYERS */}
          <div className="p-2 border-b border-[#383838]">
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2 top-2 text-[#777777]" />
              <input
                type="text"
                placeholder="Find in layers (⌘F)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-6 pr-2 py-1 bg-[#1e1e1e] border border-[#383838] rounded text-[11px] text-[#f5f5f5] placeholder-[#666666] focus:outline-none focus:border-[#0d99ff]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1.5 text-[#777777] hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* QUICK PROMPT STARTERS IN SIDEBAR */}
          <div className="border-b border-[#383838] px-2 py-1.5">
            <div
              onClick={() => setIsStartersExpanded(!isStartersExpanded)}
              className="py-1 text-[10px] font-bold text-[#777777] uppercase tracking-wider flex items-center justify-between cursor-pointer hover:text-[#cccccc]"
            >
              <div className="flex items-center gap-1">
                {isStartersExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                <span>Quick Starters ({sidebarStarters.length})</span>
              </div>
              <Sparkles className="w-3 h-3 text-[#0d99ff]" />
            </div>

            {isStartersExpanded && (
              <div className="space-y-1 pt-1 pb-1">
                {sidebarStarters.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onSelectTab('chat');
                      sendMessage(s.prompt, { model: currentModel, provider: currentProvider });
                    }}
                    className="w-full p-1.5 rounded-md bg-[#222222] hover:bg-[#2c2c2c] border border-[#333333] hover:border-[#0d99ff] text-left transition-all flex items-center gap-2 group cursor-pointer"
                    title={s.prompt}
                  >
                    <span className="text-xs shrink-0">{s.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-medium text-white truncate group-hover:text-[#0d99ff]">
                        {s.title}
                      </div>
                      <div className="text-[9px] text-[#777777] truncate">
                        {s.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* FRAMES & CHAT LAYERS TREE */}
          <div className="flex-1 overflow-y-auto px-1 py-2 space-y-2">
            {/* NEW CHAT & REFRESH BUTTONS DIRECTLY ABOVE CONVERSATION FRAMES */}
            <div className="px-1 pb-1 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  newChat();
                  onSelectTab('chat');
                }}
                className="flex-1 py-1.5 px-3 rounded-lg bg-[#0d99ff] hover:bg-[#007be5] active:scale-98 text-white font-semibold text-xs flex items-center justify-between shadow-sm transition-all cursor-pointer group"
                title="Start a new chat frame (F)"
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-white/20 flex items-center justify-center text-white text-xs group-hover:rotate-90 transition-transform">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <span>New Chat</span>
                </div>
                <span className="text-[10px] text-white/80 font-mono bg-black/25 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Plus className="w-2.5 h-2.5" />
                </span>
              </button>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-lg bg-[#252525] hover:bg-[#323232] border border-[#383838] hover:border-[#0d99ff]/50 text-[#888888] hover:text-[#0d99ff] transition-all cursor-pointer active:scale-95 shadow-xs shrink-0"
                title="Refresh chat frames & history"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#0d99ff]' : ''}`} />
              </button>
            </div>
            {/* PINNED FRAMES */}
            {pinned.length > 0 && (
              <div>
                <div className="px-2 pb-1 text-[10px] font-bold text-[#777777] uppercase tracking-wider flex items-center gap-1">
                  <Pin className="w-2.5 h-2.5 text-[#0d99ff]" />
                  <span>Pinned Frames</span>
                </div>
                <div className="space-y-0.5">
                  {pinned.map((conv) => {
                    const isSelected = activeConversationId === conv.id && currentTab === 'chat';
                    const isLocked = lockedFrames[conv.id];
                    const isHidden = hiddenFrames[conv.id];

                    return (
                      <div
                        key={conv.id}
                        onClick={() => {
                          onSelectTab('chat');
                          selectConversation(conv.id);
                        }}
                        className={`group relative flex items-center justify-between px-2 py-1.5 rounded cursor-pointer text-[11px] transition-colors ${
                          isSelected
                            ? 'bg-[#0d99ff] text-white font-medium shadow-sm'
                            : 'hover:bg-[#333333] text-[#cccccc] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate pr-1">
                          <Hash className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-[#888888]'}`} />
                          {editingId === conv.id ? (
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="bg-[#1e1e1e] border border-[#0d99ff] px-1 py-0.5 rounded text-[11px] text-white focus:outline-none w-28"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span className="truncate">{conv.title}</span>
                          )}
                        </div>

                        {/* Figma Layer Controls on Hover */}
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {editingId === conv.id ? (
                            <>
                              <button onClick={(e) => handleSaveRename(conv.id, e)} className="p-0.5 hover:text-emerald-400">
                                <Check className="w-3 h-3" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="p-0.5 hover:text-rose-400">
                                <X className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={(e) => toggleLock(conv.id, e)} className="p-0.5 hover:text-white" title={isLocked ? 'Unlock' : 'Lock'}>
                                {isLocked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3 opacity-60" />}
                              </button>
                              <button onClick={(e) => toggleVisibility(conv.id, e)} className="p-0.5 hover:text-white" title={isHidden ? 'Show' : 'Hide'}>
                                {isHidden ? <EyeOff className="w-3 h-3 opacity-50" /> : <Eye className="w-3 h-3 opacity-60" />}
                              </button>
                              <button onClick={(e) => handleStartRename(conv.id, conv.title, e)} className="p-0.5 hover:text-white" title="Rename Frame">
                                <Edit2 className="w-3 h-3 opacity-60" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); togglePinConversation(conv.id, false); }} className="p-0.5 hover:text-white" title="Unpin">
                                <Pin className="w-3 h-3 text-[#0d99ff]" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ALL FRAMES */}
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-bold text-[#777777] uppercase tracking-wider flex items-center justify-between group">
                <div
                  onClick={() => setIsFramesExpanded(!isFramesExpanded)}
                  className="flex items-center gap-1 cursor-pointer hover:text-[#cccccc]"
                >
                  {isFramesExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  <span>Conversation Frames ({unpinned.length})</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    newChat();
                    onSelectTab('chat');
                  }}
                  className="p-1 rounded bg-[#333333] hover:bg-[#0d99ff] text-[#888888] hover:text-white transition-colors cursor-pointer"
                  title="New Chat (+)"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {isFramesExpanded && (
                <div className="space-y-0.5">
                  {unpinned.length === 0 && pinned.length === 0 ? (
                    <div className="px-3 py-6 text-center text-[#777777] text-[11px]">
                      No canvas frames yet.<br />Press <kbd className="bg-[#1e1e1e] border border-[#383838] px-1 py-0.5 rounded text-[10px]">F</kbd> for New Frame.
                    </div>
                  ) : (
                    unpinned.map((conv) => {
                      const isSelected = activeConversationId === conv.id && currentTab === 'chat';
                      const isLocked = lockedFrames[conv.id];
                      const isHidden = hiddenFrames[conv.id];

                      return (
                        <div key={conv.id}>
                          <div
                            onClick={() => {
                              onSelectTab('chat');
                              selectConversation(conv.id);
                            }}
                            className={`group relative flex items-center justify-between px-2 py-1.5 rounded cursor-pointer text-[11px] transition-colors ${
                              isSelected
                                ? 'bg-[#0d99ff] text-white font-medium shadow-sm'
                                : 'hover:bg-[#333333] text-[#cccccc] hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate pr-1">
                              <Hash className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-[#888888]'}`} />
                              {editingId === conv.id ? (
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="bg-[#1e1e1e] border border-[#0d99ff] px-1 py-0.5 rounded text-[11px] text-white focus:outline-none w-28"
                                  autoFocus
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <span className="truncate">{conv.title}</span>
                              )}
                            </div>

                            {/* Hover Action Icons */}
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {editingId === conv.id ? (
                                <>
                                  <button onClick={(e) => handleSaveRename(conv.id, e)} className="p-0.5 hover:text-emerald-400">
                                    <Check className="w-3 h-3" />
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="p-0.5 hover:text-rose-400">
                                    <X className="w-3 h-3" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button onClick={(e) => toggleLock(conv.id, e)} className="p-0.5 hover:text-white" title={isLocked ? 'Unlock' : 'Lock'}>
                                    {isLocked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3 opacity-60" />}
                                  </button>
                                  <button onClick={(e) => toggleVisibility(conv.id, e)} className="p-0.5 hover:text-white" title={isHidden ? 'Show' : 'Hide'}>
                                    {isHidden ? <EyeOff className="w-3 h-3 opacity-50" /> : <Eye className="w-3 h-3 opacity-60" />}
                                  </button>
                                  <button onClick={(e) => handleStartRename(conv.id, conv.title, e)} className="p-0.5 hover:text-white" title="Rename Frame">
                                    <Edit2 className="w-3 h-3 opacity-60" />
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); togglePinConversation(conv.id, true); }} className="p-0.5 hover:text-white" title="Pin">
                                    <Pin className="w-3 h-3 opacity-60" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm('Delete this chat frame?')) {
                                        deleteConversation(conv.id);
                                      }
                                    }}
                                    className="p-0.5 hover:text-rose-400"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3 h-3 opacity-60" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* NESTED LAYERS INSIDE ACTIVE CONVERSATION (Figma Tree View) */}
                          {isSelected && messages.length > 0 && (
                            <div className="pl-5 pr-1 py-1 space-y-0.5 border-l border-[#383838] ml-3 mt-0.5">
                              {messages.slice(-6).map((m, idx) => (
                                <div
                                  key={m.id || idx}
                                  className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] text-[#999999] hover:bg-[#333333] hover:text-[#cccccc] transition-colors"
                                  title={m.content}
                                >
                                  {m.role === 'user' ? (
                                    <Type className="w-3 h-3 text-[#0d99ff] shrink-0" />
                                  ) : (
                                    <Sparkles className="w-3 h-3 text-[#9747ff] shrink-0" />
                                  )}
                                  <span className="truncate">
                                    {m.role === 'user' ? 'Prompt: ' : 'Response: '}
                                    {m.content.slice(0, 24)}...
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'properties' ? (
        /* PROPERTIES TAB (Model & Context Config) */
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Active Model Config */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#0d99ff]" />
                <span>Inference Model</span>
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1e1e1e] border border-[#383838] text-[#0d99ff] font-semibold">
                {activeModelObj?.is_local ? 'LOCAL' : 'CLOUD'}
              </span>
            </div>

            <div className="relative">
              <select
                value={currentModel}
                onChange={(e) => {
                  const target = models.find((m) => m.id === e.target.value);
                  selectModel(e.target.value, target?.provider);
                }}
                className="w-full bg-[#1e1e1e] hover:bg-[#252525] border border-[#383838] rounded-md px-2.5 py-1.5 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-[#0d99ff] transition-all"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.provider})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-[#888888] pointer-events-none" />
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#888888] px-0.5">
              <span>Context Window</span>
              <span className="font-mono text-[#cccccc]">
                {((activeModelObj?.context_length || 1000000) / 1000).toFixed(0)}k tokens
              </span>
            </div>
          </div>

          <div className="border-t border-[#383838]" />

          {/* Temperature / Creativity Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#9747ff]" />
                <span>Creativity (Temperature)</span>
              </span>
              <span className="text-[11px] font-mono text-[#0d99ff] font-bold">
                {settings?.temperature?.toFixed(2) || '0.70'}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings?.temperature ?? 0.7}
              onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
              className="w-full h-1 bg-[#1e1e1e] rounded-lg appearance-none cursor-pointer accent-[#0d99ff]"
            />

            <div className="flex justify-between text-[9px] text-[#777777] font-mono">
              <span>Precise (0.0)</span>
              <span>Balanced (0.7)</span>
              <span>Creative (1.0)</span>
            </div>
          </div>

          <div className="border-t border-[#383838]" />

          {/* Context Capabilities */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-white uppercase tracking-wider">
              Context Capabilities
            </div>

            <div className="p-2 rounded bg-[#1e1e1e] border border-[#383838] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-[#0d99ff]" />
                <span className="text-[11px] text-[#cccccc]">Vector RAG Search</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold font-mono">Enabled</span>
            </div>

            <div className="p-2 rounded bg-[#1e1e1e] border border-[#383838] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-3.5 h-3.5 text-[#9747ff]" />
                <span className="text-[11px] text-[#cccccc]">Associative Memory</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold font-mono">Active</span>
            </div>

            <div className="p-2 rounded bg-[#1e1e1e] border border-[#383838] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] text-[#cccccc]">Function Tool Calling</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold font-mono">Ready</span>
            </div>
          </div>

          <div className="border-t border-[#383838]" />

          {/* Export Frame */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-white flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-[#0d99ff]" />
                <span>Export Active Frame</span>
              </span>
              <span className="text-[10px] text-[#888888] font-mono">
                {messages.length} msgs
              </span>
            </div>

            <div className="flex gap-2">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
                className="flex-1 bg-[#1e1e1e] border border-[#383838] rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#0d99ff]"
              >
                <option value="md">Markdown (.md)</option>
                <option value="json">JSON Payload (.json)</option>
                <option value="txt">Plain Text (.txt)</option>
              </select>

              <button
                onClick={handleExport}
                className="px-3 py-1.5 rounded-md bg-[#0d99ff] hover:bg-[#007be5] text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm active:scale-95"
                title="Download export"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ASSETS TAB (Figma Components Library) */
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="text-[11px] font-semibold text-white">Component Library</div>
          <p className="text-[11px] text-[#888888] leading-relaxed">
            Drag and drop RAG documents, model templates, and prompt components into your canvas frames.
          </p>

          <div className="space-y-1.5 pt-2">
            <button
              onClick={() => onSelectTab('knowledge')}
              className="w-full p-2.5 rounded bg-[#1e1e1e] border border-[#383838] hover:border-[#0d99ff] flex items-center gap-2.5 transition-all text-left"
            >
              <Component className="w-4 h-4 text-[#9747ff]" />
              <div>
                <div className="text-[11px] font-medium text-white">Vector Document Embeddings</div>
                <div className="text-[10px] text-[#888888]">RAG Knowledge Base</div>
              </div>
            </button>

            <button
              onClick={() => onSelectTab('models')}
              className="w-full p-2.5 rounded bg-[#1e1e1e] border border-[#383838] hover:border-[#0d99ff] flex items-center gap-2.5 transition-all text-left"
            >
              <Cpu className="w-4 h-4 text-[#00b574]" />
              <div>
                <div className="text-[11px] font-medium text-white">Inference Engine Instances</div>
                <div className="text-[10px] text-[#888888]">Ollama, OpenAI, Gemini</div>
              </div>
            </button>

            <button
              onClick={() => onSelectTab('settings')}
              className="w-full p-2.5 rounded bg-[#1e1e1e] border border-[#383838] hover:border-[#0d99ff] flex items-center gap-2.5 transition-all text-left"
            >
              <Database className="w-4 h-4 text-[#ff7262]" />
              <div>
                <div className="text-[11px] font-medium text-white">Long-term Associative Memory</div>
                <div className="text-[10px] text-[#888888]">Persistent memory bank</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* FOOTER: Connection & Version Info */}
      <div className="h-8 border-t border-[#383838] px-2.5 flex items-center justify-between text-[10px] text-[#888888] bg-[#242424]">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${health?.status === 'healthy' ? 'bg-[#00b574] animate-pulse' : 'bg-amber-400'}`} />
          <span className="truncate">{health?.llm_provider || 'Local Ollama'}</span>
        </div>
        <span className="font-mono text-[#666666]">v0.1.0</span>
      </div>
    </aside>
  );
};
