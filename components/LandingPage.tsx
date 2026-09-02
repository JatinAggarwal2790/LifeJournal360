'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import {
  BookOpen,
  ArrowRight,
  Lock,
  Sparkles,
  Utensils,
  Dumbbell,
  CheckSquare,
  Compass,
  Baby,
  Smile,
  Mic,
  Moon,
  Lightbulb,
  ShieldCheck,
  Feather,
  Bookmark,
  CheckCircle2,
} from 'lucide-react';

interface JournalIndexer {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: React.ElementType;
  tabColor: string; // Tailwind background / border / text colors for the sticky tab
  bgGradient: string;
  tags: string[];
}

const JOURNAL_INDEXERS: JournalIndexer[] = [
  {
    id: 'reflection',
    title: 'Daily Reflections',
    category: 'Mindfulness',
    description: 'Capture daily thoughts, gratitude lists, moods, and untangle complex feelings with clarity.',
    icon: Feather,
    tabColor: 'bg-amber-400 text-zinc-950 border-amber-300',
    bgGradient: 'from-amber-500/20 to-amber-900/10 border-amber-500/30',
    tags: ['Gratitude', 'Emotions', 'Evening Wrap'],
  },
  {
    id: 'food',
    title: 'Food & Nutrition',
    category: 'Wellness',
    description: 'Log daily meals, water intake, macro goals, food reactions, and mindful eating habits.',
    icon: Utensils,
    tabColor: 'bg-emerald-400 text-zinc-950 border-emerald-300',
    bgGradient: 'from-emerald-500/20 to-emerald-900/10 border-emerald-500/30',
    tags: ['Meals', 'Hydration', 'Macros'],
  },
  {
    id: 'fitness',
    title: 'Fitness & Workouts',
    category: 'Active',
    description: 'Track gym workouts, personal records, sets, reps, weight progression, and cardio stats.',
    icon: Dumbbell,
    tabColor: 'bg-rose-400 text-zinc-950 border-rose-300',
    bgGradient: 'from-rose-500/20 to-rose-900/10 border-rose-500/30',
    tags: ['PRs', 'Sets & Reps', 'Bodyweight'],
  },
  {
    id: 'bujo',
    title: 'Bullet Journal & Tasks',
    category: 'Productivity',
    description: 'Rapid logging with custom bullet symbols (• Tasks, ◦ Events, – Notes, ★ Priorities).',
    icon: CheckSquare,
    tabColor: 'bg-lime-400 text-zinc-950 border-lime-300',
    bgGradient: 'from-lime-500/20 to-lime-900/10 border-lime-500/30',
    tags: ['Rapid Logging', 'Habits', 'Priorities'],
  },
  {
    id: 'travel',
    title: 'Travel & Explorer',
    category: 'Adventure',
    description: 'Document destinations, daily trip itineraries, local foods tried, expenses, and GPS pins.',
    icon: Compass,
    tabColor: 'bg-sky-400 text-zinc-950 border-sky-300',
    bgGradient: 'from-sky-500/20 to-sky-900/10 border-sky-500/30',
    tags: ['Itineraries', 'Places', 'Memory Map'],
  },
  {
    id: 'kids',
    title: 'Kids & Milestones',
    category: 'Family',
    description: 'Record memorable quotes, growth milestones, funny antics, and precious moments.',
    icon: Smile,
    tabColor: 'bg-yellow-400 text-zinc-950 border-yellow-300',
    bgGradient: 'from-yellow-500/20 to-yellow-900/10 border-yellow-500/30',
    tags: ['First Steps', 'Quotes', 'Growth'],
  },
  {
    id: 'pregnancy',
    title: 'Pregnancy Journey',
    category: 'Life Stage',
    description: 'Track trimester weeks, baby kick counts, cravings, symptoms, and appointment notes.',
    icon: Baby,
    tabColor: 'bg-pink-400 text-zinc-950 border-pink-300',
    bgGradient: 'from-pink-500/20 to-pink-900/10 border-pink-500/30',
    tags: ['Trimester', 'Kicks', 'Cravings'],
  },
  {
    id: 'multimedia',
    title: 'Voice & Multimedia',
    category: 'Memories',
    description: 'Record voice memos with auto-transcription, upload photos, link songs, and save coordinates.',
    icon: Mic,
    tabColor: 'bg-indigo-400 text-zinc-950 border-indigo-300',
    bgGradient: 'from-indigo-500/20 to-indigo-900/10 border-indigo-500/30',
    tags: ['Voice Memos', 'Photos', 'Songs'],
  },
  {
    id: 'sleep',
    title: 'Sleep & Dreams',
    category: 'Rest',
    description: 'Log sleep duration, dream narratives, sleep quality scores, and morning readiness.',
    icon: Moon,
    tabColor: 'bg-violet-400 text-zinc-950 border-violet-300',
    bgGradient: 'from-violet-500/20 to-violet-900/10 border-violet-500/30',
    tags: ['Dream Log', 'Rest Score', 'Quality'],
  },
  {
    id: 'inquiry',
    title: 'Guided Inquiries',
    category: 'Wisdom',
    description: 'Explore deep questions, core values, decision frameworks, and socratic reflections.',
    icon: Lightbulb,
    tabColor: 'bg-teal-400 text-zinc-950 border-teal-300',
    bgGradient: 'from-teal-500/20 to-teal-900/10 border-teal-500/30',
    tags: ['Socratic', 'Values', 'Clarity'],
  },
];

export function LandingPage() {
  const { signInWithGoogle, loading, error, clearError } = useAuth();
  const [selectedIndexer, setSelectedIndexer] = useState<JournalIndexer>(JOURNAL_INDEXERS[0]);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden bg-zinc-950 px-4 py-8 sm:px-6">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 bg-mesh-glow opacity-60" />

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        {/* Error notification if any */}
        {error && (
          <div
            id="auth-error-banner"
            role="alert"
            className="mb-6 flex items-center justify-between rounded-2xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-300 backdrop-blur-md"
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

        {/* Hero Headline & Intro */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/90 px-4 py-1.5 text-xs font-semibold text-zinc-300 shadow-inner backdrop-blur-md">
            <BookOpen className="h-3.5 w-3.5 text-lime-400" />
            <span className="text-zinc-200">The All-in-One Personal Journal</span>
            <span className="text-zinc-600">•</span>
            <span className="text-lime-400">Private Vault</span>
          </div>

          <h1 className="mt-6 font-sans text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            One Journal for Every Chapter <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-lime-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              of Your Life.
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-zinc-400">
            A serene, distraction-free space for your daily reflections, fitness gains, meals, travels,
            family milestones, and voice notes. Completely private, structured or freeform.
          </p>

          {/* Primary Action Button */}
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              id="btn-google-signin"
              type="button"
              onClick={signInWithGoogle}
              disabled={loading}
              className="group relative flex w-full max-w-xs items-center justify-center gap-3 overflow-hidden rounded-2xl bg-zinc-100 px-6 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-lime-500/10 transition-all hover:bg-white hover:scale-[1.02] hover:shadow-lime-500/20 active:scale-[0.98] disabled:opacity-50"
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
              <span>{loading ? 'Entering Vault...' : 'Open Your Journal'}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-zinc-500 font-medium">
            <Lock className="h-3 w-3 text-zinc-400" />
            <span>Encrypted cloud storage • Private & isolated to your account</span>
          </div>
        </div>

        {/* Visual Showcase: The Journal Book with Sticky Indexers */}
        <div className="mt-10 rounded-3xl border border-zinc-800/90 bg-zinc-900/50 p-4 sm:p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            
            {/* Left/Main: Visual Book Illustration with Sticky Index Tabs */}
            <div className="relative w-full lg:w-1/2 flex items-center justify-center">
              <div className="relative group max-w-[380px] w-full">
                
                {/* Sticky Indexer Tabs sticking out the right/top of the book */}
                <div className="absolute -right-3 sm:-right-4 top-4 bottom-4 flex flex-col justify-between z-20 pointer-events-auto">
                  {JOURNAL_INDEXERS.slice(0, 5).map((indexer) => {
                    const isSelected = selectedIndexer.id === indexer.id;
                    const IconComponent = indexer.icon;
                    return (
                      <button
                        key={indexer.id}
                        type="button"
                        onClick={() => setSelectedIndexer(indexer)}
                        className={`group/tab relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-r-lg text-[10px] font-black shadow-md transition-all duration-200 border-l-2 border-zinc-950 ${
                          indexer.tabColor
                        } ${
                          isSelected
                            ? 'translate-x-2 scale-105 ring-2 ring-white/80 shadow-lg'
                            : 'hover:translate-x-1 opacity-90'
                        }`}
                        title={indexer.title}
                      >
                        <IconComponent className="h-3 w-3" />
                        <span className="hidden sm:inline font-bold tracking-tight whitespace-nowrap">
                          {indexer.title.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Left Side Sticky Indexer Tabs */}
                <div className="absolute -left-3 sm:-left-4 top-4 bottom-4 flex flex-col justify-between z-20 pointer-events-auto">
                  {JOURNAL_INDEXERS.slice(5, 10).map((indexer) => {
                    const isSelected = selectedIndexer.id === indexer.id;
                    const IconComponent = indexer.icon;
                    return (
                      <button
                        key={indexer.id}
                        type="button"
                        onClick={() => setSelectedIndexer(indexer)}
                        className={`group/tab relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-l-lg text-[10px] font-black shadow-md transition-all duration-200 border-r-2 border-zinc-950 ${
                          indexer.tabColor
                        } ${
                          isSelected
                            ? '-translate-x-2 scale-105 ring-2 ring-white/80 shadow-lg'
                            : 'hover:-translate-x-1 opacity-90'
                        }`}
                        title={indexer.title}
                      >
                        <span className="hidden sm:inline font-bold tracking-tight whitespace-nowrap">
                          {indexer.title.split(' ')[0]}
                        </span>
                        <IconComponent className="h-3 w-3" />
                      </button>
                    );
                  })}
                </div>

                {/* Book Frame with Real Image */}
                <div className="relative mx-auto aspect-[4/3] w-[88%] sm:w-[84%] overflow-hidden rounded-2xl border border-zinc-700/60 shadow-2xl bg-zinc-950">
                  <Image
                    src="/journal_book.jpg"
                    alt="ReflectAI Hardcover Journal Book"
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                  {/* Subtle Book Spine & Leather Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-black/20 pointer-events-none" />
                  
                  {/* Book Ribbon Badge Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl bg-zinc-950/80 p-2 border border-zinc-800/80 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-lime-400/20 text-lime-400">
                        <Bookmark className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[11px] font-bold text-zinc-100">
                        {selectedIndexer.title}
                      </span>
                    </div>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded-full">
                      {selectedIndexer.category}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Side: Interactive Sticky Index Preview & Quick Switcher */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between space-y-4">
              
              {/* Selected Tab Detailed Card */}
              <div className={`rounded-2xl border p-4 sm:p-5 bg-gradient-to-br transition-all duration-300 ${selectedIndexer.bgGradient} bg-zinc-950/90`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold shadow-md ${selectedIndexer.tabColor}`}>
                      {React.createElement(selectedIndexer.icon, { className: 'h-4 w-4' })}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-zinc-100">{selectedIndexer.title}</h3>
                      <p className="text-[11px] text-zinc-400">{selectedIndexer.category} Index Tab</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-zinc-800/80 border border-zinc-700/60 px-2.5 py-0.5 text-[10px] font-bold text-zinc-300">
                    Interactive Mode
                  </span>
                </div>

                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-zinc-300">
                  {selectedIndexer.description}
                </p>

                {/* Tags / Subfeatures */}
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {selectedIndexer.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-zinc-900/90 border border-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300"
                    >
                      ✓ {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* All Journaling Styles Indexer Strip (Clickable Sticky Index Bar) */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-lime-400" />
                  Click any indexer tab to explore styles:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {JOURNAL_INDEXERS.map((indexer) => {
                    const isSelected = selectedIndexer.id === indexer.id;
                    const IconComp = indexer.icon;
                    return (
                      <button
                        key={indexer.id}
                        type="button"
                        onClick={() => setSelectedIndexer(indexer)}
                        className={`flex items-center gap-1.5 rounded-xl p-2 text-left transition-all border ${
                          isSelected
                            ? 'bg-zinc-800 border-zinc-600 text-white ring-1 ring-lime-400 shadow-sm'
                            : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                        }`}
                      >
                        <IconComp className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-lime-400' : 'text-zinc-500'}`} />
                        <span className="text-[10px] font-bold truncate">{indexer.title.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* 3 Core Experience Pillars */}
        <div className="mt-8 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 sm:p-5 backdrop-blur-md">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300 font-bold">
              <BookOpen className="h-4 w-4" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-zinc-100">Multi-Format Journaling</h3>
            <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
              Switch smoothly between freeform notes, structured trackers, voice memos, and photo memories.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 sm:p-5 backdrop-blur-md">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-300 font-bold">
              <Lock className="h-4 w-4" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-zinc-100">100% Private & Encrypted</h3>
            <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
              Your journal is strictly tied to your account vault in Cloud Firestore. No third-party data access.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 sm:p-5 backdrop-blur-md">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-400/20 text-sky-300 font-bold">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-zinc-100">Distraction-Free & Offline Safe</h3>
            <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
              Write text freely with optional AI companion guidance whenever you want deeper reflections.
            </p>
          </div>
        </div>

      </div>

      {/* Clean, Simple Footer */}
      <footer className="relative z-10 mt-10 text-center text-xs text-zinc-500 font-medium">
        ReflectAI Journal • Your Private Personal Reflection Sanctuary
      </footer>
    </div>
  );
}


