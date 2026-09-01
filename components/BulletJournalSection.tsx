'use client';

import React, { useState } from 'react';
import type { BulletItem } from '@/lib/types';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Calendar,
  Star,
  Circle,
  Minus,
  Lightbulb,
  Pin,
  MoveRight,
  Sparkles,
  Mic,
} from 'lucide-react';
import { VoiceDictationButton } from './VoiceDictationButton';

interface BulletJournalSectionProps {
  bullets: BulletItem[];
  onChangeBullets: (bullets: BulletItem[]) => void;
  onMoveToStickyNote?: (text: string, type: 'thought' | 'action') => void;
}

export function BulletJournalSection({
  bullets,
  onChangeBullets,
  onMoveToStickyNote,
}: BulletJournalSectionProps) {
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<BulletItem['type']>('task');
  const [filterType, setFilterType] = useState<string>('all');
  const [activeWeekDay, setActiveWeekDay] = useState<string>('all');

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleAddBullet = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newContent.trim()) return;

    const newItem: BulletItem = {
      id: `bullet-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: newType,
      content: newContent.trim(),
      completed: false,
      date: activeWeekDay !== 'all' ? activeWeekDay : undefined,
    };

    onChangeBullets([...bullets, newItem]);
    setNewContent('');
  };

  const handleToggleComplete = (id: string) => {
    onChangeBullets(
      bullets.map((b) => (b.id === id ? { ...b, completed: !b.completed } : b))
    );
  };

  const handleDelete = (id: string) => {
    onChangeBullets(bullets.filter((b) => b.id !== id));
  };

  const filteredBullets = bullets.filter((b) => {
    const matchesType = filterType === 'all' || b.type === filterType;
    const matchesDay = activeWeekDay === 'all' || !b.date || b.date === activeWeekDay;
    return matchesType && matchesDay;
  });

  const completedCount = bullets.filter((b) => b.completed).length;
  const taskCount = bullets.filter((b) => b.type === 'task').length;

  const getTypeIcon = (type: BulletItem['type']) => {
    switch (type) {
      case 'task':
        return <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />;
      case 'priority':
        return <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400/30" />;
      case 'event':
        return <Circle className="h-3.5 w-3.5 text-sky-400" />;
      case 'idea':
        return <Lightbulb className="h-3.5 w-3.5 text-yellow-400" />;
      case 'note':
      default:
        return <Minus className="h-3.5 w-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-zinc-900/60 p-4 sm:p-5 backdrop-blur-md shadow-lg space-y-4">
      {/* Header with Stats & Rapid Key */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/15 border border-emerald-400/30 text-emerald-400">
            <CheckSquare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-zinc-100 flex items-center gap-2">
              Bullet Journal & Weekly Matrix
              {taskCount > 0 && (
                <span className="rounded-full bg-emerald-400/20 border border-emerald-400/30 px-2 py-0.2 text-[10px] font-bold text-emerald-300">
                  {completedCount}/{taskCount} Done
                </span>
              )}
            </h3>
            <p className="text-[11px] text-zinc-400">
              Rapid logging syntax: • Task | * Priority | ○ Event | – Note | 💡 Idea
            </p>
          </div>
        </div>

        {/* Weekly Day Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveWeekDay('all')}
            className={`rounded-lg px-2 py-1 text-[10px] font-bold transition ${
              activeWeekDay === 'all'
                ? 'bg-emerald-400 text-zinc-950 shadow-sm'
                : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
            }`}
          >
            All Days
          </button>
          {DAYS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setActiveWeekDay(d)}
              className={`rounded-lg px-2 py-1 text-[10px] font-bold transition ${
                activeWeekDay === d
                  ? 'bg-emerald-400 text-zinc-950 shadow-sm'
                  : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Input Row */}
      <form onSubmit={handleAddBullet} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 shrink-0">
          <span className="text-[10px] font-bold text-zinc-500 uppercase">Type:</span>
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as any)}
            className="bg-transparent text-xs font-bold text-zinc-200 outline-none cursor-pointer"
          >
            <option value="task" className="bg-zinc-900 text-zinc-200">
              • Task
            </option>
            <option value="priority" className="bg-zinc-900 text-amber-300">
              * Priority
            </option>
            <option value="event" className="bg-zinc-900 text-sky-300">
              ○ Event
            </option>
            <option value="note" className="bg-zinc-900 text-zinc-300">
              – Note
            </option>
            <option value="idea" className="bg-zinc-900 text-yellow-300">
              💡 Idea
            </option>
          </select>
        </div>

        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Add rapid bullet entry (type or speak via mic)..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-3.5 pr-10 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
            <VoiceDictationButton
              onTranscript={(text) => setNewContent((prev) => (prev ? `${prev} ${text}` : text))}
              size="icon"
              variant="subtle"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!newContent.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50 transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Item</span>
        </button>
      </form>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-bold">
        {['all', 'task', 'priority', 'event', 'note', 'idea'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilterType(t)}
            className={`rounded-full px-2.5 py-1 transition capitalize ${
              filterType === t
                ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
            }`}
          >
            {t === 'all' ? 'All Entries' : t}
          </button>
        ))}
      </div>

      {/* Bullets List */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {filteredBullets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
            No bullet items logged yet for this filter. Start rapid logging tasks and weekly priorities above!
          </div>
        ) : (
          filteredBullets.map((item) => (
            <div
              key={item.id}
              className={`group flex items-start justify-between gap-3 rounded-xl border p-2.5 transition-all ${
                item.completed
                  ? 'border-zinc-800/60 bg-zinc-950/40 opacity-70'
                  : 'border-zinc-800 bg-zinc-950/80 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                {item.type === 'task' ? (
                  <button
                    type="button"
                    onClick={() => handleToggleComplete(item.id)}
                    className="mt-0.5 text-zinc-400 hover:text-emerald-400 transition"
                  >
                    {item.completed ? (
                      <CheckSquare className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Square className="h-4 w-4 text-zinc-500 group-hover:text-emerald-400" />
                    )}
                  </button>
                ) : (
                  <span className="mt-0.5">{getTypeIcon(item.type)}</span>
                )}

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs leading-relaxed break-words ${
                      item.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'
                    }`}
                  >
                    {item.content}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">
                      {item.type}
                    </span>
                    {item.date && (
                      <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[9px] font-bold text-zinc-400">
                        {item.date}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition">
                {onMoveToStickyNote && (
                  <>
                    <button
                      type="button"
                      onClick={() => onMoveToStickyNote(item.content, 'thought')}
                      title="Move to Insight Sticky Note"
                      className="rounded p-1 text-amber-400/80 hover:bg-amber-400/10 hover:text-amber-300 text-[10px] flex items-center gap-1 font-bold"
                    >
                      <Lightbulb className="h-3 w-3" />
                      <span className="hidden lg:inline text-[9px]">Note</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveToStickyNote(item.content, 'action')}
                      title="Move to Action Commitment Sticky Note"
                      className="rounded p-1 text-lime-400/80 hover:bg-lime-400/10 hover:text-lime-300 text-[10px] flex items-center gap-1 font-bold"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span className="hidden lg:inline text-[9px]">Action</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="rounded p-1 text-zinc-500 hover:bg-rose-950 hover:text-rose-400 transition"
                  title="Delete bullet"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
