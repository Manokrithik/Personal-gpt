import React, { useState } from 'react';
import { Bot, User, Copy, Check, FileText, ChevronDown, ChevronUp, Wrench } from 'lucide-react';
import { Message, Citation } from '../../types';

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, isStreaming }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Basic formatting helper for markdown code blocks and inline tags
  const renderFormattedContent = (content: string) => {
    if (!content && isStreaming) {
      return (
        <div className="flex items-center gap-1.5 py-1 text-muted-foreground text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot [animation-delay:0.2s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot [animation-delay:0.4s]" />
          <span className="ml-1 text-xs">Thinking...</span>
        </div>
      );
    }

    // Split by code blocks ```
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0].trim();
        const code = lines.slice(1).join('\n') || lines[0];

        return (
          <div key={idx} className="my-3 rounded-lg overflow-hidden border border-border/80 bg-zinc-950 text-zinc-100 text-xs shadow-md">
            <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[11px] text-zinc-400 font-mono">
              <span>{lang || 'code'}</span>
              <button
                onClick={() => navigator.clipboard.writeText(code)}
                className="hover:text-zinc-200 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>
            <pre className="p-3.5 overflow-x-auto leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Render regular text with paragraphs and line breaks
      return (
        <span key={idx} className="whitespace-pre-wrap leading-relaxed">
          {part}
        </span>
      );
    });
  };

  return (
    <div className={`py-4 px-4 sm:px-6 flex gap-3.5 sm:gap-4 ${isUser ? 'bg-secondary/20' : 'bg-background'}`}>
      <div className="shrink-0 mt-0.5">
        {isUser ? (
          <div className="w-7 h-7 rounded-full bg-accent border border-border flex items-center justify-center text-foreground font-semibold text-xs shadow-sm">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shadow-sm">
            <Bot className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">
              {isUser ? 'You' : 'PersonalGPT'}
            </span>
            {message.model && !isUser && (
              <span className="text-[10px] font-mono text-muted-foreground/80 px-1.5 py-0.2 rounded bg-secondary border border-border/50">
                {message.model}
              </span>
            )}
          </div>

          {!isUser && message.content && (
            <button
              onClick={handleCopy}
              className="text-muted-foreground/60 hover:text-foreground p-1 rounded transition-colors"
              title="Copy response"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="text-sm text-foreground/90 font-normal">
          {renderFormattedContent(message.content)}
        </div>

        {/* Citations / Sources Box */}
        {message.citations && message.citations.length > 0 && (
          <div className="mt-3 pt-2 border-t border-border/40">
            <button
              onClick={() => setShowSources(!showSources)}
              className="text-xs flex items-center gap-1.5 font-medium text-primary hover:underline py-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{message.citations.length} Verified Sources</span>
              {showSources ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showSources && (
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {message.citations.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-md bg-secondary/40 border border-border/50 text-xs space-y-1 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between font-medium text-foreground truncate">
                      <span className="truncate">{c.filename}</span>
                      {c.page && <span className="text-[10px] text-muted-foreground">p. {c.page}</span>}
                    </div>
                    <p className="text-muted-foreground text-[11px] line-clamp-3 leading-relaxed">
                      "{c.content}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
