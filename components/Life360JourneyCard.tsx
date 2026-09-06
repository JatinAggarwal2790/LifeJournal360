'use client';

import React, { useState, useRef } from 'react';
import type { Life360JourneySynthesis } from '@/lib/types';
import {
  Sparkles,
  Compass,
  CheckCircle2,
  Circle,
  Lightbulb,
  MessageSquare,
  Flame,
  ArrowRight,
  TrendingUp,
  Download,
  Copy,
  Check,
  Zap,
  Activity,
  Layers,
  ShieldCheck,
  RefreshCw,
  Sun,
  Palette,
  CheckCheck,
  Trophy,
  Smile,
  Heart,
  Droplets,
  Feather,
  Rocket,
} from 'lucide-react';

export type MoodThemeKey = 'amber' | 'emerald' | 'teal' | 'lime' | 'violet' | 'coral';

interface Life360JourneyCardProps {
  synthesis: Life360JourneySynthesis;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onClose?: () => void;
  title?: string;
  dateStr?: string;
  activeMood?: string;
}

interface ThemeConfig {
  name: string;
  icon: React.ReactNode;
  bgGradient: string;
  cardBg: string;
  accentColor: string;
  accentText: string;
  badgeBg: string;
  glowColor: string;
  borderColor: string;
  pillGradient: string;
  svgBg1: string;
  svgBg2: string;
  svgAccent: string;
}

const THEMES: Record<MoodThemeKey, ThemeConfig> = {
  amber: {
    name: 'Warm Sunrise',
    icon: <Sun className="h-4 w-4 text-amber-300" />,
    bgGradient: 'from-amber-950/80 via-orange-950/60 to-zinc-950',
    cardBg: 'bg-gradient-to-br from-amber-900/40 via-zinc-900/90 to-amber-950/60',
    accentColor: 'bg-amber-400 text-zinc-950',
    accentText: 'text-amber-300',
    badgeBg: 'bg-amber-400/15 border-amber-400/40 text-amber-300',
    glowColor: 'shadow-amber-500/20',
    borderColor: 'border-amber-500/40',
    pillGradient: 'from-amber-400 to-orange-400',
    svgBg1: '#451a03',
    svgBg2: '#1c1917',
    svgAccent: '#fbbf24',
  },
  lime: {
    name: 'Electric Neon',
    icon: <Zap className="h-4 w-4 text-lime-300" />,
    bgGradient: 'from-lime-950/80 via-zinc-950 to-emerald-950/70',
    cardBg: 'bg-gradient-to-br from-lime-950/40 via-zinc-900/90 to-emerald-950/50',
    accentColor: 'bg-lime-400 text-zinc-950',
    accentText: 'text-lime-300',
    badgeBg: 'bg-lime-400/15 border-lime-400/40 text-lime-300',
    glowColor: 'shadow-lime-500/20',
    borderColor: 'border-lime-500/40',
    pillGradient: 'from-lime-400 to-emerald-400',
    svgBg1: '#14532d',
    svgBg2: '#09090b',
    svgAccent: '#a3e635',
  },
  emerald: {
    name: 'Zen Botanical',
    icon: <Feather className="h-4 w-4 text-emerald-300" />,
    bgGradient: 'from-emerald-950/80 via-teal-950/60 to-zinc-950',
    cardBg: 'bg-gradient-to-br from-emerald-900/40 via-zinc-900/90 to-teal-950/60',
    accentColor: 'bg-emerald-400 text-zinc-950',
    accentText: 'text-emerald-300',
    badgeBg: 'bg-emerald-400/15 border-emerald-400/40 text-emerald-300',
    glowColor: 'shadow-emerald-500/20',
    borderColor: 'border-emerald-500/40',
    pillGradient: 'from-emerald-400 to-teal-300',
    svgBg1: '#064e3b',
    svgBg2: '#18181b',
    svgAccent: '#34d399',
  },
  teal: {
    name: 'Calm Ocean',
    icon: <Droplets className="h-4 w-4 text-cyan-300" />,
    bgGradient: 'from-cyan-950/80 via-sky-950/60 to-indigo-950',
    cardBg: 'bg-gradient-to-br from-cyan-950/40 via-zinc-900/90 to-sky-950/60',
    accentColor: 'bg-cyan-400 text-zinc-950',
    accentText: 'text-cyan-300',
    badgeBg: 'bg-cyan-400/15 border-cyan-400/40 text-cyan-300',
    glowColor: 'shadow-cyan-500/20',
    borderColor: 'border-cyan-500/40',
    pillGradient: 'from-cyan-400 to-sky-400',
    svgBg1: '#083344',
    svgBg2: '#0f172a',
    svgAccent: '#38bdf8',
  },
  violet: {
    name: 'Cosmic Aurora',
    icon: <Sparkles className="h-4 w-4 text-purple-300" />,
    bgGradient: 'from-purple-950/80 via-indigo-950/60 to-pink-950/70',
    cardBg: 'bg-gradient-to-br from-purple-950/40 via-zinc-900/90 to-fuchsia-950/50',
    accentColor: 'bg-purple-400 text-zinc-950',
    accentText: 'text-purple-300',
    badgeBg: 'bg-purple-400/15 border-purple-400/40 text-purple-300',
    glowColor: 'shadow-purple-500/20',
    borderColor: 'border-purple-500/40',
    pillGradient: 'from-purple-400 to-pink-400',
    svgBg1: '#3b0764',
    svgBg2: '#18181b',
    svgAccent: '#c084fc',
  },
  coral: {
    name: 'Sunset Passion',
    icon: <Rocket className="h-4 w-4 text-rose-300" />,
    bgGradient: 'from-rose-950/80 via-red-950/60 to-orange-950',
    cardBg: 'bg-gradient-to-br from-rose-950/40 via-zinc-900/90 to-orange-950/60',
    accentColor: 'bg-rose-400 text-zinc-950',
    accentText: 'text-rose-300',
    badgeBg: 'bg-rose-400/15 border-rose-400/40 text-rose-300',
    glowColor: 'shadow-rose-500/20',
    borderColor: 'border-rose-500/40',
    pillGradient: 'from-rose-400 to-orange-400',
    svgBg1: '#4c0519',
    svgBg2: '#18181b',
    svgAccent: '#fb7185',
  },
};

export function Life360JourneyCard({
  synthesis,
  onRefresh,
  isRefreshing = false,
  onClose,
  title = 'Reflection Journey',
  dateStr,
  activeMood,
}: Life360JourneyCardProps) {
  // Infer initial theme from synthesis visualTheme or activeMood
  const initialThemeKey: MoodThemeKey = (() => {
    if (synthesis.visualTheme && THEMES[synthesis.visualTheme as MoodThemeKey]) {
      return synthesis.visualTheme as MoodThemeKey;
    }
    const m = (activeMood || '').toLowerCase();
    if (m.includes('grateful') || m.includes('peace') || m.includes('warm')) return 'amber';
    if (m.includes('ground') || m.includes('clear') || m.includes('calm')) return 'emerald';
    if (m.includes('overwhelm') || m.includes('anxious') || m.includes('tired')) return 'teal';
    if (m.includes('energiz') || m.includes('excite') || m.includes('focus')) return 'lime';
    if (m.includes('torn') || m.includes('conflict') || m.includes('lost')) return 'violet';
    if (m.includes('restless') || m.includes('driven')) return 'coral';
    return 'lime';
  })();

  const [activeTheme, setActiveTheme] = useState<MoodThemeKey>(initialThemeKey);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const theme = THEMES[activeTheme] || THEMES.lime;

  const toggleStep = (idx: number) => {
    const newState = !completedSteps[idx];
    setCompletedSteps((prev) => {
      const updated = { ...prev, [idx]: newState };
      // Check if all steps completed
      const totalSteps = synthesis.actionSteps.length;
      const allDone = totalSteps > 0 && Object.values(updated).filter(Boolean).length === totalSteps;
      if (allDone) {
        setCelebrating(true);
        setTimeout(() => setCelebrating(false), 3000);
      }
      return updated;
    });
  };

  const handleCopyText = () => {
    const text = [
      `🌟 Life360: Journey So Far - ${title}`,
      `📌 "${synthesis.headline}"`,
      '',
      `💭 Thoughts Discussed:`,
      ...synthesis.thoughts.map((t) => `• ${t}`),
      '',
      `💡 Key Insights:`,
      ...synthesis.insights.map((i) => `• ${i}`),
      '',
      `⚡ Action Steps:`,
      ...synthesis.actionSteps.map((a) => `• ${a}`),
      '',
      `📊 Live Clarity Analytics:`,
      `• Clarity Score: ${synthesis.analytics.clarityScore}%`,
      `• Emotional Shift: ${synthesis.analytics.emotionalShift}`,
      `• Focus Domain: ${synthesis.analytics.cognitiveFocus}`,
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Export the vibrant visual infographic card as a rich standalone SVG image
   */
  const handleDownloadVisualSvg = () => {
    setDownloading(true);
    try {
      const svgWidth = 840;
      const svgHeight = 640;
      const clarity = synthesis.analytics.clarityScore;
      const today = dateStr || new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

      const thoughtsSvg = synthesis.thoughts
        .slice(0, 3)
        .map(
          (t, i) =>
            `<rect x="50" y="${300 + i * 44}" width="340" height="36" rx="10" fill="#18181b" fill-opacity="0.9" stroke="#3f3f46" stroke-width="1"/>
            <text x="65" y="${323 + i * 44}" fill="#f4f4f5" font-size="12" font-family="system-ui, sans-serif">💭 ${escapeXml(t)}</text>`
        )
        .join('');

      const insightsSvg = synthesis.insights
        .slice(0, 3)
        .map(
          (ins, i) =>
            `<rect x="420" y="${300 + i * 44}" width="370" height="36" rx="10" fill="#18181b" fill-opacity="0.9" stroke="${theme.svgAccent}" stroke-opacity="0.4" stroke-width="1"/>
            <text x="435" y="${323 + i * 44}" fill="#fef08a" font-size="12" font-family="system-ui, sans-serif">💡 ${escapeXml(ins)}</text>`
        )
        .join('');

      const actionsSvg = synthesis.actionSteps
        .slice(0, 3)
        .map(
          (act, i) =>
            `<rect x="50" y="${480 + i * 40}" width="740" height="34" rx="10" fill="#18181b" fill-opacity="0.9" stroke="${theme.svgAccent}" stroke-opacity="0.5" stroke-width="1"/>
            <circle cx="70" cy="${497 + i * 40}" r="7" fill="none" stroke="${theme.svgAccent}" stroke-width="2"/>
            <text x="90" y="${501 + i * 40}" fill="#ffffff" font-size="12" font-weight="600" font-family="system-ui, sans-serif">${escapeXml(act)}</text>`
        )
        .join('');

      const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
  <defs>
    <linearGradient id="mainBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.svgBg1}" />
      <stop offset="100%" stop-color="${theme.svgBg2}" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${theme.svgAccent}" />
      <stop offset="100%" stop-color="#ffffff" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="15" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  
  <!-- Canvas Card -->
  <rect width="100%" height="100%" rx="32" fill="url(#mainBg)" stroke="#3f3f46" stroke-width="2"/>
  <circle cx="780" cy="60" r="140" fill="${theme.svgAccent}" fill-opacity="0.12" filter="url(#glow)"/>
  
  <!-- Header Bar -->
  <rect x="50" y="40" width="200" height="32" rx="16" fill="${theme.svgAccent}" fill-opacity="0.18" stroke="${theme.svgAccent}" stroke-opacity="0.4"/>
  <text x="68" y="61" fill="${theme.svgAccent}" font-size="12" font-weight="bold" font-family="system-ui, sans-serif">✨ Life360 • Journey</text>
  <text x="790" y="61" fill="#a1a1aa" font-size="12" text-anchor="end" font-family="system-ui, sans-serif">${today}</text>
  
  <!-- Title & Headline -->
  <text x="50" y="105" fill="#ffffff" font-size="22" font-weight="bold" font-family="system-ui, sans-serif">${escapeXml(title)}</text>
  <rect x="50" y="125" width="740" height="42" rx="12" fill="#09090b" fill-opacity="0.6" stroke="#27272a"/>
  <text x="65" y="151" fill="#e4e4e7" font-size="13" font-style="italic" font-family="system-ui, sans-serif">"${escapeXml(synthesis.headline)}"</text>
  
  <!-- Analytics Banner -->
  <rect x="50" y="185" width="740" height="65" rx="16" fill="#18181b" fill-opacity="0.8" stroke="#3f3f46" stroke-width="1"/>
  
  <text x="75" y="210" fill="#a1a1aa" font-size="10" font-weight="bold" font-family="system-ui, sans-serif">CLARITY SCORE</text>
  <text x="75" y="235" fill="${theme.svgAccent}" font-size="20" font-weight="bold" font-family="system-ui, sans-serif">${clarity}%</text>
  
  <line x1="200" y1="195" x2="200" y2="240" stroke="#3f3f46" stroke-width="1"/>
  
  <text x="225" y="210" fill="#a1a1aa" font-size="10" font-weight="bold" font-family="system-ui, sans-serif">EMOTIONAL SHIFT</text>
  <text x="225" y="233" fill="#ffffff" font-size="13" font-weight="bold" font-family="system-ui, sans-serif">${escapeXml(synthesis.analytics.emotionalShift)}</text>
  
  <line x1="540" y1="195" x2="540" y2="240" stroke="#3f3f46" stroke-width="1"/>
  
  <text x="565" y="210" fill="#a1a1aa" font-size="10" font-weight="bold" font-family="system-ui, sans-serif">CORE FOCUS DOMAIN</text>
  <text x="565" y="233" fill="${theme.svgAccent}" font-size="13" font-weight="bold" font-family="system-ui, sans-serif">${escapeXml(synthesis.analytics.cognitiveFocus)}</text>
  
  <!-- Thoughts & Insights Section -->
  <text x="50" y="285" fill="#a1a1aa" font-size="12" font-weight="bold" font-family="system-ui, sans-serif">💭 THOUGHTS DISCUSSED</text>
  ${thoughtsSvg}
  
  <text x="420" y="285" fill="#fef08a" font-size="12" font-weight="bold" font-family="system-ui, sans-serif">💡 KEY INSIGHTS</text>
  ${insightsSvg}
  
  <!-- Action Steps Section -->
  <text x="50" y="465" fill="${theme.svgAccent}" font-size="12" font-weight="bold" font-family="system-ui, sans-serif">⚡ ACTION STEPS &amp; PLEDGES</text>
  ${actionsSvg}
  
  <text x="790" y="615" fill="#71717a" font-size="10" text-anchor="end" font-family="system-ui, sans-serif">Life Journal 360 • Visual Synthesis</text>
</svg>`.trim();

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `life360_${(title || 'reflection').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export visual SVG:', e);
    } finally {
      setDownloading(false);
    }
  };

  function escapeXml(unsafe: string) {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '&':
          return '&amp;';
        case "'":
          return '&apos;';
        case '"':
          return '&quot;';
        default:
          return c;
      }
    });
  }

  const clarityScore = synthesis.analytics.clarityScore || 85;

  return (
    <div
      ref={cardRef}
      className={`relative w-full overflow-hidden rounded-3xl border ${theme.borderColor} ${theme.cardBg} p-5 sm:p-7 shadow-2xl ${theme.glowColor} backdrop-blur-2xl transition-all duration-300`}
    >
      {/* Decorative Atmosphere Glow Bubbles */}
      <div
        className={`pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full ${theme.badgeBg} opacity-20 blur-3xl`}
      />
      <div
        className={`pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full ${theme.badgeBg} opacity-15 blur-3xl`}
      />

      {/* Top Header: Badge, Theme Selector, Toolbar */}
      <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-2xl ${theme.badgeBg} border shadow-inner transition-transform hover:scale-105`}
          >
            {theme.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-black uppercase tracking-wider ${theme.accentText}`}>
                Life360 • Journey So Far
              </span>
              <span className="rounded-full bg-zinc-900/90 border border-zinc-700/80 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-400" /> Current Dialogue Only
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {dateStr || new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Theme Palette Switcher & Actions */}
        <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
          {/* Quick Visual Theme Switcher */}
          <div className="flex items-center rounded-full bg-zinc-950/80 p-1 border border-zinc-800">
            {(Object.keys(THEMES) as MoodThemeKey[]).map((tKey) => {
              const th = THEMES[tKey];
              const isSel = activeTheme === tKey;
              return (
                <button
                  key={tKey}
                  type="button"
                  onClick={() => setActiveTheme(tKey)}
                  className={`h-6 w-6 rounded-full flex items-center justify-center transition-all ${
                    isSel
                      ? `${th.accentColor} scale-110 shadow-sm font-bold`
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                  title={`Switch theme: ${th.name}`}
                >
                  <span className="text-[10px]">{tKey[0].toUpperCase()}</span>
                </button>
              );
            })}
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/90 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-700 hover:text-white disabled:opacity-50"
              title="Refresh visual journey synthesis from current discussion"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin text-lime-400' : ''}`} />
              <span className="hidden sm:inline">Re-analyze</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyText}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/90 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
            title="Copy structured text"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadVisualSvg}
            disabled={downloading}
            className={`inline-flex items-center gap-1.5 rounded-full ${theme.accentColor} px-3.5 py-1.5 text-xs font-bold transition hover:scale-105 active:scale-95 shadow-md`}
            title="Download colorful infographic card (SVG)"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Card</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-zinc-800/80 p-1.5 text-zinc-400 hover:bg-zinc-700 hover:text-white transition"
              title="Close"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Focus Headline with Dynamic Mood Banner */}
      <div className="relative z-10 mt-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 p-4 sm:p-5 shadow-inner">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[10px] font-extrabold uppercase tracking-widest ${theme.accentText}`}>
            🌟 Core Focus from Current Dialogue
          </span>
          <span className="rounded-full bg-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-400">
            {synthesis.analytics.turnCount} Turns • {synthesis.analytics.wordCount} Words
          </span>
        </div>
        <h3 className="mt-2 text-base sm:text-xl font-extrabold text-zinc-100 leading-snug">
          &ldquo;{synthesis.headline}&rdquo;
        </h3>
      </div>

      {/* Quick Analytics Visual Grid */}
      <div className="relative z-10 mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Clarity Score Gauge */}
        <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/80 p-3.5 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
              Clarity Index
            </span>
            <Activity className={`h-3.5 w-3.5 ${theme.accentText}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className={`text-2xl font-black ${theme.accentText}`}>{clarityScore}%</span>
            <span className="text-[10px] text-zinc-400 font-semibold">grounded</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${theme.pillGradient} transition-all duration-700`}
              style={{ width: `${clarityScore}%` }}
            />
          </div>
        </div>

        {/* Emotional Shift */}
        <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/80 p-3.5 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
              Emotional Shift
            </span>
            <Flame className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="mt-2 text-xs font-bold text-zinc-100 flex items-center gap-1 leading-snug line-clamp-2">
            <span>{synthesis.analytics.emotionalShift || 'Tension → Clarity'}</span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block font-medium">Session Trajectory</span>
        </div>

        {/* Core Life Focus */}
        <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/80 p-3.5 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
              Core Focus
            </span>
            <Compass className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <div className="mt-2 text-xs font-bold text-sky-300 truncate">
            {synthesis.analytics.cognitiveFocus || 'Personal Focus'}
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block font-medium">Validated Domain</span>
        </div>

        {/* Growth Velocity */}
        <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/80 p-3.5 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
              Rhythm
            </span>
            <TrendingUp className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-sm font-black text-purple-300">
              {synthesis.analytics.growthVelocity}
            </span>
            <span className="text-[10px] text-zinc-400">velocity</span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block font-medium">
            Active Reflection
          </span>
        </div>
      </div>

      {/* Bento 3-Pillar Layout: Thoughts, Insights, Action Steps */}
      <div className="relative z-10 mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Pillar 1: Thoughts Discussed */}
        <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/80 p-4.5 shadow-inner flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2.5 mb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
                <MessageSquare className="h-3.5 w-3.5" />
              </span>
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-200">
                  1. Thoughts Expressed
                </h4>
                <p className="text-[10px] text-zinc-400">Raw context from current dialogue</p>
              </div>
            </div>
            <ul className="space-y-2.5">
              {synthesis.thoughts.map((thought, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 p-3 text-xs text-zinc-200 leading-snug shadow-sm hover:border-zinc-700 transition"
                >
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-400">
                    {idx + 1}
                  </span>
                  <span className="font-medium">{thought}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pillar 2: Key Breakthrough Insights */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4.5 shadow-inner flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-amber-500/30 pb-2.5 mb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Lightbulb className="h-3.5 w-3.5" />
              </span>
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                  2. Key Insights
                </h4>
                <p className="text-[10px] text-amber-300/70">Perspective shifts realized</p>
              </div>
            </div>
            <ul className="space-y-2.5">
              {synthesis.insights.map((insight, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 rounded-xl bg-zinc-900/90 border border-amber-500/30 p-3 text-xs text-zinc-100 leading-snug shadow-sm hover:border-amber-400/50 transition"
                >
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  <span className="font-medium">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pillar 3: Actionable Steps & Commitments */}
        <div
          className={`rounded-2xl border ${theme.borderColor} ${theme.badgeBg} p-4.5 shadow-inner flex flex-col justify-between`}
        >
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-lg ${theme.accentColor} shadow-sm`}
                >
                  <Zap className="h-3.5 w-3.5" />
                </span>
                <div>
                  <h4 className={`text-xs font-extrabold uppercase tracking-wider ${theme.accentText}`}>
                    3. Actionable Commitments
                  </h4>
                  <p className="text-[10px] text-zinc-400">Micro-steps ready to execute</p>
                </div>
              </div>
              {celebrating && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-black text-zinc-950 animate-bounce">
                  <Trophy className="h-3 w-3" /> All Set!
                </span>
              )}
            </div>

            <ul className="space-y-2.5">
              {synthesis.actionSteps.map((step, idx) => {
                const isDone = !!completedSteps[idx];
                return (
                  <li
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs transition cursor-pointer select-none leading-snug shadow-sm ${
                      isDone
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200 line-through opacity-80'
                        : `bg-zinc-900/90 ${theme.borderColor} text-zinc-100 hover:border-lime-400 hover:scale-[1.01]`
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                    )}
                    <span className="font-bold">{step}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="mt-3 text-[10px] text-zinc-400 text-right italic font-medium">
            *Tap step to mark complete
          </div>
        </div>
      </div>
    </div>
  );
}
