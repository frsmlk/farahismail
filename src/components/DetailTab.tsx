'use client';

import { useState, useCallback, useMemo } from 'react';
import type { ArchiveEntry } from '@/lib/types';
import { X, Play, Link, ChevronLeft, ChevronRight } from 'lucide-react';
import type { VoiceNote } from '@/components/VoiceNotePlayer';
import DetailMiniMap from '@/components/DetailMiniMap';

interface DetailTabProps {
  slug: string;
  onClose: () => void;
  entries: ArchiveEntry[];
  onNavigate?: (slug: string) => void;
  onPlayVoiceNote?: (note: VoiceNote) => void;
  isFloating?: boolean;
}

const MEDIA_TYPES: ('SKETCH' | 'PHOTO' | 'RENDER')[] = [
  'SKETCH',
  'PHOTO',
  'RENDER',
  'PHOTO',
  'RENDER',
  'SKETCH',
];

const VOICE_NOTES = [
  { label: 'Site visit notes', duration: 47 },
  { label: 'Design thoughts', duration: 123 },
];

function generatePlaceholderMedia(entryId: number) {
  return Array.from({ length: 5 }, (_, i) => ({
    index: i,
    url: `https://picsum.photos/300/200?random=${entryId * 10 + i}`,
    caption: `Documentation ${String(i + 1).padStart(2, '0')}`,
    fileType: MEDIA_TYPES[i % MEDIA_TYPES.length],
  }));
}

function generateVoiceNotes(entryId: number): { id: string; label: string; duration: number }[] {
  return VOICE_NOTES.map((v, i) => ({
    id: `vn-${entryId}-${i}`,
    label: v.label,
    duration: v.duration,
  }));
}

export default function DetailTab({
  slug,
  onClose,
  entries,
  onNavigate,
  onPlayVoiceNote,
  isFloating,
}: DetailTabProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const copyShareLink = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}#detail/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [slug]);

  const entryIndex = useMemo(
    () => entries.findIndex((e) => e.slug === slug),
    [entries, slug]
  );
  const entry = entries[entryIndex];
  const prevEntry = entryIndex > 0 ? entries[entryIndex - 1] : null;
  const nextEntry =
    entryIndex < entries.length - 1 ? entries[entryIndex + 1] : null;

  const media = useMemo(
    () => (entry ? generatePlaceholderMedia(entry.id) : []),
    [entry]
  );

  const voiceNotes = useMemo(
    () => (entry ? generateVoiceNotes(entry.id) : []),
    [entry]
  );

  const handleNavigate = useCallback(
    (targetSlug: string) => {
      if (onNavigate) {
        onNavigate(targetSlug);
      }
    },
    [onNavigate]
  );

  if (!entry) {
    return (
      <div
        style={{
          padding: '48px',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          color: 'var(--color-primary-blue)',
          opacity: 0.5,
        }}
      >
        Entry not found: {slug}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        flex: 1,
      }}
    >
      {/* ─── HEADER BAND ─── */}
      <div
        className="detail-header"
        style={{
          borderBottom: '2px solid var(--color-gridline-heavy)',
          backgroundColor: 'var(--color-cell-bg)',
        }}
      >
        {/* Breadcrumb */}
        <div
          className="detail-breadcrumb"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--color-primary-blue)',
            opacity: 0.6,
            marginBottom: '8px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              all: 'unset',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--color-primary-blue)',
            }}
          >
            ARCHIVE
          </button>
          <span>&gt;</span>
          <span>{entry.category.toUpperCase()}</span>
          <span>&gt;</span>
          <span style={{ color: 'var(--color-dark-blue)', opacity: 1 }}>
            {entry.title.toUpperCase()}
          </span>
        </div>

        {/* Title + Share */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 16px 0' }}>
          <h1
            className="detail-title"
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 600,
              color: 'var(--color-dark-blue)',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {entry.title}
          </h1>
          <button
            onClick={copyShareLink}
            title="Copy share link"
            style={{
              all: 'unset',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              border: '1px solid var(--color-gridline)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--color-primary-blue)',
              backgroundColor: copied ? 'var(--color-primary-blue)' : 'transparent',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
          >
            <Link size={10} color={copied ? '#f5f0e8' : undefined} />
            <span style={{ color: copied ? '#f5f0e8' : undefined }}>
              {copied ? 'COPIED' : 'SHARE'}
            </span>
          </button>
        </div>

        {/* Metadata row */}
        <div
          className="detail-meta-grid"
          style={{
            border: '1px solid var(--color-gridline-heavy)',
          }}
        >
          {[
            { label: 'YEAR', value: entry.endYear ? `${entry.year}–${entry.endYear}` : String(entry.year) },
            { label: 'CATEGORY', value: entry.category },
            { label: 'TYPOLOGY', value: entry.typology ?? '—' },
            { label: 'DURATION', value: entry.duration ?? '—' },
          ].map((cell, i) => (
            <div
              key={cell.label}
              style={{
                padding: '8px 12px',
                borderRight:
                  i < 3
                    ? '1px solid var(--color-gridline-heavy)'
                    : 'none',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--color-primary-blue)',
                  opacity: 0.5,
                  marginBottom: '2px',
                }}
              >
                {cell.label}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: 'var(--color-dark-blue)',
                }}
              >
                {cell.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── BODY — 3-COLUMN GRID ─── */}
      <div
        className="detail-body-grid"
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
        }}
      >
        {/* Column 1 — METADATA SHEET */}
        <div
          className="detail-col-meta"
          style={{
            borderRight: '1px solid var(--color-gridline-heavy)',
            padding: '16px 0',
          }}
        >
          {[
            { label: 'CLIENT', value: entry.client },
            { label: 'LOCATION', value: entry.location },
            {
              label: 'COLLABORATORS',
              value: entry.collaborators?.join(', '),
            },
            { label: 'TOOLS', value: entry.tools?.join(', ') },
            { label: 'ORGANIZATION', value: entry.organization },
            { label: 'ROLE', value: entry.role },
            { label: 'STATUS', value: entry.status?.toUpperCase() },
          ].map((field) => (
            <div
              key={field.label}
              style={{
                display: 'flex',
                padding: '6px 16px',
                borderBottom: '1px solid var(--color-gridline)',
                gap: '12px',
              }}
            >
              <div
                className="detail-meta-label"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--color-primary-blue)',
                  opacity: 0.5,
                  flexShrink: 0,
                }}
              >
                {field.label}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: 'var(--color-dark-blue)',
                }}
              >
                {field.value ?? '—'}
              </div>
            </div>
          ))}
        </div>

        {/* Column 2 — DESCRIPTION + NOTES + TAGS */}
        <div
          style={{
            borderRight: '1px solid var(--color-gridline-heavy)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
          }}
        >
          {/* DESCRIPTION */}
          <div style={{ paddingBottom: '16px' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--color-primary-blue)',
                opacity: 0.5,
                marginBottom: '8px',
              }}
            >
              DESCRIPTION
            </div>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                lineHeight: 1.6,
                color: 'var(--color-dark-blue)',
                margin: 0,
              }}
            >
              {entry.description}
            </p>
          </div>

          {/* Heavy gridline separator */}
          <div
            style={{
              borderBottom: '2px solid var(--color-gridline-heavy)',
              marginBottom: '16px',
            }}
          />

          {/* NOTES */}
          {entry.notes && (
            <>
              <div style={{ paddingBottom: '16px' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--color-primary-blue)',
                    opacity: 0.5,
                    marginBottom: '8px',
                  }}
                >
                  NOTES
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    lineHeight: 1.6,
                    color: 'var(--color-dark-blue)',
                    opacity: 0.7,
                    fontStyle: 'italic',
                    margin: 0,
                  }}
                >
                  {entry.notes}
                </p>
              </div>
              <div
                style={{
                  borderBottom: '2px solid var(--color-gridline-heavy)',
                  marginBottom: '16px',
                }}
              />
            </>
          )}

          {/* TIMELINE FEED */}
          {entry.updates && entry.updates.length > 0 && (
            <>
              <div style={{ paddingBottom: '16px' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--color-primary-blue)',
                    opacity: 0.5,
                    marginBottom: '12px',
                  }}
                >
                  UPDATES
                </div>
                <div style={{ position: 'relative', paddingLeft: '20px' }}>
                  {/* Vertical timeline line */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '5px',
                      top: '6px',
                      bottom: '6px',
                      width: '1px',
                      backgroundColor: 'var(--color-gridline-heavy)',
                    }}
                  />
                  {entry.updates.map((update, i) => {
                    const date = new Date(update.date);
                    const dateStr = date.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    }).toUpperCase();
                    const typeLabel =
                      update.type === 'milestone'
                        ? 'MILESTONE'
                        : update.type === 'photo'
                          ? 'PHOTO'
                          : update.type === 'thought'
                            ? 'THOUGHT'
                            : 'NOTE';
                    const dotSize = update.type === 'milestone' ? 9 : 7;
                    const dotColor =
                      update.type === 'milestone'
                        ? 'var(--color-primary-blue)'
                        : update.type === 'thought'
                          ? 'var(--color-lighter-blue)'
                          : update.type === 'photo'
                            ? 'var(--color-light-blue)'
                            : 'var(--color-gridline-heavy)';

                    return (
                      <div
                        key={i}
                        style={{
                          position: 'relative',
                          paddingBottom: i < entry.updates!.length - 1 ? '14px' : '0',
                        }}
                      >
                        {/* Dot */}
                        <div
                          style={{
                            position: 'absolute',
                            left: `-${15 + dotSize / 2}px`,
                            top: '3px',
                            width: `${dotSize}px`,
                            height: `${dotSize}px`,
                            borderRadius: '50%',
                            backgroundColor: dotColor,
                            border: update.type === 'milestone' ? '2px solid var(--color-dark-blue)' : 'none',
                          }}
                        />
                        {/* Date + Type label */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '3px',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '10px',
                              letterSpacing: '0.06em',
                              color: 'var(--color-primary-blue)',
                              opacity: 0.5,
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {dateStr}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '9px',
                              letterSpacing: '0.08em',
                              color: dotColor,
                              border: `1px solid ${update.type === 'milestone' ? 'var(--color-primary-blue)' : 'var(--color-gridline)'}`,
                              padding: '1px 5px',
                              lineHeight: '1.4',
                            }}
                          >
                            {typeLabel}
                          </span>
                        </div>
                        {/* Update text */}
                        <p
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '12px',
                            lineHeight: 1.5,
                            color: 'var(--color-dark-blue)',
                            margin: 0,
                            fontStyle: update.type === 'thought' ? 'italic' : 'normal',
                            opacity: update.type === 'thought' ? 0.8 : 1,
                          }}
                        >
                          {update.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div
                style={{
                  borderBottom: '2px solid var(--color-gridline-heavy)',
                  marginBottom: '16px',
                }}
              />
            </>
          )}

          {/* TAGS */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--color-primary-blue)',
                opacity: 0.5,
                marginBottom: '8px',
              }}
            >
              TAGS
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    letterSpacing: '0.04em',
                    color: 'var(--color-primary-blue)',
                    border: '1px solid var(--color-gridline-heavy)',
                    padding: '3px 8px',
                    borderRadius: 0,
                    backgroundColor: 'var(--color-cell-bg)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3 — MEDIA GALLERY */}
        <div style={{ padding: '16px' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--color-primary-blue)',
              opacity: 0.5,
              marginBottom: '12px',
            }}
          >
            MEDIA
          </div>
          <div className="detail-media-grid">
            {media.map((item) => (
              <div key={item.index}>
                <div
                  onClick={() => setLightboxImage(item.url)}
                  style={{
                    position: 'relative',
                    border: '1px solid var(--color-primary-blue)',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    aspectRatio: '3/2',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.caption}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  {/* Frame number overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      backgroundColor: 'rgba(19, 39, 68, 0.7)',
                      color: '#f5f0e8',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      padding: '2px 5px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {String(item.index + 1).padStart(2, '0')}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--color-dark-blue)',
                    marginTop: '4px',
                  }}
                >
                  {item.caption}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--color-primary-blue)',
                    opacity: 0.5,
                    letterSpacing: '0.06em',
                  }}
                >
                  {item.fileType}
                </div>
              </div>
            ))}
          </div>

          {/* Voice Notes */}
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--color-primary-blue)',
              opacity: 0.5,
              marginTop: '20px',
              marginBottom: '8px',
            }}
          >
            VOICE NOTES
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {voiceNotes.map((vn) => {
              const mins = Math.floor(vn.duration / 60);
              const secs = vn.duration % 60;
              const timeStr = `${mins}:${String(secs).padStart(2, '0')}`;

              return (
                <button
                  key={vn.id}
                  onClick={() => onPlayVoiceNote?.(vn)}
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 10px',
                    border: '1px solid var(--color-gridline)',
                    backgroundColor: 'var(--color-cell-bg)',
                    fontFamily: 'var(--font-mono)',
                    transition: 'background-color 0.1s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-cell-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-cell-bg)';
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '22px',
                      height: '22px',
                      backgroundColor: 'var(--color-primary-blue)',
                      color: '#f5f0e8',
                      flexShrink: 0,
                    }}
                  >
                    <Play size={10} />
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--color-dark-blue)',
                      flex: 1,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {vn.label}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      color: 'var(--color-primary-blue)',
                      opacity: 0.6,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {timeStr}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mini Map */}
          {entry.coordinates && (
            <DetailMiniMap
              coordinates={entry.coordinates}
              label={entry.location}
            />
          )}
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      {!isFloating && (
        <div
          style={{
            borderTop: '1px solid var(--color-gridline-heavy)',
            padding: '10px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--color-cell-bg)',
            flexShrink: 0,
          }}
        >
          {/* Previous */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
            {prevEntry && (
              <button
                onClick={() => handleNavigate(prevEntry.slug)}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--color-primary-blue)',
                }}
              >
                <ChevronLeft size={12} />
                <span className="detail-nav-label">{prevEntry.title}</span>
              </button>
            )}
          </div>

          {/* Center — Return */}
          <button
            onClick={onClose}
            style={{
              all: 'unset',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--color-primary-blue)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            RETURN TO ARCHIVE
          </button>

          {/* Next */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            {nextEntry && (
              <button
                onClick={() => handleNavigate(nextEntry.slug)}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--color-primary-blue)',
                }}
              >
                <span className="detail-nav-label">{nextEntry.title}</span>
                <ChevronRight size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── LIGHTBOX ─── */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(19, 39, 68, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '80vw',
              maxHeight: '80vh',
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxImage(null);
              }}
              style={{
                position: 'absolute',
                top: '-32px',
                right: '0',
                background: 'none',
                border: 'none',
                color: '#f5f0e8',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxImage}
              alt="Enlarged view"
              style={{
                maxWidth: '80vw',
                maxHeight: '80vh',
                border: '1px solid var(--color-primary-blue)',
                display: 'block',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
