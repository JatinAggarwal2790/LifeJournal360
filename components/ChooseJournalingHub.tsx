'use client';

import React, { useState, useMemo } from 'react';
import type { JournalArchetype, JournalInteraction } from '@/lib/types';
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
  Plus,
  ArrowRight,
  BookOpen,
  Moon,
  Flower2,
  Heart,
  Code2,
  Rocket,
  Brain,
  Scroll,
  Languages,
  Star,
  Check,
  Search,
  Pin,
  Clock,
  MessageSquare,
  Trash2,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronRight,
  X,
  StickyNote,
  Layers,
  PenTool,
} from 'lucide-react';

interface ChooseJournalingHubProps {
  onSelectJourney: (config: {
    archetype: JournalArchetype;
    customTypeName?: string;
    customTypeIcon?: string;
    title?: string;
  }) => void;
  onOpenStickyNotes?: () => void;
  entriesCount?: number;
  interactions?: JournalInteraction[];
  onSelectInteraction?: (interaction: JournalInteraction) => void;
  onDeleteInteraction?: (interactionId: string) => Promise<void> | void;
  activeInteractionId?: string | null;
}

export interface JournalTypeCard {
  id: JournalArchetype;
  label: string;
  category: 'Structure' | 'Multimedia' | 'Specialized' | 'Reflection';
  tagline: string;
  description: string;
  featureChips: string[];
  sampleTitle: string;
  icon: React.ElementType;
  accentColor: string;
  badgeBg: string;
  borderHover: string;
  buttonColor: string;
  gradientBg: string;
  emoji: string;
}

export const JOURNAL_TYPE_OPTIONS: JournalTypeCard[] = [
  {
    id: 'food_diary',
    label: 'Food & Nutrition',
    category: 'Specialized',
    tagline: 'Meals, macros & hydration',
    description: 'Track mindful meals, estimated calories, 8-glass water hydration and daily energy vitality.',
    featureChips: ['Meal & Calorie Logs', '8-Glass Water Tracker'],
    sampleTitle: 'Daily Culinary & Hydration Log',
    icon: Utensils,
    accentColor: 'text-amber-400',
    badgeBg: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
    borderHover: 'hover:border-amber-400/70',
    buttonColor: 'bg-amber-400 text-zinc-950 hover:bg-amber-300',
    gradientBg: 'from-amber-950/30 via-zinc-900/60 to-zinc-950',
    emoji: '🥗',
  },
  {
    id: 'multimedia_blog',
    label: 'Multimedia Memories',
    category: 'Multimedia',
    tagline: 'Photos, videos & soundtracks',
    description: 'Attach photo snapshots, video moments, workout telemetry stats and soundtrack vibe tags.',
    featureChips: ['Photo & Video Gallery', 'GPS & Soundtrack Tags'],
    sampleTitle: 'Daily Multimedia Memory Capsule',
    icon: Camera,
    accentColor: 'text-sky-400',
    badgeBg: 'bg-sky-400/15 text-sky-300 border-sky-400/30',
    borderHover: 'hover:border-sky-400/70',
    buttonColor: 'bg-sky-400 text-zinc-950 hover:bg-sky-300',
    gradientBg: 'from-sky-950/30 via-zinc-900/60 to-zinc-950',
    emoji: '📸',
  },
  {
    id: 'kids_journey',
    label: 'Kids & Milestones',
    category: 'Specialized',
    tagline: 'Quotes, growth & fun moments',
    description: 'Preserve childhood growth breakthroughs, hilarious quotes and treasured family memories.',
    featureChips: ['Hilarious Quotes Log', 'Age & Growth Breakthroughs'],
    sampleTitle: 'Little Explorers & Cherished Quotes',
    icon: Smile,
    accentColor: 'text-violet-400',
    badgeBg: 'bg-violet-400/15 text-violet-300 border-violet-400/30',
    borderHover: 'hover:border-violet-400/70',
    buttonColor: 'bg-violet-400 text-zinc-950 hover:bg-violet-300',
    gradientBg: 'from-violet-950/30 via-zinc-900/60 to-zinc-950',
    emoji: '🧸',
  },
  {
    id: 'fitness_tracker',
    label: 'Fitness & PRs',
    category: 'Specialized',
    tagline: 'Workouts, sets & recovery',
    description: 'Document exercise sets, reps, weight progression, breakthrough PR milestones and recovery.',
    featureChips: ['Multi-Exercise Sets', 'PR Milestones & Recovery'],
    sampleTitle: 'Hypertrophy & PR Progression Session',
    icon: Dumbbell,
    accentColor: 'text-lime-400',
    badgeBg: 'bg-lime-400/15 text-lime-300 border-lime-400/30',
    borderHover: 'hover:border-lime-400/70',
    buttonColor: 'bg-lime-400 text-zinc-950 hover:bg-lime-300',
    gradientBg: 'from-lime-950/30 via-zinc-900/60 to-zinc-950',
    emoji: '🏋️',
  },
  {
    id: 'travel_log',
    label: 'Travel Explorer',
    category: 'Specialized',
    tagline: 'Destinations & local gems',
    description: 'Log wanderlust destinations, sights visited, local culinary discoveries and trip budgets.',
    featureChips: ['Destinations & Sights', 'Local Food & Transit'],
    sampleTitle: 'Wanderlust Explorer & Hidden Sights',
    icon: Compass,
    accentColor: 'text-cyan-400',
    badgeBg: 'bg-cyan-400/15 text-cyan-300 border-cyan-400/30',
    borderHover: 'hover:border-cyan-400/70',
    buttonColor: 'bg-cyan-400 text-zinc-950 hover:bg-cyan-300',
    gradientBg: 'from-cyan-950/30 via-zinc-900/60 to-zinc-950',
    emoji: '✈️',
  },
  {
    id: 'bullet_tasks',
    label: 'Bullet & Tasks',
    category: 'Structure',
    tagline: 'Rapid logs & weekly sprints',
    description: 'Rapid syntax action logs (• tasks, * priority, ○ event, 💡 idea) with weekday sprint filters.',
    featureChips: ['Rapid Syntax Logging', 'Mon–Sun Sprint Filters'],
    sampleTitle: 'Weekly Sprint & Tactical Action Matrix',
    icon: CheckSquare,
    accentColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
    borderHover: 'hover:border-emerald-400/70',
    buttonColor: 'bg-emerald-400 text-zinc-950 hover:bg-emerald-300',
    gradientBg: 'from-emerald-950/30 via-zinc-900/60 to-zinc-950',
    emoji: '🌿',
  },
  {
    id: 'pregnancy_milestones',
    label: 'Pregnancy Milestones',
    category: 'Specialized',
    tagline: 'Weeks 1–40 & kicks counter',
    description: 'Week-by-week fruit size comparisons, fetal kick counters, symptom checks and doctor memos.',
    featureChips: ['Baby Fruit Comparison', 'Fetal Kick Counter'],
    sampleTitle: 'Baby Journey & Growth Milestones',
    icon: Baby,
    accentColor: 'text-rose-400',
    badgeBg: 'bg-rose-400/15 text-rose-300 border-rose-400/30',
    borderHover: 'hover:border-rose-400/70',
    buttonColor: 'bg-rose-400 text-zinc-950 hover:bg-rose-300',
    gradientBg: 'from-rose-950/30 via-zinc-900/60 to-zinc-950',
    emoji: '👶',
  },
  {
    id: 'classic_reflection',
    label: 'Classic Reflection',
    category: 'Reflection',
    tagline: 'Mindful stream of clarity',
    description: 'Uncluttered space for stream of consciousness, deep clarity and mindful personal processing.',
    featureChips: ['Zero-Distraction Canvas', 'Socratic AI Insights'],
    sampleTitle: 'Evening Mindful Reflection & Clarity',
    icon: Feather,
    accentColor: 'text-zinc-200',
    badgeBg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    borderHover: 'hover:border-zinc-500',
    buttonColor: 'bg-zinc-100 text-zinc-950 hover:bg-white',
    gradientBg: 'from-zinc-900/60 via-zinc-900/40 to-zinc-950',
    emoji: '🪷',
  },
];

// Presets for custom journal modalities
const CUSTOM_TYPE_PRESETS = [
  { name: 'Book Reading', emoji: '📚', icon: BookOpen, desc: 'Track books read, key quotes & chapter ratings' },
  { name: 'Dream Journal', emoji: '🌙', icon: Moon, desc: 'Record vivid dreams & subconscious symbols' },
  { name: 'Plant & Garden', emoji: '🪴', icon: Flower2, desc: 'Track watering, propagation & seasonal blooms' },
  { name: 'Pet Moments', emoji: '🐕', icon: Heart, desc: 'Log pet habits, vet visits & training milestones' },
  { name: 'Dev & Coding', emoji: '💻', icon: Code2, desc: 'Document bugs fixed & architecture notes' },
  { name: 'Startup Build', emoji: '🚀', icon: Rocket, desc: 'Capture founder decisions, MRR & customer calls' },
  { name: 'Gratitude Wins', emoji: '✨', icon: Star, desc: '3 daily gratitudes & positive mindset affirmations' },
  { name: 'Mental Wellness', emoji: '🧠', icon: Brain, desc: 'Log emotional shifts & anxiety triggers' },
  { name: 'Stoic Philosophy', emoji: '🏛️', icon: Scroll, desc: 'Daily Marcus Aurelius reflections & virtues' },
  { name: 'Language Practice', emoji: '🗣️', icon: Languages, desc: 'New vocabulary & grammar breakthroughs' },
];

export function ChooseJournalingHub({
  onSelectJourney,
  onOpenStickyNotes,
  entriesCount = 0,
  interactions = [],
  onSelectInteraction,
  onDeleteInteraction,
  activeInteractionId,
}: ChooseJournalingHubProps) {
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Structure' | 'Multimedia' | 'Specialized' | 'Reflection'>('All');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmoji, setCustomEmoji] = useState('✨');
  const [customGoal, setCustomGoal] = useState('');
  const [customTitleInput, setCustomTitleInput] = useState('');

  // Quick Start Entry Title Modal State
  const [titleModalConfig, setTitleModalConfig] = useState<{
    archetype: JournalArchetype;
    label: string;
    emoji: string;
    tagline: string;
    sampleTitle: string;
    accentColor: string;
    buttonColor: string;
    customTypeName?: string;
    customTypeIcon?: string;
  } | null>(null);
  const [entryTitleInput, setEntryTitleInput] = useState('');

  const todayFormatted = new Date().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  const getDistinctDefaultTitle = (archetype: JournalArchetype, baseTitle: string, customName?: string) => {
    const existingCount = interactions.filter((i) => {
      const isArch = (i.archetype || 'classic_reflection') === archetype;
      if (archetype === 'custom' && customName) {
        return isArch && i.customTypeName === customName;
      }
      return isArch;
    }).length;

    const prefix = customName || baseTitle;
    if (existingCount > 0) {
      return `${prefix} #${existingCount + 1} – ${todayFormatted}`;
    }
    return `${prefix} – ${todayFormatted}`;
  };

  const handleOpenTitleModal = (opt: JournalTypeCard) => {
    const defaultTitle = getDistinctDefaultTitle(opt.id, opt.label);
    setEntryTitleInput(defaultTitle);
    setTitleModalConfig({
      archetype: opt.id,
      label: opt.label,
      emoji: opt.emoji,
      tagline: opt.tagline,
      sampleTitle: opt.sampleTitle,
      accentColor: opt.accentColor,
      buttonColor: opt.buttonColor,
    });
  };

  const handleOpenPresetTitleModal = (preset: typeof CUSTOM_TYPE_PRESETS[0]) => {
    const defaultTitle = getDistinctDefaultTitle('custom', preset.name, preset.name);
    setEntryTitleInput(defaultTitle);
    setTitleModalConfig({
      archetype: 'custom',
      label: preset.name,
      emoji: preset.emoji,
      tagline: preset.desc,
      sampleTitle: preset.name,
      accentColor: 'text-purple-400',
      buttonColor: 'bg-purple-500 text-white hover:bg-purple-400',
      customTypeName: preset.name,
      customTypeIcon: preset.emoji,
    });
  };

  const handleConfirmTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleModalConfig) return;

    const finalTitle = entryTitleInput.trim()
      ? entryTitleInput.trim()
      : getDistinctDefaultTitle(
          titleModalConfig.archetype,
          titleModalConfig.label,
          titleModalConfig.customTypeName
        );

    onSelectJourney({
      archetype: titleModalConfig.archetype,
      customTypeName: titleModalConfig.customTypeName,
      customTypeIcon: titleModalConfig.customTypeIcon,
      title: finalTitle,
    });

    setTitleModalConfig(null);
  };

  const handleLaunchArchetypeDirect = (archetype: JournalArchetype, sampleTitle: string) => {
    const defaultTitle = getDistinctDefaultTitle(archetype, sampleTitle);
    onSelectJourney({
      archetype,
      title: defaultTitle,
    });
  };

  const handleCreateCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const finalTitle = customTitleInput.trim()
      ? customTitleInput.trim()
      : `${customName.trim()} – ${todayFormatted}`;

    onSelectJourney({
      archetype: 'custom',
      customTypeName: customName.trim(),
      customTypeIcon: customEmoji || '✨',
      title: finalTitle,
    });

    setShowCustomModal(false);
  };

  const filteredOptions = JOURNAL_TYPE_OPTIONS.filter((opt) => {
    if (selectedFilter === 'All') return true;
    return opt.category === selectedFilter;
  });

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-zinc-950 px-3 py-5 sm:px-5 lg:px-6">
      {/* Botanical ambient subtle gradients */}
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Compact Hero Header */}
        <div className="mb-4 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-0.5 text-xs font-bold text-lime-300 backdrop-blur-md shadow-sm mb-2">
            <Sparkles className="h-3 w-3 text-lime-400" />
            <span>ReflectAI Journaling Modalities</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white max-w-2xl mx-auto leading-tight">
            Choose Your <span className="bg-gradient-to-r from-lime-400 via-emerald-400 to-sky-400 bg-clip-text text-transparent">Journaling Journey</span>
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            Select any modality below with seamless text-only writing, rich media logging, and smart AI Mode assistance.
          </p>
        </div>

        {/* Top Bar: Categorized Quick Selection Bar under Header */}
        <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-2.5 sm:p-3 backdrop-blur-xl shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400/20 text-amber-400 border border-amber-400/30 text-xs">
                <StickyNote className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-extrabold text-zinc-200">
                Quick Category Selection ({interactions.length} Saved Entries)
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={onOpenStickyNotes}
                className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition"
              >
                <StickyNote className="h-3 w-3" />
                <span>Open Sticky Notes Board ({interactions.length})</span>
              </button>
            </div>
          </div>

          {/* Quick Category Buttons Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-800">
            {/* All notes pill */}
            <button
              type="button"
              onClick={() => setSelectedFilter('All')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition shrink-0 border ${
                selectedFilter === 'All'
                  ? 'bg-lime-400 text-zinc-950 border-lime-300 shadow-sm'
                  : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-850 hover:text-white'
              }`}
            >
              <span>🌟</span>
              <span>All Types</span>
              <span className="rounded-full bg-black/20 px-1.5 py-0.2 text-[10px] font-extrabold">
                {interactions.length}
              </span>
            </button>

            {/* Individual Categorized Buttons */}
            {JOURNAL_TYPE_OPTIONS.map((opt) => {
              const count = interactions.filter(
                (item) => (item.archetype || 'classic_reflection') === opt.id
              ).length;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    handleOpenTitleModal(opt);
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition shrink-0 border bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-lime-500/50 hover:text-white group`}
                >
                  <span>{opt.emoji}</span>
                  <span className="group-hover:text-lime-300">{opt.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                      count > 0
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Clean, Full-Width Journal Types Grid */}
        <div className="space-y-4">
          {/* Filter Pills & Custom Creator Trigger */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-900/60 p-2.5 rounded-2xl border border-zinc-800/80 backdrop-blur-md">
            <div className="flex flex-wrap items-center gap-1.5">
              {(['All', 'Structure', 'Multimedia', 'Specialized', 'Reflection'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSelectedFilter(filter)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    selectedFilter === filter
                      ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                      : 'bg-zinc-950/70 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {filter === 'All' ? '🌟 All Categories' : filter}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowCustomModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-950/40 px-3.5 py-1.5 text-xs font-bold text-purple-300 hover:bg-purple-900/60 transition"
            >
              <Plus className="h-3.5 w-3.5 text-purple-400" />
              <span>Define Custom Type</span>
            </button>
          </div>

          {/* Streamlined Cards Grid: 3 columns on large screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOptions.map((item) => {
              const savedCount = interactions.filter(
                (i) => (i.archetype || 'classic_reflection') === item.id
              ).length;

              return (
                <div
                  key={item.id}
                  className={`group relative flex flex-col justify-between rounded-2xl border border-zinc-800 bg-gradient-to-b ${item.gradientBg} p-4 shadow-md backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${item.borderHover}`}
                >
                  <div>
                    {/* Top Row: Icon, Title & Category Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900/90 border border-zinc-700/70 text-lg shadow-inner group-hover:scale-105 transition-transform">
                          <span>{item.emoji}</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-white group-hover:text-lime-300 transition-colors leading-snug">
                            {item.label}
                          </h3>
                          <p className="text-[10px] text-zinc-400 font-medium">
                            {item.tagline}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {savedCount > 0 && (
                          <span className="rounded-full bg-amber-400/20 border border-amber-400/30 px-1.5 py-0.2 text-[9px] font-black text-amber-300">
                            {savedCount} notes
                          </span>
                        )}
                        <span className={`rounded-full px-2 py-0.2 text-[9px] font-extrabold border ${item.badgeBg}`}>
                          {item.category}
                        </span>
                      </div>
                    </div>

                    {/* Crisp Short Description */}
                    <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2 mb-2.5">
                      {item.description}
                    </p>

                    {/* Compact Micro-Feature Chips */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.featureChips.map((chip, cIdx) => (
                        <span
                          key={cIdx}
                          className="inline-flex items-center gap-1 rounded-md bg-zinc-950/80 border border-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-400"
                        >
                          <span className={item.accentColor}>•</span>
                          <span>{chip}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Compact Action Footer */}
                  <button
                    type="button"
                    onClick={() => handleOpenTitleModal(item)}
                    className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-black transition-all shadow-sm active:scale-98 ${item.buttonColor}`}
                  >
                    <span>Start {item.label.split(' ')[0]} Journal</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}

            {/* Compact Custom Creator Card */}
            <div className="group relative flex flex-col justify-between rounded-2xl border-2 border-dashed border-purple-500/40 bg-gradient-to-b from-purple-950/20 via-zinc-900/60 to-zinc-950 p-4 shadow-md backdrop-blur-md transition-all duration-200 hover:border-purple-400 hover:-translate-y-0.5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 text-lg shadow-inner group-hover:scale-105 transition-transform">
                      <span>✨</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white group-hover:text-purple-300 transition-colors leading-snug">
                        Custom Modality
                      </h3>
                      <p className="text-[10px] text-purple-300 font-medium">
                        Books, Pets, Dreams &amp; Projects
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full px-2 py-0.2 text-[9px] font-extrabold border bg-purple-400/15 text-purple-300 border-purple-400/30">
                    Custom
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed mb-2.5">
                  Design any specialized journal tailored to your exact daily lifestyle or unique passion.
                </p>

                {/* Preset Pills */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {CUSTOM_TYPE_PRESETS.slice(0, 4).map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleOpenPresetTitleModal(p)}
                      className="inline-flex items-center gap-1 rounded-md bg-zinc-950 border border-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300 hover:border-purple-400 hover:text-purple-200 transition"
                    >
                      <span>{p.emoji}</span>
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCustomModal(true)}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-black bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-400 hover:to-indigo-400 transition-all shadow-sm active:scale-98"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Define New Custom Journal</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Quick Start Entry Title */}
      {titleModalConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-zinc-700 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{titleModalConfig.emoji}</span>
                <div>
                  <h2 className="text-base font-black text-white">
                    Start {titleModalConfig.label}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    {titleModalConfig.tagline}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTitleModalConfig(null)}
                className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmTitleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Journal Entry Title <span className="text-lime-400">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={entryTitleInput}
                  onChange={(e) => setEntryTitleInput(e.target.value)}
                  placeholder={`e.g. ${titleModalConfig.sampleTitle} – Tokyo Highlights, Leg PR, etc.`}
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 py-2.5 px-3.5 text-sm font-bold text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none"
                />
                <p className="mt-1.5 text-[11px] text-zinc-400">
                  Customizing this title will help you easily find and group your entries in your side panel.
                </p>
              </div>

              {/* Submit / Direct buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setTitleModalConfig(null)}
                  className="rounded-xl bg-zinc-800 px-3.5 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black shadow-md transition ${titleModalConfig.buttonColor}`}
                >
                  <span>Start Entry</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Custom Journaling Type */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-purple-500/40 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/40 text-base">
                  ✨
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-white">Create Custom Journaling Type</h3>
                  <p className="text-xs text-zinc-400">Set up a category tailored to your goals</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="rounded-full bg-zinc-900 p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomSubmit} className="space-y-3.5">
              {/* Presets row */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Pick a Quick Preset:
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-zinc-900/70 border border-zinc-800 rounded-xl">
                  {CUSTOM_TYPE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCustomName(preset.name);
                        setCustomEmoji(preset.emoji);
                        setCustomGoal(preset.desc);
                        setCustomTitleInput(`${preset.name} – ${todayFormatted}`);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950/80 px-2 py-1 text-xs text-zinc-300 hover:border-purple-400 hover:text-purple-200 transition"
                    >
                      <span>{preset.emoji}</span>
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Emoji & Name */}
              <div className="grid grid-cols-4 gap-2.5">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Emoji</label>
                  <input
                    type="text"
                    value={customEmoji}
                    onChange={(e) => setCustomEmoji(e.target.value)}
                    maxLength={4}
                    className="w-full text-center rounded-xl border border-zinc-800 bg-zinc-900 py-1.5 text-base text-white focus:border-purple-400 focus:outline-none"
                    placeholder="✨"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Category Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => {
                      setCustomName(e.target.value);
                      if (!customTitleInput || customTitleInput.endsWith(todayFormatted)) {
                        setCustomTitleInput(`${e.target.value} – ${todayFormatted}`);
                      }
                    }}
                    placeholder="e.g. Pet Diary, Reading Club, Dream Log"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-1.5 px-3 text-xs text-white placeholder-zinc-500 focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Goal or Tagline */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Purpose / Intention (Optional)
                </label>
                <input
                  type="text"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="e.g. Capture recurring symbols and lucid awareness"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-1.5 px-3 text-xs text-white placeholder-zinc-500 focus:border-purple-400 focus:outline-none"
                />
              </div>

              {/* Auto Title */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Session Title
                </label>
                <input
                  type="text"
                  value={customTitleInput}
                  onChange={(e) => setCustomTitleInput(e.target.value)}
                  placeholder={`e.g. ${customName || 'Custom Journal'} – ${todayFormatted}`}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-1.5 px-3 text-xs text-white placeholder-zinc-500 focus:border-purple-400 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="rounded-xl bg-zinc-800 px-3.5 py-1.5 text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customName.trim()}
                  className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-1.5 text-xs font-black text-white hover:from-purple-400 hover:to-indigo-400 transition shadow-md disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Launch Custom Journal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
