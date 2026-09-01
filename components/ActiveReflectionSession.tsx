'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import type {
  JournalInteraction,
  ChatMessage,
  ReflectionMode,
  PacingPreference,
  Life360JourneySynthesis,
  JournalArchetype,
  InteractionEngineMode,
  BulletItem,
  MultimediaEntry,
  SpecializedTrackingData,
} from '@/lib/types';
import { saveJournalInteraction } from '@/lib/firestore-service';
import { Life360JourneyCard } from './Life360JourneyCard';
import { InsightsStickyShelf } from './InsightsStickyShelf';
import { LeafJournalSelector } from './LeafJournalSelector';
import { BulletJournalSection } from './BulletJournalSection';
import { MultimediaSection } from './MultimediaSection';
import { SpecializedTrackingSection } from './SpecializedTrackingSection';
import { VoiceDictationButton } from './VoiceDictationButton';
import Markdown from 'react-markdown';
import {
  Send,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Smile,
  FileText,
  Lightbulb,
  Compass,
  RotateCcw,
  Loader2,
  Copy,
  Check,
  Zap,
  Flame,
  Brain,
  Sliders,
  X,
  Eye,
  StickyNote,
  Leaf,
  Calendar,
  Layers,
  Camera,
  Utensils,
  Dumbbell,
  Baby,
  Clock,
  Pin,
  Bot,
  PenTool,
  Bookmark,
  ChevronDown,
  ChevronRight,
  Plus,
  MapPin,
  CloudSun,
  Image as ImageIcon,
  Layout,
  Mic,
} from 'lucide-react';

interface ActiveReflectionSessionProps {
  initialInteraction?: JournalInteraction | null;
  onSaved?: (savedInteraction: JournalInteraction) => void;
  onStartNew?: () => void;
  onToggleStickyNotes?: () => void;
  isStickyNotesOpen?: boolean;
  stickyNotesCount?: number;
}

const MODES: Array<{
  id: ReflectionMode;
  label: string;
  shortTag: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  glowColor: string;
}> = [
  {
    id: 'deep_reflection',
    label: 'Deep Reflection',
    shortTag: 'Mirror',
    desc: 'Empathetic, grounded mirror cutting directly to core emotional truth',
    icon: Compass,
    accentColor: 'text-lime-400',
    glowColor: 'hover:border-lime-400/50',
  },
  {
    id: 'inquiry',
    label: 'Socratic Inquiry',
    shortTag: 'Socratic',
    desc: 'Probing 1-2 sharp questions to expose subconscious assumptions',
    icon: Sparkles,
    accentColor: 'text-teal-400',
    glowColor: 'hover:border-teal-400/50',
  },
  {
    id: 'brainstorm',
    label: 'Action & Brainstorm',
    shortTag: 'Action',
    desc: 'Practical, high-leverage frameworks and actionable execution pathways',
    icon: Lightbulb,
    accentColor: 'text-amber-400',
    glowColor: 'hover:border-amber-400/50',
  },
  {
    id: 'perspective_shift',
    label: 'Perspective Reframe',
    shortTag: 'Reframe',
    desc: 'Constructive counter-perspectives & philosophical reframing',
    icon: Flame,
    accentColor: 'text-violet-400',
    glowColor: 'hover:border-violet-400/50',
  },
  {
    id: 'summary',
    label: 'Synthesis & Themes',
    shortTag: 'Synthesis',
    desc: 'Extract key tensions, emotional patterns, and structured takeaways',
    icon: FileText,
    accentColor: 'text-emerald-400',
    glowColor: 'hover:border-emerald-400/50',
  },
];

const PACING_MODES: Array<{
  id: PacingPreference;
  label: string;
  badge: string;
  desc: string;
}> = [
  {
    id: 'auto',
    label: 'Adaptive Pacing',
    badge: 'Auto',
    desc: 'Starts crisp (<=100w / 3 lines) on turn 1, expanding as engagement deepens',
  },
  {
    id: 'crisp',
    label: 'Ultra-Crisp',
    badge: '⚡ <=100w',
    desc: 'Strictly 2-3 lines, laser-focused with zero filler intros',
  },
  {
    id: 'balanced',
    label: 'Balanced',
    badge: '⚖️ ~150w',
    desc: 'Concise reflection with 1 analytical insight and 1 follow-up angle',
  },
  {
    id: 'deep',
    label: 'Deep Dive',
    badge: '🌊 ~220w',
    desc: 'Full-depth multidimensional exploration & structured takeaways',
  },
];

const MOODS = [
  { label: 'Grateful', emoji: '✨' },
  { label: 'Deep Focus', emoji: '🧠' },
  { label: 'Seeking Clarity', emoji: '💭' },
  { label: 'Energized', emoji: '⚡' },
  { label: 'Overwhelmed', emoji: '🌊' },
  { label: 'Grounded', emoji: '🌿' },
  { label: 'Torn / Conflicted', emoji: '⚖️' },
  { label: 'Restless', emoji: '🌪️' },
];

export function ActiveReflectionSession({
  initialInteraction,
  onSaved,
  onStartNew,
  onToggleStickyNotes,
  isStickyNotesOpen = false,
  stickyNotesCount = 0,
}: ActiveReflectionSessionProps) {
  const { user } = useAuth();

  // Core Session State
  const [sessionId, setSessionId] = useState<string>(
    () => initialInteraction?.id || `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  );
  const [title, setTitle] = useState<string>(
    () => initialInteraction?.title || 'Daily Reflection'
  );
  const [engineMode, setEngineMode] = useState<InteractionEngineMode>(
    () => initialInteraction?.engineMode || 'non_ai'
  );
  const [archetype, setArchetype] = useState<JournalArchetype>(
    () => initialInteraction?.archetype || 'classic_reflection'
  );
  const [customTypeName, setCustomTypeName] = useState<string | undefined>(
    () => initialInteraction?.customTypeName
  );
  const [customTypeIcon, setCustomTypeIcon] = useState<string | undefined>(
    () => initialInteraction?.customTypeIcon
  );
  const [entryDate, setEntryDate] = useState<string>(
    () => initialInteraction?.entryDate || new Date().toISOString().split('T')[0]
  );
  const [freeformContent, setFreeformContent] = useState<string>(
    () => initialInteraction?.freeformContent || (initialInteraction?.messages?.[0]?.content) || ''
  );
  const [bullets, setBullets] = useState<BulletItem[]>(
    () => initialInteraction?.bullets || []
  );
  const [multimedia, setMultimedia] = useState<MultimediaEntry>(
    () => initialInteraction?.multimedia || {}
  );
  const [specializedData, setSpecializedData] = useState<SpecializedTrackingData>(
    () => initialInteraction?.specializedData || {}
  );

  // AI Dialog State (for AI Companion mode)
  const [mode, setMode] = useState<ReflectionMode>(
    () => initialInteraction?.reflectionMode || 'deep_reflection'
  );
  const [mood, setMood] = useState<string>(() => initialInteraction?.mood || '');
  const [pacingPreference, setPacingPreference] = useState<PacingPreference>(
    () => initialInteraction?.pacingPreference || 'auto'
  );
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => initialInteraction?.messages || []
  );
  const [aiSummary, setAiSummary] = useState<string>(
    () => initialInteraction?.aiSummary || ''
  );
  const [journeySynthesis, setJourneySynthesis] = useState<Life360JourneySynthesis | null>(
    () => initialInteraction?.journeySynthesis || null
  );
  const [createdAt, setCreatedAt] = useState<number>(
    () => initialInteraction?.createdAt || Date.now()
  );

  // UI state
  const [currentInput, setCurrentInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showJourneyModal, setShowJourneyModal] = useState(false);
  const [showInlineJourney, setShowInlineJourney] = useState(false);
  const [isInsightsShelfOpen, setIsInsightsShelfOpen] = useState(false);
  const [showLeafSelectorModal, setShowLeafSelectorModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [writingViewMode, setWritingViewMode] = useState<'text_only' | 'split' | 'tracker_only'>('split');
  const [lastModelUsed, setLastModelUsed] = useState<string>('gemini-3.6-flash');
  const [lastPacingStage, setLastPacingStage] = useState<'crisp' | 'balanced' | 'deep'>('crisp');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showPacingMenu, setShowPacingMenu] = useState(false);
  const [highlightNoteMessage, setHighlightNoteMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const freeformTextareaRef = useRef<HTMLTextAreaElement>(null);
  const pacingMenuRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of dialogue when in AI mode
  useEffect(() => {
    if (engineMode === 'ai_companion') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating, engineMode]);

  // Count Insights & Actions for the badge
  const insightNotesCount =
    (journeySynthesis?.insights?.length || 0) + (journeySynthesis?.thoughts?.length || 0);
  const actionNotesCount = journeySynthesis?.actionSteps?.length || 0;
  const totalStickyNotesRight = insightNotesCount + actionNotesCount;

  const [isDetectingEntryGps, setIsDetectingEntryGps] = useState(false);

  const handleDetectEntryLocation = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      setIsDetectingEntryGps(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsDetectingEntryGps(false);
          const currentLoc = multimedia.location || {};
          const updatedLoc = {
            ...currentLoc,
            latitude: Number(pos.coords.latitude.toFixed(4)),
            longitude: Number(pos.coords.longitude.toFixed(4)),
            placeName: currentLoc.placeName || 'Current Geo Location',
            weather: currentLoc.weather || 'Sunny, 22°C',
          };
          const updatedMm = { ...multimedia, location: updatedLoc };
          setMultimedia(updatedMm);
          persistSession(
            messages,
            title,
            mode,
            mood,
            pacingPreference,
            aiSummary,
            journeySynthesis,
            freeformContent,
            bullets,
            updatedMm
          );
        },
        () => {
          setIsDetectingEntryGps(false);
          const currentLoc = multimedia.location || {};
          const updatedLoc = {
            ...currentLoc,
            latitude: 37.7749,
            longitude: -122.4194,
            placeName: currentLoc.placeName || 'San Francisco, CA',
            weather: currentLoc.weather || 'Mild, 19°C',
          };
          const updatedMm = { ...multimedia, location: updatedLoc };
          setMultimedia(updatedMm);
          persistSession(
            messages,
            title,
            mode,
            mood,
            pacingPreference,
            aiSummary,
            journeySynthesis,
            freeformContent,
            bullets,
            updatedMm
          );
        },
        { timeout: 5000 }
      );
    } else {
      const currentLoc = multimedia.location || {};
      const updatedLoc = {
        ...currentLoc,
        latitude: 40.7128,
        longitude: -74.006,
        placeName: currentLoc.placeName || 'New York, NY',
        weather: currentLoc.weather || 'Partly Cloudy, 20°C',
      };
      const updatedMm = { ...multimedia, location: updatedLoc };
      setMultimedia(updatedMm);
      persistSession(
        messages,
        title,
        mode,
        mood,
        pacingPreference,
        aiSummary,
        journeySynthesis,
        freeformContent,
        bullets,
        updatedMm
      );
    }
  };

  /**
   * Persist current state to Firestore under user isolation
   */
  const persistSession = async (
    customMessages = messages,
    customTitle = title,
    customMode = mode,
    customMood = mood,
    customPacing = pacingPreference,
    customSummary = aiSummary,
    customJourney = journeySynthesis,
    customFreeform = freeformContent,
    customBullets = bullets,
    customMultimedia = multimedia,
    customSpecialized = specializedData,
    customArchetype = archetype,
    customEngineMode = engineMode,
    customDate = entryDate
  ) => {
    if (!user) return;

    try {
      setSaveStatus('saving');
      setSaveErrorMessage(null);

      const entryToSave: JournalInteraction = {
        id: sessionId,
        userId: user.uid,
        title: customTitle.trim() || 'Reflection Entry',
        archetype: customArchetype,
        customTypeName: customArchetype === 'custom' ? customTypeName : undefined,
        customTypeIcon: customArchetype === 'custom' ? customTypeIcon : undefined,
        engineMode: customEngineMode,
        entryDate: customDate,
        freeformContent: customFreeform,
        bullets: customBullets,
        multimedia: customMultimedia,
        specializedData: customSpecialized,
        reflectionMode: customMode,
        initialPrompt: customFreeform || customMessages[0]?.content || '',
        messages: customMessages,
        aiSummary: customSummary,
        journeySynthesis: customJourney || undefined,
        mood: customMood,
        pacingPreference: customPacing,
        tags: [customMode, customArchetype, customEngineMode, ...(customMood ? [customMood] : [])],
        createdAt,
        updatedAt: Date.now(),
      };

      await saveJournalInteraction(user.uid, entryToSave);
      setSaveStatus('saved');
      if (onSaved) onSaved(entryToSave);
    } catch (err: any) {
      console.error('Firestore save failed:', err);
      setSaveStatus('error');
      setSaveErrorMessage(err.message || 'Could not save to Firestore');
    }
  };

  /**
   * Move text directly to sticky notes (Thought or Action)
   */
  const handleMoveTextToSticky = (text: string, type: 'thought' | 'action') => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const currentSynthesis: Life360JourneySynthesis = journeySynthesis || {
      headline: 'Reflection & Action In Progress',
      thoughts: [],
      insights: [],
      actionSteps: [],
      analytics: {
        clarityScore: 85,
        primaryEmotion: mood || 'Balanced',
        emotionalShift: 'Focused Momentum',
        growthVelocity: 'Steady',
        cognitiveFocus: title || 'Personal Growth',
        turnCount: Math.floor(messages.length / 2) + 1,
        wordCount: freeformContent.trim().split(/\s+/).length,
      },
      visualTheme: 'lime',
      generatedAt: Date.now(),
    };

    if (type === 'thought') {
      const updatedThoughts = [...(currentSynthesis.thoughts || []), trimmed];
      const updatedSynthesis = { ...currentSynthesis, thoughts: updatedThoughts };
      setJourneySynthesis(updatedSynthesis);
      persistSession(
        messages,
        title,
        mode,
        mood,
        pacingPreference,
        aiSummary,
        updatedSynthesis
      );
      setHighlightNoteMessage(`Pinned thought to sticky note: "${trimmed.substring(0, 30)}..."`);
    } else {
      const updatedActions = [...(currentSynthesis.actionSteps || []), trimmed];
      const updatedSynthesis = { ...currentSynthesis, actionSteps: updatedActions };
      setJourneySynthesis(updatedSynthesis);
      persistSession(
        messages,
        title,
        mode,
        mood,
        pacingPreference,
        aiSummary,
        updatedSynthesis
      );
      setHighlightNoteMessage(`Pinned action commitment to sticky note: "${trimmed.substring(0, 30)}..."`);
    }

    setTimeout(() => {
      setHighlightNoteMessage(null);
    }, 4000);
  };

  /**
   * Move highlighted selection in freeform editor to sticky note
   */
  const handleMoveSelectedText = (type: 'thought' | 'action') => {
    let textToMove = '';
    if (freeformTextareaRef.current) {
      const start = freeformTextareaRef.current.selectionStart;
      const end = freeformTextareaRef.current.selectionEnd;
      if (start !== end) {
        textToMove = freeformContent.substring(start, end);
      }
    }
    if (!textToMove.trim()) {
      textToMove = freeformContent.trim().split('\n').pop() || freeformContent.trim();
    }
    if (textToMove) {
      handleMoveTextToSticky(textToMove, type);
    }
  };

  /**
   * Handle user submitting a reflection turn to Gemini (in AI Companion mode)
   */
  const handleSendPrompt = async (forcedPrompt?: string, forcedMode?: ReflectionMode) => {
    const promptToSend = (forcedPrompt || currentInput).trim();
    if (!promptToSend || isGenerating) return;

    setShowPacingMenu(false);
    const activeMode = forcedMode || mode;
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: promptToSend,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setCurrentInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    if (messages.length === 0 && (title === 'Daily Reflection' || !title)) {
      const snippet = promptToSend.split('\n')[0].substring(0, 45);
      const updatedTitle = snippet.length > 0 ? (snippet.length === 45 ? `${snippet}...` : snippet) : 'Daily Reflection';
      setTitle(updatedTitle);
    }

    setIsGenerating(true);

    try {
      const conversationHistory = updatedMessages.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          mode: activeMode,
          mood,
          pacingPreference,
          conversationHistory,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate reflection');
      }

      const data = await res.json();
      if (data.modelUsed) setLastModelUsed(data.modelUsed);
      if (data.pacingStage) setLastPacingStage(data.pacingStage);

      const aiMessage: ChatMessage = {
        id: `msg_${Date.now()}_a`,
        role: 'model',
        content: data.reflection,
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);

      await persistSession(
        finalMessages,
        title,
        activeMode,
        mood,
        pacingPreference,
        aiSummary,
        journeySynthesis
      );
    } catch (err: any) {
      console.error('Reflection request error:', err);
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        role: 'model',
        content: `*⚠️ Reflection paused:* ${err.message || 'Network or service disruption. You can retry safely.'}`,
        timestamp: Date.now(),
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Action to generate on-demand summary
   */
  const handleGenerateSummary = async () => {
    if (isSummarizing) return;
    try {
      setIsSummarizing(true);
      setSaveStatus('saving');

      const res = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
          freeformContent,
          bullets,
          multimedia,
          specializedData,
          archetype,
          engineMode,
          title,
          mood,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await res.json();
      if (data.journeySynthesis) {
        const headline = data.journeySynthesis.headline || 'Journal Synthesis';
        const insightsList = (data.journeySynthesis.insights || []).map((i: string) => `• ${i}`).join('\n');
        const actionsList = (data.journeySynthesis.actionSteps || []).map((a: string) => `✓ ${a}`).join('\n');
        const summaryText = `### ${headline}\n\n**Key Insights:**\n${insightsList}\n\n**Action Commitments:**\n${actionsList}`;
        setAiSummary(summaryText);
        await persistSession(
          messages,
          title,
          mode,
          mood,
          pacingPreference,
          summaryText,
          data.journeySynthesis
        );
      }
    } catch (err: any) {
      console.error('Summary error:', err);
      setSaveStatus('error');
      setSaveErrorMessage(err.message || 'Could not generate summary');
    } finally {
      setIsSummarizing(false);
    }
  };

  /**
   * Action to synthesize Life360 Journey from current session
   */
  const handleGenerateLife360Journey = async () => {
    if (isSynthesizing) return;
    try {
      setIsSynthesizing(true);
      setSaveStatus('saving');
      setSaveErrorMessage(null);

      const res = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          freeformContent,
          bullets,
          multimedia,
          specializedData,
          archetype,
          engineMode,
          title,
          mood,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to synthesize Journey');
      }

      const data = await res.json();
      if (data.journeySynthesis) {
        setJourneySynthesis(data.journeySynthesis);
        setShowJourneyModal(true);
        await persistSession(
          messages,
          title,
          mode,
          mood,
          pacingPreference,
          aiSummary,
          data.journeySynthesis
        );
      }
    } catch (err: any) {
      console.error('Life360 Journey synthesis error:', err);
      setSaveStatus('error');
      setSaveErrorMessage(err.message || 'Could not synthesize Journey');
    } finally {
      setIsSynthesizing(false);
    }
  };

  /**
   * Action to start a fresh reflection session
   */
  const handleStartFresh = () => {
    if (messages.length > 0 || freeformContent.trim() || bullets.length > 0) {
      persistSession();
    }
    setSessionId(`entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
    setTitle('Daily Reflection');
    setEngineMode('non_ai');
    setArchetype('classic_reflection');
    setEntryDate(new Date().toISOString().split('T')[0]);
    setFreeformContent('');
    setBullets([]);
    setMultimedia({});
    setSpecializedData({});
    setMode('deep_reflection');
    setMood('');
    setPacingPreference('auto');
    setMessages([]);
    setAiSummary('');
    setJourneySynthesis(null);
    setShowJourneyModal(false);
    setShowInlineJourney(false);
    setCreatedAt(Date.now());
    setCurrentInput('');
    setSaveStatus('idle');
    setSaveErrorMessage(null);
    if (onStartNew) onStartNew();
  };

  // Word count helper for non-AI mode
  const wordCount = freeformContent.trim() ? freeformContent.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      {/* Sticky Notes Notification Toast */}
      {highlightNoteMessage && (
        <div className="fixed top-18 right-4 z-50 rounded-2xl bg-amber-400 text-zinc-950 px-4 py-2.5 font-extrabold text-xs shadow-2xl flex items-center gap-2 border border-amber-300 animate-bounce">
          <Sparkles className="h-4 w-4 shrink-0" />
          <span>{highlightNoteMessage}</span>
        </div>
      )}

      {/* Top Banner: Engine Mode Selector + Archetype Leaf + Date Picker + Sticky Note Triggers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-900/80 p-3 sm:p-4 rounded-2xl border border-zinc-800 backdrop-blur-md shadow-md">
        {/* Left: Engine Mode Toggle (AI vs Non-AI Default) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Left Sticky Shelf Toggle */}
          {onToggleStickyNotes && (
            <button
              type="button"
              onClick={onToggleStickyNotes}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition border ${
                isStickyNotesOpen
                  ? 'bg-amber-400 text-zinc-950 border-amber-300 shadow-md'
                  : 'bg-zinc-950 text-amber-300 border-amber-500/30 hover:bg-zinc-800'
              }`}
              title="Toggle previous reflections shelf"
            >
              <StickyNote className="h-3.5 w-3.5" />
              <span>Past Notes ({stickyNotesCount})</span>
            </button>
          )}

          {/* PROMINENT AI MODE ON / OFF TOGGLE SWITCH */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-2xl border-2 border-zinc-800 shadow-md">
            <button
              type="button"
              onClick={() => {
                setEngineMode('non_ai');
                persistSession(
                  messages,
                  title,
                  mode,
                  mood,
                  pacingPreference,
                  aiSummary,
                  journeySynthesis,
                  freeformContent,
                  bullets,
                  multimedia,
                  specializedData,
                  archetype,
                  'non_ai'
                );
              }}
              className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-black transition ${
                engineMode === 'non_ai'
                  ? 'bg-emerald-400 text-zinc-950 shadow-md ring-2 ring-emerald-300'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Switch to Pure Focused Writing (AI Off)"
            >
              <PenTool className="h-3.5 w-3.5" />
              <span>AI Mode: OFF (Text Desk)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEngineMode('ai_companion');
                persistSession(
                  messages,
                  title,
                  mode,
                  mood,
                  pacingPreference,
                  aiSummary,
                  journeySynthesis,
                  freeformContent,
                  bullets,
                  multimedia,
                  specializedData,
                  archetype,
                  'ai_companion'
                );
              }}
              className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-black transition ${
                engineMode === 'ai_companion'
                  ? 'bg-lime-400 text-zinc-950 shadow-md ring-2 ring-lime-300'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Switch to Interactive AI Companion Guidance"
            >
              <Bot className="h-3.5 w-3.5" />
              <span className="flex items-center gap-1">
                <span>AI Mode: ON</span>
                <span className="flex h-2 w-2 rounded-full bg-zinc-950" />
              </span>
            </button>
          </div>
        </div>

        {/* Right: Leaf Archetype Trigger & Insights Shelf & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Leaf Archetype Selector Button */}
          <button
            type="button"
            onClick={() => setShowLeafSelectorModal(!showLeafSelectorModal)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-xs font-extrabold text-emerald-300 hover:bg-emerald-500/25 transition shadow-sm"
          >
            <Leaf className="h-3.5 w-3.5" />
            <span className="capitalize">{archetype.replace('_', ' ')}</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          {/* Date Picker */}
          <div className="flex items-center gap-1 bg-zinc-950 px-2.5 py-1 rounded-xl border border-zinc-800">
            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-zinc-200 outline-none cursor-pointer"
            />
          </div>

          {/* Right Insights Sticky Shelf Toggle */}
          <button
            type="button"
            onClick={() => setIsInsightsShelfOpen(!isInsightsShelfOpen)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition border ${
              isInsightsShelfOpen
                ? 'bg-lime-400 text-zinc-950 border-lime-300 shadow-md'
                : 'bg-zinc-950 text-lime-300 border-lime-500/30 hover:bg-zinc-800'
            }`}
            title="Toggle Key Insights & Action Commitments Sticky Notes on the right"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Insights & Actions ({totalStickyNotesRight})</span>
          </button>

          {/* Manual Save Button */}
          <button
            type="button"
            onClick={() => persistSession()}
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-1 rounded-xl bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-200 hover:bg-zinc-700 transition"
          >
            {saveStatus === 'saving' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-lime-400" />
            ) : (
              <Save className="h-3.5 w-3.5 text-zinc-400" />
            )}
            <span>{saveStatus === 'saved' ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Modal/Accordion: Botanical Leaf Archetype Selector */}
      {showLeafSelectorModal && (
        <div className="animate-fadeIn">
          <LeafJournalSelector
            selectedArchetype={archetype}
            onSelectArchetype={(selected) => {
              setArchetype(selected);
              setShowLeafSelectorModal(false);
              persistSession(
                messages,
                title,
                mode,
                mood,
                pacingPreference,
                aiSummary,
                journeySynthesis,
                freeformContent,
                bullets,
                multimedia,
                specializedData,
                selected
              );
            }}
          />
        </div>
      )}

      {/* Main Title & Mood Selection Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/50 p-3 sm:p-4 rounded-2xl border border-zinc-800/80">
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => persistSession()}
            placeholder="Journal Title (e.g. Planning my week & deep focus)..."
            className="w-full bg-transparent text-base sm:text-lg font-black text-zinc-100 placeholder-zinc-500 outline-none border-b border-transparent focus:border-lime-500 pb-0.5"
          />
        </div>

        {/* Mood chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[10px] font-bold uppercase text-zinc-500 shrink-0">Mood:</span>
          {MOODS.map((m) => (
            <button
              key={m.label}
              type="button"
              onClick={() => {
                const newMood = mood === m.label ? '' : m.label;
                setMood(newMood);
                persistSession(
                  messages,
                  title,
                  mode,
                  newMood,
                  pacingPreference,
                  aiSummary,
                  journeySynthesis
                );
              }}
              className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold transition shrink-0 ${
                mood === m.label
                  ? 'bg-lime-400 text-zinc-950 shadow-sm'
                  : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: NON-AI MODE (DEFAULT WRITING & STRUCTURING INTERFACE)             */}
      {/* ========================================================================= */}
      {engineMode === 'non_ai' && (
        <div className="space-y-4">
          {/* Universal View Mode Switcher for All Archetypes */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-zinc-900/90 p-2.5 sm:p-3 rounded-2xl border border-zinc-800 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-zinc-300">Desk View:</span>
              <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setWritingViewMode('text_only')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-black transition ${
                    writingViewMode === 'text_only'
                      ? 'bg-emerald-400 text-zinc-950 shadow-md ring-1 ring-emerald-300'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Distraction-free pure text writing desk without forms or tables"
                >
                  <PenTool className="h-3.5 w-3.5" />
                  <span>📝 Text Only</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWritingViewMode('split')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-black transition ${
                    writingViewMode === 'split'
                      ? 'bg-lime-400 text-zinc-950 shadow-md ring-1 ring-lime-300'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Side-by-side: Text Notes on left, Tracker/Media on right"
                >
                  <Layout className="h-3.5 w-3.5" />
                  <span>⚡ Split View (Notes + Tracker)</span>
                </button>

                {(archetype === 'food_diary' ||
                  archetype === 'fitness_tracker' ||
                  archetype === 'pregnancy_milestones' ||
                  archetype === 'travel_log' ||
                  archetype === 'kids_journey' ||
                  archetype === 'multimedia_blog' ||
                  archetype === 'bullet_tasks') && (
                  <button
                    type="button"
                    onClick={() => setWritingViewMode('tracker_only')}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-black transition ${
                      writingViewMode === 'tracker_only'
                        ? 'bg-amber-400 text-zinc-950 shadow-md ring-1 ring-amber-300'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Specialized tracking forms only"
                  >
                    <Sliders className="h-3.5 w-3.5" />
                    <span>📊 Tracker Only</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <span>💡 You can write text freely alone or use tracker fields anytime.</span>
            </div>
          </div>

          {/* Render layout based on writingViewMode */}
          {writingViewMode === 'text_only' ? (
            /* TEXT-ONLY VIEW: Pure distraction-free writing desk */
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5 backdrop-blur-md shadow-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <PenTool className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-extrabold text-zinc-200">
                      Focused Writing Desk ({wordCount} words)
                    </span>
                    <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.2 text-[10px] font-bold text-emerald-300">
                      Text Only Mode
                    </span>
                  </div>

                  {/* Quick Actions: Voice Dictation & Pin to Shelf */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <VoiceDictationButton
                      onTranscript={(txt) => {
                        setFreeformContent((prev) => (prev ? `${prev}\n${txt}` : txt));
                      }}
                      onAudioRecorded={(audio) => {
                        const currentAudio = multimedia.audioNotes || [];
                        const updatedMm = {
                          ...multimedia,
                          audioNotes: [
                            ...currentAudio,
                            {
                              id: audio.id,
                              url: audio.url,
                              durationSeconds: audio.durationSeconds,
                              transcript: audio.transcript,
                              recordedAt: Date.now(),
                              label: `Voice Note #${currentAudio.length + 1}`,
                            },
                          ],
                        };
                        setMultimedia(updatedMm);
                        if (audio.transcript) {
                          setFreeformContent((prev) => (prev ? `${prev}\n${audio.transcript}` : audio.transcript || ''));
                        }
                      }}
                      variant="solid"
                      size="md"
                    />

                    <button
                      type="button"
                      onClick={() => handleMoveSelectedText('thought')}
                      className="inline-flex items-center gap-1 rounded-lg bg-amber-400/15 border border-amber-400/30 px-2.5 py-1 text-xs font-bold text-amber-300 hover:bg-amber-400/25 transition"
                      title="Highlight any text and click to pin as an Insight Sticky Note"
                    >
                      <Lightbulb className="h-3.5 w-3.5" />
                      <span>Pin Insight Note</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoveSelectedText('action')}
                      className="inline-flex items-center gap-1 rounded-lg bg-lime-400/15 border border-lime-400/30 px-2.5 py-1 text-xs font-bold text-lime-300 hover:bg-lime-400/25 transition"
                      title="Highlight any text and click to pin as an Action Commitment"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Pin Action</span>
                    </button>
                  </div>
                </div>

                {/* Direct GPS tag on the entry */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-950/80 p-2 rounded-xl border border-zinc-800/80 text-xs">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <input
                      type="text"
                      value={multimedia.location?.placeName || ''}
                      onChange={(e) => {
                        const updatedLoc = { ...(multimedia.location || {}), placeName: e.target.value };
                        const updatedMm = { ...multimedia, location: updatedLoc };
                        setMultimedia(updatedMm);
                        persistSession(
                          messages,
                          title,
                          mode,
                          mood,
                          pacingPreference,
                          aiSummary,
                          journeySynthesis,
                          freeformContent,
                          bullets,
                          updatedMm
                        );
                      }}
                      placeholder="Tag location on this entry (e.g. San Francisco, CA / London, UK)..."
                      className="bg-transparent text-xs text-zinc-200 placeholder-zinc-500 outline-none w-full"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleDetectEntryLocation}
                      disabled={isDetectingEntryGps}
                      className="flex items-center gap-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/25 transition disabled:opacity-50"
                      title="Auto-detect current GPS location for this entry"
                    >
                      <Compass className="h-3.5 w-3.5" />
                      <span>{isDetectingEntryGps ? 'Detecting...' : 'Auto GPS'}</span>
                    </button>
                    {multimedia.location?.placeName && (
                      <button
                        type="button"
                        onClick={() => {
                          const updatedMm = { ...multimedia, location: undefined };
                          setMultimedia(updatedMm);
                          persistSession(
                            messages,
                            title,
                            mode,
                            mood,
                            pacingPreference,
                            aiSummary,
                            journeySynthesis,
                            freeformContent,
                            bullets,
                            updatedMm
                          );
                        }}
                        className="text-xs text-zinc-500 hover:text-rose-400 px-1"
                        title="Remove location tag"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                </div>

                {/* Writing Textarea */}
                <textarea
                  ref={freeformTextareaRef}
                  value={freeformContent}
                  onChange={(e) => setFreeformContent(e.target.value)}
                  onBlur={() => persistSession()}
                  placeholder="Start writing your thoughts, daily notes, weekly plans, or reflections freely... (No structured forms required, write or speak via Voice Note anytime!)"
                  rows={10}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm leading-relaxed text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />

                {/* Text-Only Submit / Save Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-zinc-800/80">
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                    <span>💡 Tip: Write text alone or click Voice Note to speak. Auto-saved safely.</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => persistSession()}
                      disabled={saveStatus === 'saving'}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-zinc-950 hover:bg-emerald-400 transition shadow-md disabled:opacity-50"
                    >
                      {saveStatus === 'saving' ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : saveStatus === 'saved' ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                      <span>{saveStatus === 'saved' ? 'Entry Saved ✓' : saveStatus === 'saving' ? 'Saving...' : 'Submit & Save Entry'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : writingViewMode === 'split' ? (
            /* SPLIT VIEW: Side-by-Side (Writing Desk on Left + Tracker on Right) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Left Column: Focused Writing Desk */}
              <div className="lg:col-span-7 space-y-3.5">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 backdrop-blur-md shadow-lg space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <PenTool className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-extrabold text-zinc-200">
                        Writing Space ({wordCount} words)
                      </span>
                    </div>

                    {/* Quick Actions: Voice Dictation & Pin */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <VoiceDictationButton
                        onTranscript={(txt) => {
                          setFreeformContent((prev) => (prev ? `${prev}\n${txt}` : txt));
                        }}
                        onAudioRecorded={(audio) => {
                          const currentAudio = multimedia.audioNotes || [];
                          const updatedMm = {
                            ...multimedia,
                            audioNotes: [
                              ...currentAudio,
                              {
                                id: audio.id,
                                url: audio.url,
                                durationSeconds: audio.durationSeconds,
                                transcript: audio.transcript,
                                recordedAt: Date.now(),
                                label: `Voice Note #${currentAudio.length + 1}`,
                              },
                            ],
                          };
                          setMultimedia(updatedMm);
                          if (audio.transcript) {
                            setFreeformContent((prev) => (prev ? `${prev}\n${audio.transcript}` : audio.transcript || ''));
                          }
                        }}
                        variant="subtle"
                        size="sm"
                      />

                      <button
                        type="button"
                        onClick={() => handleMoveSelectedText('thought')}
                        className="inline-flex items-center gap-1 rounded-lg bg-amber-400/15 border border-amber-400/30 px-2.5 py-1 text-xs font-bold text-amber-300 hover:bg-amber-400/25 transition"
                        title="Highlight text to pin as an Insight Sticky Note"
                      >
                        <Lightbulb className="h-3 w-3" />
                        <span>Pin Insight</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveSelectedText('action')}
                        className="inline-flex items-center gap-1 rounded-lg bg-lime-400/15 border border-lime-400/30 px-2.5 py-1 text-xs font-bold text-lime-300 hover:bg-lime-400/25 transition"
                        title="Highlight text to pin as an Action Commitment"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Pin Action</span>
                      </button>
                    </div>
                  </div>

                  {/* Direct GPS tag on the entry */}
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-950/80 p-2 rounded-xl border border-zinc-800/80 text-xs">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <input
                        type="text"
                        value={multimedia.location?.placeName || ''}
                        onChange={(e) => {
                          const updatedLoc = { ...(multimedia.location || {}), placeName: e.target.value };
                          const updatedMm = { ...multimedia, location: updatedLoc };
                          setMultimedia(updatedMm);
                          persistSession(
                            messages,
                            title,
                            mode,
                            mood,
                            pacingPreference,
                            aiSummary,
                            journeySynthesis,
                            freeformContent,
                            bullets,
                            updatedMm
                          );
                        }}
                        placeholder="Tag GPS / Location on this reflection..."
                        className="bg-transparent text-xs text-zinc-200 placeholder-zinc-500 outline-none w-full"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleDetectEntryLocation}
                        disabled={isDetectingEntryGps}
                        className="flex items-center gap-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/25 transition disabled:opacity-50"
                        title="Auto-detect current GPS location for this entry"
                      >
                        <Compass className="h-3 w-3" />
                        <span>{isDetectingEntryGps ? 'Detecting...' : 'Auto GPS'}</span>
                      </button>
                      {multimedia.location?.placeName && (
                        <button
                          type="button"
                          onClick={() => {
                            const updatedMm = { ...multimedia, location: undefined };
                            setMultimedia(updatedMm);
                            persistSession(
                              messages,
                              title,
                              mode,
                              mood,
                              pacingPreference,
                              aiSummary,
                              journeySynthesis,
                              freeformContent,
                              bullets,
                              updatedMm
                            );
                          }}
                          className="text-xs text-zinc-500 hover:text-rose-400 px-1"
                          title="Remove location tag"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Compact Textarea */}
                  <textarea
                    ref={freeformTextareaRef}
                    value={freeformContent}
                    onChange={(e) => setFreeformContent(e.target.value)}
                    onBlur={() => persistSession()}
                    placeholder="Write your journal entry, notes, or thoughts freely... (You can write text alone or fill in the tracker on the right anytime!)"
                    rows={8}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 text-sm leading-relaxed text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />

                  {/* Submit / Save Bar in Split Left Column */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500">Write text alone or use tracker</span>
                    <button
                      type="button"
                      onClick={() => persistSession()}
                      disabled={saveStatus === 'saving'}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-extrabold text-zinc-950 hover:bg-emerald-400 transition shadow-sm disabled:opacity-50"
                    >
                      {saveStatus === 'saving' ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : saveStatus === 'saved' ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <Save className="h-3 w-3" />
                      )}
                      <span>{saveStatus === 'saved' ? 'Saved ✓' : 'Save Notes'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Specialized Tracker / Multimedia Section */}
              <div className="lg:col-span-5 space-y-3.5">
                {archetype === 'multimedia_blog' ? (
                  <MultimediaSection
                    multimedia={multimedia}
                    onChangeMultimedia={(updated) => {
                      setMultimedia(updated);
                      persistSession(
                        messages,
                        title,
                        mode,
                        mood,
                        pacingPreference,
                        aiSummary,
                        journeySynthesis,
                        freeformContent,
                        bullets,
                        updated
                      );
                    }}
                    entryLocation={multimedia.location}
                  />
                ) : archetype === 'bullet_tasks' ? (
                  <BulletJournalSection
                    bullets={bullets}
                    onChangeBullets={(updated) => {
                      setBullets(updated);
                      persistSession(
                        messages,
                        title,
                        mode,
                        mood,
                        pacingPreference,
                        aiSummary,
                        journeySynthesis,
                        freeformContent,
                        updated
                      );
                    }}
                    onMoveToStickyNote={handleMoveTextToSticky}
                  />
                ) : (
                  <SpecializedTrackingSection
                    archetype={archetype}
                    specializedData={specializedData}
                    onChangeSpecializedData={(updated) => {
                      setSpecializedData(updated);
                      persistSession(
                        messages,
                        title,
                        mode,
                        mood,
                        pacingPreference,
                        aiSummary,
                        journeySynthesis,
                        freeformContent,
                        bullets,
                        multimedia,
                        updated
                      );
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            /* TRACKER ONLY VIEW: Full width specialized form */
            <div className="space-y-4">
              {archetype === 'multimedia_blog' ? (
                <MultimediaSection
                  multimedia={multimedia}
                  onChangeMultimedia={(updated) => {
                    setMultimedia(updated);
                    persistSession(
                      messages,
                      title,
                      mode,
                      mood,
                      pacingPreference,
                      aiSummary,
                      journeySynthesis,
                      freeformContent,
                      bullets,
                      updated
                    );
                  }}
                  entryLocation={multimedia.location}
                />
              ) : archetype === 'bullet_tasks' ? (
                <BulletJournalSection
                  bullets={bullets}
                  onChangeBullets={(updated) => {
                    setBullets(updated);
                    persistSession(
                      messages,
                      title,
                      mode,
                      mood,
                      pacingPreference,
                      aiSummary,
                      journeySynthesis,
                      freeformContent,
                      updated
                    );
                  }}
                  onMoveToStickyNote={handleMoveTextToSticky}
                />
              ) : (
                <SpecializedTrackingSection
                  archetype={archetype}
                  specializedData={specializedData}
                  onChangeSpecializedData={(updated) => {
                    setSpecializedData(updated);
                    persistSession(
                      messages,
                      title,
                      mode,
                      mood,
                      pacingPreference,
                      aiSummary,
                      journeySynthesis,
                      freeformContent,
                      bullets,
                      multimedia,
                      updated
                    );
                  }}
                />
              )}

              {/* Submit / Save Bar for Tracker Only View */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <div className="text-[11px] text-zinc-400">
                  <span>💡 All structured entries and voice recordings are synchronized to your secure journal.</span>
                </div>
                <button
                  type="button"
                  onClick={() => persistSession()}
                  disabled={saveStatus === 'saving'}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-zinc-950 hover:bg-emerald-400 transition shadow-md disabled:opacity-50"
                >
                  {saveStatus === 'saving' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : saveStatus === 'saved' ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  <span>{saveStatus === 'saved' ? 'Entry Saved ✓' : saveStatus === 'saving' ? 'Saving...' : 'Submit & Save Entry'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Action Row: Summary & Life360 Journey Synthesizer in Non-AI Mode */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-lime-400" />
              <span className="text-xs text-zinc-300">
                Ready to review today&apos;s takeaways and trajectory?
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={isSummarizing || (!freeformContent.trim() && bullets.length === 0)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-200 hover:bg-zinc-700 transition disabled:opacity-50"
              >
                {isSummarizing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                ) : (
                  <FileText className="h-3.5 w-3.5 text-emerald-400" />
                )}
                <span>Generate Summary</span>
              </button>

              <button
                type="button"
                onClick={handleGenerateLife360Journey}
                disabled={isSynthesizing || (!freeformContent.trim() && bullets.length === 0)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-lime-400 px-4 py-2 text-xs font-extrabold text-zinc-950 hover:bg-lime-300 transition shadow-lg disabled:opacity-50"
              >
                {isSynthesizing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-950" />
                ) : (
                  <Compass className="h-3.5 w-3.5 text-zinc-950" />
                )}
                <span>Synthesize Life360 Journey</span>
              </button>
            </div>
          </div>

          {/* Display Inline Summary if generated */}
          {aiSummary && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 sm:p-5 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-emerald-400" />
                <h4 className="text-xs font-extrabold uppercase text-emerald-300">
                  Synthesized Journal Summary
                </h4>
              </div>
              <div className="text-xs leading-relaxed text-zinc-200 prose prose-invert max-w-none">
                <Markdown>{aiSummary}</Markdown>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: AI COMPANION MODE (CONVERSATIONAL DIALOGUE WITH PROBING QUESTIONS)*/}
      {/* ========================================================================= */}
      {engineMode === 'ai_companion' && (
        <div className="space-y-4">
          {/* Mode Selector & Adaptive Pacing Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase text-zinc-500">Lens:</span>
              {MODES.map((m) => {
                const Icon = m.icon;
                const isSelected = mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setMode(m.id);
                      persistSession(
                        messages,
                        title,
                        m.id,
                        mood,
                        pacingPreference,
                        aiSummary,
                        journeySynthesis
                      );
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition border ${
                      isSelected
                        ? 'bg-zinc-800 text-zinc-100 border-zinc-600 shadow-sm'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className={`h-3 w-3 ${m.accentColor}`} />
                    <span>{m.shortTag}</span>
                  </button>
                );
              })}
            </div>

            {/* Pacing Menu */}
            <div className="relative" ref={pacingMenuRef}>
              <button
                type="button"
                onClick={() => setShowPacingMenu(!showPacingMenu)}
                className="flex items-center gap-1 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800 text-xs text-zinc-300 font-bold hover:bg-zinc-800"
              >
                <Sliders className="h-3 w-3 text-lime-400" />
                <span>Pacing: {pacingPreference}</span>
              </button>
              {showPacingMenu && (
                <div className="absolute right-0 top-8 z-30 w-56 rounded-xl border border-zinc-700 bg-zinc-900 p-2 shadow-xl space-y-1">
                  {PACING_MODES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setPacingPreference(p.id);
                        setShowPacingMenu(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs font-bold ${
                        pacingPreference === p.id ? 'bg-lime-400 text-zinc-950' : 'text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span>{p.label}</span>
                        <span>{p.badge}</span>
                      </div>
                      <p className="text-[10px] opacity-80 font-normal mt-0.5">{p.desc}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Multi-turn Dialogue Stream */}
          <div className="space-y-3 min-h-[280px]">
            {messages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400/10 border border-lime-400/20 text-lime-400 mx-auto">
                  <Compass className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-zinc-200">
                  What&apos;s on your mind today?
                </h4>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Type your reflections, thoughts, or questions below. Your AI companion will provide empathetic perspectives and actionable clarity.
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id || idx}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                          : 'bg-zinc-900/90 text-zinc-200 border border-zinc-800/80 shadow-md'
                      }`}
                    >
                      <Markdown>{msg.content}</Markdown>
                    </div>

                    {!isUser && (
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 pl-2">
                        <button
                          type="button"
                          onClick={() => handleMoveTextToSticky(msg.content, 'thought')}
                          className="hover:text-amber-400 flex items-center gap-1 font-bold"
                        >
                          <Lightbulb className="h-3 w-3" />
                          <span>Pin Insight Note</span>
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => handleMoveTextToSticky(msg.content, 'action')}
                          className="hover:text-lime-400 flex items-center gap-1 font-bold"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>Pin Action Commitment</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {isGenerating && (
              <div className="flex items-center gap-2 text-xs text-lime-400 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 w-fit">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Reflecting and formulating thoughtful insight...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* AI Companion Input Box */}
          <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/80 p-2.5 focus-within:border-lime-500 space-y-2">
            <textarea
              ref={textareaRef}
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendPrompt();
                }
              }}
              placeholder="Speak or type your reflection, thought, or question here (Press Enter to reflect)..."
              rows={3}
              className="w-full bg-transparent p-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none resize-none"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/60 px-1">
              <div className="flex items-center gap-2">
                <VoiceDictationButton
                  onTranscript={(txt) => {
                    setCurrentInput((prev) => (prev ? `${prev} ${txt}` : txt));
                  }}
                  onAudioRecorded={(audio) => {
                    if (audio.transcript) {
                      setCurrentInput((prev) => (prev ? `${prev} ${audio.transcript}` : audio.transcript || ''));
                    }
                  }}
                  variant="subtle"
                  size="sm"
                />
                <span className="text-[10px] text-zinc-500 hidden sm:inline">
                  Shift + Enter for new line • Voice note supported
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => persistSession()}
                  disabled={saveStatus === 'saving'}
                  className="inline-flex items-center gap-1 rounded-xl bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition"
                  title="Save conversation and reflection to cloud"
                >
                  <Save className="h-3 w-3 text-emerald-400" />
                  <span>{saveStatus === 'saved' ? 'Saved ✓' : 'Save'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendPrompt()}
                  disabled={!currentInput.trim() || isGenerating}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-lime-400 px-4 py-1.5 text-xs font-extrabold text-zinc-950 hover:bg-lime-300 disabled:opacity-40 transition shadow-sm"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send & Reflect</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Visual Life360 Journey Card */}
      {showJourneyModal && journeySynthesis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <Life360JourneyCard
              synthesis={journeySynthesis}
              title={title}
              activeMood={mood}
              onClose={() => setShowJourneyModal(false)}
              onRefresh={handleGenerateLife360Journey}
              isRefreshing={isSynthesizing}
            />
          </div>
        </div>
      )}

      {/* Slide-out Shelf: Insights & Action Sticky Notes on the Right */}
      <InsightsStickyShelf
        interaction={
          initialInteraction || {
            id: sessionId,
            userId: user?.uid || '',
            title,
            archetype,
            engineMode,
            entryDate,
            freeformContent,
            bullets,
            multimedia,
            specializedData,
            reflectionMode: mode,
            initialPrompt: freeformContent || messages[0]?.content || '',
            messages,
            aiSummary,
            journeySynthesis: journeySynthesis || undefined,
            mood,
            pacingPreference,
            tags: [mode, archetype],
            createdAt,
            updatedAt: createdAt,
          }
        }
        currentSynthesis={journeySynthesis}
        onSynthesize={handleGenerateLife360Journey}
        isSynthesizing={isSynthesizing}
        isOpen={isInsightsShelfOpen}
        onToggleOpen={() => setIsInsightsShelfOpen(!isInsightsShelfOpen)}
      />
    </div>
  );
}
