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
  CheckCircle2
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
      prompt: 'Solve the equation 2x² - 8x + 6 = 0 step-by-step with clean calculations.',
    },
    {
      icon: '🧬',
      title: 'Science Concept',
      prompt: 'Explain how photosynthesis works step-by-step in simple, understandable terms.',
    },
    {
      icon: '⚛️',
      title: 'Quantum Physics',
      prompt: 'Explain quantum computing using an easy real-world analogy in neat numbered steps.',
    },
    {
      icon: '💻',
      title: 'Clean Code',
      prompt: 'Write and explain a modern Python async worker with error handling step-by-step.',
    },
  ];

  return (
    <div className="relative min-h-full flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto w-full select-none animate-fade-in">
      {/* Background Ambient Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header Badge & Greeting */}
      <div className="text-center space-y-3 max-w-2xl mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 border border-primary/25 text-primary text-xs font-medium shadow-sm backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span>Next-Gen Private Modular AI Platform</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-[11px] text-muted-foreground font-mono">v0.1.0</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          {getGreeting()},{' '}
          <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            what would you like to explore?
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
          PersonalGPT understands your questions and delivers <strong className="text-foreground font-medium">neat, step-by-step</strong> answers. 
          Use the camera to scan problems, or type any request below.
        </p>
      </div>

      {/* 4 Unique Interactive Feature Launchpads */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full mb-8">
        {/* Card 1: Camera Scan & Search */}
        <div
          onClick={onOpenCamera}
          className="group relative p-4 rounded-2xl bg-card/60 hover:bg-card/90 border border-border/70 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 group-hover:bg-blue-500/10 rounded-bl-full transition-colors pointer-events-none" />
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-500 shadow-sm group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                Camera Scan & Search
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Visual
                </span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Scan handwritten math equations, documents, textbook pages, or physical items for real-time visual solutions.
              </p>
            </div>
          </div>
          <div className="pt-3 flex items-center text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
            <span>Launch Camera Scanner</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Card 2: Step-by-Step Solver */}
        <div
          onClick={() => onSelectPrompt('Solve this step-by-step with clean calculations: ')}
          className="group relative p-4 rounded-2xl bg-card/60 hover:bg-card/90 border border-border/70 hover:border-emerald-500/50 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 group-hover:bg-emerald-500/10 rounded-bl-full transition-colors pointer-events-none" />
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-sm group-hover:scale-105 transition-transform">
              <Calculator className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                Step-by-Step Solver
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Neat
                </span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Break down math problems, scientific principles, and logic tasks into clean, numbered steps with zero confusing symbols.
              </p>
            </div>
          </div>
          <div className="pt-3 flex items-center text-xs font-semibold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
            <span>Solve a Problem</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Card 3: RAG Knowledge Base */}
        <div
          onClick={() => onSelectPrompt('Summarize the key insights and facts from my uploaded knowledge base documents.')}
          className="group relative p-4 rounded-2xl bg-card/60 hover:bg-card/90 border border-border/70 hover:border-purple-500/50 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 group-hover:bg-purple-500/10 rounded-bl-full transition-colors pointer-events-none" />
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-500 shadow-sm group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-purple-400 transition-colors flex items-center gap-1.5">
                Knowledge Base & Docs
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  RAG
                </span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Ground answers in your private PDFs, research papers, and notes with verified source citations.
              </p>
            </div>
          </div>
          <div className="pt-3 flex items-center text-xs font-semibold text-purple-400 group-hover:translate-x-0.5 transition-transform">
            <span>Query Documents</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Card 4: Code & Technical Architecture */}
        <div
          onClick={() => onSelectPrompt('Write and explain step-by-step: ')}
          className="group relative p-4 rounded-2xl bg-card/60 hover:bg-card/90 border border-border/70 hover:border-amber-500/50 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 group-hover:bg-amber-500/10 rounded-bl-full transition-colors pointer-events-none" />
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                Code & Technical Architect
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Code
                </span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Design system architectures, write clean commented code, and debug errors with full step-by-step reasoning.
              </p>
            </div>
          </div>
          <div className="pt-3 flex items-center text-xs font-semibold text-amber-400 group-hover:translate-x-0.5 transition-transform">
            <span>Architect & Code</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>
      </div>

      {/* Curated Quick-Action Prompt Chips */}
      <div className="w-full space-y-2.5 mb-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-primary" />
            Try a Quick Question:
          </span>
          <span className="text-[11px] text-muted-foreground">Click to run immediately</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {samplePrompts.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(item.prompt)}
              className="text-left p-2.5 rounded-xl bg-secondary/40 hover:bg-secondary/80 border border-border/50 hover:border-primary/40 transition-all flex items-start gap-2.5 group"
            >
              <span className="text-base select-none shrink-0 group-hover:scale-110 transition-transform">{item.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </div>
                <p className="text-[11px] text-muted-foreground truncate leading-relaxed">
                  {item.prompt}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Minimal Assurance Strip */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground/80 pt-2 border-t border-border/30 w-full font-mono">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Multimodal Vision Ready</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>100% Private Architecture</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Neat Step-by-Step Explanations</span>
        </div>
      </div>
    </div>
  );
};
