import React, { useState } from 'react';
import {
  Sliders,
  PlayCircle,
  Code2,
  ChevronDown,
  Cpu,
  BookOpen,
  Brain,
  Wrench,
  Download,
  Copy,
  Check,
  Sparkles,
  Maximize2,
  Share2,
  Activity,
  Layers,
  FileCode,
  Gauge
} from 'lucide-react';
import { useModelStore } from '../../store/modelStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useChatStore } from '../../store/chatStore';

export interface FigmaRightPanelProps {
  currentTab: string;
}

export const FigmaRightPanel: React.FC<FigmaRightPanelProps> = ({ currentTab }) => {
  const [activeTab, setActiveTab] = useState<'design' | 'prototype' | 'inspect'>('design');
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<'md' | 'json' | 'txt'>('md');

  const { models, currentModel, currentProvider, selectModel } = useModelStore();
  const { settings, updateSettings, health } = useSettingsStore();
  const { messages, activeConversationId, conversations } = useChatStore();

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  const activeModelObj = models.find((m) => m.id === currentModel) || models[0];

  const handleTemperatureChange = (val: number) => {
    updateSettings({ temperature: val });
  };

  const handleExport = () => {
    if (!messages.length) {
      alert('No messages to export in active conversation.');
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

  const handleCopyRaw = () => {
    const raw = JSON.stringify(messages, null, 2);
    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="w-64 bg-[#2c2c2c] text-[#cccccc] border-l border-[#383838] flex flex-col h-full select-none text-xs shrink-0">
      {/* Top Inspector Tabs: Design | Prototype | Inspect */}
      <div className="h-9 border-b border-[#383838] flex items-center px-2 bg-[#262626]">
        <button
          onClick={() => setActiveTab('design')}
          className={`flex-1 py-1.5 text-center font-medium transition-colors ${
            activeTab === 'design'
              ? 'text-white border-b-2 border-[#0d99ff] -mb-[1px]'
              : 'text-[#888888] hover:text-[#cccccc]'
          }`}
        >
          Design
        </button>

        <button
          onClick={() => setActiveTab('prototype')}
          className={`flex-1 py-1.5 text-center font-medium transition-colors ${
            activeTab === 'prototype'
              ? 'text-white border-b-2 border-[#0d99ff] -mb-[1px]'
              : 'text-[#888888] hover:text-[#cccccc]'
          }`}
        >
          Prototype
        </button>

        <button
          onClick={() => setActiveTab('inspect')}
          className={`flex-1 py-1.5 text-center font-medium transition-colors ${
            activeTab === 'inspect'
              ? 'text-white border-b-2 border-[#0d99ff] -mb-[1px]'
              : 'text-[#888888] hover:text-[#cccccc]'
          }`}
        >
          Inspect
        </button>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-[#383838]">
        {activeTab === 'design' && (
          <>
            {/* FIGMA FRAME GEOMETRY / ALIGNMENT SECTION */}
            <div className="p-3 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-white">
                <span>Frame Geometry</span>
                <span className="text-[10px] text-[#777777] font-mono">1440 × 900</span>
              </div>

              {/* Coordinates & Dimensions Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1">
                  <span className="text-[#777777] w-4 font-mono">X</span>
                  <input
                    type="text"
                    defaultValue="0"
                    className="w-full bg-transparent text-white font-mono focus:outline-none"
                    readOnly
                  />
                </div>
                <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1">
                  <span className="text-[#777777] w-4 font-mono">Y</span>
                  <input
                    type="text"
                    defaultValue="0"
                    className="w-full bg-transparent text-white font-mono focus:outline-none"
                    readOnly
                  />
                </div>
                <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1">
                  <span className="text-[#777777] w-4 font-mono">W</span>
                  <input
                    type="text"
                    defaultValue="100%"
                    className="w-full bg-transparent text-white font-mono focus:outline-none"
                    readOnly
                  />
                </div>
                <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1">
                  <span className="text-[#777777] w-4 font-mono">H</span>
                  <input
                    type="text"
                    defaultValue="100%"
                    className="w-full bg-transparent text-white font-mono focus:outline-none"
                    readOnly
                  />
                </div>
              </div>

              {/* Corner Radius & Constraints */}
              <div className="flex items-center justify-between text-[11px] pt-1 text-[#888888]">
                <span>Corner radius</span>
                <span className="font-mono text-white bg-[#1e1e1e] border border-[#383838] px-2 py-0.5 rounded">
                  8px
                </span>
              </div>
            </div>

            {/* AI MODEL & INFERENCE SECTION */}
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between text-[11px] font-semibold text-white">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#0d99ff]" />
                  Inference Model
                </span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                  activeModelObj?.is_local ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {activeModelObj?.is_local ? 'Local' : 'Cloud'}
                </span>
              </div>

              {/* Model Picker */}
              <div className="space-y-1">
                <label className="text-[10px] text-[#888888]">Active Model</label>
                <div className="relative">
                  <select
                    value={currentModel}
                    onChange={(e) => {
                      const tgt = models.find((m) => m.id === e.target.value);
                      selectModel(e.target.value, tgt?.provider);
                    }}
                    className="w-full appearance-none bg-[#1e1e1e] border border-[#383838] hover:border-[#0d99ff] focus:border-[#0d99ff] rounded px-2.5 py-1.5 text-[11px] text-white focus:outline-none transition-colors"
                  >
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.provider})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-[#777777] pointer-events-none" />
                </div>
              </div>

              {/* Temperature Slider & Scrubber */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#888888]">Temperature (Creativity)</span>
                  <span className="font-mono text-white bg-[#1e1e1e] border border-[#383838] px-1.5 py-0.2 rounded">
                    {(settings?.temperature ?? 0.7).toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings?.temperature ?? 0.7}
                  onChange={(e) => handleTemperatureChange(parseFloat(e.target.value))}
                  className="w-full accent-[#0d99ff] cursor-pointer h-1.5 bg-[#1e1e1e] rounded"
                />
                <div className="flex justify-between text-[9px] text-[#666666] font-mono">
                  <span>Precise (0.0)</span>
                  <span>Balanced (0.7)</span>
                  <span>Creative (1.0)</span>
                </div>
              </div>

              {/* Max Tokens / Context Length */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-[#888888]">Context Window</span>
                <span className="font-mono text-[#0d99ff]">
                  {activeModelObj?.context_length ? `${(activeModelObj.context_length / 1024).toFixed(0)}k tokens` : '8k tokens'}
                </span>
              </div>
            </div>

            {/* CONTEXT & LAYER FEATURES */}
            <div className="p-3 space-y-2.5">
              <div className="text-[11px] font-semibold text-white">Fill & Context Properties</div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between p-2 rounded bg-[#1e1e1e] border border-[#383838]">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-[#0d99ff]" />
                    <span>Vector RAG Library</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Enabled</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#1e1e1e] border border-[#383838]">
                  <div className="flex items-center gap-2">
                    <Brain className="w-3.5 h-3.5 text-[#9747ff]" />
                    <span>Associative Memory</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Active</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#1e1e1e] border border-[#383838]">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-3.5 h-3.5 text-amber-400" />
                    <span>Function Tool Calling</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Ready</span>
                </div>
              </div>
            </div>

            {/* EXPORT SECTION (FIGMA EXPORT PANEL) */}
            <div className="p-3 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-white">
                <span>Export Frame</span>
                <span className="text-[10px] text-[#777777] font-mono">{messages.length} msgs</span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="flex-1 bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#0d99ff]"
                >
                  <option value="md">Markdown (.md)</option>
                  <option value="json">JSON (.json)</option>
                  <option value="txt">Plain Text (.txt)</option>
                </select>

                <button
                  onClick={handleExport}
                  className="px-3 py-1.5 rounded bg-[#383838] hover:bg-[#0d99ff] hover:text-white text-white font-medium text-[11px] flex items-center gap-1.5 transition-colors"
                  title="Download exported conversation"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'prototype' && (
          <div className="p-3 space-y-3">
            <div className="text-[11px] font-semibold text-white">Interaction Prototype</div>
            <p className="text-[11px] text-[#888888] leading-relaxed">
              Define conversational interactions and token flow behaviors.
            </p>

            <div className="space-y-2 pt-1 text-[11px]">
              <div className="p-2.5 rounded bg-[#1e1e1e] border border-[#383838] space-y-1">
                <div className="text-white font-medium">Trigger: On Enter Key</div>
                <div className="text-[10px] text-[#888888]">Dispatch prompt to streaming inference endpoint.</div>
              </div>

              <div className="p-2.5 rounded bg-[#1e1e1e] border border-[#383838] space-y-1">
                <div className="text-white font-medium">Action: Stream Response</div>
                <div className="text-[10px] text-[#888888]">Server-Sent Events (SSE) token buffering.</div>
              </div>

              <div className="p-2.5 rounded bg-[#1e1e1e] border border-[#383838] space-y-1">
                <div className="text-white font-medium">Animation: Smart Typewriter</div>
                <div className="text-[10px] text-[#888888]">Progressive markdown DOM rehydration.</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inspect' && (
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-semibold text-white">
              <span>Token Inspector</span>
              <button
                onClick={handleCopyRaw}
                className="text-[10px] text-[#0d99ff] hover:underline flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between p-2 rounded bg-[#1e1e1e] border border-[#383838]">
                <span className="text-[#888888]">Conversation ID</span>
                <span className="font-mono text-[10px] text-white truncate max-w-[120px]">
                  {activeConversationId || 'None'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-[#1e1e1e] border border-[#383838]">
                <span className="text-[#888888]">Message Count</span>
                <span className="font-mono text-white">{messages.length}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-[#1e1e1e] border border-[#383838]">
                <span className="text-[#888888]">Active Provider</span>
                <span className="font-mono text-[#0d99ff]">{currentProvider}</span>
              </div>

              <div className="space-y-1 pt-1">
                <div className="text-[10px] text-[#888888]">Raw Payload JSON</div>
                <pre className="p-2 rounded bg-[#1e1e1e] border border-[#383838] text-[9px] font-mono text-[#aaaaaa] max-h-48 overflow-y-auto leading-relaxed">
                  {JSON.stringify(messages.slice(-3), null, 2) || '// No message history'}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
