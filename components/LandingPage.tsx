'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Sparkles, ShieldCheck, Lock, Cpu, ArrowRight, Zap, CheckCircle2, Flame, Bot } from 'lucide-react';

export function LandingPage() {
  const { signInWithGoogle, loading, error, clearError } = useAuth();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden bg-zinc-950 px-4 py-12 sm:px-6 bg-grid-pattern">
      {/* Dynamic ambient gradient glow */}
      <div className="pointer-events-none absolute inset-0 bg-mesh-glow opacity-80" />

      <div className="relative z-10 mx-auto w-full max-w-4xl">
        {/* Error notification if any */}
        {error && (
          <div
            id="auth-error-banner"
            role="alert"
            className="mb-8 flex items-center justify-between rounded-2xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-300 backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-red-200">Auth Alert:</span>
              <span>{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-xs font-medium text-red-400 hover:text-red-200 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Hero Area */}
        <div className="text-center pt-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/90 px-4 py-1.5 text-xs font-semibold text-zinc-300 shadow-inner backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-lime-400 animate-ping" />
            <span className="text-lime-400">Gemini 3.6 Flash</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">Private Firestore Vault</span>
          </div>

          <h1 className="mt-8 font-sans text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            Vibe check your mind, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-lime-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              guided by Gemini AI.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-zinc-400">
            A frictionless, aesthetic space to brain-dump, untangle complex emotions, and converse
            with an empathetic AI mirror. Fully encrypted & isolated to your private Firestore vault.
          </p>

          {/* Primary Action Button */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              id="btn-google-signin"
              type="button"
              onClick={signInWithGoogle}
              disabled={loading}
              className="group relative flex w-full max-w-xs items-center justify-center gap-3 overflow-hidden rounded-2xl bg-zinc-100 px-6 py-4 text-sm font-bold text-zinc-950 shadow-lg shadow-lime-500/10 transition-all hover:bg-white hover:scale-[1.02] hover:shadow-lime-500/20 active:scale-[0.98] disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.54 0 2.89.55 3.93 1.54l2.94-2.94C17.09 1.94 14.73 1 12 1 7.39 1 3.51 3.64 1.62 7.46l3.52 2.73C6.01 7.21 8.76 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.88c2.17-2 3.71-4.94 3.71-8.7z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.14 14.81c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31L1.62 7.46C.59 9.53 0 11.72 0 14s.59 4.47 1.62 6.54l3.52-2.73z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.88c-1.07.72-2.45 1.16-4.22 1.16-3.24 0-5.99-2.21-6.86-5.19L1.62 16.02C3.51 19.84 7.39 23 12 23z"
                />
              </svg>
              <span>{loading ? 'Entering Vault...' : 'Continue with Google'}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500 font-medium">
            <Lock className="h-3 w-3 text-zinc-400" />
            <span>Zero-password storage • Direct Google Federated Auth</span>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div id="pillar-user-isolation" className="group rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-md transition-all hover:border-zinc-700 hover:bg-zinc-900/90">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700/50 text-lime-400 shadow-sm">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-base font-bold text-zinc-100 flex items-center gap-2">
              Isolated Vault
              <span className="rounded-full bg-lime-400/10 px-2 py-0.5 text-[10px] font-semibold text-lime-400">100% Private</span>
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Your journal entries live exclusively under your authenticated UID in Cloud Firestore. No cross-tenant reads allowed.
            </p>
          </div>

          <div id="pillar-ai-reflections" className="group rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-md transition-all hover:border-zinc-700 hover:bg-zinc-900/90">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700/50 text-emerald-400 shadow-sm">
              <Bot className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-base font-bold text-zinc-100 flex items-center gap-2">
              Gemini Co-Pilot
              <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">Multi-Model</span>
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Converse through deep multi-turn reflections with automated 4-model fallback ladders for zero-downtime intelligence.
            </p>
          </div>

          <div id="pillar-journal-history" className="group rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-md transition-all hover:border-zinc-700 hover:bg-zinc-900/90">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700/50 text-teal-400 shadow-sm">
              <Zap className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-base font-bold text-zinc-100 flex items-center gap-2">
              Instant Sync
              <span className="rounded-full bg-teal-400/10 px-2 py-0.5 text-[10px] font-semibold text-teal-400">Real-Time</span>
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Live Firestore snapshots ensure your thoughts, moods, and conversation transcripts are persistently saved instantly.
            </p>
          </div>
        </div>

        {/* Security & Verification Checklist */}
        <div className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-lime-400" />
            Security & Production Architecture
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-lime-400 shrink-0" />
              <span>OWASP-compliant server-side proxy for API keys</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-lime-400 shrink-0" />
              <span>Owner-bound Firestore path validation (`request.auth.uid == userId`)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-lime-400 shrink-0" />
              <span>Resilient fallback ladder (Gemini 3.6 Flash → 3.1 Flash-Lite)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-lime-400 shrink-0" />
              <span>Zero-crash sanitized document payloads</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <footer className="relative z-10 mt-12 text-center text-xs text-zinc-500 font-medium">
        ReflectAI Journal • Next.js 15 • Gemini 3.6 Flash • Firebase Auth & Cloud Firestore
      </footer>
    </div>
  );
}

