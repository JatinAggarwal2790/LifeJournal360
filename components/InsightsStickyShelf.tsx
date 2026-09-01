'use client';

import React, { useState } from 'react';
import type { JournalInteraction, Life360JourneySynthesis } from '@/lib/types';
import {
  Lightbulb,
  Zap,
  Sparkles,
  CheckCircle2,
  Circle,
  Pin,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  TrendingUp,
  Compass,
  Smile,
  Activity,
  Layers,
  Flame,
  CheckCheck,
  Trophy,
  Filter,
} from 'lucide-react';

interface InsightsStickyShelfProps {
  interaction: JournalInteraction | null;
  currentSynthesis?: Life360JourneySynthesis | null;
  onSynthesize?: () => void;
  isSynthesizing?: boolean;
  isOpen: boolean;
  onToggleOpen: () => void;
}

// Playful pastel palettes for insight notes
const INSIGHT_NOTE_PALETTES = [
  {
    bg: 'bg-amber-100 text-amber-950 border-amber-300/90 shadow-amber-900/15',
    pinColor: 'text-amber-600',
    badgeBg: 'bg-amber-300/80 text-amber-950',
    iconColor: 'text-amber-700',
    rotation: '-rotate-1',
  },
  {
    bg: 'bg-purple-100 text-purple-950 border-purple-300/90 shadow-purple-900/15',
    pinColor: 'text-purple-600',
    badgeBg: 'bg-purple-300/80 text-purple-950',
    iconColor: 'text-purple-700',
    rotation: 'rotate-1',
  },
  {
    bg: 'bg-sky-100 text-sky-950 border-sky-300/90 shadow-sky-900/15',
    pinColor: 'text-sky-600',
    badgeBg: 'bg-sky-300/80 text-sky-950',
    iconColor: 'text-sky-700',
    rotation: '-rotate-2',
  },
];

// Playful vibrant palettes for action commitment notes
const ACTION_NOTE_PALETTES = [
  {
    bg: 'bg-lime-100 text-lime-950 border-lime-300/90 shadow-lime-900/15',
    doneBg: 'bg-emerald-950/80 text-emerald-200 border-emerald-500/50 shadow-none',
    pinColor: 'text-lime-700',
    badgeBg: 'bg-lime-300/80 text-lime-950',
    iconColor: 'text-lime-700',
    rotation: 'rotate-2',
  },
  {
    bg: 'bg-emerald-100 text-emerald-950 border-emerald-300/90 shadow-emerald-900/15',
    doneBg: 'bg-emerald-950/80 text-emerald-200 border-emerald-500/50 shadow-none',
    pinColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-300/80 text-emerald-950',
    iconColor: 'text-emerald-700',
    rotation: '-rotate-1',
  },
  {
    bg: 'bg-rose-100 text-rose-950 border-rose-300/90 shadow-rose-900/15',
    doneBg: 'bg-rose-950/80 text-rose-200 border-rose-500/50 shadow-none',
    pinColor: 'text-rose-700',
    badgeBg: 'bg-rose-300/80 text-rose-950',
    iconColor: 'text-rose-700',
    rotation: 'rotate-1',
  },
];

export function InsightsStickyShelf({
  interaction,
  currentSynthesis,
  onSynthesize,
  isSynthesizing = false,
  isOpen,
  onToggleOpen,
}: InsightsStickyShelfProps) {
  // Use either active live session synthesis or interaction's persisted synthesis
  const synthesis = currentSynthesis || interaction?.journeySynthesis || null;

  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [filterMode, setFilterMode] = useState<'all' | 'insights' | 'actions'>('all');
  const [copied, setCopied] = useState(false);
  const [celebration, setCelebration] = useState(false);

  const insights = synthesis?.insights || [];
  const actionSteps = synthesis?.actionSteps || [];
  const thoughts = synthesis?.thoughts || [];

  const totalInsights = insights.length;
  const totalActions = actionSteps.length;
  const totalNotes = totalInsights + totalActions + (synthesis ? 1 : 0);

  const toggleActionStep = (actionText: string, idx: number) => {
    const key = `${interaction?.id || 'active'}_${idx}_${actionText}`;
    const newState = !completedSteps[key];
    setCompletedSteps((prev) => {
      const next = { ...prev, [key]: newState };
      // Check if all action steps are done
      if (actionSteps.length > 0) {
        const completedCount = actionSteps.filter((step, i) => next[`${interaction?.id || 'active'}_${i}_${step}`]).length;
        if (completedCount === actionSteps.length) {
          setCelebration(true);
          setTimeout(() => setCelebration(false), 3500);
        }
      }
      return next;
    });
  };

  const handleCopyAll = () => {
    if (!synthesis) return;
    const lines = [
      `📌 Reflection: ${interaction?.title || 'Current Reflection'}`,
      `🎯 "${synthesis.headline}"`,
      '',
      `💡 KEY INSIGHTS:`,
      ...insights.map((ins, i) => `${i + 1}. ${ins}`),
      '',
      `⚡ ACTION COMMITMENTS:`,
      ...actionSteps.map((act, i) => `${i + 1}. [ ] ${act}`),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Toggle button on the right edge if closed */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggleOpen}
          className="fixed right-2 top-20 z-40 flex items-center gap-1.5 rounded-l-2xl border border-zinc-700 bg-zinc-900/95 py-2 px-3 text-xs font-bold text-lime-400 shadow-xl backdrop-blur-md hover:bg-zinc-800 hover:scale-105 transition"
          title="Open Insights & Action Commitments Sticky Notes"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <div className="flex items-center gap-1">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            <Zap className="h-3.5 w-3.5 text-lime-400" />
          </div>
          <span className="hidden sm:inline">Insights & Actions</span>
          {totalNotes > 0 && (
            <span className="rounded-full bg-lime-400/20 px-1.5 py-0.2 text-[10px] text-lime-300">
              {totalNotes}
            </span>
          )}
        </button>
      )}

      {/* Slide-out Insights & Action Commitments Shelf / Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-40 flex flex-col border-l border-zinc-800 bg-zinc-950/95 backdrop-blur-2xl transition-all duration-300 shadow-2xl ${
          isOpen ? 'w-80 sm:w-92 translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        {/* Shelf Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 p-4 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/30">
                <Lightbulb className="h-4 w-4" />
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-400/20 text-lime-400 border border-lime-400/30">
                <Zap className="h-4 w-4" />
              </span>
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-zinc-100 flex items-center gap-1.5">
                Insights & Actions
                {totalNotes > 0 && (
                  <span className="rounded-full bg-lime-400/20 px-2 py-0.5 text-[10px] font-bold text-lime-300">
                    {totalNotes}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-zinc-400 truncate max-w-[150px]">
                {interaction?.title || 'Active Reflection'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {synthesis && (
              <button
                type="button"
                onClick={handleCopyAll}
                className="rounded-xl border border-zinc-700 bg-zinc-800/80 p-1.5 text-zinc-300 hover:bg-zinc-700 hover:text-white transition"
                title="Copy all insights & commitments"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            )}
            <button
              type="button"
              onClick={onToggleOpen}
              className="rounded-xl bg-zinc-800/80 p-1.5 text-zinc-400 hover:bg-zinc-700 hover:text-white transition"
              title="Close drawer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter Chips Bar */}
        {synthesis && (
          <div className="flex items-center justify-between border-b border-zinc-800/70 px-3 py-2 bg-zinc-950/80 text-[11px]">
            <div className="flex items-center gap-1 font-semibold text-zinc-400">
              <Filter className="h-3 w-3" /> Filter:
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`rounded-lg px-2 py-0.5 font-bold transition ${
                  filterMode === 'all'
                    ? 'bg-zinc-700 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                All ({totalNotes})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('insights')}
                className={`rounded-lg px-2 py-0.5 font-bold transition ${
                  filterMode === 'insights'
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                💡 Insights ({totalInsights})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('actions')}
                className={`rounded-lg px-2 py-0.5 font-bold transition ${
                  filterMode === 'actions'
                    ? 'bg-lime-400/20 text-lime-300 border border-lime-400/40'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                ⚡ Actions ({totalActions})
              </button>
            </div>
          </div>
        )}

        {/* Sticky Notes Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/40">
          {celebration && (
            <div className="rounded-2xl border border-emerald-500/50 bg-emerald-950/80 p-3.5 text-center text-xs font-black text-emerald-300 shadow-xl animate-bounce flex items-center justify-center gap-2">
              <Trophy className="h-4 w-4 text-emerald-400" />
              <span>All actionable commitments completed! 🌟</span>
            </div>
          )}

          {!synthesis ? (
            /* No synthesis available yet: invite to synthesize */
            <div className="rounded-3xl border-2 border-dashed border-zinc-800 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-3">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-extrabold text-zinc-100">
                No Insights Synthesized Yet
              </h4>
              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                {interaction && interaction.messages.length > 0
                  ? 'Extract key psychological breakthroughs and concrete micro-commitments from this discussion.'
                  : 'Start a conversation on the canvas, and your key insights and action commitments will automatically pin here!'}
              </p>

              {onSynthesize && (
                <button
                  type="button"
                  onClick={onSynthesize}
                  disabled={isSynthesizing || (interaction ? interaction.messages.length === 0 : true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-lime-400 px-4 py-2.5 text-xs font-black text-zinc-950 hover:bg-lime-300 transition shadow-lg disabled:opacity-40"
                >
                  <Sparkles className={`h-4 w-4 ${isSynthesizing ? 'animate-spin' : ''}`} />
                  <span>{isSynthesizing ? 'Synthesizing...' : 'Extract Insights & Actions'}</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* 1. Core Focus & Trajectory Sticky Note */}
              {(filterMode === 'all' || filterMode === 'insights') && (
                <div className="group relative rounded-2xl border border-zinc-700 bg-zinc-900 text-zinc-100 p-4 shadow-xl -rotate-1 hover:rotate-0 transition-transform">
                  {/* Pin Graphic */}
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
                    <Pin className="h-4 w-4 text-zinc-400 fill-current drop-shadow" />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 mb-1 pt-1">
                    <span className="flex items-center gap-1 text-lime-400">
                      <Sparkles className="h-3 w-3" /> CORE TRAJECTORY
                    </span>
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-zinc-300 font-mono">
                      {synthesis.analytics.clarityScore}% Clarity
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-zinc-100 leading-snug italic mt-1">
                    &ldquo;{synthesis.headline}&rdquo;
                  </h4>

                  <div className="mt-2.5 flex items-center justify-between border-t border-zinc-800 pt-2 text-[10px] text-zinc-400">
                    <span className="flex items-center gap-1 font-semibold text-amber-300">
                      <Flame className="h-3 w-3 text-amber-400" />
                      {synthesis.analytics.emotionalShift}
                    </span>
                    <span className="text-sky-300 font-bold">
                      {synthesis.analytics.cognitiveFocus}
                    </span>
                  </div>
                </div>
              )}

              {/* 2. Key Insights Sticky Notes */}
              {(filterMode === 'all' || filterMode === 'insights') && (
                <>
                  <div className="flex items-center gap-1.5 pt-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                    <Lightbulb className="h-3.5 w-3.5" />
                    <span>Key Insights ({insights.length})</span>
                  </div>

                  {insights.map((insight, idx) => {
                    const palette = INSIGHT_NOTE_PALETTES[idx % INSIGHT_NOTE_PALETTES.length];
                    return (
                      <div
                        key={`insight_${idx}`}
                        className={`group relative rounded-2xl border p-4 shadow-md transition-all duration-200 ${
                          palette.bg
                        } ${palette.rotation} hover:rotate-0 hover:scale-[1.02] hover:shadow-xl`}
                      >
                        {/* Pin Graphic */}
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
                          <Pin className={`h-4 w-4 drop-shadow fill-current ${palette.pinColor}`} />
                        </div>

                        {/* Note Header */}
                        <div className="flex items-center justify-between text-[10px] font-bold opacity-80 mb-1.5 pt-1">
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${palette.badgeBg} flex items-center gap-1`}>
                            <Lightbulb className="h-2.5 w-2.5" /> Insight #{idx + 1}
                          </span>
                          <span className="text-[9px] opacity-70 font-semibold">Perspective Shift</span>
                        </div>

                        {/* Insight Text */}
                        <p className="text-xs font-bold leading-relaxed">
                          {insight}
                        </p>
                      </div>
                    );
                  })}
                </>
              )}

              {/* 3. Actionable Commitments Sticky Notes */}
              {(filterMode === 'all' || filterMode === 'actions') && (
                <>
                  <div className="flex items-center gap-1.5 pt-2 text-[11px] font-extrabold uppercase tracking-wider text-lime-400">
                    <Zap className="h-3.5 w-3.5" />
                    <span>Action Commitments ({actionSteps.length})</span>
                  </div>

                  {actionSteps.map((step, idx) => {
                    const key = `${interaction?.id || 'active'}_${idx}_${step}`;
                    const isDone = !!completedSteps[key];
                    const palette = ACTION_NOTE_PALETTES[idx % ACTION_NOTE_PALETTES.length];

                    return (
                      <div
                        key={`action_${idx}`}
                        onClick={() => toggleActionStep(step, idx)}
                        className={`group relative rounded-2xl border p-4 shadow-md transition-all duration-200 cursor-pointer select-none ${
                          isDone ? palette.doneBg : palette.bg
                        } ${palette.rotation} hover:rotate-0 hover:scale-[1.02] hover:shadow-xl`}
                      >
                        {/* Pin Graphic */}
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
                          <Pin className={`h-4 w-4 drop-shadow fill-current ${palette.pinColor}`} />
                        </div>

                        {/* Note Header */}
                        <div className="flex items-center justify-between text-[10px] font-bold opacity-80 mb-1.5 pt-1">
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${palette.badgeBg} flex items-center gap-1`}>
                            <Zap className="h-2.5 w-2.5" /> Action #{idx + 1}
                          </span>
                          <span className="text-[9px] opacity-80 font-bold">
                            {isDone ? '✓ Completed' : 'Tap to check off'}
                          </span>
                        </div>

                        {/* Action Content with Checkbox */}
                        <div className="flex items-start gap-2 mt-1">
                          {isDone ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                          ) : (
                            <Circle className="mt-0.5 h-4 w-4 shrink-0 opacity-60 group-hover:opacity-100" />
                          )}
                          <p className={`text-xs font-bold leading-relaxed ${isDone ? 'line-through opacity-80' : ''}`}>
                            {step}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
