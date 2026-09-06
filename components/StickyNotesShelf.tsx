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
  Check,
  Trash2,
  AlertTriangle,
  Loader2,
  ChevronDown,
  Layers,
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

// Playful, compact sticky note color themes
const STICKY_PALETTES = [
  {
    bg: 'bg-amber-100 text-amber-950 border-amber-300/80 shadow-amber-900/15',
    activeRing: 'ring-2 ring-amber-400 border-amber-500',
    pinColor: 'text-amber-600',
    tagBg: 'bg-amber-200/90 text-amber-900',
    rotation: '-rotate-0.5',
  },
  {
    bg: 'bg-emerald-100 text-emerald-950 border-emerald-300/80 shadow-emerald-900/15',
    activeRing: 'ring-2 ring-emerald-400 border-emerald-500',
    pinColor: 'text-emerald-600',
    tagBg: 'bg-emerald-200/90 text-emerald-900',
    rotation: 'rotate-0.5',
  },
  {
    bg: 'bg-sky-100 text-sky-950 border-sky-300/80 shadow-sky-900/15',
    activeRing: 'ring-2 ring-sky-400 border-sky-500',
    pinColor: 'text-sky-600',
    tagBg: 'bg-sky-200/90 text-sky-900',
    rotation: '-rotate-0.5',
  },
  {
    bg: 'bg-rose-100 text-rose-950 border-rose-300/80 shadow-rose-900/15',
    activeRing: 'ring-2 ring-rose-400 border-rose-500',
    pinColor: 'text-rose-600',
    tagBg: 'bg-rose-200/90 text-rose-900',
    rotation: 'rotate-0.5',
  },
  {
    bg: 'bg-purple-100 text-purple-950 border-purple-300/80 shadow-purple-900/15',
    activeRing: 'ring-2 ring-purple-400 border-purple-500',
    pinColor: 'text-purple-600',
    tagBg: 'bg-purple-200/90 text-purple-900',
    rotation: '-rotate-0.5',
  },
  {
    bg: 'bg-lime-100 text-lime-950 border-lime-300/80 shadow-lime-900/15',
    activeRing: 'ring-2 ring-lime-400 border-lime-500',
    pinColor: 'text-lime-700',
    tagBg: 'bg-lime-200/90 text-lime-900',
    rotation: 'rotate-0.5',
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
  const [groupingMode, setGroupingMode] = useState<'date' | 'flat'>('date');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered interactions by search query
  const filteredInteractions = useMemo(() => {
    if (!searchQuery.trim()) return interactions;
    const q = searchQuery.toLowerCase();
    return interactions.filter((item) => {
      const titleMatch = (item.title || '').toLowerCase().includes(q);
      const moodMatch = (item.mood || '').toLowerCase().includes(q);
      const contentMatch =
        (item.freeformContent || '').toLowerCase().includes(q) ||
        item.messages.some((m) => m.content.toLowerCase().includes(q));
      const headlineMatch = (item.journeySynthesis?.headline || '').toLowerCase().includes(q);
      const dateMatch = (item.entryDate || '').toLowerCase().includes(q);
      return titleMatch || moodMatch || contentMatch || headlineMatch || dateMatch;
    });
  }, [interactions, searchQuery]);

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
    const snippet = firstUserMsg.length > 55 ? `${firstUserMsg.substring(0, 52)}...` : firstUserMsg;

    return (
      <div
        key={item.id}
        onClick={() => onSelectInteraction(item)}
        className={`group relative rounded-xl border p-2.5 shadow-sm transition-all duration-200 cursor-pointer ${
          palette.bg
        } ${palette.rotation} hover:rotate-0 hover:scale-[1.01] hover:shadow-md ${
          isSelected ? palette.activeRing : ''
        }`}
      >
        {/* Subtle Micro-Pin Graphic */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
          <Pin className={`h-3 w-3 drop-shadow-sm fill-current ${palette.pinColor}`} />
        </div>

        {/* Delete Button (hover or focused) */}
        {onDeleteInteraction && (
          <button
            type="button"
            onClick={(e) => handleDeleteClick(e, item.id)}
            className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 shadow transition opacity-0 group-hover:opacity-100 sm:opacity-0 focus:opacity-100 max-sm:opacity-100"
            title="Delete this reflection"
          >
            <Trash2 className="h-2.5 w-2.5" />
          </button>
        )}

        {/* Note Header: Date & Mood Tag (Category badge removed as redundant) */}
        <div className="flex items-center justify-between text-[9px] font-medium opacity-75 mb-1 pt-0.5">
          <span className="flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {dateFormatted}
          </span>
          {item.mood && (
            <span className={`rounded-full px-1.5 py-0.2 text-[8px] font-bold ${palette.tagBg}`}>
              {item.mood}
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="text-xs font-bold leading-tight line-clamp-1 group-hover:underline text-zinc-950">
          {item.title || 'Untitled Reflection'}
        </h4>

        {/* Single-Line Excerpt Preview */}
        <p className="mt-0.5 text-[10px] opacity-80 line-clamp-1 leading-snug font-normal">
          {item.journeySynthesis?.headline ? `"${item.journeySynthesis.headline}"` : (snippet || 'Journal entry')}
        </p>

        {/* Note Footer: Messages & Action indicator */}
        <div className="mt-1.5 flex items-center justify-between border-t border-black/10 pt-1 text-[9px]">
          <span className="flex items-center gap-0.5 font-semibold opacity-75 text-[8px]">
            <MessageSquare className="h-2.5 w-2.5" />
            {item.messages.length} msgs
          </span>

          {item.journeySynthesis ? (
            <span className="flex items-center gap-0.5 font-black text-amber-900 bg-amber-300/60 px-1 py-0.2 rounded text-[8px]">
              <Sparkles className="h-2 w-2" /> {item.journeySynthesis.analytics.clarityScore}%
            </span>
          ) : (
            <span className="font-bold opacity-60 group-hover:opacity-100 text-[8px]">
              Open &rarr;
            </span>
          )}
        </div>

        {isSelected && (
          <div className="absolute right-1.5 top-1.5 rounded-full bg-zinc-950 px-1.5 py-0.2 text-[8px] font-black text-lime-400 flex items-center gap-0.5 shadow">
            <Check className="h-2 w-2" /> Active
          </div>
        )}

        {/* Delete Confirmation Overlay */}
        {confirmDeleteId === item.id && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-xl bg-zinc-950/95 p-2 text-center text-zinc-100 shadow-xl backdrop-blur-sm animate-in fade-in zoom-in-95 duration-150"
          >
            <AlertTriangle className="h-4 w-4 text-red-400 mb-0.5" />
            <p className="text-[11px] font-bold text-zinc-200">Delete reflection?</p>
            <div className="mt-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={deletingId === item.id}
                className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 hover:bg-zinc-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => handleConfirmDelete(e, item.id)}
                disabled={deletingId === item.id}
                className="flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-red-500 transition shadow"
              >
                {deletingId === item.id ? (
                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                ) : (
                  <Trash2 className="h-2.5 w-2.5" />
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
      {/* Mobile backdrop when drawer is open */}
      {isOpen && (
        <div
          onClick={onToggleOpen}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Floating Toggle button on left edge when closed */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggleOpen}
          className="fixed left-2 top-20 z-30 flex items-center gap-1 rounded-r-xl border border-zinc-700/80 bg-zinc-900/95 py-1.5 px-2.5 text-[10px] font-bold text-amber-300 shadow-md backdrop-blur-md hover:bg-zinc-800 hover:scale-102 transition"
          title="Open Sticky Notes"
        >
          <StickyNote className="h-3.5 w-3.5 text-amber-400" />
          <span className="hidden sm:inline">Notes</span>
          <span className="rounded-full bg-amber-400/20 px-1 py-0.2 text-[9px] text-amber-300 font-extrabold">
            {interactions.length}
          </span>
          <ChevronRight className="h-3 w-3" />
        </button>
      )}

      {/* Compact Slide-out Sticky Notes Drawer / Sidebar */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 flex flex-col border-r border-zinc-800 bg-zinc-950/95 backdrop-blur-2xl transition-all duration-300 shadow-2xl ${
          isOpen ? 'w-72 translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
      >
        {/* Sleek, Compact Shelf Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-3 py-2.5 bg-zinc-900/70">
          <div className="flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400/20 text-amber-400 border border-amber-400/30">
              <StickyNote className="h-3.5 w-3.5" />
            </span>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-zinc-100">Sticky Notes</h3>
              <span className="rounded-md bg-zinc-800 px-1.5 py-0.2 text-[9px] font-semibold text-amber-300">
                {interactions.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onStartNew()}
              className="flex items-center gap-1 rounded-lg bg-lime-400 px-2 py-1 text-[10px] font-bold text-zinc-950 hover:bg-lime-300 transition shadow-sm"
              title="Start a new reflection"
            >
              <Plus className="h-3 w-3" />
              <span>New</span>
            </button>
            <button
              type="button"
              onClick={onToggleOpen}
              className="rounded-lg bg-zinc-800/80 p-1 text-zinc-400 hover:bg-zinc-700 hover:text-white transition"
              title="Close drawer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Compact Search & View Toggle Row */}
        <div className="p-2 border-b border-zinc-800/60 bg-zinc-950/60 flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2 h-3 w-3 text-zinc-500" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 py-1 pl-6 pr-2 text-[11px] text-zinc-200 placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center rounded-lg bg-zinc-900 border border-zinc-800 p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setGroupingMode('date')}
              className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold transition ${
                groupingMode === 'date'
                  ? 'bg-amber-400 text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Group by Date"
            >
              <Clock className="h-2.5 w-2.5" />
              <span>Date</span>
            </button>
            <button
              type="button"
              onClick={() => setGroupingMode('flat')}
              className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold transition ${
                groupingMode === 'flat'
                  ? 'bg-amber-400 text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Flat list of all notes"
            >
              <Layers className="h-2.5 w-2.5" />
              <span>All</span>
            </button>
          </div>
        </div>

        {/* Sticky Notes Scroll Area: Trimmed padding, immediate visibility */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2 bg-zinc-950/40">
          {/* Quick Create Note Button */}
          <button
            type="button"
            onClick={() => onStartNew()}
            className="w-full rounded-xl border border-dashed border-zinc-800 p-1.5 text-center text-[10px] font-bold text-zinc-400 hover:border-lime-400 hover:text-lime-300 hover:bg-lime-950/10 transition flex items-center justify-center gap-1.5 group"
          >
            <Plus className="h-3 w-3 group-hover:scale-110 transition-transform text-lime-400" />
            <span>Start New Entry</span>
          </button>

          {filteredInteractions.length === 0 ? (
            <div className="py-6 text-center text-[11px] text-zinc-500">
              {searchQuery ? 'No matching notes found.' : 'No entries yet. Start one above!'}
            </div>
          ) : groupingMode === 'date' ? (
            /* DATE-BASED GROUPING VIEW (Compact Accordion per Day) */
            dateGroupsData.map((group) => {
              const isCollapsed = !!collapsedGroups[group.key];

              return (
                <div
                  key={group.key}
                  className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden shadow-xs"
                >
                  {/* Date Accordion Header */}
                  <div
                    onClick={() => toggleGroupCollapse(group.key)}
                    className="flex items-center justify-between p-2 bg-zinc-900/80 hover:bg-zinc-850 cursor-pointer transition select-none border-b border-zinc-800/50"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded bg-amber-400/15 text-amber-400 text-[10px]">
                        <Clock className="h-2.5 w-2.5" />
                      </span>
                      <div className="flex items-center gap-1">
                        <h4 className="text-[10px] font-bold text-zinc-200">{group.label}</h4>
                        {group.sublabel && (
                          <span className="text-[9px] text-zinc-500 font-normal">
                            • {group.sublabel}
                          </span>
                        )}
                      </div>
                      <span className="rounded-full bg-zinc-800 border border-zinc-700 px-1.5 py-0.2 text-[9px] font-semibold text-amber-300 ml-0.5">
                        {group.items.length}
                      </span>
                    </div>

                    <ChevronDown
                      className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${
                        isCollapsed ? '-rotate-90' : 'rotate-0'
                      }`}
                    />
                  </div>

                  {/* Accordion Content: Sticky Notes in this Date */}
                  {!isCollapsed && (
                    <div className="p-2 space-y-2 bg-zinc-950/60">
                      {group.items.map((item, idx) => renderStickyNoteCard(item, idx))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            /* Flat List of Notes */
            filteredInteractions.map((item, idx) => renderStickyNoteCard(item, idx))
          )}
        </div>
      </aside>
    </>
  );
}
