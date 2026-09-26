import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Brain, Sliders, Moon, Sun, Trash2, Shield, Plus, Check, Key, Cloud, Eye, EyeOff, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    memories,
    theme,
    setTheme,
    fetchSettings,
    updateSettings,
    fetchMemories,
    deleteMemory,
    clearAllMemories,
  } = useSettingsStore();

  const [temp, setTemp] = useState(0.7);
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [showGemini, setShowGemini] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);
  const [keysSaved, setKeysSaved] = useState(false);
  const [newMemoryText, setNewMemoryText] = useState('');
  const [newMemoryType, setNewMemoryType] = useState('preference');

  useEffect(() => {
    fetchSettings();
    fetchMemories();
  }, []);

  useEffect(() => {
    if (settings) {
      setTemp(settings.temperature);
      if (settings.gemini_api_key) setGeminiKey(settings.gemini_api_key);
      if (settings.openai_api_key) setOpenaiKey(settings.openai_api_key);
    }
  }, [settings]);

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      gemini_api_key: geminiKey.trim(),
      openai_api_key: openaiKey.trim(),
    });
    setKeysSaved(true);
    setTimeout(() => setKeysSaved(false), 3000);
  };

  const handleSaveTemperature = (newVal: number) => {
    setTemp(newVal);
    updateSettings({ temperature: newVal });
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryText.trim()) return;
    try {
      await fetch('/api/v1/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMemoryText.trim(),
          memory_type: newMemoryType,
          importance: 0.8,
        }),
      });
      setNewMemoryText('');
      fetchMemories();
    } catch (e) {
      console.error('Failed to create memory', e);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-background p-6 sm:p-8 space-y-8 max-w-4xl">
      {/* Header */}
      <div className="border-b border-border/50 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Settings & Personalization</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure model parameters, long-term memory, privacy, and feature flags.
        </p>
      </div>

      {/* Section 1: AI Parameters */}
      <div className="bg-card/40 border border-border/60 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sliders className="w-4 h-4 text-primary" />
          <h3>Inference & Generation Parameters</h3>
        </div>

        <div className="space-y-4 pt-2">
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span>Temperature: {temp}</span>
              <span className="text-muted-foreground">{temp < 0.4 ? 'Focused & Deterministic' : temp > 1.0 ? 'Creative & Variable' : 'Balanced'}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.5"
              step="0.05"
              value={temp}
              onChange={(e) => handleSaveTemperature(parseFloat(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer p-2.5 rounded-lg border border-border/60 bg-secondary/30">
              <input
                type="checkbox"
                checked={settings?.enable_rag ?? true}
                onChange={(e) => updateSettings({ enable_rag: e.target.checked })}
                className="rounded accent-primary"
              />
              <span>RAG Engine</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer p-2.5 rounded-lg border border-border/60 bg-secondary/30">
              <input
                type="checkbox"
                checked={settings?.enable_memory ?? true}
                onChange={(e) => updateSettings({ enable_memory: e.target.checked })}
                className="rounded accent-primary"
              />
              <span>Memory Profile</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer p-2.5 rounded-lg border border-border/60 bg-secondary/30">
              <input
                type="checkbox"
                checked={settings?.enable_tools ?? true}
                onChange={(e) => updateSettings({ enable_tools: e.target.checked })}
                className="rounded accent-primary"
              />
              <span>Tool Execution</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer p-2.5 rounded-lg border border-border/60 bg-secondary/30">
              <input
                type="checkbox"
                checked={settings?.enable_agents ?? true}
                onChange={(e) => updateSettings({ enable_agents: e.target.checked })}
                className="rounded accent-primary"
              />
              <span>Agentic Planner</span>
            </label>
          </div>
        </div>
      </div>

      {/* Section: Cloud AI Providers & API Keys */}
      <div className="bg-card/40 border border-border/60 rounded-xl p-5 space-y-4">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Cloud className="w-4 h-4 text-primary" />
            <h3>Cloud AI Providers & API Keys</h3>
          </div>
          {keysSaved && (
            <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> Keys Saved
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Optionally connect cloud LLMs to unlock state-of-the-art models like Google Gemini and OpenAI GPT. Keys are stored safely in your local environment.
        </p>

        <form onSubmit={handleSaveKeys} className="space-y-4 pt-1">
          {/* Google Gemini */}
          <div className="space-y-1.5 p-3.5 rounded-lg border border-border/50 bg-secondary/20">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Google Gemini API Key
              </label>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  geminiKey.trim() 
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                    : 'bg-muted text-muted-foreground border-border/40'
                }`}>
                  {geminiKey.trim() ? 'Configured' : 'Offline Engine'}
                </span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-primary hover:underline flex items-center gap-0.5"
                >
                  Get Free Key <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
            <div className="relative">
              <input
                type={showGemini ? 'text' : 'password'}
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full px-3 py-1.5 pr-8 text-xs font-mono rounded-lg bg-secondary/40 border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/40"
              />
              <button
                type="button"
                onClick={() => setShowGemini(!showGemini)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showGemini ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* OpenAI */}
          <div className="space-y-1.5 p-3.5 rounded-lg border border-border/50 bg-secondary/20">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                OpenAI API Key
              </label>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  openaiKey.trim() 
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                    : 'bg-muted text-muted-foreground border-border/40'
                }`}>
                  {openaiKey.trim() ? 'Configured' : 'Offline Engine'}
                </span>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-primary hover:underline flex items-center gap-0.5"
                >
                  Get Key <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
            <div className="relative">
              <input
                type={showOpenai ? 'text' : 'password'}
                placeholder="sk-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="w-full px-3 py-1.5 pr-8 text-xs font-mono rounded-lg bg-secondary/40 border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/40"
              />
              <button
                type="button"
                onClick={() => setShowOpenai(!showOpenai)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showOpenai ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Key className="w-3.5 h-3.5" /> Save Cloud API Keys
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: Long-Term Memory */}
      <div className="bg-card/40 border border-border/60 rounded-xl p-5 space-y-4">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Brain className="w-4 h-4 text-primary" />
            <h3>Long-Term Memory Records ({memories.length})</h3>
          </div>

          {memories.length > 0 && (
            <button
              onClick={() => { if (confirm('Clear all stored memories?')) clearAllMemories(); }}
              className="text-xs text-destructive hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          MUmu AI automatically records key preferences, facts, and workflow constraints mentioned in chat turns to personalize future responses.
        </p>

        {/* Add Memory Manually */}
        <form onSubmit={handleAddMemory} className="flex gap-2 pt-1">
          <input
            type="text"
            placeholder="Add memory statement, e.g. 'Prefers TypeScript with strict types'..."
            value={newMemoryText}
            onChange={(e) => setNewMemoryText(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-secondary/40 border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
          <select
            value={newMemoryType}
            onChange={(e) => setNewMemoryType(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-secondary/40 border border-border/60 text-foreground focus:outline-none"
          >
            <option value="preference">Preference</option>
            <option value="fact">Fact</option>
            <option value="goal">Goal</option>
            <option value="instruction">Instruction</option>
            <option value="project">Project</option>
          </select>
          <button
            type="submit"
            disabled={!newMemoryText.trim()}
            className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg disabled:opacity-50 hover:opacity-90 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </form>

        {/* Memory Items List */}
        <div className="space-y-1.5 max-h-56 overflow-y-auto pt-2">
          {memories.length === 0 ? (
            <div className="text-center py-4 text-xs text-muted-foreground/60">
              No memories recorded yet. Talk to MUmu AI or add one above!
            </div>
          ) : (
            memories.map((mem) => (
              <div
                key={mem.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 border border-border/40 text-xs"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                    {mem.memory_type}
                  </span>
                  <span className="truncate text-foreground">{mem.content}</span>
                </div>
                <button
                  onClick={() => deleteMemory(mem.id)}
                  className="p-1 text-muted-foreground hover:text-destructive shrink-0"
                  title="Delete memory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Section 3: Appearance & Theme */}
      <div className="bg-card/40 border border-border/60 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Moon className="w-4 h-4 text-primary" /> Appearance
        </h3>
        <div className="flex gap-3">
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border transition-colors ${
              theme === 'dark' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/40 border-border/60 text-muted-foreground'
            }`}
          >
            <Moon className="w-4 h-4" /> Dark Mode
          </button>

          <button
            onClick={() => setTheme('light')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border transition-colors ${
              theme === 'light' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/40 border-border/60 text-muted-foreground'
            }`}
          >
            <Sun className="w-4 h-4" /> Light Mode
          </button>
        </div>
      </div>
    </div>
  );
};
