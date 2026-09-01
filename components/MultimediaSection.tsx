'use client';

import React, { useState } from 'react';
import type { MultimediaEntry } from '@/lib/types';
import {
  Camera,
  Video,
  Activity,
  Music,
  MapPin,
  Plus,
  Trash2,
  Image as ImageIcon,
  Flame,
  Footprints,
  Clock,
  Compass,
  CloudSun,
  Headphones,
  Sparkles,
  Link2,
  Check,
  Globe,
  Tag,
  Mic,
  Volume2,
  Play,
  Square,
} from 'lucide-react';
import { VoiceDictationButton } from './VoiceDictationButton';

interface MultimediaSectionProps {
  multimedia: MultimediaEntry;
  onChangeMultimedia: (multimedia: MultimediaEntry) => void;
  entryLocation?: {
    placeName?: string;
    latitude?: number;
    longitude?: number;
    weather?: string;
  };
  compact?: boolean;
}

export function MultimediaSection({
  multimedia,
  onChangeMultimedia,
  entryLocation,
  compact = false,
}: MultimediaSectionProps) {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'audio' | 'workout' | 'music' | 'gps'>('photos');

  // Photo state
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoPlaceName, setPhotoPlaceName] = useState('');
  const [showPhotoLocationInput, setShowPhotoLocationInput] = useState(false);

  // Video state
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoPlaceName, setVideoPlaceName] = useState('');

  // Location state
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  const handleAddAudioNote = (audioData: {
    id: string;
    url?: string;
    durationSeconds?: number;
    transcript?: string;
    recordedAt?: number;
    label?: string;
  }) => {
    const currentAudio = multimedia.audioNotes || [];
    onChangeMultimedia({
      ...multimedia,
      audioNotes: [...currentAudio, audioData],
    });
  };

  const handleRemoveAudioNote = (idx: number) => {
    const currentAudio = multimedia.audioNotes || [];
    onChangeMultimedia({
      ...multimedia,
      audioNotes: currentAudio.filter((_, i) => i !== idx),
    });
  };

  const handleAddPhoto = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!photoUrl.trim()) return;

    const currentPhotos = multimedia.photos || [];
    onChangeMultimedia({
      ...multimedia,
      photos: [
        ...currentPhotos,
        {
          url: photoUrl.trim(),
          caption: photoCaption.trim() || undefined,
          placeName: photoPlaceName.trim() || (entryLocation?.placeName ? entryLocation.placeName : undefined),
          latitude: entryLocation?.latitude,
          longitude: entryLocation?.longitude,
        },
      ],
    });
    setPhotoUrl('');
    setPhotoCaption('');
    setPhotoPlaceName('');
    setShowPhotoLocationInput(false);
  };

  const handleRemovePhoto = (idx: number) => {
    const currentPhotos = multimedia.photos || [];
    onChangeMultimedia({
      ...multimedia,
      photos: currentPhotos.filter((_, i) => i !== idx),
    });
  };

  const handleAddVideo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!videoUrl.trim()) return;

    const currentVideos = multimedia.videos || [];
    onChangeMultimedia({
      ...multimedia,
      videos: [
        ...currentVideos,
        {
          url: videoUrl.trim(),
          title: videoTitle.trim() || undefined,
          placeName: videoPlaceName.trim() || (entryLocation?.placeName ? entryLocation.placeName : undefined),
          latitude: entryLocation?.latitude,
          longitude: entryLocation?.longitude,
        },
      ],
    });
    setVideoUrl('');
    setVideoTitle('');
    setVideoPlaceName('');
  };

  const handleRemoveVideo = (idx: number) => {
    const currentVideos = multimedia.videos || [];
    onChangeMultimedia({
      ...multimedia,
      videos: currentVideos.filter((_, i) => i !== idx),
    });
  };

  const handleUpdateWorkout = (field: string, val: any) => {
    const current = multimedia.workoutStats || {};
    onChangeMultimedia({
      ...multimedia,
      workoutStats: {
        ...current,
        [field]: val,
      },
    });
  };

  const handleUpdateMusic = (field: string, val: string) => {
    const current = multimedia.music || {};
    onChangeMultimedia({
      ...multimedia,
      music: {
        ...current,
        [field]: val,
      },
    });
  };

  const handleUpdateLocation = (field: string, val: any) => {
    const current = multimedia.location || {};
    onChangeMultimedia({
      ...multimedia,
      location: {
        ...current,
        [field]: val,
      },
    });
  };

  const handleDetectGPS = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      setIsDetectingGps(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsDetectingGps(false);
          const current = multimedia.location || {};
          onChangeMultimedia({
            ...multimedia,
            location: {
              ...current,
              latitude: Number(position.coords.latitude.toFixed(4)),
              longitude: Number(position.coords.longitude.toFixed(4)),
              placeName: current.placeName || 'Current Geo Location',
              weather: current.weather || 'Sunny, 22°C',
            },
          });
        },
        () => {
          setIsDetectingGps(false);
          const current = multimedia.location || {};
          onChangeMultimedia({
            ...multimedia,
            location: {
              ...current,
              latitude: 37.7749,
              longitude: -122.4194,
              placeName: current.placeName || 'San Francisco, CA',
              weather: current.weather || 'Mild, 19°C',
            },
          });
        },
        { timeout: 5000 }
      );
    } else {
      const current = multimedia.location || {};
      onChangeMultimedia({
        ...multimedia,
        location: {
          ...current,
          latitude: 40.7128,
          longitude: -74.006,
          placeName: current.placeName || 'New York, NY',
          weather: current.weather || 'Partly Cloudy, 20°C',
        },
      });
    }
  };

  const photosCount = multimedia.photos?.length || 0;
  const videosCount = multimedia.videos?.length || 0;
  const audioCount = multimedia.audioNotes?.length || 0;
  const hasWorkout = Boolean(multimedia.workoutStats?.activityType || multimedia.workoutStats?.caloriesBurned);
  const hasMusic = Boolean(multimedia.music?.trackTitle);
  const hasLocation = Boolean(multimedia.location?.placeName || multimedia.location?.latitude);

  return (
    <div className="rounded-2xl border border-sky-500/30 bg-zinc-900/70 p-3.5 sm:p-4 backdrop-blur-md shadow-lg space-y-3.5 flex flex-col h-full">
      {/* Header with Badges & Tab Navigation */}
      <div className="flex flex-col gap-2 border-b border-zinc-800/80 pb-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-400/20 text-sky-400 border border-sky-400/30">
              <Camera className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-zinc-100 flex items-center gap-1.5">
                Multimedia Memories
                <span className="rounded-full bg-sky-400/20 border border-sky-400/30 px-1.5 py-0.2 text-[9px] font-bold text-sky-300">
                  {photosCount + videosCount + audioCount} items
                </span>
              </h3>
            </div>
          </div>

          <span className="text-[10px] text-zinc-400 italic">
            Attach now or later
          </span>
        </div>

        {/* Tab pills */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800/90 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold transition whitespace-nowrap ${
              activeTab === 'photos' ? 'bg-sky-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ImageIcon className="h-3 w-3" />
            <span>Photos {photosCount > 0 && `(${photosCount})`}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold transition whitespace-nowrap ${
              activeTab === 'audio' ? 'bg-amber-400 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Mic className="h-3 w-3" />
            <span>Voice Notes {audioCount > 0 && `(${audioCount})`}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold transition whitespace-nowrap ${
              activeTab === 'videos' ? 'bg-sky-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Video className="h-3 w-3" />
            <span>Videos {videosCount > 0 && `(${videosCount})`}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gps')}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold transition whitespace-nowrap ${
              activeTab === 'gps' ? 'bg-emerald-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MapPin className="h-3 w-3" />
            <span>GPS {hasLocation && '✓'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('workout')}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold transition whitespace-nowrap ${
              activeTab === 'workout' ? 'bg-sky-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="h-3 w-3" />
            <span>Workout {hasWorkout && '✓'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('music')}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold transition whitespace-nowrap ${
              activeTab === 'music' ? 'bg-sky-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Music className="h-3 w-3" />
            <span>Music {hasMusic && '✓'}</span>
          </button>
        </div>
      </div>

      {/* Tab: Photos */}
      {activeTab === 'photos' && (
        <div className="space-y-3 flex-1 flex flex-col">
          {/* Photo URL Input Form with Direct GPS Tagging Option */}
          <form onSubmit={handleAddPhoto} className="space-y-2 bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800">
            <div className="space-y-1.5">
              <div className="flex gap-1.5">
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="Paste Photo URL (https://...)"
                  className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-sky-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!photoUrl.trim()}
                  className="inline-flex items-center justify-center gap-1 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-bold text-zinc-950 hover:bg-sky-400 disabled:opacity-50 transition shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Attach</span>
                </button>
              </div>

              <div className="flex gap-1.5 items-center">
                <div className="relative flex-1 flex items-center">
                  <input
                    type="text"
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                    placeholder="Photo caption (type or speak via mic)..."
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-2.5 pr-7 py-1.5 text-[11px] text-zinc-200 placeholder-zinc-500 focus:border-sky-500 focus:outline-none"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2">
                    <VoiceDictationButton
                      onTranscript={(txt) => setPhotoCaption((prev) => (prev ? `${prev} ${txt}` : txt))}
                      size="icon"
                      variant="subtle"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPhotoLocationInput(!showPhotoLocationInput)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg border flex items-center gap-1 transition shrink-0 ${
                    photoPlaceName || showPhotoLocationInput
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                  title="Tag location on this specific photo"
                >
                  <MapPin className="h-3 w-3" />
                  <span>{photoPlaceName ? 'GPS Tagged' : 'Tag GPS'}</span>
                </button>
              </div>

              {/* Collapsible Photo GPS Tag field */}
              {showPhotoLocationInput && (
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    value={photoPlaceName}
                    onChange={(e) => setPhotoPlaceName(e.target.value)}
                    placeholder="Place name for this photo (e.g. Shibuya Sky, Tokyo)"
                    className="flex-1 rounded-lg border border-emerald-500/40 bg-zinc-900 px-2.5 py-1 text-[10px] text-emerald-200 placeholder-zinc-500 focus:outline-none"
                  />
                  {entryLocation?.placeName && (
                    <button
                      type="button"
                      onClick={() => setPhotoPlaceName(entryLocation.placeName || '')}
                      className="text-[9px] font-bold text-emerald-400 hover:underline shrink-0 bg-emerald-950/60 px-1.5 py-1 rounded border border-emerald-500/30"
                    >
                      Use Entry GPS
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Quick Sample Image Presets */}
            <div className="flex items-center flex-wrap gap-1 text-[10px] text-zinc-400 pt-1 border-t border-zinc-850">
              <span className="font-semibold text-zinc-500">Presets:</span>
              <button
                type="button"
                onClick={() => {
                  setPhotoUrl('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=60');
                  setPhotoCaption('Yosemite Valley sunset');
                  setPhotoPlaceName('Yosemite National Park');
                }}
                className="rounded bg-zinc-900 px-1.5 py-0.5 hover:bg-zinc-800 hover:text-sky-300 text-[10px]"
              >
                🌲 Nature
              </button>
              <button
                type="button"
                onClick={() => {
                  setPhotoUrl('https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=60');
                  setPhotoCaption('Deep work desk setup & coffee');
                }}
                className="rounded bg-zinc-900 px-1.5 py-0.5 hover:bg-zinc-800 hover:text-sky-300 text-[10px]"
              >
                ☕ Workspace
              </button>
              <button
                type="button"
                onClick={() => {
                  setPhotoUrl('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=60');
                  setPhotoCaption('Evening 5km run session');
                }}
                className="rounded bg-zinc-900 px-1.5 py-0.5 hover:bg-zinc-800 hover:text-sky-300 text-[10px]"
              >
                🏃 Run
              </button>
              <button
                type="button"
                onClick={() => {
                  setPhotoUrl('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60');
                  setPhotoCaption('Sunset beach waves');
                  setPhotoPlaceName('Maui, Hawaii');
                }}
                className="rounded bg-zinc-900 px-1.5 py-0.5 hover:bg-zinc-800 hover:text-sky-300 text-[10px]"
              >
                🏖️ Beach
              </button>
            </div>
          </form>

          {/* Photos Grid Stream */}
          <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2 pr-1">
            {multimedia.photos && multimedia.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {multimedia.photos.map((p, idx) => (
                  <div
                    key={idx}
                    className="group relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.url}
                      alt={p.caption || `Photo ${idx + 1}`}
                      className="h-24 w-full object-cover group-hover:scale-105 transition duration-300"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as any).src = 'https://picsum.photos/400/300';
                      }}
                    />

                    {/* Overlay info */}
                    <div className="p-1.5 bg-zinc-950/90 text-[10px] space-y-0.5">
                      {p.caption && <p className="text-zinc-200 font-medium truncate">{p.caption}</p>}
                      {p.placeName && (
                        <p className="text-emerald-400 text-[9px] flex items-center gap-0.5 truncate font-semibold">
                          <MapPin className="h-2.5 w-2.5 shrink-0" />
                          <span>{p.placeName}</span>
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 rounded-full bg-zinc-950/80 p-1 text-rose-400 hover:bg-rose-950 transition opacity-80 hover:opacity-100"
                      title="Remove photo"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-800 p-4 text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-1.5">
                <ImageIcon className="h-6 w-6 text-zinc-600" />
                <p className="font-semibold text-zinc-400">No photos attached yet</p>
                <p className="text-[10px] text-zinc-500 max-w-[200px]">
                  You can write your reflections now and attach photos or GPS snapshots whenever you wish.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

          {/* Tab: Audio & Voice Notes */}
      {activeTab === 'audio' && (
        <div className="space-y-3 flex-1 flex flex-col">
          <div className="bg-zinc-950/90 p-3 rounded-xl border border-amber-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300">
                  <Mic className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-100">Voice Note Recorder</h4>
                  <p className="text-[10px] text-zinc-400">Record spoken audio memos and auto-transcribe text</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <VoiceDictationButton
                onAudioRecorded={(audio) => {
                  handleAddAudioNote({
                    id: audio.id,
                    url: audio.url,
                    durationSeconds: audio.durationSeconds,
                    transcript: audio.transcript,
                    recordedAt: Date.now(),
                    label: `Audio Memo #${(multimedia.audioNotes?.length || 0) + 1}`,
                  });
                }}
                onTranscript={(txt) => {
                  if (txt) {
                    handleAddAudioNote({
                      id: `transcript-${Date.now()}`,
                      transcript: txt,
                      recordedAt: Date.now(),
                      label: `Dictation #${(multimedia.audioNotes?.length || 0) + 1}`,
                    });
                  }
                }}
                variant="solid"
                size="md"
              />
            </div>
          </div>

          {/* Audio List Stream */}
          <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2 pr-1">
            {multimedia.audioNotes && multimedia.audioNotes.length > 0 ? (
              multimedia.audioNotes.map((note, idx) => (
                <div key={note.id || idx} className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span className="text-xs font-bold text-zinc-200">{note.label || `Audio Note #${idx + 1}`}</span>
                      {note.durationSeconds !== undefined && note.durationSeconds > 0 && (
                        <span className="text-[10px] text-zinc-400 font-mono bg-zinc-900 px-1.5 py-0.5 rounded">
                          {Math.floor(note.durationSeconds / 60)}:{(note.durationSeconds % 60).toString().padStart(2, '0')}s
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAudioNote(idx)}
                      className="p-1 text-zinc-500 hover:text-rose-400 transition shrink-0"
                      title="Remove voice note"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {note.url && (
                    <audio controls src={note.url} className="w-full h-8 mt-1 rounded" />
                  )}

                  {note.transcript && (
                    <div className="text-[11px] text-zinc-300 italic bg-zinc-900/80 p-2 rounded-lg border border-zinc-800/80">
                      &ldquo;{note.transcript}&rdquo;
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-800 p-4 text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-1.5">
                <Mic className="h-6 w-6 text-zinc-600" />
                <p className="font-semibold text-zinc-400">No voice notes recorded yet</p>
                <p className="text-[10px] text-zinc-500 max-w-[220px]">
                  Click the microphone button above to record voice reflections or dictate your thoughts.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Videos */}
      {activeTab === 'videos' && (
        <div className="space-y-3 flex-1 flex flex-col">
          <form onSubmit={handleAddVideo} className="space-y-2 bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800">
            <div className="flex gap-1.5">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste Video URL (YouTube, Vimeo, MP4)..."
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-sky-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!videoUrl.trim()}
                className="inline-flex items-center justify-center gap-1 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-bold text-zinc-950 hover:bg-sky-400 disabled:opacity-50 transition shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex gap-1.5 items-center">
              <div className="relative flex-1 flex items-center">
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Video title / moment description..."
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-2.5 pr-7 py-1.5 text-[11px] text-zinc-200 placeholder-zinc-500 focus:border-sky-500 focus:outline-none"
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2">
                  <VoiceDictationButton
                    onTranscript={(txt) => setVideoTitle((prev) => (prev ? `${prev} ${txt}` : txt))}
                    size="icon"
                    variant="subtle"
                  />
                </div>
              </div>
              <input
                type="text"
                value={videoPlaceName}
                onChange={(e) => setVideoPlaceName(e.target.value)}
                placeholder="Location (optional)..."
                className="w-32 rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-[10px] text-zinc-200 placeholder-zinc-500 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </form>

          <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2 pr-1">
            {multimedia.videos && multimedia.videos.length > 0 ? (
              multimedia.videos.map((v, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl border border-zinc-800 bg-zinc-950">
                  <div className="flex items-center gap-2 min-w-0">
                    <Video className="h-4 w-4 text-sky-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-200 truncate">{v.title || 'Video Moment'}</p>
                      <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-sky-400 hover:underline truncate block">
                        {v.url}
                      </a>
                      {v.placeName && (
                        <span className="text-[9px] text-emerald-400 flex items-center gap-0.5 font-medium">
                          <MapPin className="h-2.5 w-2.5" /> {v.placeName}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveVideo(idx)}
                    className="p-1 text-zinc-500 hover:text-rose-400 transition shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-800 p-4 text-center text-xs text-zinc-500">
                No video moments added yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: GPS & Geolocation Coordinates on Entry */}
      {activeTab === 'gps' && (
        <div className="space-y-3 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-emerald-400" />
              Direct Entry GPS Stamp
            </span>
            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={isDetectingGps}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/30 transition disabled:opacity-50"
            >
              <MapPin className="h-3 w-3" />
              <span>{isDetectingGps ? 'Detecting...' : 'Auto-Detect'}</span>
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-0.5">
                Place / City / Landmark
              </label>
              <input
                type="text"
                value={multimedia.location?.placeName || ''}
                onChange={(e) => handleUpdateLocation('placeName', e.target.value)}
                placeholder="e.g. Shibuya Sky, Tokyo / Central Park, NYC"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-0.5">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={multimedia.location?.latitude || ''}
                  onChange={(e) => handleUpdateLocation('latitude', Number(e.target.value))}
                  placeholder="35.6580"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-200 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-0.5">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={multimedia.location?.longitude || ''}
                  onChange={(e) => handleUpdateLocation('longitude', Number(e.target.value))}
                  placeholder="139.7016"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-200 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-0.5">
                Weather Snapshot
              </label>
              <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1">
                <CloudSun className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <input
                  type="text"
                  value={multimedia.location?.weather || ''}
                  onChange={(e) => handleUpdateLocation('weather', e.target.value)}
                  placeholder="e.g. Crisp autumn breeze, 18°C"
                  className="w-full bg-transparent text-xs text-zinc-200 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Workout Stats */}
      {activeTab === 'workout' && (
        <div className="grid grid-cols-2 gap-2 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800 flex-1">
          <div className="col-span-2">
            <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-0.5">
              Activity Type
            </label>
            <select
              value={multimedia.workoutStats?.activityType || 'Running'}
              onChange={(e) => handleUpdateWorkout('activityType', e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-200"
            >
              <option value="Running">🏃 Running</option>
              <option value="Cycling">🚴 Cycling</option>
              <option value="Strength Training">🏋️ Strength Training</option>
              <option value="HIIT">⚡ HIIT / Circuit</option>
              <option value="Yoga / Mobility">🧘 Yoga / Mobility</option>
              <option value="Walking">🚶 Walking</option>
              <option value="Swimming">🏊 Swimming</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-0.5">
              Duration (Mins)
            </label>
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1">
              <Clock className="h-3 w-3 text-zinc-500" />
              <input
                type="number"
                min={0}
                value={multimedia.workoutStats?.durationMinutes || ''}
                onChange={(e) => handleUpdateWorkout('durationMinutes', Number(e.target.value))}
                placeholder="45"
                className="w-full bg-transparent text-xs text-zinc-200 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-0.5">
              Calories (kcal)
            </label>
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1">
              <Flame className="h-3 w-3 text-amber-400" />
              <input
                type="number"
                min={0}
                value={multimedia.workoutStats?.caloriesBurned || ''}
                onChange={(e) => handleUpdateWorkout('caloriesBurned', Number(e.target.value))}
                placeholder="420"
                className="w-full bg-transparent text-xs text-zinc-200 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Music Soundtrack */}
      {activeTab === 'music' && (
        <div className="space-y-2 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800 flex-1">
          <div>
            <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-0.5">
              Song / Track
            </label>
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1">
              <Music className="h-3.5 w-3.5 text-sky-400 shrink-0" />
              <input
                type="text"
                value={multimedia.music?.trackTitle || ''}
                onChange={(e) => handleUpdateMusic('trackTitle', e.target.value)}
                placeholder="e.g. Weightless, Tycho - Awake"
                className="w-full bg-transparent text-xs text-zinc-200 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-0.5">
                Artist
              </label>
              <input
                type="text"
                value={multimedia.music?.artist || ''}
                onChange={(e) => handleUpdateMusic('artist', e.target.value)}
                placeholder="e.g. Tycho"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-200 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-0.5">
                Vibe / Mood
              </label>
              <input
                type="text"
                value={multimedia.music?.albumOrVibe || ''}
                onChange={(e) => handleUpdateMusic('albumOrVibe', e.target.value)}
                placeholder="e.g. Focus Chill"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-200 outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
