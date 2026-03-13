'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Play, Pause, X } from 'lucide-react';

export interface VoiceNote {
  id: string;
  label: string;
  duration: number; // seconds
  url?: string;
}

interface VoiceNotePlayerProps {
  note: VoiceNote | null;
  onClose: () => void;
}

// Generate deterministic waveform bars from a seed string
function generateWaveform(id: string, barCount: number): number[] {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Array.from({ length: barCount }, (_, i) => {
    const seed = Math.abs(hash * (i + 1) * 7919) % 1000;
    // Heights between 0.15 and 1.0, shaped like speech (louder in middle)
    const envelope = Math.sin((i / barCount) * Math.PI) * 0.5 + 0.5;
    const noise = (seed / 1000) * 0.6 + 0.15;
    return Math.min(1, noise * envelope + 0.15);
  });
}

const BAR_COUNT = 48;

export default function VoiceNotePlayer({ note, onClose }: VoiceNotePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const waveform = useMemo(
    () => (note ? generateWaveform(note.id, BAR_COUNT) : []),
    [note]
  );

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const updateProgress = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setElapsed(audio.currentTime);
    if (audio.duration && isFinite(audio.duration)) {
      setProgress((audio.currentTime / audio.duration) * 100);
    }
    if (!audio.paused) {
      rafRef.current = requestAnimationFrame(updateProgress);
    }
  }, []);

  // Reset and auto-play when note changes
  useEffect(() => {
    stopPlayback();
    setProgress(0);
    setElapsed(0);
    setDuration(0);

    if (note?.url) {
      const audio = new Audio(note.url);
      audioRef.current = audio;

      audio.addEventListener('loadedmetadata', () => {
        if (isFinite(audio.duration)) setDuration(audio.duration);
      });
      audio.addEventListener('canplaythrough', () => {
        audio.play();
        setIsPlaying(true);
        rafRef.current = requestAnimationFrame(updateProgress);
      }, { once: true });
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(100);
        setElapsed(audio.duration);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      });
    } else {
      audioRef.current = null;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [note, stopPlayback, updateProgress]);

  const togglePlay = () => {
    if (!note || !audioRef.current) return;

    if (isPlaying) {
      stopPlayback();
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      rafRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  if (!note) return null;

  const displayDuration = duration > 0 ? duration : note.duration;
  const playheadBar = Math.floor((progress / 100) * BAR_COUNT);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '60px',
        right: '16px',
        zIndex: 901,
        width: 'calc(100% - 32px)',
        maxWidth: '290px',
        backgroundColor: 'var(--color-cell-bg)',
        border: '1px solid var(--color-gridline-heavy)',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: 'var(--color-dark-blue)',
      }}
    >
      {/* Top row: label + close */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 10px 2px',
        }}
      >
        <span
          style={{
            fontSize: '10px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--color-primary-blue)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {note.label}
        </span>
        <button
          onClick={onClose}
          style={{
            all: 'unset',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--color-primary-blue)',
            opacity: 0.4,
            flexShrink: 0,
          }}
        >
          <X size={11} />
        </button>
      </div>

      {/* Waveform */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 10px 6px',
        }}
      >
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          style={{
            all: 'unset',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            backgroundColor: 'var(--color-primary-blue)',
            color: '#f5f0e8',
            flexShrink: 0,
          }}
        >
          {isPlaying ? <Pause size={10} /> : <Play size={10} />}
        </button>

        {/* Bars */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '1.5px',
            height: '24px',
          }}
        >
          {waveform.map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${h * 100}%`,
                backgroundColor:
                  i < playheadBar
                    ? 'var(--color-primary-blue)'
                    : 'var(--color-gridline)',
                transition: isPlaying ? 'none' : 'background-color 0.1s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom row: time */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 10px 6px',
          fontSize: '10px',
          color: 'var(--color-primary-blue)',
          opacity: 0.6,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span>{formatTime(elapsed)}</span>
        <span>{formatTime(displayDuration)}</span>
      </div>
    </div>
  );
}
