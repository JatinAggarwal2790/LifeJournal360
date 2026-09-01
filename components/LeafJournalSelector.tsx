'use client';

import React from 'react';
import type { JournalArchetype } from '@/lib/types';
import {
  Sparkles,
  CheckSquare,
  Camera,
  Utensils,
  Dumbbell,
  Baby,
  Compass,
  Smile,
  Feather,
  Leaf,
  Layers,
  Calendar,
  Music,
  MapPin,
  Flame,
  Activity,
  Heart,
  ChevronDown,
} from 'lucide-react';

interface LeafJournalSelectorProps {
  selectedArchetype: JournalArchetype;
  onSelectArchetype: (archetype: JournalArchetype) => void;
  compact?: boolean;
}

export interface ArchetypeMeta {
  id: JournalArchetype;
  label: string;
  category: 'Structure' | 'Multimedia' | 'Specialized' | 'Reflection';
  tagline: string;
  description: string;
  icon: React.ElementType;
  leafColor: string;
  bgGrad: string;
  accentBorder: string;
  highlightText: string;
  badge: string;
}

export const JOURNAL_ARCHETYPES: ArchetypeMeta[] = [
  {
    id: 'bullet_tasks',
    label: 'Bullet & Tasks Planner',
    category: 'Structure',
    tagline: 'Rapid logging, task status & weekly planning',
    description: 'Maintain bullet-journal style rapid logs (tasks •, notes –, events ○, priorities *), organize weekly sprints, and track task completions.',
    icon: CheckSquare,
    leafColor: 'from-emerald-400 to-teal-500',
    bgGrad: 'bg-emerald-950/40 hover:bg-emerald-900/50',
    accentBorder: 'border-emerald-500/40 hover:border-emerald-400',
    highlightText: 'text-emerald-300',
    badge: '1. Structuring & Planning',
  },
  {
    id: 'multimedia_blog',
    label: 'Multimedia Memory Archive',
    category: 'Multimedia',
    tagline: 'Photos, videos, workouts, music & GPS logs',
    description: 'Day-wise blogging with rich media: pin snapshots, video highlights, workout calories/steps, background music soundtrack, and GPS coordinates.',
    icon: Camera,
    leafColor: 'from-sky-400 to-indigo-500',
    bgGrad: 'bg-sky-950/40 hover:bg-sky-900/50',
    accentBorder: 'border-sky-500/40 hover:border-sky-400',
    highlightText: 'text-sky-300',
    badge: '2. Media Archiving',
  },
  {
    id: 'food_diary',
    label: 'Food & Nutrition Diary',
    category: 'Specialized',
    tagline: 'Meals, macros, water glasses & energy rating',
    description: 'Track breakfast, lunch, dinner, snacks, caloric estimates, hydration counter, and emotional connection to nutrition.',
    icon: Utensils,
    leafColor: 'from-amber-400 to-orange-500',
    bgGrad: 'bg-amber-950/40 hover:bg-amber-900/50',
    accentBorder: 'border-amber-500/40 hover:border-amber-400',
    highlightText: 'text-amber-300',
    badge: '3. Niche: Nutrition',
  },
  {
    id: 'fitness_tracker',
    label: 'Fitness & PR Tracker',
    category: 'Specialized',
    tagline: 'Workout routines, sets, reps & recovery score',
    description: 'Log exercise regimens, record personal records (PRs), track strength progression, and score your recovery energy.',
    icon: Dumbbell,
    leafColor: 'from-lime-400 to-emerald-500',
    bgGrad: 'bg-lime-950/40 hover:bg-lime-900/50',
    accentBorder: 'border-lime-500/40 hover:border-lime-400',
    highlightText: 'text-lime-300',
    badge: '3. Niche: Fitness',
  },
  {
    id: 'pregnancy_milestones',
    label: 'Pregnancy Milestones',
    category: 'Specialized',
    tagline: 'Gestational week, kicks, symptoms & baby size',
    description: 'Capture pregnancy journey week by week, fruit/vegetable size comparisons, fetal kicks, symptoms, and doctor visit memos.',
    icon: Baby,
    leafColor: 'from-pink-400 to-rose-500',
    bgGrad: 'bg-rose-950/40 hover:bg-rose-900/50',
    accentBorder: 'border-rose-500/40 hover:border-rose-400',
    highlightText: 'text-rose-300',
    badge: '3. Niche: Maternity',
  },
  {
    id: 'travel_log',
    label: 'Travel Explorer Log',
    category: 'Specialized',
    tagline: 'Destinations, sights, local food & routes',
    description: 'Document adventures with sightseeing checklists, weather conditions, local culinary memories, and travel budget notes.',
    icon: Compass,
    leafColor: 'from-cyan-400 to-blue-500',
    bgGrad: 'bg-cyan-950/40 hover:bg-cyan-900/50',
    accentBorder: 'border-cyan-500/40 hover:border-cyan-400',
    highlightText: 'text-cyan-300',
    badge: '3. Niche: Wanderlust',
  },
  {
    id: 'kids_journey',
    label: 'Kids Journey & Milestones',
    category: 'Specialized',
    tagline: 'Growth milestones, funny quotes & memories',
    description: 'Preserve childhood gold: hilarious quotes, developmental milestones, favorite games, and heartwarming daily memories.',
    icon: Smile,
    leafColor: 'from-violet-400 to-purple-500',
    bgGrad: 'bg-violet-950/40 hover:bg-violet-900/50',
    accentBorder: 'border-violet-500/40 hover:border-violet-400',
    highlightText: 'text-violet-300',
    badge: '3. Niche: Family',
  },
  {
    id: 'classic_reflection',
    label: 'Classic Freeform Reflection',
    category: 'Reflection',
    tagline: 'Mindfulness, stream of consciousness & clarity',
    description: 'Distraction-free, pure introspection for clarifying complex thoughts, emotional processing, and life alignment.',
    icon: Feather,
    leafColor: 'from-zinc-300 to-zinc-400',
    bgGrad: 'bg-zinc-900/70 hover:bg-zinc-900',
    accentBorder: 'border-zinc-700 hover:border-zinc-500',
    highlightText: 'text-zinc-200',
    badge: 'Core Mindfulness',
  },
  {
    id: 'custom',
    label: 'Custom Modality',
    category: 'Specialized',
    tagline: 'Personalized tracking, custom metrics & passion logs',
    description: 'Unique custom journaling format designed for your specific passions, routines, projects, and goals.',
    icon: Sparkles,
    leafColor: 'from-purple-400 to-indigo-500',
    bgGrad: 'bg-purple-950/40 hover:bg-purple-900/50',
    accentBorder: 'border-purple-500/40 hover:border-purple-400',
    highlightText: 'text-purple-300',
    badge: 'Custom Modality',
  },
];

export function LeafJournalSelector({
  selectedArchetype,
  onSelectArchetype,
  compact = false,
}: LeafJournalSelectorProps) {
  const current = JOURNAL_ARCHETYPES.find((a) => a.id === selectedArchetype) || JOURNAL_ARCHETYPES[0];

  if (compact) {
    return (
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 shrink-0">
          <Leaf className="h-3.5 w-3.5 text-emerald-400" />
          <span>Journal Archetype:</span>
        </div>
        <div className="flex items-center gap-1.5">
          {JOURNAL_ARCHETYPES.map((arch) => {
            const isSelected = selectedArchetype === arch.id;
            const Icon = arch.icon;
            return (
              <button
                key={arch.id}
                type="button"
                onClick={() => onSelectArchetype(arch.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition whitespace-nowrap ${
                  isSelected
                    ? `bg-zinc-100 text-zinc-950 shadow-md ring-2 ring-emerald-400/50`
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-zinc-950' : arch.highlightText}`} />
                <span>{arch.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-3xl border border-zinc-800/80 bg-zinc-900/50 p-5 sm:p-6 backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* Botanical ambient gradient */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/15 border border-emerald-400/30 text-emerald-400 shadow-inner">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-zinc-100">
                Choose Journaling Archetype
              </h3>
              <span className="rounded-full bg-emerald-400/15 border border-emerald-400/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                Leaf Modalities
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Select a specialized leaf template to structure your tasks, log media, or track niche journeys.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-semibold text-zinc-400 bg-zinc-950/80 border border-zinc-800 rounded-2xl px-3 py-1.5">
          <span>Active:</span>
          <span className="font-bold text-zinc-100 flex items-center gap-1.5">
            <current.icon className={`h-3.5 w-3.5 ${current.highlightText}`} />
            {current.label}
          </span>
        </div>
      </div>

      {/* Botanical Grid of Leaf Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {JOURNAL_ARCHETYPES.map((archetype, idx) => {
          const isSelected = selectedArchetype === archetype.id;
          const Icon = archetype.icon;

          return (
            <div
              key={archetype.id}
              onClick={() => onSelectArchetype(archetype.id)}
              className={`group relative flex flex-col justify-between rounded-2xl border p-4 cursor-pointer transition-all duration-200 select-none ${
                archetype.bgGrad
              } ${
                isSelected
                  ? `ring-2 ring-emerald-400 shadow-xl scale-[1.02] border-emerald-400/80 bg-zinc-900`
                  : `${archetype.accentBorder} hover:scale-[1.01]`
              }`}
            >
              {/* Leaf Stem & Pin Accent */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl transition shadow-sm ${
                      isSelected
                        ? `bg-gradient-to-br ${archetype.leafColor} text-zinc-950 font-black`
                        : 'bg-zinc-800 text-zinc-300 group-hover:bg-zinc-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      {archetype.badge}
                    </span>
                    <h4 className="text-xs font-extrabold text-zinc-100 group-hover:text-white leading-tight">
                      {archetype.label}
                    </h4>
                  </div>
                </div>

                {isSelected && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-zinc-950 font-black text-[10px] shadow">
                    ✓
                  </span>
                )}
              </div>

              {/* Tagline */}
              <p className="text-[11px] font-semibold text-zinc-300 mt-1 mb-2 leading-snug">
                {archetype.tagline}
              </p>

              {/* Description */}
              <p className="text-[10px] text-zinc-400 leading-relaxed mb-3 flex-1 line-clamp-2 group-hover:line-clamp-none transition-all">
                {archetype.description}
              </p>

              {/* Bottom selection pill */}
              <div className="flex items-center justify-between border-t border-zinc-800/80 pt-2.5 mt-auto">
                <span className="text-[10px] text-zinc-500 font-mono">
                  #{idx + 1}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold transition ${
                    isSelected
                      ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40'
                      : 'bg-zinc-800/60 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-zinc-200'
                  }`}
                >
                  {isSelected ? 'Active Mode' : 'Select Leaf'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
