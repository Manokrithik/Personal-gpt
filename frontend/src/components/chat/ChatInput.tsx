import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Paperclip, BookOpen, Brain, Wrench, Camera, X, Scan } from 'lucide-react';
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

  const { isStreaming, sendMessage, stopGeneration } = useChatStore();
  const { currentModel, currentProvider } = useModelStore();
  const { uploadFile } = useKnowledgeStore();

  const cameraFileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  // Support clipboard image pasting (Ctrl+V screenshot/photo)
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

    const text = input.trim() || 'Scan and search: Please analyze and explain this scanned image in detail.';
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
    'What is this?',
    'Solve this problem',
    'Explain in detail',
    'Extract text',
  ];

  return (
    <div className="p-4 bg-background/80 backdrop-blur-md border-t border-border/50 max-w-4xl mx-auto w-full">
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(base64, mimeType) => {
          setAttachedImage({
            base64,
            mimeType,
            previewUrl: `data:${mimeType};base64,${base64}`,
          });
        }}
      />

      <form onSubmit={handleSubmit} className="relative bg-secondary/40 border border-border/80 rounded-xl p-2.5 shadow-sm focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/30 transition-all">
        {/* Context Feature Pills */}
        <div className="flex items-center gap-1.5 pb-2 px-1 border-b border-border/40 text-[11px]">
          <button
            type="button"
            onClick={() => setUseRag(!useRag)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full border transition-colors ${
              useRag ? 'bg-primary/10 border-primary/30 text-primary font-medium' : 'border-transparent text-muted-foreground/60 hover:text-muted-foreground'
            }`}
            title="Toggle RAG document retrieval"
          >
            <BookOpen className="w-3 h-3" />
            RAG
          </button>

          <button
            type="button"
            onClick={() => setUseMemory(!useMemory)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full border transition-colors ${
              useMemory ? 'bg-primary/10 border-primary/30 text-primary font-medium' : 'border-transparent text-muted-foreground/60 hover:text-muted-foreground'
            }`}
            title="Toggle Long-Term Memory context"
          >
            <Brain className="w-3 h-3" />
            Memory
          </button>

          <button
            type="button"
            onClick={() => setUseTools(!useTools)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full border transition-colors ${
              useTools ? 'bg-primary/10 border-primary/30 text-primary font-medium' : 'border-transparent text-muted-foreground/60 hover:text-muted-foreground'
            }`}
            title="Toggle agentic tool calling (Calculator, File Search, etc.)"
          >
            <Wrench className="w-3 h-3" />
            Tools
          </button>

          <div className="ml-auto text-[10px] text-muted-foreground/60 font-mono hidden sm:inline">
            Shift + Enter for new line
          </div>
        </div>

        {/* Attached Scanned Image Preview & Question Quick-Chips */}
        {attachedImage && (
          <div className="mx-1 mt-2 mb-2 p-2.5 bg-primary/10 border border-primary/30 rounded-xl space-y-2">
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-border shadow-sm shrink-0 bg-secondary">
                <img src={attachedImage.previewUrl} alt="Camera scan preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Scan className="w-3.5 h-3.5 text-primary" />
                  <span>Camera Photo Captured</span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  Ready. Ask your question below and click Send.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Question Suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-primary/20">
              <span className="text-[10px] text-muted-foreground font-medium">Quick questions:</span>
              {quickQuestionSuggestions.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => setInput(prompt)}
                  className="px-2 py-0.5 rounded-full bg-secondary/80 hover:bg-primary/20 hover:text-primary border border-border/50 text-[10px] text-foreground font-medium transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={attachedImage ? "Type your question about this photo (e.g., 'What is this?', 'Solve this problem')..." : "Ask PersonalGPT anything, scan with camera, or perform tasks..."}
          rows={1}
          className="w-full bg-transparent px-2 pt-2 text-sm text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none max-h-44 leading-relaxed"
        />

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 px-1">
          <div className="flex items-center gap-2">
            {/* Prominent Camera Option */}
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary border border-primary/35 text-xs font-semibold transition-all shadow-sm active:scale-95"
              title="Access Camera: Take photo or scan document/question"
            >
              <Camera className="w-4 h-4" />
              <span>Camera</span>
            </button>

            {/* Hidden Direct Device Camera Input */}
            <input
              type="file"
              ref={cameraFileInputRef}
              onChange={handleDirectCameraCapture}
              className="hidden"
              accept="image/*"
              capture="environment"
            />

            {/* Document Upload Button */}
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
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent/80 transition-colors"
              title="Attach document to Knowledge Base (.pdf, .txt, .docx, .md, .csv)"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <span className="text-[11px] font-mono text-muted-foreground/70 px-2 py-0.5 rounded bg-secondary/80 border border-border/40">
              {currentModel}
            </span>
          </div>

          <div>
            {isStreaming ? (
              <button
                type="button"
                onClick={stopGeneration}
                className="p-2 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
                title="Stop generation"
              >
                <Square className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() && !attachedImage}
                className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all shadow-sm"
                title="Send question & photo"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
