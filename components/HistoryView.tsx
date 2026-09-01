'use client';

import React, { useState } from 'react';
import type { JournalInteraction, ReflectionMode } from '@/lib/types';
import { deleteJournalInteraction } from '@/lib/firestore-service';
import { Life360JourneyCard } from './Life360JourneyCard';
import Markdown from 'react-markdown';
import {
  Search,
  Calendar,
  Smile,
  Trash2,
  ExternalLink,
  Download,
  Filter,
  Sparkles,
  BookOpen,
  MessageSquare,
  FileText,
  Compass,
  Lightbulb,
  X,
  Clock,
  AlertTriangle,
  Flame,
  Zap,
} from 'lucide-react';

interface HistoryViewProps {
  userId: string;
  interactions: JournalInteraction[];
  onSelectInteraction: (interaction: JournalInteraction) => void;
  onRefresh?: () => void;
}

export function HistoryView({
  userId,
  interactions,
  onSelectInteraction,
  onRefresh,
}: HistoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModeFilter, setSelectedModeFilter] = useState<string>('all');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('all');
  const [activeModalEntry, setActiveModalEntry] = useState<JournalInteraction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Filter entries based on search & mode
  const filteredInteractions = interactions.filter((item) => {
    // Mode filter
    if (selectedModeFilter !== 'all' && item.reflectionMode !== selectedModeFilter) {
      return false;
    }
    // Mood filter
    if (selectedMoodFilter !== 'all' && item.mood !== selectedMoodFilter) {
      return false;
    }
    // Search query
    if (!searchQuery.trim()) return true;
    const queryLower = searchQuery.toLowerCase();
    const titleMatch = (item.title || '').toLowerCase().includes(queryLower);
    const contentMatch = item.messages.some((m) => (m.content || '').toLowerCase().includes(queryLower));
    const summaryMatch = (item.aiSummary || '').toLowerCase().includes(queryLower);
    const tagMatch = (item.tags || []).some((t) => t.toLowerCase().includes(queryLower));
    return titleMatch || contentMatch || summaryMatch || tagMatch;
  });

  // Calculate statistics
  const totalEntries = interactions.length;
  const totalTurns = interactions.reduce((acc, curr) => acc + (curr.messages?.length || 0), 0);

  // Handle entry deletion
  const handleDelete = async (entryId: string) => {
    if (!userId || !entryId) return;
    try {
      setDeletingId(entryId);
      await deleteJournalInteraction(userId, entryId);
      if (activeModalEntry?.id === entryId) {
        setActiveModalEntry(null);
      }
      setShowDeleteConfirm(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to delete interaction:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Export entry to markdown file download
  const handleExportMarkdown = (entry: JournalInteraction) => {
    const dateStr = new Date(entry.createdAt).toLocaleDateString();
    let mdContent = `# ${entry.title || 'Journal Reflection'}\n\n`;
    mdContent += `**Date:** ${dateStr}  \n`;
    mdContent += `**Mode:** ${entry.reflectionMode}  \n`;
    if (entry.mood) mdContent += `**Mood:** ${entry.mood}  \n`;
    mdContent += `\n---\n\n`;

    if (entry.journeySynthesis) {
      const syn = entry.journeySynthesis;
      mdContent += `## ✨ Life360: Journey So Far\n\n`;
      mdContent += `**Focus:** ${syn.headline}\n\n`;
      mdContent += `### 💭 Thoughts\n${syn.thoughts.map((t) => `- ${t}`).join('\n')}\n\n`;
      mdContent += `### 💡 Key Insights\n${syn.insights.map((i) => `- ${i}`).join('\n')}\n\n`;
      mdContent += `### ⚡ Action Steps\n${syn.actionSteps.map((a) => `- [ ] ${a}`).join('\n')}\n\n`;
      mdContent += `**Analytics:** Clarity ${syn.analytics.clarityScore}% | Shift: ${syn.analytics.emotionalShift} | Focus: ${syn.analytics.cognitiveFocus}\n\n---\n\n`;
    } else if (entry.aiSummary) {
      mdContent += `## ✨ Life360: Journey So Far\n\n${entry.aiSummary}\n\n---\n\n`;
    }

    mdContent += `## 💬 Dialogue Transcript\n\n`;
    entry.messages.forEach((msg) => {
      const speaker = msg.role === 'user' ? '👤 **You**' : '✨ **Gemini**';
      mdContent += `### ${speaker} (${new Date(msg.timestamp).toLocaleTimeString()})\n\n${msg.content}\n\n`;
    });

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(entry.title || 'reflection').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${entry.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative mx-auto flex h-[calc(100vh-4rem)] w-full max-w-5xl flex-col bg-zinc-950/60 backdrop-blur-md">
      {/* Header & Stats Banner */}
      <div className="border-b border-zinc-800/80 bg-zinc-900/60 px-4 py-4 sm:px-6 backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-100 flex items-center gap-2">
              <span>Journal Archive</span>
              <span className="rounded-full bg-lime-400/10 border border-lime-400/20 px-2 py-0.5 text-[10px] font-bold text-lime-400">
                Firestore Vault
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Isolated documents exclusively readable by your authenticated UID.
            </p>
          </div>

          {/* Quick Stats Pills */}
          <div className="flex items-center gap-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-1.5 text-center shadow-inner">
              <span className="block text-sm font-bold text-zinc-100">{totalEntries}</span>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Entries</span>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-1.5 text-center shadow-inner">
              <span className="block text-sm font-bold text-lime-400">{totalTurns}</span>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Turns</span>
            </div>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              id="input-search-archive"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search past entries, thoughts, or AI summaries..."
              className="w-full rounded-full border border-zinc-800 bg-zinc-900/90 py-2 pl-10 pr-8 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:bg-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-lime-400/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
            <button
              onClick={() => setSelectedModeFilter('all')}
              className={`rounded-full px-3 py-1.5 font-semibold transition ${
                selectedModeFilter === 'all'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedModeFilter('deep_reflection')}
              className={`rounded-full px-3 py-1.5 font-semibold transition ${
                selectedModeFilter === 'deep_reflection'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              Reflections
            </button>
            <button
              onClick={() => setSelectedModeFilter('inquiry')}
              className={`rounded-full px-3 py-1.5 font-semibold transition ${
                selectedModeFilter === 'inquiry'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              Inquiry
            </button>
            <button
              onClick={() => setSelectedModeFilter('perspective_shift')}
              className={`rounded-full px-3 py-1.5 font-semibold transition ${
                selectedModeFilter === 'perspective_shift'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              Reframe
            </button>
            <button
              onClick={() => setSelectedModeFilter('brainstorm')}
              className={`rounded-full px-3 py-1.5 font-semibold transition ${
                selectedModeFilter === 'brainstorm'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              Brainstorm
            </button>
            <button
              onClick={() => setSelectedModeFilter('summary')}
              className={`rounded-full px-3 py-1.5 font-semibold transition ${
                selectedModeFilter === 'summary'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              Summaries
            </button>
          </div>
        </div>
      </div>

      {/* Entry Cards List */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        {filteredInteractions.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center justify-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400">
              <BookOpen className="h-6 w-6 text-lime-400" />
            </div>
            <h3 className="mt-4 text-base font-bold text-zinc-200">
              {searchQuery ? 'No matching reflections found' : 'No reflections saved yet'}
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
              {searchQuery
                ? 'Try broadening your search query or clearing the filter.'
                : 'Start your first session to converse with Gemini and save isolated records.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredInteractions.map((entry) => {
              const firstUserMsg = entry.messages.find((m) => m.role === 'user')?.content || entry.initialPrompt;
              const firstAiMsg = entry.messages.find((m) => m.role === 'model')?.content || entry.aiSummary;

              return (
                <div
                  key={entry.id}
                  id={`entry-card-${entry.id}`}
                  className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-5 shadow-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/90 backdrop-blur-md"
                >
                  <div>
                    {/* Top Row: Date & Mood */}
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                        <span>{new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {entry.mood && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 border border-zinc-700/60 px-2 py-0.5 text-[10px] font-semibold text-lime-400">
                            <Smile className="h-3 w-3" />
                            {entry.mood}
                          </span>
                        )}
                        <span className="rounded-full bg-zinc-800/90 border border-zinc-700/60 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                          {entry.reflectionMode === 'deep_reflection'
                            ? 'Mirror'
                            : entry.reflectionMode === 'inquiry'
                            ? 'Socratic'
                            : entry.reflectionMode === 'brainstorm'
                            ? 'Action'
                            : entry.reflectionMode === 'perspective_shift'
                            ? 'Reframe'
                            : 'Synthesis'}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-zinc-100 line-clamp-1 group-hover:text-lime-300 transition-colors">
                        {entry.title || 'Untitled Reflection'}
                      </h3>
                      {entry.journeySynthesis && (
                        <span className="shrink-0 rounded-full bg-lime-400/10 border border-lime-400/20 px-2 py-0.5 text-[9px] font-extrabold text-lime-400">
                          ✨ Life360 • {entry.journeySynthesis.analytics.clarityScore}%
                        </span>
                      )}
                    </div>

                    {/* Excerpt */}
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400 line-clamp-2">
                      {entry.journeySynthesis?.headline ? `"${entry.journeySynthesis.headline}"` : (firstUserMsg || 'No prompt content')}
                    </p>

                    {/* AI Highlight Preview if available */}
                    {entry.journeySynthesis ? (
                      <div className="mt-3 rounded-xl bg-lime-950/20 border border-lime-500/20 p-2.5 text-[11px] text-zinc-300">
                        <div className="flex items-center gap-1.5 font-bold text-lime-400 text-[10px] uppercase tracking-wider mb-1">
                          <Zap className="h-3 w-3" /> Action Pledge:
                        </div>
                        <p className="text-zinc-200 line-clamp-1">
                          {entry.journeySynthesis.actionSteps[0] || 'Reflect and align'}
                        </p>
                      </div>
                    ) : firstAiMsg ? (
                      <div className="mt-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 p-3 text-[11px] text-zinc-300 line-clamp-2">
                        <span className="font-bold text-lime-400 inline-flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> Gemini:
                        </span>{' '}
                        {firstAiMsg.replace(/[#*`_]/g, '')}
                      </div>
                    ) : null}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3 text-xs">
                    <span className="text-zinc-500 text-[11px] font-medium">
                      {entry.messages.length} {entry.messages.length === 1 ? 'turn' : 'turns'}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Read Full Transcript Modal */}
                      <button
                        type="button"
                        onClick={() => setActiveModalEntry(entry)}
                        className="inline-flex items-center gap-1 font-semibold text-zinc-300 hover:text-white transition-colors text-xs"
                      >
                        <span>View</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>

                      {/* Resume / Load into active session */}
                      <button
                        type="button"
                        onClick={() => onSelectInteraction(entry)}
                        className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-950 hover:bg-white hover:scale-105 transition"
                      >
                        Continue
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(entry.id)}
                        className="text-zinc-500 hover:text-red-400 p-1 transition"
                        title="Delete entry"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Delete Confirmation Overlay */}
                  {showDeleteConfirm === entry.id && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-zinc-950/95 p-4 text-center backdrop-blur-sm border border-red-500/30">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                      <p className="mt-1 text-xs font-semibold text-zinc-100">
                        Delete this reflection permanently?
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          disabled={deletingId === entry.id}
                          className="rounded-full bg-red-600 px-3.5 py-1 text-xs font-bold text-white hover:bg-red-500 disabled:opacity-50"
                        >
                          {deletingId === entry.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detailed Modal Transcript View */}
      {activeModalEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-md">
          <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-950/40">
              <div>
                <h2 className="text-xl font-extrabold text-zinc-100">
                  {activeModalEntry.title}
                </h2>
                <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
                  <span>{new Date(activeModalEntry.createdAt).toLocaleString()}</span>
                  <span>•</span>
                  <span className="capitalize text-zinc-300">{activeModalEntry.reflectionMode.replace('_', ' ')}</span>
                  {activeModalEntry.mood && <span className="text-lime-400">• Mood: {activeModalEntry.mood}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportMarkdown(activeModalEntry)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white"
                  title="Download as Markdown file"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export MD</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalEntry(null)}
                  className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Dialogue Transcript & Life360 Card */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeModalEntry.journeySynthesis ? (
                <div className="mb-2">
                  <Life360JourneyCard
                    synthesis={activeModalEntry.journeySynthesis}
                    title={activeModalEntry.title}
                    activeMood={activeModalEntry.mood}
                    dateStr={new Date(activeModalEntry.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  />
                </div>
              ) : activeModalEntry.aiSummary ? (
                <div className="rounded-2xl border border-lime-500/20 bg-lime-950/20 p-4 text-xs text-zinc-200">
                  <div className="flex items-center gap-1.5 font-bold text-lime-400 mb-2">
                    <Sparkles className="h-4 w-4 text-lime-400" />
                    <span>Life360 • Journey So Far</span>
                  </div>
                  <div className="prose prose-invert prose-xs max-w-none">
                    <Markdown>{activeModalEntry.aiSummary}</Markdown>
                  </div>
                </div>
              ) : null}

              <div className="space-y-4">
                {activeModalEntry.messages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[11px] font-semibold text-zinc-400 mb-1 px-1">
                        {isUser ? 'You' : 'Gemini AI'}
                      </span>
                      <div
                        className={`rounded-2xl px-4 py-3 text-xs leading-relaxed max-w-[85%] ${
                          isUser
                            ? 'bg-zinc-100 text-zinc-950 rounded-tr-xs font-medium whitespace-pre-wrap'
                            : 'bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-tl-xs'
                        }`}
                      >
                        {isUser ? (
                          msg.content
                        ) : (
                          <div className="prose prose-invert prose-xs max-w-none">
                            <Markdown>{msg.content}</Markdown>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-zinc-800 px-6 py-4 bg-zinc-950/60">
              <button
                type="button"
                onClick={() => handleDelete(activeModalEntry.id)}
                className="text-xs font-semibold text-red-400 hover:text-red-300"
              >
                Delete Entry
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectInteraction(activeModalEntry);
                  setActiveModalEntry(null);
                }}
                className="rounded-full bg-lime-400 px-5 py-2 text-xs font-bold text-zinc-950 hover:bg-lime-300 hover:scale-105 transition"
              >
                Continue in Studio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

