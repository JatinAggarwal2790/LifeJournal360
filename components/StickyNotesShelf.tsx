'use client';

import React, { useState, useMemo } from 'react';
import type { JournalInteraction, JournalArchetype } from '@/lib/types';
import {
  Plus,
  StickyNote,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Pin,
  Clock,
  MessageSquare,
  Search,
  Zap,
  Tag,
  Check,
  Trash2,
  AlertTriangle,
  Loader2,
  ChevronDown,
  Layers,
  FolderOpen,
  Folder,
} from 'lucide-react';

interface StickyNotesShelfProps {
  interactions: JournalInteraction[];
  activeInteractionId?: string | null;
  onSelectInteraction: (interaction: JournalInteraction) => void;
  onStartNew: (archetype?: JournalArchetype, customTypeName?: string) => void;
  onDeleteInteraction?: (interactionId: string) => Promise<void> | void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

// Category metadata helper
export const ARCHETYPE_CATEGORY_MAP: Record<
  JournalArchetype,
  { label: string; emoji: string; color: string; bgBadge: string }
> = {
  travel_log: {
    label: 'Travel Log',
    emoji: '✈️',
    color: 'text-cyan-400',
    bgBadge: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40',
  },
  food_diary: {
    label: 'Food & Nutrition',
    emoji: '🥗',
    color: 'text-amber-400',
    bgBadge: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
  },
  fitness_tracker: {
    label: 'Fitness & PRs',
    emoji: '🏋️',
    color: 'text-lime-400',
    bgBadge: 'bg-lime-950/80 text-lime-300 border-lime-500/40',
  },
  kids_journey: {
    label: 'Kids Journey',
    emoji: '🧸',
    color: 'text-violet-400',
    bgBadge: 'bg-violet-950/80 text-violet-300 border-violet-500/40',
  },
  pregnancy_milestones: {
    label: 'Pregnancy',
    emoji: '👶',
    color: 'text-rose-400',
    bgBadge: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
  },
  bullet_tasks: {
    label: 'Bullet & Tasks',
    emoji: '🌿',
    color: 'text-emerald-400',
    bgBadge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
  },
  multimedia_blog: {
    label: 'Multimedia',
    emoji: '📸',
    color: 'text-sky-400',
    bgBadge: 'bg-sky-950/80 text-sky-300 border-sky-500/40',
  },
  classic_reflection: {
    label: 'Classic Reflection',
    emoji: '🪷',
    color: 'text-zinc-300',
    bgBadge: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  },
  custom: {
    label: 'Custom Type',
    emoji: '✨',
    color: 'text-purple-400',
    bgBadge: 'bg-purple-950/80 text-purple-300 border-purple-500/40',
  },
};

// Playful sticky note color themes
const STICKY_PALETTES = [
  {
    bg: 'bg-amber-100 text-amber-950 border-amber-300/80 shadow-amber-900/20',
    activeRing: 'ring-2 ring-amber-400 border-amber-500',
    pinColor: 'text-amber-600',
    tagBg: 'bg-amber-200/90 text-amber-900',
    rotation: '-rotate-1',
  },
  {
    bg: 'bg-emerald-100 text-emerald-950 border-emerald-300/80 shadow-emerald-900/20',
    activeRing: 'ring-2 ring-emerald-400 border-emerald-500',
    pinColor: 'text-emerald-600',
    tagBg: 'bg-emerald-200/90 text-emerald-900',
    rotation: 'rotate-1',
  },
  {
    bg: 'bg-sky-100 text-sky-950 border-sky-300/80 shadow-sky-900/20',
    activeRing: 'ring-2 ring-sky-400 border-sky-500',
    pinColor: 'text-sky-600',
    tagBg: 'bg-sky-200/90 text-sky-900',
    rotation: '-rotate-2',
  },
  {
    bg: 'bg-rose-100 text-rose-950 border-rose-300/80 shadow-rose-900/20',
    activeRing: 'ring-2 ring-rose-400 border-rose-500',
    pinColor: 'text-rose-600',
    tagBg: 'bg-rose-200/90 text-rose-900',
    rotation: 'rotate-2',
  },
  {
    bg: 'bg-purple-100 text-purple-950 border-purple-300/80 shadow-purple-900/20',
    activeRing: 'ring-2 ring-purple-400 border-purple-500',
    pinColor: 'text-purple-600',
    tagBg: 'bg-purple-200/90 text-purple-900',
    rotation: '-rotate-1',
  },
  {
    bg: 'bg-lime-100 text-lime-950 border-lime-300/80 shadow-lime-900/20',
    activeRing: 'ring-2 ring-lime-400 border-lime-500',
    pinColor: 'text-lime-700',
    tagBg: 'bg-lime-200/90 text-lime-900',
    rotation: 'rotate-1',
  },
];

export function StickyNotesShelf({
  interactions,
  activeInteractionId,
  onSelectInteraction,
  onStartNew,
  onDeleteInteraction,
  isOpen,
  onToggleOpen,
}: StickyNotesShelfProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [groupingMode, setGroupingMode] = useState<'date' | 'category' | 'flat'>('date');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Group interactions by archetype / category
  const categoriesData = useMemo(() => {
    const map = new Map<string, { key: string; label: string; emoji: string; count: number; items: JournalInteraction[] }>();

    interactions.forEach((item) => {
      const arch = item.archetype || 'classic_reflection';
      const meta = ARCHETYPE_CATEGORY_MAP[arch] || ARCHETYPE_CATEGORY_MAP.classic_reflection;
      const groupKey = arch === 'custom' && item.customTypeName ? `custom_${item.customTypeName}` : arch;
      const groupLabel = arch === 'custom' && item.customTypeName ? item.customTypeName : meta.label;
      const groupEmoji = arch === 'custom' && item.customTypeIcon ? item.customTypeIcon : meta.emoji;

      if (!map.has(groupKey)) {
        map.set(groupKey, {
          key: groupKey,
          label: groupLabel,
          emoji: groupEmoji,
          count: 0,
          items: [],
        });
      }

      const entry = map.get(groupKey)!;
      entry.count += 1;
      entry.items.push(item);
    });

    return Array.from(map.values());
  }, [interactions]);

  // Filtered interactions by search query and category pill
  const filteredInteractions = useMemo(() => {
    return interactions.filter((item) => {
      // Category filter check
      if (selectedCategoryFilter !== 'all') {
        const arch = item.archetype || 'classic_reflection';
        const groupKey = arch === 'custom' && item.customTypeName ? `custom_${item.customTypeName}` : arch;
        if (selectedCategoryFilter !== arch && selectedCategoryFilter !== groupKey) {
          return false;
        }
      }

      // Search query check
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const titleMatch = (item.title || '').toLowerCase().includes(q);
      const moodMatch = (item.mood || '').toLowerCase().includes(q);
      const contentMatch = (item.freeformContent || '').toLowerCase().includes(q) || item.messages.some((m) => m.content.toLowerCase().includes(q));
      const headlineMatch = (item.journeySynthesis?.headline || '').toLowerCase().includes(q);
      const customTypeMatch = (item.customTypeName || '').toLowerCase().includes(q);
      const dateMatch = (item.entryDate || '').toLowerCase().includes(q);
      return titleMatch || moodMatch || contentMatch || headlineMatch || customTypeMatch || dateMatch;
    });
  }, [interactions, searchQuery, selectedCategoryFilter]);

  // Helper to compute date group metadata
  const getDateGroupMeta = (item: JournalInteraction) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const itemDateStr = item.entryDate || new Date(item.createdAt).toISOString().split('T')[0];

    if (itemDateStr === todayStr) {
      return {
        key: 'today',
        label: 'Today',
        sublabel: now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        order: 0,
      };
    }
    if (itemDateStr === yesterdayStr) {
      return {
        key: 'yesterday',
        label: 'Yesterday',
        sublabel: yesterday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        order: 1,
      };
    }

    const d = new Date(itemDateStr + 'T12:00:00');
    return {
      key: itemDateStr,
      label: isNaN(d.getTime()) ? itemDateStr : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      sublabel: isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { year: 'numeric', weekday: 'short' }),
      order: 2 + (now.getTime() - (isNaN(d.getTime()) ? item.createdAt : d.getTime())),
    };
  };

  // Group filtered items by Date
  const dateGroupsData = useMemo(() => {
    const map = new Map<string, { key: string; label: string; sublabel: string; order: number; items: JournalInteraction[] }>();

    filteredInteractions.forEach((item) => {
      const meta = getDateGroupMeta(item);
      if (!map.has(meta.key)) {
        map.set(meta.key, {
          key: meta.key,
          label: meta.label,
          sublabel: meta.sublabel,
          order: meta.order,
          items: [],
        });
      }
      map.get(meta.key)!.items.push(item);
    });

    return Array.from(map.values()).sort((a, b) => a.order - b.order);
  }, [filteredInteractions]);

  const toggleGroupCollapse = (groupKey: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  };

  const handleConfirmDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!onDeleteInteraction) return;
    setDeletingId(id);
    try {
      await onDeleteInteraction(id);
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Failed to delete reflection:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const renderStickyNoteCard = (item: JournalInteraction, idx: number) => {
    const palette = STICKY_PALETTES[idx % STICKY_PALETTES.length];
    const isSelected = activeInteractionId === item.id;
    const dateFormatted = new Date(item.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
    const firstUserMsg =
      item.freeformContent || item.messages.find((m) => m.role === 'user')?.content || item.initialPrompt || '';
    const snippet = firstUserMsg.length > 70 ? `${firstUserMsg.substring(0, 67)}...` : firstUserMsg;

    const arch = item.archetype || 'classic_reflection';
    const catMeta = ARCHETYPE_CATEGORY_MAP[arch] || ARCHETYPE_CATEGORY_MAP.classic_reflection;
    const displayCategoryName = item.customTypeName || catMeta.label;
    const displayCategoryEmoji = item.customTypeIcon || catMeta.emoji;

    return (
      <div
        key={item.id}
        onClick={() => onSelectInteraction(item)}
        className={`group relative rounded-2xl border p-4 shadow-md transition-all duration-200 cursor-pointer ${
          palette.bg
        } ${palette.rotation} hover:rotate-0 hover:scale-[1.02] hover:shadow-xl ${
          isSelected ? palette.activeRing : ''
        }`}
      >
        {/* Pin Graphic */}
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
          <Pin className={`h-4 w-4 drop-shadow-md fill-current ${palette.pinColor}`} />
        </div>

        {/* Delete Button (hover or always accessible) */}
        {onDeleteInteraction && (
          <button
            type="button"
            onClick={(e) => handleDeleteClick(e, item.id)}
            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 hover:border-red-500/50 shadow-md transition opacity-0 group-hover:opacity-100 sm:opacity-0 focus:opacity-100 max-sm:opacity-100"
            title="Delete this reflection"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}

        {/* Note Header: Category Badge & Date */}
        <div className="flex items-center justify-between text-[10px] font-bold opacity-90 mb-1.5 pt-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/10 px-2 py-0.5 text-[9px] font-black">
            <span>{displayCategoryEmoji}</span>
            <span className="truncate max-w-[90px]">{displayCategoryName}</span>
          </span>

          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {dateFormatted}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-sm font-black leading-snug line-clamp-1 group-hover:underline">
          {item.title || 'Untitled Reflection'}
        </h4>

        {/* Excerpt Snippet */}
        <p className="mt-1.5 text-xs opacity-90 line-clamp-2 leading-relaxed font-normal">
          {item.journeySynthesis?.headline ? `"${item.journeySynthesis.headline}"` : (snippet || 'Discussion transcript')}
        </p>

        {/* Note Footer: Badges & Messages */}
        <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-2 text-[10px]">
          <div className="flex items-center gap-1.5">
            {item.mood && (
              <span className={`rounded-full px-2 py-0.2 text-[9px] font-extrabold ${palette.tagBg}`}>
                {item.mood}
              </span>
            )}
            <span className="flex items-center gap-0.5 font-semibold opacity-75">
              <MessageSquare className="h-3 w-3" />
              {item.messages.length}
            </span>
          </div>

          {item.journeySynthesis ? (
            <span className="flex items-center gap-0.5 font-black text-amber-900 bg-amber-300/60 px-1.5 py-0.5 rounded-md text-[9px]">
              <Sparkles className="h-2.5 w-2.5" /> {item.journeySynthesis.analytics.clarityScore}%
            </span>
          ) : (
            <span className="font-bold opacity-60 group-hover:opacity-100 flex items-center gap-0.5">
              Open &rarr;
            </span>
          )}
        </div>

        {isSelected && (
          <div className="absolute right-2 top-2 rounded-full bg-zinc-950 px-2 py-0.5 text-[9px] font-black text-lime-400 flex items-center gap-1 shadow">
            <Check className="h-2.5 w-2.5" /> Active
          </div>
        )}

        {/* Delete Confirmation Overlay */}
        {confirmDeleteId === item.id && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-2xl bg-zinc-950/95 p-3 text-center text-zinc-100 shadow-2xl backdrop-blur-sm animate-in fade-in zoom-in-95 duration-150"
          >
            <AlertTriangle className="h-5 w-5 text-red-400 mb-1" />
            <p className="text-xs font-bold text-zinc-200">Delete reflection?</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">This cannot be undone.</p>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={deletingId === item.id}
                className="rounded-lg bg-zinc-800 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:bg-zinc-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => handleConfirmDelete(e, item.id)}
                disabled={deletingId === item.id}
                className="flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-500 transition shadow"
              >
                {deletingId === item.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Toggle button on the left edge if closed */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggleOpen}
          className="fixed left-2 top-20 z-40 flex items-center gap-1.5 rounded-r-2xl border border-zinc-700 bg-zinc-900/95 py-2 px-3 text-xs font-bold text-amber-300 shadow-xl backdrop-blur-md hover:bg-zinc-800 hover:scale-105 transition"
          title="Open Sticky Notes drawer"
        >
          <StickyNote className="h-4 w-4 text-amber-400" />
          <span className="hidden sm:inline">Sticky Notes</span>
          <span className="rounded-full bg-amber-400/20 px-1.5 py-0.2 text-[10px] text-amber-300">
            {interactions.length}
          </span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Slide-out Sticky Notes Drawer / Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-zinc-800 bg-zinc-950/95 backdrop-blur-2xl transition-all duration-300 shadow-2xl ${
          isOpen ? 'w-80 sm:w-92 translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
      >
        {/* Shelf Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 p-4 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/30">
              <StickyNote className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-zinc-100 flex items-center gap-1.5">
                Sticky Notes
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                  {interactions.length} Notes
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">Categorized by Journaling Type</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onStartNew()}
              className="flex items-center gap-1 rounded-xl bg-lime-400 px-2.5 py-1.5 text-xs font-bold text-zinc-950 hover:bg-lime-300 transition shadow-sm"
              title="Start a new reflection or pick journey"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New</span>
            </button>
            <button
              type="button"
              onClick={onToggleOpen}
              className="rounded-xl bg-zinc-800/80 p-1.5 text-zinc-400 hover:bg-zinc-700 hover:text-white transition"
              title="Close drawer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search Bar & Grouping Mode Toggle */}
        <div className="p-3 border-b border-zinc-800/70 space-y-2.5">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by title, content, mood, date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-1.5 pl-8 pr-3 text-xs text-zinc-200 placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Grouping mode buttons: By Date vs By Category vs All Flat */}
          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <span className="text-zinc-400 font-medium">Group by:</span>
            <div className="flex items-center rounded-xl bg-zinc-900 border border-zinc-800 p-0.5 shadow-inner">
              <button
                type="button"
                onClick={() => setGroupingMode('date')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold transition ${
                  groupingMode === 'date'
                    ? 'bg-amber-400 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Group entries by Date (Today, Yesterday, Past Dates)"
              >
                <Clock className="h-3 w-3" />
                <span>By Date</span>
              </button>
              <button
                type="button"
                onClick={() => setGroupingMode('category')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold transition ${
                  groupingMode === 'category'
                    ? 'bg-amber-400 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Group entries by Journal Type"
              >
                <FolderOpen className="h-3 w-3" />
                <span>By Type</span>
              </button>
              <button
                type="button"
                onClick={() => setGroupingMode('flat')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold transition ${
                  groupingMode === 'flat'
                    ? 'bg-amber-400 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Flat list of all notes"
              >
                <Layers className="h-3 w-3" />
                <span>All</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="px-3 py-2 border-b border-zinc-800/70 bg-zinc-950/80 overflow-x-auto scrollbar-none flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('all')}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold transition ${
              selectedCategoryFilter === 'all'
                ? 'bg-amber-400 text-zinc-950 shadow-sm font-black'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
            }`}
          >
            🌟 All ({interactions.length})
          </button>

          {categoriesData.map((cat) => {
            const isSelected = selectedCategoryFilter === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategoryFilter(isSelected ? 'all' : cat.key)}
                className={`shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition ${
                  isSelected
                    ? 'bg-zinc-100 text-zinc-950 shadow-sm font-black'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                }`}
              >
                <span>{cat.emoji}</span>
                <span className="truncate max-w-[85px]">{cat.label}</span>
                <span className="rounded-full bg-black/20 px-1 text-[9px] font-black">
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sticky Notes Scroll Area */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-zinc-950/40">
          {/* Quick Create Note Card */}
          <button
            type="button"
            onClick={() => onStartNew()}
            className="w-full rounded-2xl border-2 border-dashed border-zinc-800 p-3 text-center text-xs font-bold text-zinc-400 hover:border-lime-400 hover:text-lime-400 hover:bg-lime-950/10 transition flex items-center justify-center gap-2 group"
          >
            <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span>Start New Journal Entry</span>
          </button>

          {filteredInteractions.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              {searchQuery
                ? 'No matching journal entries found.'
                : 'No entries in this selection yet. Start one above!'}
            </div>
          ) : groupingMode === 'date' ? (
            /* DATE-BASED GROUPING VIEW (Accordion per Day) */
            dateGroupsData.map((group) => {
              const isCollapsed = !!collapsedGroups[group.key];

              return (
                <div
                  key={group.key}
                  className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden shadow-sm"
                >
                  {/* Date Accordion Header */}
                  <div
                    onClick={() => toggleGroupCollapse(group.key)}
                    className="flex items-center justify-between p-3 bg-zinc-900/80 hover:bg-zinc-850 cursor-pointer transition select-none border-b border-zinc-800/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400/15 text-amber-400 border border-amber-400/30 text-xs">
                        <Clock className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-black text-zinc-100">{group.label}</h4>
                          {group.sublabel && (
                            <span className="text-[10px] text-zinc-400 font-medium">
                              • {group.sublabel}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="rounded-full bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-[10px] font-bold text-amber-300 ml-1">
                        {group.items.length} {group.items.length === 1 ? 'entry' : 'entries'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <ChevronDown
                        className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                          isCollapsed ? '-rotate-90' : 'rotate-0'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Accordion Content: Sticky Notes in this Date */}
                  {!isCollapsed && (
                    <div className="p-3 space-y-3 bg-zinc-950/60">
                      {group.items.map((item, idx) => renderStickyNoteCard(item, idx))}
                    </div>
                  )}
                </div>
              );
            })
          ) : groupingMode === 'category' ? (
            /* CATEGORY-BASED GROUPING VIEW */
            categoriesData
              .filter((cat) => {
                if (selectedCategoryFilter !== 'all') {
                  return selectedCategoryFilter === cat.key;
                }
                return true;
              })
              .map((cat) => {
                const catFilteredItems = cat.items.filter((item) => {
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    (item.title || '').toLowerCase().includes(q) ||
                    (item.mood || '').toLowerCase().includes(q) ||
                    (item.freeformContent || '').toLowerCase().includes(q) ||
                    item.messages.some((m) => m.content.toLowerCase().includes(q)) ||
                    (item.journeySynthesis?.headline || '').toLowerCase().includes(q)
                  );
                });

                if (catFilteredItems.length === 0) return null;

                const isCollapsed = !!collapsedGroups[cat.key];

                return (
                  <div
                    key={cat.key}
                    className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden shadow-sm"
                  >
                    {/* Category Accordion Header */}
                    <div
                      onClick={() => toggleGroupCollapse(cat.key)}
                      className="flex items-center justify-between p-3 bg-zinc-900/80 hover:bg-zinc-850 cursor-pointer transition select-none border-b border-zinc-800/50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{cat.emoji}</span>
                        <h4 className="text-xs font-extrabold text-zinc-100">{cat.label}</h4>
                        <span className="rounded-full bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                          {catFilteredItems.length} {catFilteredItems.length === 1 ? 'entry' : 'entries'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const sampleItem = cat.items[0];
                            onStartNew(sampleItem?.archetype, sampleItem?.customTypeName);
                          }}
                          className="flex items-center gap-0.5 rounded-lg bg-zinc-800 px-2 py-1 text-[10px] font-bold text-lime-400 hover:bg-zinc-700 transition"
                          title={`Add new ${cat.label} entry`}
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add</span>
                        </button>

                        <ChevronDown
                          className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                            isCollapsed ? '-rotate-90' : 'rotate-0'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Accordion Content: Sticky Notes in this category */}
                    {!isCollapsed && (
                      <div className="p-3 space-y-3 bg-zinc-950/60">
                        {catFilteredItems.map((item, idx) => renderStickyNoteCard(item, idx))}
                      </div>
                    )}
                  </div>
                );
              })
          ) : (
            /* Flat Sticky Wall View */
            filteredInteractions.map((item, idx) => renderStickyNoteCard(item, idx))
          )}
        </div>
      </aside>
    </>
  );
}
