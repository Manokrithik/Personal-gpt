import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  User as UserIcon,
  Mail,
  KeyRound,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Palette,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const AVATAR_COLORS = [
  '#0d99ff', // Figma Blue
  '#9747ff', // Figma Purple
  '#00b574', // Figma Green
  '#f24e1e', // Figma Orange
  '#ff7262', // Figma Coral
  '#1abcfe', // Figma Sky
];

export const FigmaAuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    isLoading,
    error,
    login,
    register,
    resetPassword,
    closeAuthModal,
    openAuthModal,
    clearError,
  } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  // Clear all form inputs and errors
  const resetForm = () => {
    setUsername('');
    setPassword('');
    setDisplayName('');
    setEmail('');
    setSelectedColor(AVATAR_COLORS[0]);
    setIsResettingPassword(false);
    clearError();
  };

  // Whenever the modal opens or the mode changes, reset all fields to be blank
  useEffect(() => {
    if (isAuthModalOpen) {
      resetForm();
    }
  }, [isAuthModalOpen, authModalMode]);

  const handleClose = () => {
    resetForm();
    closeAuthModal();
  };

  if (!isAuthModalOpen) return null;

  const isLogin = authModalMode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) return;

    let success = false;
    if (isResettingPassword) {
      success = await resetPassword(cleanUser, cleanPass);
    } else if (isLogin) {
      success = await login(cleanUser, cleanPass);
    } else {
      success = await register(
        cleanUser,
        cleanPass,
        email.trim(),
        displayName.trim(),
        selectedColor
      );
    }

    if (success) {
      resetForm();
      closeAuthModal();
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    clearError();
    try {
      const ok = await login('owner', 'admin123');
      if (ok) {
        resetForm();
        closeAuthModal();
      }
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={handleClose} />

      <div className="relative w-full max-w-md bg-[#2c2c2c] border border-[#383838] rounded-xl shadow-2xl overflow-hidden z-10 text-xs text-[#cccccc]">
        {/* Header with Figma Tab Switcher */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#383838] bg-[#242424]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#0d99ff] to-[#9747ff] flex items-center justify-center text-white shadow-sm">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white leading-tight">
                {isLogin ? 'Sign In to PersonalGPT' : 'Create Studio Account'}
              </h3>
              <p className="text-[10px] text-[#888888]">
                {isLogin
                  ? 'Access your private canvas, memories & models'
                  : 'Get a personalized multi-agent AI workspace'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-[#383838] text-[#888888] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch header */}
        <div className="flex border-b border-[#383838] bg-[#1e1e1e]">
          <button
            type="button"
            onClick={() => {
              resetForm();
              openAuthModal('login');
            }}
            className={`flex-1 py-2 text-center text-xs font-medium border-b-2 transition-colors ${
              isLogin
                ? 'border-[#0d99ff] text-white bg-[#262626]'
                : 'border-transparent text-[#888888] hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              resetForm();
              openAuthModal('register');
            }}
            className={`flex-1 py-2 text-center text-xs font-medium border-b-2 transition-colors ${
              !isLogin
                ? 'border-[#0d99ff] text-white bg-[#262626]'
                : 'border-transparent text-[#888888] hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{typeof error === 'string' ? error : JSON.stringify(error)}</span>
            </div>
          )}

          {/* Quick Demo Login Option */}
          {isLogin && (
            <div className="p-2.5 rounded-lg bg-[#202020] border border-[#383838] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#9747ff]" />
                <div>
                  <div className="text-white font-medium text-[11px]">Quick Local Demo</div>
                  <div className="text-[10px] text-[#888888]">
                    Account: <code className="text-[#0d99ff]">owner</code> (Password:{' '}
                    <code className="text-[#0d99ff]">admin123</code>)
                  </div>
                </div>
              </div>
              <button
                type="button"
                disabled={demoLoading || isLoading}
                onClick={handleDemoLogin}
                className="px-2.5 py-1 rounded bg-[#383838] hover:bg-[#0d99ff] text-white text-[11px] font-medium transition-colors flex items-center gap-1"
              >
                {demoLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : '1-Click Login'}
              </button>
            </div>
          )}

          {/* Username */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-[#cccccc] flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-[#888888]" />
              <span>Username</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. alex or owner"
              className="w-full bg-[#1e1e1e] border border-[#383838] rounded-md px-3 py-1.5 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#0d99ff]"
            />
          </div>

          {/* Display Name (Only in Register) */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[#cccccc] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#888888]" />
                <span>Display Name</span>
                <span className="text-[#666666] text-[10px]">(Optional)</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Alex Designer"
                className="w-full bg-[#1e1e1e] border border-[#383838] rounded-md px-3 py-1.5 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#0d99ff]"
              />
            </div>
          )}

          {/* Email (Only in Register) */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[#cccccc] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#888888]" />
                <span>Email</span>
                <span className="text-[#666666] text-[10px]">(Optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@studio.ai"
                className="w-full bg-[#1e1e1e] border border-[#383838] rounded-md px-3 py-1.5 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#0d99ff]"
              />
            </div>
          )}

          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-[#cccccc] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#888888]" />
                <span>{isResettingPassword ? 'New Password' : 'Password'}</span>
              </label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsResettingPassword(!isResettingPassword);
                    clearError();
                  }}
                  className="text-[10px] text-[#0d99ff] hover:underline cursor-pointer"
                >
                  {isResettingPassword ? '← Back to Sign In' : 'Forgot / Reset Password?'}
                </button>
              )}
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isResettingPassword ? 'Enter your new password' : '••••••••'}
              className="w-full bg-[#1e1e1e] border border-[#383838] rounded-md px-3 py-1.5 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#0d99ff]"
            />
          </div>

          {/* Avatar Color Swatches (Register) */}
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-[#cccccc] flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#888888]" />
                <span>Avatar Studio Color</span>
              </label>
              <div className="flex items-center gap-2">
                {AVATAR_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setSelectedColor(col)}
                    style={{ backgroundColor: col }}
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 border-2 border-[#1e1e1e]"
                  >
                    {selectedColor === col && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full h-8 rounded-md bg-[#0d99ff] hover:bg-[#007be5] disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    {isResettingPassword
                      ? 'Resetting Password...'
                      : isLogin
                      ? 'Signing In...'
                      : 'Creating Account...'}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {isResettingPassword
                      ? 'Reset Password & Sign In'
                      : isLogin
                      ? 'Sign In'
                      : 'Create Account'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="px-4 py-2.5 border-t border-[#383838] bg-[#222222] flex items-center justify-between text-[10px] text-[#777777]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted PBKDF2 + JWT Session</span>
          </div>
          <span>PersonalGPT Studio</span>
        </div>
      </div>
    </div>
  );
};
