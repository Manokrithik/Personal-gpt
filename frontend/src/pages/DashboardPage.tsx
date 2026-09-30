import React, { useEffect } from 'react';
import {
  Activity,
  Database,
  Cpu,
  BookOpen,
  MessageSquare,
  Brain,
  HardDrive,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import { useChatStore } from '../store/chatStore';
import { useKnowledgeStore } from '../store/knowledgeStore';

export const DashboardPage: React.FC = () => {
  const { health, fetchHealth, settings, memories } = useSettingsStore();
  const { conversations } = useChatStore();
  const { documents } = useKnowledgeStore();

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#1e1e1e] figma-canvas-grid p-4 sm:p-6 space-y-5 text-xs text-[#cccccc]">
      {/* Figma Frame Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#383838] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] text-[#0d99ff] bg-[#0d99ff]/10 border border-[#0d99ff]/30 px-2 py-0.5 rounded font-semibold">
              # Frame: Operational Health & Telemetry
            </span>
            <span className="text-[#666666] font-mono text-[10px]">1440 × 900</span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white">System Health & Dashboard</h2>
          <p className="text-[11px] text-[#888888] mt-0.5">
            Operational status across local storage, Chroma vector database, and active LLM providers.
          </p>
        </div>

        <button
          onClick={() => fetchHealth()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2c2c2c] border border-[#383838] hover:border-[#0d99ff] text-white font-medium text-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card/40 border border-border/60 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Conversations</span>
            <MessageSquare className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">{conversations.length}</div>
          <p className="text-[11px] text-muted-foreground">Persistent chat threads</p>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border/60 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Knowledge Docs</span>
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">{documents.length}</div>
          <p className="text-[11px] text-muted-foreground">RAG indexed files</p>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border/60 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Long-Term Memory</span>
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">{memories.length}</div>
          <p className="text-[11px] text-muted-foreground">Persisted user facts</p>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border/60 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Active Model</span>
            <Cpu className="w-4 h-4 text-primary" />
          </div>
          <div className="text-base font-bold text-foreground font-mono truncate">
            {health?.active_model || 'llama3.2:1b'}
          </div>
          <p className="text-[11px] text-muted-foreground">Current inference target</p>
        </div>
      </div>

      {/* Services Health Status */}
      <div className="bg-card/40 border border-border/60 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Subsystem Status
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-lg border border-border/60 bg-secondary/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <HardDrive className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-xs font-semibold text-foreground">Backend API</div>
                <div className="text-[11px] text-muted-foreground">FastAPI ASGI Server</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-500 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Online
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-border/60 bg-secondary/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-xs font-semibold text-foreground">Database Storage</div>
                <div className="text-[11px] text-muted-foreground">SQLite / PostgreSQL Async</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-500 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Connected
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-border/60 bg-secondary/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-xs font-semibold text-foreground">Vector Store</div>
                <div className="text-[11px] text-muted-foreground">ChromaDB / JSON Vector Index</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-500 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-border/60 bg-secondary/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-xs font-semibold text-foreground">AI Provider Adapter</div>
                <div className="text-[11px] text-muted-foreground">{health?.llm_provider || 'Local / Hybrid'}</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-500 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
