import React, { useEffect } from 'react';
import { Cpu, Check, RefreshCw, HardDrive, Cloud, Info } from 'lucide-react';
import { useModelStore } from '../store/modelStore';

export const ModelsPage: React.FC = () => {
  const { models, currentModel, currentProvider, isLoading, fetchModels, selectModel } = useModelStore();

  useEffect(() => {
    fetchModels();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#1e1e1e] figma-canvas-grid p-4 sm:p-6 space-y-5 text-xs text-[#cccccc]">
      {/* Figma Frame Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#383838] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] text-[#0d99ff] bg-[#0d99ff]/10 border border-[#0d99ff]/30 px-2 py-0.5 rounded font-semibold">
              # Frame: Inference Engines
            </span>
            <span className="text-[#666666] font-mono text-[10px]">1440 × 900</span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white">Model Management</h2>
          <p className="text-[11px] text-[#888888] mt-0.5">
            Switch between local Ollama models (private & offline) and cloud API providers (OpenAI, Gemini).
          </p>
        </div>

        <button
          onClick={() => fetchModels()}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2c2c2c] border border-[#383838] hover:border-[#0d99ff] text-white font-medium text-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Engines</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex gap-3 items-start text-xs text-foreground/90">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-primary">Hardware & Privacy Notice</p>
          <p className="text-muted-foreground leading-relaxed">
            Local Ollama models run 100% on your laptop hardware with zero telemetry or data leaves your machine. Cloud models (OpenAI, Gemini) require API keys configured in the backend <code className="bg-primary/20 px-1 py-0.5 rounded text-foreground font-mono">.env</code>.
          </p>
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((m) => {
          const isSelected = m.id === currentModel;
          return (
            <div
              key={m.id}
              className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm'
                  : 'border-border/70 bg-card/40 hover:border-primary/40 hover:bg-card/70'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${m.is_local ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      {m.is_local ? <HardDrive className="w-4 h-4" /> : <Cloud className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground truncate max-w-[180px]">{m.name}</h4>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                        {m.provider}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      m.is_local
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                        : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                    }`}
                  >
                    {m.is_local ? 'Local Model' : 'Cloud API'}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed min-h-[36px]">
                  {m.description || `Inference model managed by ${m.provider}.`}
                </p>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground/80 pt-2 border-t border-border/40 font-mono">
                  <span>Context:</span>
                  <span>{m.context_length ? `${(m.context_length / 1024).toFixed(0)}k tokens` : '4k tokens'}</span>
                </div>
              </div>

              <div className="pt-4 mt-2">
                <button
                  onClick={() => selectModel(m.id, m.provider)}
                  disabled={isSelected}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-sm cursor-default'
                      : 'bg-secondary text-secondary-foreground hover:bg-primary/20 hover:text-primary'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Active Default
                    </>
                  ) : (
                    'Select Model'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
