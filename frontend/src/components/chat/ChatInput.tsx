import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Paperclip,
  BookOpen,
  Brain,
  Wrench,
  Camera,
  X,
  Scan,
  Sparkles,
  Component,
  Image as ImageIcon
} from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { useModelStore } from '../../store/modelStore';
import { useKnowledgeStore } from '../../store/knowledgeStore';
import { CameraModal } from './CameraModal';

interface ChatInputProps {
  onOpenFileUpload?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onOpenFileUpload }) => {
  const [input, setInput] = useState('');
  const [useRag, setUseRag] = useState(true);
  const [useMemory, setUseMemory] = useState(true);
  const [useTools, setUseTools] = useState(true);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [attachedImage, setAttachedImage] = useState<{
    base64: string;
    mimeType: string;
    previewUrl: string;
  } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraFileInputRef = useRef<HTMLInputElement>(null);

  const { isStreaming, sendMessage, stopGeneration, isCameraModalOpen, setCameraModalOpen } = useChatStore();
  const { currentModel, currentProvider } = useModelStore();
  const { uploadFile } = useKnowledgeStore();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.replace(/^data:image\/[a-z]+;base64,/, '');
            setAttachedImage({
              base64,
              mimeType: file.type || 'image/jpeg',
              previewUrl: result,
            });
          };
          reader.readAsDataURL(file);
          e.preventDefault();
          break;
        }
      }
    }
  };

  const handleDirectCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.replace(/^data:image\/[a-z]+;base64,/, '');
        setAttachedImage({
          base64,
          mimeType: file.type || 'image/jpeg',
          previewUrl: result,
        });
      };
      reader.readAsDataURL(file);
      if (cameraFileInputRef.current) cameraFileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !attachedImage) || isStreaming) return;

    const text = input.trim() || 'Scan and inspect: Please analyze this image layer on canvas.';
    const imagePayload = attachedImage
      ? {
          image_data: attachedImage.base64,
          image_mime_type: attachedImage.mimeType,
        }
      : {};

    setInput('');
    setAttachedImage(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    sendMessage(text, {
      model: currentModel,
      provider: currentProvider,
      use_rag: useRag,
      use_memory: useMemory,
      use_tools: useTools,
      ...imagePayload,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const quickQuestionSuggestions = [
    'What is this component?',
    'Solve this equation',
    'Extract text / OCR',
    'Create Figma layout',
  ];

  return (
    <div className="p-3 sm:p-4 max-w-3xl mx-auto w-full shrink-0 z-20">
      <CameraModal
        isOpen={isCameraOpen || isCameraModalOpen}
        onClose={() => {
          setIsCameraOpen(false);
          setCameraModalOpen(false);
        }}
        onCapture={(base64, mimeType) => {
          setAttachedImage({
            base64,
            mimeType,
            previewUrl: `data:${mimeType};base64,${base64}`,
          });
          setIsCameraOpen(false);
          setCameraModalOpen(false);
        }}
      />

      {/* Figma UI3 Floating Dock Card */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-[#262626]/95 backdrop-blur-xl border border-[#383838] focus-within:border-[#0d99ff] focus-within:shadow-[0_0_0_1px_#0d99ff] rounded-xl p-2.5 shadow-2xl transition-all"
      >
        {/* Top Control Bar: Context Pills & Layer Toggles */}
        <div className="flex items-center gap-1.5 pb-2 px-1 border-b border-[#333333] text-[11px]">
          <button
            type="button"
            onClick={() => setUseRag(!useRag)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-all ${
              useRag
                ? 'bg-[#0d99ff]/20 border-[#0d99ff]/50 text-[#0d99ff] font-semibold'
                : 'border-transparent text-[#777777] hover:text-[#cccccc]'
            }`}
            title="Toggle RAG document retrieval"
          >
            <Component className="w-3 h-3" />
            <span>RAG</span>
          </button>

          <button
            type="button"
            onClick={() => setUseMemory(!useMemory)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-all ${
              useMemory
                ? 'bg-[#9747ff]/20 border-[#9747ff]/50 text-[#a259ff] font-semibold'
                : 'border-transparent text-[#777777] hover:text-[#cccccc]'
            }`}
            title="Toggle Long-Term Memory context"
          >
            <Brain className="w-3 h-3" />
            <span>Memory</span>
          </button>

          <button
            type="button"
            onClick={() => setUseTools(!useTools)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-all ${
              useTools
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 font-semibold'
                : 'border-transparent text-[#777777] hover:text-[#cccccc]'
            }`}
            title="Toggle agentic tool calling"
          >
            <Wrench className="w-3 h-3" />
            <span>Tools</span>
          </button>

          <div className="ml-auto text-[10px] text-[#666666] font-mono hidden sm:inline">
            Return ↵ to send
          </div>
        </div>

        {/* Attached Image Preview */}
        {attachedImage && (
          <div className="mx-1 mt-2 mb-2 p-2 bg-[#1e1e1e] border border-[#383838] rounded-lg space-y-2">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded overflow-hidden border border-[#444444] shrink-0 bg-black">
                <img src={attachedImage.previewUrl} alt="Captured layer" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-medium text-white">
                  <Scan className="w-3.5 h-3.5 text-[#0d99ff]" />
                  <span>Image Canvas Layer Attached</span>
                </div>
                <p className="text-[10px] text-[#888888] truncate">
                  Ready for visual inference and analysis.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="p-1 rounded text-[#777777] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-[#333333]">
              <span className="text-[10px] text-[#777777]">Quick actions:</span>
              {quickQuestionSuggestions.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => setInput(prompt)}
                  className="px-2 py-0.5 rounded bg-[#2c2c2c] hover:bg-[#0d99ff]/20 hover:text-[#0d99ff] border border-[#383838] text-[10px] text-[#cccccc] transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Prompt Input Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={attachedImage ? "Ask about this visual layer (e.g. 'Generate Figma code', 'Inspect text')..." : "Type a prompt or design request on the canvas..."}
          rows={1}
          className="w-full bg-transparent px-2 pt-2 text-xs sm:text-sm text-white placeholder-[#777777] resize-none focus:outline-none max-h-40 leading-relaxed font-sans"
        />

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-1 px-1">
          <div className="flex items-center gap-1.5">
            {/* Camera Scan Button */}
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1e1e1e] hover:bg-[#333333] border border-[#383838] text-[11px] font-medium transition-colors cursor-pointer"
              style={{ color: 'var(--theme-app-accent, #0d99ff)' }}
              title="Camera Scan & Inspect"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera</span>
            </button>

            {/* Hidden Direct File Camera */}
            <input
              type="file"
              ref={cameraFileInputRef}
              onChange={handleDirectCameraCapture}
              className="hidden"
              accept="image/*"
              capture="environment"
            />

            {/* File Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.txt,.md,.docx,.csv"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-[#888888] hover:text-white rounded hover:bg-[#333333] transition-colors"
              title="Upload file to Knowledge Base"
            >
              <Paperclip className="w-3.5 h-3.5" />
            </button>

            {/* Active Model Tag */}
            <span className="text-[10px] font-mono text-[#888888] px-2 py-0.5 rounded bg-[#1e1e1e] border border-[#333333] hidden sm:inline-block">
              {currentModel}
            </span>
          </div>

          <div>
            {isStreaming ? (
              <button
                type="button"
                onClick={stopGeneration}
                className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30 transition-all cursor-pointer"
                title="Stop generation"
              >
                <Square className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() && !attachedImage}
                className="p-1.5 px-3 rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer text-xs"
                style={{ backgroundColor: 'var(--theme-app-accent, #0d99ff)' }}
                title="Send to AI Canvas"
              >
                <span>Run</span>
                <Send className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
