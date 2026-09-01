'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Volume2, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

interface VoiceDictationButtonProps {
  onTranscript: (text: string) => void;
  onAudioRecorded?: (audioData: {
    id: string;
    url?: string;
    durationSeconds?: number;
    transcript?: string;
    recordedAt?: number;
    label?: string;
  }) => void;
  size?: 'sm' | 'md' | 'icon';
  variant?: 'subtle' | 'solid' | 'pill';
  placeholder?: string;
  label?: string;
  className?: string;
  appendMode?: boolean;
}

export function VoiceDictationButton({
  onTranscript,
  onAudioRecorded,
  size = 'sm',
  variant = 'subtle',
  label = 'Voice Note',
  className = '',
  appendMode = true,
}: VoiceDictationButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [hasSpeechRecognition] = useState(() => {
    if (typeof window !== 'undefined') {
      return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    }
    return true;
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordedTranscriptRef = useRef<string>('');

  const stopListening = React.useCallback(() => {
    setIsListening(false);
    setInterimText('');

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
      mediaRecorderRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  const startListening = async () => {
    setErrorMessage(null);
    setInterimText('');
    setRecordingSeconds(0);
    recordedTranscriptRef.current = '';

    // 1. Initialize SpeechRecognition if available
    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let currentInterim = '';
          let finalChunk = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalChunk += transcript + ' ';
            } else {
              currentInterim += transcript;
            }
          }

          if (currentInterim) {
            setInterimText(currentInterim);
          }

          if (finalChunk.trim()) {
            recordedTranscriptRef.current += finalChunk;
            onTranscript(finalChunk.trim());
            setInterimText('');
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition status:', event.error);
          if (event.error === 'not-allowed') {
            setErrorMessage('Microphone access denied. Please allow microphone permissions.');
          } else if (event.error !== 'no-speech') {
            setErrorMessage(`Voice input: ${event.error}`);
          }
        };

        recognition.onend = () => {
          // If still recording audio, allow restart unless explicitly stopped
          if (isListening && recognitionRef.current) {
            try {
              recognition.start();
            } catch (e) {
              // Ignore already started error
            }
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        console.error('Speech recognition start failed:', err);
      }
    }

    // 2. Also start MediaRecorder for audio recording if supported
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);

          if (onAudioRecorded) {
            onAudioRecorded({
              id: `audio_${Date.now()}`,
              url: audioUrl,
              durationSeconds: recordingSeconds || 1,
              transcript: recordedTranscriptRef.current.trim() || undefined,
              recordedAt: Date.now(),
              label: `Voice Note (${recordingSeconds}s)`,
            });
          }

          // Stop all audio tracks
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(250);
        setIsListening(true);

        // Start timer
        timerIntervalRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      } catch (err: any) {
        console.warn('MediaRecorder permission or device unavailable:', err);
        if (!SpeechRecognition) {
          setErrorMessage('Microphone permission required for voice notes.');
        }
      }
    }
  };

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Format recording seconds
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative inline-flex items-center">
      {isListening ? (
        <div className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/50 bg-red-950/80 px-2.5 py-1 text-xs font-black text-red-300 shadow-lg animate-pulse backdrop-blur-md">
          {/* Animated sound wave bars */}
          <div className="flex items-center gap-0.5 h-3">
            <span className="w-1 bg-red-400 rounded-full animate-[bounce_0.8s_infinite_100ms] h-2.5" />
            <span className="w-1 bg-red-300 rounded-full animate-[bounce_0.8s_infinite_300ms] h-3.5" />
            <span className="w-1 bg-red-400 rounded-full animate-[bounce_0.8s_infinite_200ms] h-2" />
          </div>

          <span className="text-[11px] font-mono font-bold text-white">
            {formatTime(recordingSeconds)}
          </span>

          <span className="hidden sm:inline text-[11px] text-red-200">
            {interimText ? `"${interimText.slice(0, 20)}..."` : 'Listening...'}
          </span>

          <button
            type="button"
            onClick={toggleListening}
            className="flex items-center gap-1 rounded-lg bg-red-500 px-2 py-0.5 text-[11px] font-black text-white hover:bg-red-400 transition"
            title="Stop voice dictation"
          >
            <Square className="h-2.5 w-2.5 fill-white" />
            <span>Done</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={toggleListening}
          className={`inline-flex items-center gap-1.5 rounded-xl transition-all duration-150 active:scale-95 ${
            variant === 'pill'
              ? 'bg-gradient-to-r from-amber-500/20 to-lime-500/20 border border-amber-400/40 text-amber-300 hover:border-amber-300 hover:text-white px-2.5 py-1 text-xs font-bold'
              : variant === 'solid'
              ? 'bg-amber-400 text-zinc-950 hover:bg-amber-300 px-2.5 py-1 text-xs font-black shadow-sm'
              : 'bg-zinc-900/80 border border-zinc-800 hover:border-amber-400/50 text-zinc-400 hover:text-amber-300 px-2 py-1 text-xs font-semibold'
          } ${size === 'icon' ? 'p-1.5' : ''} ${className}`}
          title="Click to speak and dictate voice note directly"
        >
          <Mic className={`h-3.5 w-3.5 ${variant === 'solid' ? 'text-zinc-950' : 'text-amber-400'}`} />
          {size !== 'icon' && <span>{label}</span>}
        </button>
      )}

      {errorMessage && (
        <div className="absolute left-0 -bottom-8 z-50 rounded-lg bg-zinc-900 border border-red-500/50 px-2.5 py-1 text-[10px] text-red-300 shadow-xl whitespace-nowrap flex items-center gap-1">
          <AlertCircle className="h-3 w-3 text-red-400" />
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="ml-1 text-zinc-400 hover:text-white"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
