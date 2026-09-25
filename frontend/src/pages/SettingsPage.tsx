import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Brain, Sliders, Moon, Sun, Trash2, Shield, Plus, Check } from 'lucide-react';
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
  const [newMemoryText, setNewMemoryText] = useState('');
  const [newMemoryType, setNewMemoryType] = useState('preference');

  useEffect(() => {
    fetchSettings();
    fetchMemories();
  }, []);

  useEffect(() => {
    if (settings) {
      setTemp(settings.temperature);
    }
  }, [settings]);

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
          PersonalGPT automatically records key preferences, facts, and workflow constraints mentioned in chat turns to personalize future responses.
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
              No memories recorded yet. Talk to PersonalGPT or add one above!
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
