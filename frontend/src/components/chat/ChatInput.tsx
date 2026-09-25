import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Paperclip, Sparkles, BookOpen, Brain, Wrench } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { useModelStore } from '../../store/modelStore';
import { useKnowledgeStore } from '../../store/knowledgeStore';

interface ChatInputProps {
  onOpenFileUpload?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onOpenFileUpload }) => {
  const [input, setInput] = useState('');
  const [useRag, setUseRag] = useState(true);
  const [useMemory, setUseMemory] = useState(true);
  const [useTools, setUseTools] = useState(true);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isStreaming, sendMessage, stopGeneration } = useChatStore();
  const { currentModel, currentProvider } = useModelStore();
  const { uploadFile } = useKnowledgeStore();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming) return;

    const text = input.trim();
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    sendMessage(text, {
      model: currentModel,
      provider: currentProvider,
      use_rag: useRag,
      use_memory: useMemory,
      use_tools: useTools,
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

  return (
    <div className="p-4 bg-background/80 backdrop-blur-md border-t border-border/50 max-w-4xl mx-auto w-full">
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

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask PersonalGPT anything, analyze documents, or perform tasks..."
          rows={1}
          className="w-full bg-transparent px-2 pt-2 text-sm text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none max-h-44 leading-relaxed"
        />

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 px-1">
          <div className="flex items-center gap-1">
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
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent/80 transition-colors"
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
                disabled={!input.trim()}
                className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all shadow-sm"
                title="Send message"
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
