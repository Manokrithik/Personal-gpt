import React from 'react';
import {
  Camera,
  Calculator,
  BookOpen,
  Code2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Compass
} from 'lucide-react';

interface WelcomeHeroProps {
  onSelectPrompt: (promptText: string) => void;
  onOpenCamera: () => void;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({ onSelectPrompt, onOpenCamera }) => {
  // Determine dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const samplePrompts = [
    {
      icon: '📐',
      title: 'Math Equation',
      badge: 'Step-by-Step',
      prompt: 'Solve the equation 2x² - 8x + 6 = 0 step-by-step with clean calculations.',
    },
    {
      icon: '🧬',
      title: 'Biology & Science',
      badge: 'Clear Stages',
      prompt: 'Explain how photosynthesis works step-by-step in simple, understandable terms.',
    },
    {
      icon: '⚛️',
      title: 'Quantum Physics',
      badge: 'Easy Analogy',
      prompt: 'Explain quantum computing using an easy real-world analogy in neat numbered steps.',
    },
    {
      icon: '💻',
      title: 'Code Architecture',
      badge: 'Clean Code',
      prompt: 'Write and explain a modern Python async worker with error handling step-by-step.',
    },
  ];

  return (
    <div className="relative min-h-full flex flex-col items-center justify-center px-4 py-10 max-w-4xl mx-auto w-full select-none animate-fade-in bg-aurora">
      {/* Top Floating Glowing Beacon */}
      <div className="relative mb-6 flex flex-col items-center">
        <div className="relative w-16 h-16 flex items-center justify-center group">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 blur-xl opacity-50 group-hover:opacity-80 transition-opacity animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-card/90 border border-white/15 flex items-center justify-center shadow-2xl backdrop-blur-xl">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>

        <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-secondary/80 border border-white/10 text-xs font-medium shadow-sm backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-foreground font-semibold">PersonalGPT Modern AI</span>
          <span className="text-muted-foreground/60">•</span>
          <span className="text-primary font-mono text-[11px]">Private Engine</span>
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <div className="text-center space-y-3 max-w-2xl mb-9">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
          {getGreeting()},{' '}
          <span className="text-gradient">
            what shall we solve today?
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto font-normal">
          PersonalGPT understands your questions and delivers <strong className="text-foreground font-semibold">neat, step-by-step</strong> answers. 
          Use the camera to scan problems, or type any request below.
        </p>
      </div>

      {/* 4 Unique Glassmorphism Interactive Launchpad Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
        {/* Card 1: Camera Scan & Search */}
        <div
          onClick={onOpenCamera}
          className="glass-card group relative p-5 rounded-2xl cursor-pointer hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-sm group-hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground group-hover:text-cyan-400 transition-colors">
                  Camera Scan & Search
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Multimodal
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Scan handwritten math equations, documents, textbook pages, or physical items for real-time visual solutions.
              </p>
            </div>
          </div>
          <div className="pt-4 flex items-center text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
            <span>Launch Camera Scanner</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </div>
        </div>

        {/* Card 2: Step-by-Step Solver */}
        <div
          onClick={() => onSelectPrompt('Solve this step-by-step with clean calculations: ')}
          className="glass-card group relative p-5 rounded-2xl cursor-pointer hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-sm group-hover:scale-110 transition-transform">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground group-hover:text-emerald-400 transition-colors">
                  Step-by-Step Solver
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Structured
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Break down math problems, scientific principles, and logic tasks into clean, numbered steps with zero confusing symbols.
              </p>
            </div>
          </div>
          <div className="pt-4 flex items-center text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>Solve a Problem</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </div>
        </div>

        {/* Card 3: RAG Knowledge Base */}
        <div
          onClick={() => onSelectPrompt('Summarize the key insights and facts from my uploaded knowledge base documents.')}
          className="glass-card group relative p-5 rounded-2xl cursor-pointer hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-sm group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground group-hover:text-purple-400 transition-colors">
                  Knowledge Base & Docs
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  RAG
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Ground answers in your private PDFs, research papers, and notes with verified source citations.
              </p>
            </div>
          </div>
          <div className="pt-4 flex items-center text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
            <span>Query Documents</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </div>
        </div>

        {/* Card 4: Code & Technical Architecture */}
        <div
          onClick={() => onSelectPrompt('Write and explain step-by-step: ')}
          className="glass-card group relative p-5 rounded-2xl cursor-pointer hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-sm group-hover:scale-110 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground group-hover:text-amber-400 transition-colors">
                  Code & System Architect
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Engineered
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Design system architectures, write clean commented code, and debug errors with full step-by-step reasoning.
              </p>
            </div>
          </div>
          <div className="pt-4 flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
            <span>Architect & Code</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </div>
        </div>
      </div>

      {/* Curated Quick-Action Starter Prompts */}
      <div className="w-full space-y-3 mb-8">
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span className="font-bold text-foreground flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-primary" />
            Quick Inspiration
          </span>
          <span className="text-[11px] text-muted-foreground/70">Click to execute immediately</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {samplePrompts.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(item.prompt)}
              className="glass-card text-left p-3 rounded-xl hover:border-primary/40 transition-all flex items-start gap-3 group"
            >
              <span className="text-lg select-none shrink-0 group-hover:scale-125 transition-transform">{item.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </span>
                  <span className="text-[9px] font-mono text-muted-foreground/80 px-1.5 py-0.2 rounded bg-secondary/80 border border-white/5">
                    {item.badge}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate leading-relaxed mt-0.5">
                  {item.prompt}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modern High-Tech Bottom Assurance Strip */}
      <div className="flex flex-wrap items-center justify-center gap-5 text-[11px] text-muted-foreground/70 pt-4 border-t border-white/5 w-full font-mono">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
          <span className="text-foreground/80">Multimodal Vision</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span className="text-foreground/80">100% Private Data</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-foreground/80">Neat Step-by-Step Logic</span>
        </div>
      </div>
    </div>
  );
};
