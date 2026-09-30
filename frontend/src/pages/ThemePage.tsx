import React, { useState } from 'react';
import {
  Palette,
  RotateCcw,
  Sparkles,
  Bot,
  User as UserIcon,
  Check,
  Sliders,
  Grid,
  CircleDot,
  Square,
  Eye,
  Copy,
  Download,
  Upload,
} from 'lucide-react';
import { useThemeStore, PRESET_THEMES, CustomTheme } from '../store/themeStore';

const COLOR_SWATCHES = [
  '#0d99ff', // Figma Blue
  '#9747ff', // Purple
  '#00b574', // Green
  '#f59e0b', // Amber
  '#ff7262', // Coral
  '#00f0ff', // Cyber Cyan
  '#ff0055', // Hot Pink
  '#1e1e1e', // Dark Gray
  '#121212', // Pure Dark
  '#0a0f1d', // Midnight Blue
  '#1c1917', // Espresso
  '#f8fafc', // Light
];

interface ColorFieldProps {
  label: string;
  description: string;
  value: string;
  onChange: (val: string) => void;
  presetSwatches?: string[];
}

const ColorField: React.FC<ColorFieldProps> = ({
  label,
  description,
  value,
  onChange,
  presetSwatches = COLOR_SWATCHES,
}) => {
  return (
    <div className="p-3.5 rounded-lg bg-[#222222] border border-[#383838] space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-white text-xs">{label}</div>
          <div className="text-[10px] text-[#888888]">{description}</div>
        </div>
        <div className="flex items-center gap-2">
          {/* Native Color Picker Circle */}
          <label
            className="w-7 h-7 rounded-md cursor-pointer border-2 border-white/20 shadow-sm flex items-center justify-center overflow-hidden hover:scale-105 active:scale-95 transition-transform"
            style={{ backgroundColor: value }}
            title="Click to choose custom color"
          >
            <input
              type="color"
              value={value.startsWith('#') && value.length === 7 ? value : '#0d99ff'}
              onChange={(e) => onChange(e.target.value)}
              className="opacity-0 w-0 h-0 cursor-pointer"
            />
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-20 bg-[#181818] border border-[#404040] rounded px-2 py-1 text-[11px] font-mono text-white text-center focus:outline-none focus:border-[#0d99ff]"
          />
        </div>
      </div>

      {/* Quick Swatches */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1">
        {presetSwatches.slice(0, 8).map((swatch) => (
          <button
            key={swatch}
            type="button"
            onClick={() => onChange(swatch)}
            style={{ backgroundColor: swatch }}
            className={`w-5 h-5 rounded-full border border-black/40 flex items-center justify-center transition-transform hover:scale-115 ${
              value.toLowerCase() === swatch.toLowerCase() ? 'ring-2 ring-white ring-offset-1 ring-offset-[#222222]' : ''
            }`}
            title={swatch}
          >
            {value.toLowerCase() === swatch.toLowerCase() && (
              <Check className="w-2.5 h-2.5 text-white drop-shadow-sm" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export const ThemePage: React.FC = () => {
  const {
    currentTheme,
    isCustomized,
    updateColor,
    setPattern,
    selectPreset,
    resetToDefault,
  } = useThemeStore();

  const [copiedNotification, setCopiedNotification] = useState(false);
  const [testPrompt, setTestPrompt] = useState('Can you explain how the new Figma UI3 theme customization works in PersonalGPT?');

  const handleCopyThemeJson = () => {
    navigator.clipboard.writeText(JSON.stringify(currentTheme, null, 2));
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#181818] text-[#cccccc] overflow-y-auto select-none">
      {/* Studio Header Bar */}
      <header className="px-6 py-4 bg-[#222222] border-b border-[#383838] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-md transition-colors"
            style={{ backgroundColor: currentTheme.appAccent }}
          >
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">Theme & Canvas Studio</h1>
              {isCustomized && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0d99ff]/20 text-[#0d99ff] border border-[#0d99ff]/30 font-semibold font-mono">
                  Customized
                </span>
              )}
            </div>
            <p className="text-xs text-[#888888]">
              Personalize app colors, chat canvas backgrounds, user prompt bubbles, and AI response cards.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => selectPreset('figma-dark')}
            className="px-3 py-1.5 rounded-md text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            style={{ backgroundColor: currentTheme.appAccent }}
            title="Apply the recommended perfect Figma Studio color palette"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Set Perfect Combination</span>
          </button>

          <button
            onClick={resetToDefault}
            className="px-3 py-1.5 rounded-md bg-[#2c2c2c] hover:bg-[#383838] border border-[#383838] text-xs font-medium text-white flex items-center gap-1.5 transition-colors"
            title="Reset to default Figma dark theme"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#888888]" />
            <span>Reset to Default</span>
          </button>

          <button
            onClick={handleCopyThemeJson}
            className="px-3 py-1.5 rounded-md bg-[#2c2c2c] hover:bg-[#383838] border border-[#383838] text-xs font-medium text-white flex items-center gap-1.5 transition-colors"
            title="Copy theme configuration JSON"
          >
            <Copy className="w-3.5 h-3.5 text-[#888888]" />
            <span>{copiedNotification ? 'Copied JSON!' : 'Export Theme'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
        {/* LIVE REAL-TIME CHAT PREVIEW CANVAS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Eye className="w-4 h-4 text-[#0d99ff]" />
              <span>Real-Time Live Chat Preview</span>
            </div>
            <span className="text-[10px] text-[#777777] font-mono">
              Live feedback on every color modification
            </span>
          </div>

          <div
            className="rounded-xl border p-5 shadow-2xl transition-all relative overflow-hidden"
            style={{
              backgroundColor: currentTheme.chatBg,
              borderColor: currentTheme.borderColor,
            }}
          >
            {/* Background grid pattern if active */}
            {currentTheme.canvasPattern === 'dots' && (
              <div className="absolute inset-0 figma-canvas-grid opacity-30 pointer-events-none" />
            )}

            {/* Preview Frame Header */}
            <div className="relative z-10 flex items-center justify-between pb-3 mb-4 border-b" style={{ borderColor: currentTheme.borderColor }}>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentTheme.appAccent }} />
                <span className="text-xs font-semibold text-white font-mono">Frame #1 — AI Design Studio</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded text-white"
                  style={{ backgroundColor: currentTheme.appAccent }}
                >
                  Active Accent
                </span>
              </div>
            </div>

            {/* Mock Chat Conversation */}
            <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
              {/* User Message Bubble */}
              <div className="flex justify-end gap-2.5">
                <div
                  className="rounded-xl px-4 py-3 max-w-lg shadow-sm border transition-all"
                  style={{
                    backgroundColor: currentTheme.userBubbleBg,
                    color: currentTheme.userText,
                    borderColor: currentTheme.borderColor,
                  }}
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold mb-1 opacity-75">
                    <span>You</span>
                    <span className="text-[9px] font-mono opacity-60">Editable Test Prompt</span>
                  </div>
                  <textarea
                    rows={2}
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    className="w-full bg-transparent resize-none border-none outline-none text-xs leading-relaxed font-medium p-0 focus:ring-0"
                    style={{ color: currentTheme.userText }}
                  />
                </div>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: currentTheme.appAccent }}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* AI Response Card */}
              <div className="flex justify-start gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: currentTheme.appAccent }}
                >
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div
                  className="rounded-xl px-4 py-3 max-w-xl shadow-md border transition-all space-y-2"
                  style={{
                    backgroundColor: currentTheme.aiBubbleBg,
                    color: currentTheme.aiText,
                    borderColor: currentTheme.borderColor,
                  }}
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold opacity-75">
                    <span>MUmu AI</span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-mono text-white"
                      style={{ backgroundColor: currentTheme.appAccent }}
                    >
                      Gemini 2.5 Flash
                    </span>
                  </div>
                  <div className="text-xs leading-relaxed space-y-1.5 font-normal">
                    <p className="font-semibold" style={{ color: currentTheme.appAccent }}>
                      ### 🎯 Direct Answer
                    </p>
                    <p>
                      You can customize the <strong>app color</strong>, <strong>chat background</strong>,{' '}
                      <strong>user prompt bubble</strong>, and <strong>AI answer card</strong> in real time!
                      Every change is instantly rendered and saved to your browser.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRESET THEMES PALETTES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-white uppercase tracking-wider">
              Studio Preset Themes
            </h2>
            <span className="text-[10px] text-[#777777]">1-Click to apply curated palettes</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {PRESET_THEMES.map((theme) => {
              const isSelected = currentTheme.id === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => selectPreset(theme.id)}
                  className={`p-3 rounded-lg border text-left transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'border-[#0d99ff] bg-[#222222] shadow-md ring-1 ring-[#0d99ff]'
                      : 'border-[#383838] bg-[#1e1e1e] hover:border-[#555555] hover:bg-[#252525]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-xs text-white truncate">{theme.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#0d99ff]" />}
                  </div>

                  {/* Swatches preview row */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <div
                      className="w-5 h-5 rounded-full border border-black/30"
                      style={{ backgroundColor: theme.appAccent }}
                      title="App Accent"
                    />
                    <div
                      className="w-5 h-5 rounded-full border border-black/30"
                      style={{ backgroundColor: theme.chatBg }}
                      title="Chat Background"
                    />
                    <div
                      className="w-5 h-5 rounded-full border border-black/30"
                      style={{ backgroundColor: theme.userBubbleBg }}
                      title="User Bubble"
                    />
                    <div
                      className="w-5 h-5 rounded-full border border-black/30"
                      style={{ backgroundColor: theme.aiBubbleBg }}
                      title="AI Bubble"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CUSTOM COLOR SLIDERS / PICKERS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#383838] pb-2">
            <h2 className="text-xs font-semibold text-white uppercase tracking-wider">
              Fine-Grained Color Controls
            </h2>
            <span className="text-[10px] text-[#888888]">Adjust exact HEX or select swatch</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. App Accent Color */}
            <ColorField
              label="App Accent / Brand Color"
              description="Toolbar highlights, active icons, buttons & badges"
              value={currentTheme.appAccent}
              onChange={(c) => updateColor('appAccent', c)}
            />

            {/* 2. Studio Canvas Background */}
            <ColorField
              label="Studio Canvas Background"
              description="Overall outer window and workspace canvas"
              value={currentTheme.appBg}
              onChange={(c) => updateColor('appBg', c)}
            />

            {/* 3. Chat Frame Background */}
            <ColorField
              label="Chat Frame Background"
              description="Main artboard where conversations and messages flow"
              value={currentTheme.chatBg}
              onChange={(c) => updateColor('chatBg', c)}
            />

            {/* 4. User Bubble Background */}
            <ColorField
              label="User Chat Bubble Background"
              description="Background card color for messages you type"
              value={currentTheme.userBubbleBg}
              onChange={(c) => updateColor('userBubbleBg', c)}
            />

            {/* 5. User Text Color */}
            <ColorField
              label="User Message Text Color"
              description="Font color inside user prompt bubbles"
              value={currentTheme.userText}
              onChange={(c) => updateColor('userText', c)}
            />

            {/* 6. AI Answer Bubble Background */}
            <ColorField
              label="AI Answer Bubble Background"
              description="Card background for answers from PersonalGPT"
              value={currentTheme.aiBubbleBg}
              onChange={(c) => updateColor('aiBubbleBg', c)}
            />

            {/* 7. AI Answer Text Color */}
            <ColorField
              label="AI Answer Text Color"
              description="Font color for AI answers and explanations"
              value={currentTheme.aiText}
              onChange={(c) => updateColor('aiText', c)}
            />

            {/* 8. Border & Divider Color */}
            <ColorField
              label="Border & Frame Line Color"
              description="Subtle borders separating chat frames and panels"
              value={currentTheme.borderColor}
              onChange={(c) => updateColor('borderColor', c)}
            />
          </div>
        </div>

        {/* CANVAS PATTERN SELECTOR */}
        <div className="p-4 rounded-lg bg-[#222222] border border-[#383838] space-y-3">
          <div className="font-semibold text-white text-xs">Chat Canvas Grid Pattern</div>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setPattern('dots')}
              className={`p-3 rounded-md border flex items-center justify-center gap-2 text-xs font-medium transition-colors ${
                currentTheme.canvasPattern === 'dots'
                  ? 'border-[#0d99ff] bg-[#2a2a2a] text-white'
                  : 'border-[#383838] text-[#888888] hover:text-white'
              }`}
            >
              <CircleDot className="w-4 h-4 text-[#0d99ff]" />
              <span>Dot Matrix (Figma)</span>
            </button>

            <button
              type="button"
              onClick={() => setPattern('grid')}
              className={`p-3 rounded-md border flex items-center justify-center gap-2 text-xs font-medium transition-colors ${
                currentTheme.canvasPattern === 'grid'
                  ? 'border-[#0d99ff] bg-[#2a2a2a] text-white'
                  : 'border-[#383838] text-[#888888] hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4 text-[#00f0ff]" />
              <span>Cyber Grid</span>
            </button>

            <button
              type="button"
              onClick={() => setPattern('none')}
              className={`p-3 rounded-md border flex items-center justify-center gap-2 text-xs font-medium transition-colors ${
                currentTheme.canvasPattern === 'none'
                  ? 'border-[#0d99ff] bg-[#2a2a2a] text-white'
                  : 'border-[#383838] text-[#888888] hover:text-white'
              }`}
            >
              <Square className="w-4 h-4 text-[#888888]" />
              <span>Flat Solid</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
