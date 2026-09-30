import React from 'react';
import { Sparkles, Calendar, LogIn } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

interface WelcomeHeroProps {
  onSelectPrompt: (promptText: string) => void;
  onOpenCamera: () => void;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = () => {
  const { user, isAuthenticated, openAuthModal } = useAuthStore();
  const { currentTheme } = useThemeStore();

  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }); // e.g. "Monday"
  const formattedDate = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }); // e.g. "Sep 28, 2026"

  const displayName = isAuthenticated && user ? (user.display_name || user.username) : null;

  return (
    <div className="relative min-h-[55vh] flex flex-col items-center justify-center px-4 py-8 max-w-xl mx-auto w-full select-none animate-in fade-in duration-300">
      {/* Sleek Ambient Glowing Logo Aura */}
      <div className="relative mb-5 flex items-center justify-center">
        <div
          className="absolute -inset-3 rounded-full blur-2xl opacity-20 animate-pulse"
          style={{ backgroundColor: currentTheme.appAccent }}
        />
        <div
          className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl border transition-all"
          style={{
            backgroundColor: 'var(--theme-ai-bubble-bg, #202225)',
            borderColor: 'var(--theme-border, #33373e)',
          }}
        >
          <Sparkles
            className="w-7 h-7 transition-colors drop-shadow-sm"
            style={{ color: currentTheme.appAccent }}
          />
        </div>
      </div>

      {/* Date & Day Pill */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e1e1e] border border-[#333333] text-xs text-[#a0a0a0] mb-3 shadow-inner">
        <Calendar className="w-3.5 h-3.5 text-[#0d99ff]" />
        <span className="font-semibold text-white">{dayName}</span>
        <span className="text-[#555555]">•</span>
        <span>{formattedDate}</span>
      </div>

      {/* Headline: Hi [Username], Happy [Today's Day]! */}
      <div className="text-center space-y-2.5">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
          Hi{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(135deg, #ffffff 30%, ${currentTheme.appAccent} 100%)`,
            }}
          >
            {displayName || 'there'}
          </span>
          , Happy {dayName}!
        </h1>
        <p className="text-xs sm:text-sm text-[#888888] font-normal leading-relaxed max-w-md mx-auto">
          Converse naturally, write code, solve problems, and explore ideas with human-level clarity.
        </p>

        {/* Quick Sign In prompt if guest */}
        {!isAuthenticated && (
          <div className="pt-2">
            <button
              onClick={() => openAuthModal('login')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#0d99ff] hover:text-white bg-[#0d99ff]/10 hover:bg-[#0d99ff] border border-[#0d99ff]/30 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign in to save your personal profile</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

