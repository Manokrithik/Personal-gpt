import React, { useState } from 'react';
import {
  Bot,
  User,
  Copy,
  Check,
  FileText,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Download,
  Maximize2,
  X,
  ExternalLink
} from 'lucide-react';
import { Message, Citation } from '../../types';

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
}

// AI Image Generation Card Component with zoom, download, and copy
const GeneratedImageCard: React.FC<{ alt: string; url: string }> = ({ alt, url }) => {
  const [loaded, setLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const cleanName = (alt || 'mumu-ai-artwork')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 40);
      link.download = `${cleanName}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error('Failed to download image:', e);
      window.open(url, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="my-3 rounded-2xl overflow-hidden border border-primary/30 bg-card/90 backdrop-blur-xl shadow-xl transition-all hover:border-primary/60 max-w-xl group">
      {/* Studio Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-secondary/70 border-b border-border/40 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-primary">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-primary" />
          <span>MUmu AI Image Studio</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold">
            1024 × 1024 HD
          </span>
        </div>
      </div>

      {/* Image Container with Shimmer Skeleton */}
      <div className="relative overflow-hidden bg-black/50 min-h-[220px] flex items-center justify-center">
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground bg-secondary/30 animate-pulse">
            <Sparkles className="w-6 h-6 text-primary animate-spin" />
            <span className="text-xs font-mono">Generating high-res artwork...</span>
          </div>
        )}
        <img
          src={url}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onClick={() => setModalOpen(true)}
          className={`w-full max-h-[460px] object-cover transition-all duration-500 cursor-pointer ${
            loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          } hover:scale-[1.02]`}
        />

        {/* Hover Quick Action Overlay */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-lg">
          <button
            onClick={() => setModalOpen(true)}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            title="Expand Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopyLink}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            title="Copy Image URL"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Caption & Download Footer */}
      <div className="p-3 bg-secondary/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <p className="text-xs text-foreground/90 font-medium italic line-clamp-2">
          "{alt}"
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-xs hover:bg-primary/90 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Saving...' : 'Download Image'}</span>
          </button>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[92vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setModalOpen(false)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={url}
              alt={alt}
              className="max-h-[80vh] w-auto rounded-2xl shadow-2xl object-contain border border-white/15"
            />
            <div className="mt-3.5 flex items-center justify-between w-full px-2">
              <span className="text-white text-xs font-medium italic truncate max-w-md">{alt}</span>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-md hover:bg-primary/90 active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download HD
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const MessageItem: React.FC<MessageItemProps> = ({ message, isStreaming }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSpans = (text: string) => {
    const tokens = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
    return tokens.map((token, tIdx) => {
      if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
        return <strong key={tIdx} className="font-semibold text-foreground">{token.slice(2, -2)}</strong>;
      }
      if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
        return <code key={tIdx} className="px-1.5 py-0.5 rounded bg-secondary/80 text-[11px] font-mono border border-border/40 text-primary">{token.slice(1, -1)}</code>;
      }
      if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
        return <em key={tIdx} className="italic text-muted-foreground">{token.slice(1, -1)}</em>;
      }
      return token;
    });
  };

  const formatInlineText = (text: string) => {
    // Convert LaTeX math delimiters ($...$ and $$...$$) and symbols (\times, \div, etc.) into clean unicode
    const clean = text
      .replace(/\$\$([^$]+?)\$\$/g, '$1')
      .replace(/\$([^$]+?)\$/g, '$1')
      .replace(/\\times/g, '×')
      .replace(/\\div/g, '÷')
      .replace(/\\cdot/g, '·')
      .replace(/\\pm/g, '±')
      .replace(/\\approx/g, '≈')
      .replace(/\\neq/g, '≠')
      .replace(/\\leq/g, '≤')
      .replace(/\\geq/g, '≥');

    const lines = clean.split('\n');
    return lines.map((line, lIdx) => {
      // Check for Markdown Image: ![alt](url)
      const imgMatch = line.trim().match(/^!\[(.*?)\]\((https?:\/\/[^\s\)]+)\)$/);
      if (imgMatch) {
        return <GeneratedImageCard key={lIdx} alt={imgMatch[1]} url={imgMatch[2]} />;
      }
      const inlineImg = line.match(/!\[(.*?)\]\((https?:\/\/[^\s\)]+)\)/);
      if (inlineImg && line.trim().startsWith('![')) {
        return <GeneratedImageCard key={lIdx} alt={inlineImg[1]} url={inlineImg[2]} />;
      }

      if (line.startsWith('### ')) {
        return (
          <h4 key={lIdx} className="font-bold text-sm text-foreground mt-3 mb-1.5">
            {formatSpans(line.slice(4))}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={lIdx} className="font-bold text-base text-foreground mt-3 mb-1.5">
            {formatSpans(line.slice(3))}
          </h3>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h2 key={lIdx} className="font-bold text-lg text-foreground mt-3 mb-2">
            {formatSpans(line.slice(2))}
          </h2>
        );
      }
      if (line.includes('Executed tool')) {
        return (
          <div key={lIdx} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-md my-1 border border-border/40 font-mono">
            {formatSpans(line)}
          </div>
        );
      }

      return (
        <p key={lIdx} className={line.trim() === '' ? 'h-2' : 'leading-relaxed my-0.5'}>
          {formatSpans(line)}
        </p>
      );
    });
  };

  // Formatting helper for markdown code blocks, inline tags, and clean math
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

      // Render regular text with clean math and markdown formatting
      return (
        <div key={idx} className="space-y-0.5">
          {formatInlineText(part)}
        </div>
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
              {isUser ? 'You' : 'MUmu AI'}
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

        {/* Scanned / Uploaded Image */}
        {message.extra_metadata?.image_data && (
          <div className="mb-2">
            <div className="relative inline-block max-w-xs sm:max-w-sm rounded-xl overflow-hidden border border-border shadow-sm bg-secondary/40">
              <img
                src={
                  message.extra_metadata.image_data.startsWith('data:')
                    ? message.extra_metadata.image_data
                    : `data:${message.extra_metadata.image_mime_type || 'image/jpeg'};base64,${message.extra_metadata.image_data}`
                }
                alt="Visual scan"
                className="max-h-56 sm:max-h-64 rounded-xl object-cover cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => {
                  const src = message.extra_metadata?.image_data.startsWith('data:')
                    ? message.extra_metadata.image_data
                    : `data:${message.extra_metadata?.image_mime_type || 'image/jpeg'};base64,${message.extra_metadata.image_data}`;
                  const win = window.open();
                  if (win) {
                    win.document.write(`<img src="${src}" style="max-width:100%; height:auto;" />`);
                  }
                }}
              />
              <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-medium text-white flex items-center gap-1">
                📷 Scanned Image
              </div>
            </div>
          </div>
        )}

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
