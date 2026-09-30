import React, { useState } from 'react';
import {
  X,
  Link2,
  Copy,
  Check,
  Download,
  Share2,
  Globe,
  Lock,
  FileText,
  FileCode,
  Users
} from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { useModelStore } from '../../store/modelStore';

export interface FigmaShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FigmaShareModal: React.FC<FigmaShareModalProps> = ({ isOpen, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [permission, setPermission] = useState('view');
  const { messages, activeConversationId, conversations } = useChatStore();
  const { currentModel } = useModelStore();

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExportMarkdown = () => {
    if (!messages.length) return;
    let md = `# ${activeConv?.title || 'PersonalGPT Conversation'}\n\n`;
    md += `*Exported from PersonalGPT Figma Studio (${currentModel}) on ${new Date().toLocaleString()}*\n\n---\n\n`;
    messages.forEach((m) => {
      md += `### ${m.role === 'user' ? '🧑 User' : '🤖 Assistant'}\n\n${m.content}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(activeConv?.title || 'conversation').replace(/[^a-z0-9]/gi, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (!messages.length) return;
    const json = JSON.stringify(
      {
        id: activeConversationId,
        title: activeConv?.title,
        model: currentModel,
        exported_at: new Date().toISOString(),
        messages: messages,
      },
      null,
      2
    );

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(activeConv?.title || 'conversation').replace(/[^a-z0-9]/gi, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#2c2c2c] border border-[#383838] rounded-xl shadow-2xl overflow-hidden z-10 text-xs text-[#cccccc]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#383838]">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#0d99ff]" />
            <h3 className="font-semibold text-sm text-white">Share canvas & conversation</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#383838] text-[#888888] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 space-y-4">
          {/* Email / Invite Row */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-white">Invite Collaborator</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Email or username..."
                className="flex-1 bg-[#1e1e1e] border border-[#383838] rounded-md px-3 py-1.5 text-xs text-white placeholder-[#777777] focus:outline-none focus:border-[#0d99ff]"
              />
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
                className="bg-[#1e1e1e] border border-[#383838] rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#0d99ff]"
              >
                <option value="view">Can view</option>
                <option value="edit">Can prompt</option>
              </select>
              <button className="px-3 py-1.5 rounded-md bg-[#0d99ff] hover:bg-[#007be5] text-white font-semibold transition-colors">
                Send
              </button>
            </div>
          </div>

          {/* Link Sharing Status */}
          <div className="p-3 rounded-lg bg-[#1e1e1e] border border-[#383838] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-white font-medium text-[11px]">Anyone with the link</div>
                <div className="text-[10px] text-[#888888]">Can view this canvas & prompt conversation</div>
              </div>
            </div>
            <span className="text-[10px] text-[#0d99ff] font-medium">Public Draft</span>
          </div>

          {/* Direct File Export Buttons */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-semibold text-white">Export Artifacts</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportMarkdown}
                className="p-2.5 rounded-lg bg-[#1e1e1e] border border-[#383838] hover:border-[#0d99ff] text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-white font-medium">
                  <FileText className="w-3.5 h-3.5 text-[#0d99ff]" />
                  <span>Markdown (.md)</span>
                </div>
                <div className="text-[10px] text-[#777777] mt-0.5">Formatted conversation log</div>
              </button>

              <button
                onClick={handleExportJSON}
                className="p-2.5 rounded-lg bg-[#1e1e1e] border border-[#383838] hover:border-[#0d99ff] text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-white font-medium">
                  <FileCode className="w-3.5 h-3.5 text-[#9747ff]" />
                  <span>JSON Payload (.json)</span>
                </div>
                <div className="text-[10px] text-[#777777] mt-0.5">Machine-readable data</div>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer with Copy Link */}
        <div className="px-4 py-3 border-t border-[#383838] bg-[#242424] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-[#888888]">
            <Link2 className="w-3.5 h-3.5" />
            <span className="truncate max-w-[200px]">{window.location.origin}</span>
          </div>

          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-md bg-[#383838] hover:bg-[#0d99ff] hover:text-white text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
