'use client';

import React, { useState, useEffect } from 'react';
import {
  Instagram,
  Facebook,
  Linkedin,
  FileText,
  Share2,
  Copy,
  Check,
  Sparkles,
  Download,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Edit3,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Heart,
  MessageCircle,
  Bookmark,
  Send,
  ThumbsUp,
  Globe,
  Sliders,
} from 'lucide-react';
import type {
  SocialPlatform,
  SocialTone,
  SocialPrivacyLevel,
  SocialPostResponse,
  SocialPostCarouselSlide,
  ChatMessage,
  BulletItem,
  JournalArchetype,
} from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

interface SocialSharePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  journalTitle?: string;
  freeformContent?: string;
  messages?: ChatMessage[];
  bullets?: BulletItem[];
  mood?: string;
  archetype?: JournalArchetype;
}

const PLATFORMS: Array<{
  id: SocialPlatform;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  activeBg: string;
}> = [
  {
    id: 'instagram',
    label: 'Instagram',
    desc: 'Hook, carousel slides, caption & hashtags',
    icon: Instagram,
    color: 'text-pink-400',
    activeBg: 'bg-gradient-to-r from-pink-500/20 via-rose-500/20 to-amber-500/20 border-pink-500/40 text-pink-300',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    desc: 'Relatable storytelling & community discussion',
    icon: Facebook,
    color: 'text-blue-400',
    activeBg: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
  },
  {
    id: 'blog',
    label: 'Blog / Article',
    desc: 'SEO Title, Medium/Substack markdown & headings',
    icon: FileText,
    color: 'text-teal-400',
    activeBg: 'bg-teal-500/20 border-teal-500/40 text-teal-300',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    desc: 'Leadership lessons & professional takeaways',
    icon: Linkedin,
    color: 'text-sky-400',
    activeBg: 'bg-sky-500/20 border-sky-500/40 text-sky-300',
  },
];

const TONES: Array<{ id: SocialTone; label: string; emoji: string }> = [
  { id: 'inspiring', label: 'Inspiring & Uplifting', emoji: '✨' },
  { id: 'vulnerable', label: 'Candid & Vulnerable', emoji: '🌿' },
  { id: 'growth', label: 'Action & Growth', emoji: '🚀' },
  { id: 'storytelling', label: 'Vivid Storytelling', emoji: '📖' },
  { id: 'philosophical', label: 'Philosophical & Deep', emoji: '🌌' },
];

export function SocialSharePostModal({
  isOpen,
  onClose,
  journalTitle,
  freeformContent,
  messages,
  bullets,
  mood,
  archetype,
}: SocialSharePostModalProps) {
  const { user } = useAuth();
  const [platform, setPlatform] = useState<SocialPlatform>('instagram');
  const [tone, setTone] = useState<SocialTone>('inspiring');
  const [privacyLevel, setPrivacyLevel] = useState<SocialPrivacyLevel>('anonymized');
  const [customInstructions, setCustomInstructions] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [postResponse, setPostResponse] = useState<SocialPostResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'preview' | 'edit' | 'carousel'>('preview');
  const [editableBody, setEditableBody] = useState('');
  const [carouselSlides, setCarouselSlides] = useState<SocialPostCarouselSlide[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const getFullShareText = (): string => {
    if (!postResponse) return '';
    if (platform === 'blog') {
      return postResponse.rawMarkdown || `# ${postResponse.headline}\n\n${editableBody}`;
    }

    let text = editableBody;
    if (postResponse.suggestedHashtags && postResponse.suggestedHashtags.length > 0) {
      text += `\n\n${postResponse.suggestedHashtags.join(' ')}`;
    }
    return text;
  };

  const handleGeneratePost = async (
    targetPlatform = platform,
    targetTone = tone,
    targetPrivacy = privacyLevel
  ) => {
    setIsGenerating(true);
    setError(null);
    setCopied(false);
    setShareSuccess(false);

    try {
      const res = await fetch('/api/social-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: targetPlatform,
          tone: targetTone,
          privacyLevel: targetPrivacy,
          customInstructions: customInstructions.trim() || undefined,
          journalTitle: journalTitle || 'Daily Reflection',
          freeformContent: freeformContent || '',
          messages: messages || [],
          bullets: bullets || [],
          mood: mood || undefined,
          archetype: archetype || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate social post');
      }

      const data: SocialPostResponse = await res.json();
      setPostResponse(data);
      setEditableBody(data.body);
      if (data.carouselSlides && data.carouselSlides.length > 0) {
        setCarouselSlides(data.carouselSlides);
        setActiveSlideIndex(0);
      } else {
        setCarouselSlides([]);
      }
    } catch (err: any) {
      console.error('Failed to generate social post:', err);
      setError(err.message || 'Something went wrong while generating your post.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate when modal opens if not yet generated
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      if (!postResponse && !isGenerating) {
        void handleGeneratePost(platform, tone, privacyLevel);
      }
    }, 10);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleCopy = async (textToCopy?: string) => {
    const text = textToCopy || getFullShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    const shareText = getFullShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: postResponse?.headline || journalTitle || 'Journal Reflection',
          text: shareText,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopy(shareText);
        }
      }
    } else {
      handleCopy(shareText);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!postResponse) return;
    const content = getFullShareText();
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeTitle = (postResponse.headline || journalTitle || 'post')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    a.href = url;
    a.download = `${platform}_${safeTitle}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const authorName = user?.displayName || 'Journal Creator';
  const authorHandle = user?.displayName
    ? `@${user.displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    : '@lifejournal360';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/85 p-3 sm:p-5 backdrop-blur-md overflow-y-auto">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl border border-zinc-800 bg-zinc-900/95 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 sm:px-6 py-4 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-lime-400/10 border border-lime-400/20 text-lime-400">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-zinc-100 flex items-center gap-2">
                <span>Social & Blog Post Generator</span>
                <span className="rounded-full bg-pink-500/15 border border-pink-500/30 px-2 py-0.5 text-[10px] font-bold text-pink-300">
                  Instagram • Facebook • Blog
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Transform your personal reflections into ready-to-publish posts with smart privacy protection.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Controls & Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Platform Selector Tabs */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
              Choose Target Platform
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PLATFORMS.map((p) => {
                const Icon = p.icon;
                const isSelected = platform === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPlatform(p.id);
                      handleGeneratePost(p.id, tone, privacyLevel);
                    }}
                    className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? p.activeBg + ' shadow-md scale-[1.02]'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`h-4 w-4 ${p.color}`} />
                      <span className="text-xs font-bold text-zinc-100">{p.label}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 line-clamp-1">{p.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tone & Privacy Settings Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-950/70 p-3 rounded-2xl border border-zinc-800/80">
            {/* Tone Selector */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-zinc-400 font-semibold mr-1 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Tone:</span>
              </span>
              {TONES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTone(t.id);
                    handleGeneratePost(platform, t.id, privacyLevel);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                    tone === t.id
                      ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                      : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  <span className="mr-1">{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Privacy Level Toggle */}
            <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  const newPrivacy = privacyLevel === 'anonymized' ? 'clean' : 'anonymized';
                  setPrivacyLevel(newPrivacy);
                  handleGeneratePost(platform, tone, newPrivacy);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  privacyLevel === 'anonymized'
                    ? 'bg-emerald-400/15 border-emerald-400/30 text-emerald-300'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                }`}
                title="Toggle Safe Anonymization (anonymizes personal names & sensitive locations)"
              >
                {privacyLevel === 'anonymized' ? (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>🛡️ Anonymized (Safe)</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                    <span>Original Details</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition"
                title="Custom creative instructions"
              >
                <Sliders className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Advanced Custom Prompt Input */}
          {showAdvanced && (
            <div className="bg-zinc-950/90 p-3 rounded-2xl border border-zinc-800 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-xs text-zinc-300 font-bold">
                <span>Custom Creative Instructions (Optional)</span>
                <span className="text-[10px] text-zinc-500">e.g. &ldquo;Make it shorter&rdquo;, &ldquo;Focus on the morning routine&rdquo;</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g. Emphasize gratitude for my team, keep under 120 words..."
                  className="flex-1 bg-zinc-900 px-3 py-2 rounded-xl text-xs text-zinc-100 border border-zinc-700 outline-none focus:border-lime-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleGeneratePost();
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleGeneratePost()}
                  disabled={isGenerating}
                  className="px-3 py-2 rounded-xl bg-lime-400 text-zinc-950 text-xs font-black hover:bg-lime-300 transition flex items-center gap-1"
                >
                  {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  <span>Apply</span>
                </button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-200 flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => handleGeneratePost()}
                className="underline hover:text-white font-bold ml-2"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="flex flex-col items-center justify-center p-12 bg-zinc-950/40 rounded-3xl border border-dashed border-zinc-800">
              <Loader2 className="h-8 w-8 animate-spin text-lime-400 mb-3" />
              <p className="text-sm font-bold text-zinc-200">
                Crafting your {platform === 'instagram' ? 'Instagram Post & Carousel' : platform === 'facebook' ? 'Facebook Community Post' : platform === 'blog' ? 'Blog Article' : 'LinkedIn Post'}...
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Refining voice, pacing, hooks, and privacy safeguarding with Gemini.
              </p>
            </div>
          )}

          {/* Post Presentation View */}
          {!isGenerating && postResponse && (
            <div className="space-y-4">
              {/* View Mode Tabs (Preview / Edit / Carousel Slides) */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      activeTab === 'preview' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Live Mockup Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      activeTab === 'edit' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit Post Text</span>
                  </button>

                  {carouselSlides.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('carousel')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        activeTab === 'carousel' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Carousel Slides ({carouselSlides.length})</span>
                    </button>
                  )}
                </div>

                {/* Privacy summary pill */}
                {postResponse.privacyScrubSummary && (
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1 bg-zinc-950 px-2.5 py-1 rounded-full border border-zinc-800">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    <span className="line-clamp-1">{postResponse.privacyScrubSummary}</span>
                  </span>
                )}
              </div>

              {/* 1. LIVE MOCKUP PREVIEW TAB */}
              {activeTab === 'preview' && (
                <div className="flex flex-col items-center justify-center">
                  {/* INSTAGRAM MOCKUP */}
                  {platform === 'instagram' && (
                    <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden font-sans">
                      {/* Instagram Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[1.5px]">
                            <div className="h-full w-full rounded-full bg-zinc-950 flex items-center justify-center text-xs font-black text-pink-400">
                              LJ
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-zinc-100 flex items-center gap-1">
                              <span>{authorHandle}</span>
                              <span className="text-[10px] text-pink-400">• Follow</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 block">Life Journal 360 Reflections</span>
                          </div>
                        </div>
                        <div className="text-zinc-400 text-sm">•••</div>
                      </div>

                      {/* Instagram Visual Carousel Card */}
                      {carouselSlides.length > 0 ? (
                        <div className="relative aspect-square w-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-6 flex flex-col justify-between border-b border-zinc-800 select-none">
                          <div className="flex items-center justify-between text-xs text-zinc-400">
                            <span className="font-extrabold uppercase tracking-widest text-[10px] text-pink-400">
                              Life Journal 360
                            </span>
                            <span className="rounded-full bg-zinc-800/90 px-2 py-0.5 text-[10px] font-bold text-zinc-200">
                              {activeSlideIndex + 1} / {carouselSlides.length}
                            </span>
                          </div>

                          <div className="my-auto text-center px-4 space-y-3">
                            <h4 className="text-lg font-black tracking-tight text-white leading-snug">
                              {carouselSlides[activeSlideIndex]?.title}
                            </h4>
                            <p className="text-xs text-zinc-300 leading-relaxed max-h-40 overflow-y-auto">
                              {carouselSlides[activeSlideIndex]?.text}
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                              disabled={activeSlideIndex === 0}
                              className="h-7 w-7 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center disabled:opacity-30"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>

                            <div className="flex items-center gap-1.5">
                              {carouselSlides.map((_, idx) => (
                                <span
                                  key={idx}
                                  className={`h-1.5 rounded-full transition-all ${
                                    idx === activeSlideIndex ? 'w-5 bg-pink-400' : 'w-1.5 bg-zinc-700'
                                  }`}
                                />
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => setActiveSlideIndex((prev) => Math.min(carouselSlides.length - 1, prev + 1))}
                              disabled={activeSlideIndex === carouselSlides.length - 1}
                              className="h-7 w-7 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center disabled:opacity-30"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video w-full bg-gradient-to-tr from-pink-950/40 via-purple-950/30 to-zinc-950 p-6 flex flex-col justify-center text-center border-b border-zinc-800">
                          <h3 className="text-base font-extrabold text-pink-300 mb-2">{postResponse.headline}</h3>
                          <p className="text-xs text-zinc-300 italic">&ldquo;{postResponse.hook}&rdquo;</p>
                        </div>
                      )}

                      {/* Instagram Action Icons */}
                      <div className="flex items-center justify-between px-4 py-2.5 text-zinc-300">
                        <div className="flex items-center gap-4">
                          <Heart className="h-5 w-5 text-rose-500 fill-rose-500/20 cursor-pointer hover:scale-110 transition" />
                          <MessageCircle className="h-5 w-5 cursor-pointer hover:scale-110 transition" />
                          <Send className="h-5 w-5 cursor-pointer hover:scale-110 transition" />
                        </div>
                        <Bookmark className="h-5 w-5 cursor-pointer hover:scale-110 transition" />
                      </div>

                      {/* Instagram Caption & Hashtags */}
                      <div className="px-4 pb-4 space-y-2 text-xs">
                        <div>
                          <span className="font-bold text-zinc-100 mr-2">{authorHandle}</span>
                          <span className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{editableBody}</span>
                        </div>

                        {postResponse.suggestedHashtags && postResponse.suggestedHashtags.length > 0 && (
                          <div className="text-pink-400 font-semibold text-[11px] leading-relaxed">
                            {postResponse.suggestedHashtags.join(' ')}
                          </div>
                        )}

                        <span className="text-[10px] uppercase tracking-wider text-zinc-500 block pt-1">
                          Just now • Life Journal 360
                        </span>
                      </div>
                    </div>
                  )}

                  {/* FACEBOOK MOCKUP */}
                  {platform === 'facebook' && (
                    <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl p-4 sm:p-5 space-y-3 font-sans">
                      {/* Author Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
                            {authorName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-zinc-100">{authorName}</div>
                            <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                              <span>Just now</span>
                              <span>•</span>
                              <Globe className="h-3 w-3" />
                            </div>
                          </div>
                        </div>
                        <div className="text-zinc-400 text-sm">•••</div>
                      </div>

                      {/* Post Body */}
                      <div className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap pt-1 font-normal">
                        {editableBody}
                      </div>

                      {/* Call to Action Question Highlight */}
                      {postResponse.callToAction && (
                        <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 text-xs text-blue-200 font-medium">
                          💬 <span className="font-bold">Discussion prompt:</span> {postResponse.callToAction}
                        </div>
                      )}

                      {/* Reactions & Comment Bar */}
                      <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs text-zinc-400">
                        <button type="button" className="flex items-center gap-1.5 hover:text-blue-400 transition">
                          <ThumbsUp className="h-4 w-4" />
                          <span>Like</span>
                        </button>
                        <button type="button" className="flex items-center gap-1.5 hover:text-blue-400 transition">
                          <MessageCircle className="h-4 w-4" />
                          <span>Comment</span>
                        </button>
                        <button type="button" className="flex items-center gap-1.5 hover:text-blue-400 transition">
                          <Share2 className="h-4 w-4" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* BLOG ARTICLE MOCKUP */}
                  {platform === 'blog' && (
                    <div className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl p-6 sm:p-8 space-y-5">
                      <div className="border-b border-zinc-800/80 pb-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-teal-400/15 border border-teal-400/30 px-2.5 py-0.5 text-[10px] font-extrabold text-teal-300 uppercase tracking-wider">
                            Personal Growth Essay
                          </span>
                          <span className="text-xs text-zinc-500">•</span>
                          <span className="text-xs text-zinc-400">{postResponse.estimatedReadTime || '3 min read'}</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                          {postResponse.headline}
                        </h1>
                        <p className="text-xs sm:text-sm text-zinc-400 italic">
                          &ldquo;{postResponse.hook}&rdquo;
                        </p>
                      </div>

                      <div className="prose prose-invert max-w-none text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                        {editableBody}
                      </div>

                      {postResponse.callToAction && (
                        <div className="border-l-2 border-teal-400 pl-4 py-1 text-xs sm:text-sm text-teal-200 font-semibold italic">
                          {postResponse.callToAction}
                        </div>
                      )}

                      <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                        <span className="font-semibold">Published via Life Journal 360</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleDownloadMarkdown}
                            className="text-teal-400 hover:underline font-bold flex items-center gap-1"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Download .md</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LINKEDIN MOCKUP */}
                  {platform === 'linkedin' && (
                    <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl p-4 sm:p-5 space-y-3 font-sans">
                      <div className="flex items-center gap-2.5">
                        <div className="h-10 w-10 rounded-full bg-sky-600 flex items-center justify-center font-bold text-white text-sm">
                          {authorName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-100 flex items-center gap-1">
                            <span>{authorName}</span>
                            <span className="text-[10px] text-zinc-500">• 1st</span>
                          </div>
                          <span className="text-[10px] text-zinc-400 block">Personal Growth & Reflective Leadership</span>
                          <span className="text-[9px] text-zinc-500">Just now • 🌐</span>
                        </div>
                      </div>

                      <div className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap pt-1 font-normal">
                        {editableBody}
                      </div>

                      {postResponse.suggestedHashtags && postResponse.suggestedHashtags.length > 0 && (
                        <div className="text-sky-400 font-bold text-[11px]">
                          {postResponse.suggestedHashtags.join(' ')}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs text-zinc-400">
                        <button type="button" className="flex items-center gap-1 hover:text-sky-400">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>Like</span>
                        </button>
                        <button type="button" className="flex items-center gap-1 hover:text-sky-400">
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>Comment</span>
                        </button>
                        <button type="button" className="flex items-center gap-1 hover:text-sky-400">
                          <Share2 className="h-3.5 w-3.5" />
                          <span>Repost</span>
                        </button>
                        <button type="button" className="flex items-center gap-1 hover:text-sky-400">
                          <Send className="h-3.5 w-3.5" />
                          <span>Send</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. EDIT POST TEXT TAB */}
              {activeTab === 'edit' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Direct Text Editor (Changes apply immediately to copy and preview)</span>
                    <span>{editableBody.split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                  <textarea
                    rows={12}
                    value={editableBody}
                    onChange={(e) => setEditableBody(e.target.value)}
                    className="w-full rounded-2xl bg-zinc-950 p-4 text-xs font-mono text-zinc-200 border border-zinc-800 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400/30 leading-relaxed"
                  />
                  {postResponse.suggestedHashtags && postResponse.suggestedHashtags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 text-xs">
                      <span className="text-zinc-500 font-bold mr-1">Hashtags:</span>
                      {postResponse.suggestedHashtags.map((h, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg bg-zinc-800 text-pink-300 text-[11px] font-semibold"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. CAROUSEL SLIDES TAB */}
              {activeTab === 'carousel' && carouselSlides.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs text-zinc-400 flex items-center justify-between">
                    <span>Carousel Slide by Slide Deck (Ready for Instagram or LinkedIn PDF)</span>
                    <button
                      type="button"
                      onClick={() => {
                        const slideText = carouselSlides
                          .map((s) => `### Slide ${s.slideNumber}: ${s.title}\n${s.text}`)
                          .join('\n\n---\n\n');
                        handleCopy(slideText);
                      }}
                      className="text-pink-400 hover:underline font-bold"
                    >
                      Copy All Slides as Text
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {carouselSlides.map((slide, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 flex flex-col justify-between space-y-3 hover:border-pink-500/40 transition"
                      >
                        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold">
                          <span className="text-pink-400">SLIDE {slide.slideNumber}</span>
                          <span>{idx + 1} of {carouselSlides.length}</span>
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <h5 className="text-xs font-black text-zinc-100">{slide.title}</h5>
                          <p className="text-[11px] text-zinc-300 leading-relaxed line-clamp-4">{slide.text}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(`Slide ${slide.slideNumber}: ${slide.title}\n${slide.text}`)}
                          className="text-[10px] font-bold text-zinc-400 hover:text-white flex items-center gap-1 self-end pt-1"
                        >
                          <Copy className="h-3 w-3" />
                          <span>Copy Slide</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="border-t border-zinc-800 bg-zinc-950/80 px-5 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            {postResponse && (
              <span>
                Model: <strong className="text-zinc-200">{postResponse.modelUsed}</strong>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => handleGeneratePost()}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-bold hover:bg-zinc-700 transition"
              title="Regenerate post"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              disabled={!postResponse}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200 text-xs font-bold hover:bg-zinc-800 transition disabled:opacity-50"
              title="Download post as Markdown file"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export .md</span>
            </button>

            <button
              type="button"
              onClick={() => handleCopy()}
              disabled={!postResponse}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition shadow-md ${
                copied
                  ? 'bg-emerald-400 text-zinc-950'
                  : 'bg-zinc-100 text-zinc-950 hover:bg-white hover:scale-105'
              } disabled:opacity-50`}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Post'}</span>
            </button>

            <button
              type="button"
              onClick={handleNativeShare}
              disabled={!postResponse}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition shadow-md ${
                shareSuccess
                  ? 'bg-emerald-400 text-zinc-950'
                  : 'bg-lime-400 text-zinc-950 hover:bg-lime-300 hover:scale-105'
              } disabled:opacity-50`}
            >
              {shareSuccess ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
              <span>{shareSuccess ? 'Shared!' : 'Share Post'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
