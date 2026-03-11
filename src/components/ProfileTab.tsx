'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { profile, archiveEntries, status } from '@/lib/seed-data';

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

function getDisciplineSummary(): {
  discipline: string;
  entries: number;
}[] {
  return [
    { discipline: 'Art Direction', entries: 18 },
    { discipline: 'Residential', entries: 16 },
    { discipline: 'Interior Design', entries: 12 },
    { discipline: 'Modelling', entries: 11 },
    { discipline: 'Landscape', entries: 9 },
    { discipline: 'Hospitality', entries: 8 },
    { discipline: 'Urban Planning', entries: 6 },
    { discipline: 'Artworks', entries: 5 },
    { discipline: 'Set Design', entries: 4 },
    { discipline: 'Furniture', entries: 3 },
  ];
}

interface ActivityItem {
  date: string;
  text: string;
  type: 'note' | 'milestone' | 'photo' | 'thought';
  entryTitle: string;
  entrySlug: string;
}

/* ─── Shared styles ──────────────────────────────────────────────────────── */

const BORDER = '1px solid var(--color-gridline)';
const BORDER_HEAVY = '1px solid var(--color-gridline-heavy)';

/* ─── Panel header ───────────────────────────────────────────────────────── */

function PanelHeader({
  title,
  cellRef,
  style,
}: {
  title: string;
  cellRef: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 12px',
        height: 28,
        minHeight: 28,
        backgroundColor: 'rgba(44, 95, 138, 0.06)',
        borderBottom: BORDER_HEAVY,
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--color-primary-blue)',
        flexShrink: 0,
        ...style,
      }}
    >
      <span>{title}</span>
      <span
        style={{
          fontSize: '9px',
          opacity: 0.25,
          letterSpacing: '0.04em',
          fontWeight: 400,
        }}
      >
        {cellRef}
      </span>
    </div>
  );
}

/* ─── Form types ─────────────────────────────────────────────────────────── */

type FormStatus = 'idle' | 'sending' | 'sent' | 'error';

/* ─── Component ──────────────────────────────────────────────────────────── */

interface ProfileTabProps {
  onNavigate?: (tabId: string) => void;
}

export default function ProfileTab({ onNavigate }: ProfileTabProps) {
  /* ── Practice panel state ── */
  const [showAllDisciplines, setShowAllDisciplines] = useState(false);

  /* ── Website copy state ── */
  const [websiteCopied, setWebsiteCopied] = useState(false);

  /* ── Form state ── */
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (statusTimer.current) clearTimeout(statusTimer.current);
    };
  }, []);

  const handleSubmit = useCallback(() => {
    if (!formName.trim() || !formEmail.trim() || !formMessage.trim()) return;
    setFormStatus('sending');
    setTimeout(() => {
      setFormStatus('sent');
      setFormName('');
      setFormEmail('');
      setFormSubject('');
      setFormMessage('');
      statusTimer.current = setTimeout(() => setFormStatus('idle'), 3000);
    }, 1200);
  }, [formName, formEmail, formMessage]);

  const handleClear = useCallback(() => {
    setFormName('');
    setFormEmail('');
    setFormSubject('');
    setFormMessage('');
    setFocusedField(null);
    setFormStatus('idle');
  }, []);

  const canSubmit =
    formStatus === 'idle' &&
    formName.trim() !== '' &&
    formEmail.trim() !== '' &&
    formMessage.trim() !== '';

  /* ── Computed data ── */
  const disciplineSummary = useMemo(() => getDisciplineSummary(), []);
  const maxEntries = useMemo(
    () => Math.max(...disciplineSummary.map((d) => d.entries)),
    [disciplineSummary]
  );

  const recentWork = useMemo(() => {
    return [...archiveEntries]
      .filter((e) => e.entryType === 'project')
      .sort((a, b) => b.year - a.year)
      .slice(0, 5);
  }, []);

  const activityFeed = useMemo((): ActivityItem[] => {
    const all: ActivityItem[] = [];
    for (const entry of archiveEntries) {
      if (entry.updates) {
        for (const update of entry.updates) {
          all.push({
            ...update,
            entryTitle: entry.title,
            entrySlug: entry.slug,
          });
        }
      }
    }
    return all.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, []);

  /* ── Stats ── */
  const totalEntries = archiveEntries.filter(
    (e) => e.entryType === 'project'
  ).length;
  const categoryCount = new Set(archiveEntries.map((e) => e.category)).size;
  const years = archiveEntries.map((e) => e.year);
  const yearRange = `${Math.min(...years)}\u2013${Math.max(...years)}`;

  /* ── Form helpers ── */
  const inquiryTitle =
    formStatus === 'sent'
      ? 'Received \u2014 I\u2019ll be in touch'
      : formStatus === 'error'
        ? 'DELIVERY FAILED'
        : 'INQUIRY';
  const inquiryColor =
    formStatus === 'sent'
      ? 'var(--color-light-blue)'
      : formStatus === 'error'
        ? '#ef4444'
        : undefined;

  const formFields = [
    {
      field: 'name',
      label: 'YOUR NAME',
      value: formName,
      setter: setFormName,
      placeholder: 'Enter your name...',
    },
    {
      field: 'email',
      label: 'YOUR EMAIL',
      value: formEmail,
      setter: setFormEmail,
      placeholder: 'Enter your email...',
    },
    {
      field: 'subject',
      label: 'SUBJECT',
      value: formSubject,
      setter: setFormSubject,
      placeholder: 'What is this regarding...',
    },
    {
      field: 'message',
      label: 'MESSAGE',
      value: formMessage,
      setter: setFormMessage,
      placeholder: 'Write your message...',
      multiline: true as const,
    },
  ];

  /* ── Render ── */
  return (
    <div
      className="profile-dashboard"
      style={{ overflow: 'auto', height: '100%' }}
    >
      {/* ═══════════════════════════════════════════════════════════════════════
          ROW 1 — HERO
          ═══════════════════════════════════════════════════════════════════════ */}

      {/* ─── IDENTITY PANEL ─── */}
      <div
        className="panel-identity"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <PanelHeader title="Card" cellRef="A1:B6" />
        <div
          style={{
            flex: 1,
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* Name */}
          <div style={{ marginBottom: '20px' }}>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '38px',
                fontWeight: 700,
                color: 'var(--color-dark-blue)',
                lineHeight: 0.95,
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              FARAH
            </h1>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '38px',
                fontWeight: 700,
                color: 'var(--color-dark-blue)',
                lineHeight: 0.95,
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              ISMAIL
            </h1>
          </div>

          {/* Roles */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              marginBottom: '20px',
            }}
          >
            {profile.roles.map((role, i) => (
              <div
                key={role}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--color-primary-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    opacity: 0.3,
                    fontSize: '10px',
                    width: '16px',
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{role}</span>
              </div>
            ))}
          </div>

          {/* Separator */}
          <div style={{ borderBottom: BORDER_HEAVY, marginBottom: '14px' }} />

          {/* Location */}
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.04em',
              color: 'var(--color-dark-blue)',
              marginBottom: '8px',
            }}
          >
            {profile.location}
          </div>

          {/* Contact button */}
          <button
            onClick={() => {
              const inquiryPanel = document.querySelector('.panel-inquiry');
              if (inquiryPanel) {
                inquiryPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const firstInput = inquiryPanel.querySelector('input');
                if (firstInput) setTimeout(() => firstInput.focus(), 400);
              }
            }}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#f5f0e8',
              backgroundColor: 'var(--color-primary-blue)',
              border: '1px solid var(--color-gridline-heavy)',
              padding: '7px 20px',
              width: 'fit-content',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-dark-blue)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-blue)';
            }}
          >
            CONTACT
          </button>
        </div>
      </div>

      {/* ─── STATEMENT PANEL ─── */}
      <div
        className="panel-statement"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <PanelHeader title="About" cellRef="C1:F6" />
        <div
          style={{
            flex: 1,
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '14px',
              lineHeight: 1.75,
              color: 'var(--color-dark-blue)',
              margin: 0,
              maxWidth: '560px',
            }}
          >
            {profile.bio}
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          STATS RIBBON
          ═══════════════════════════════════════════════════════════════════════ */}
      <div
        className="panel-stats"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          padding: '0 16px',
          height: '28px',
          minHeight: '28px',
          backgroundColor: 'rgba(44, 95, 138, 0.04)',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--color-primary-blue)',
        }}
      >
        <span>{totalEntries} PROJECTS</span>
        <span style={{ opacity: 0.3 }}>·</span>
        <span>{categoryCount} CATEGORIES</span>
        <span style={{ opacity: 0.3 }}>·</span>
        <span>{yearRange}</span>
        <span style={{ opacity: 0.3 }}>·</span>
        <span>{profile.basedIn.toUpperCase()}</span>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          ROW 2 — DATA
          ═══════════════════════════════════════════════════════════════════════ */}

      {/* ─── DISCIPLINES PANEL ─── */}
      <div
        className="panel-disciplines"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <PanelHeader title="Practice" cellRef="A8:B14" />
        <div style={{ flex: 1, padding: '4px 0' }}>
          {(() => {
            const sorted = [...disciplineSummary].sort((a, b) => b.entries - a.entries);
            const top = sorted.slice(0, 4);
            const rest = sorted.slice(4);
            const visible = showAllDisciplines ? sorted : top;
            const othersCount = rest.reduce((sum, d) => sum + d.entries, 0);

            return (
              <>
                {visible.map((d, i) => {
                  const isLast = showAllDisciplines
                    ? i === visible.length - 1
                    : rest.length === 0 && i === visible.length - 1;
                  return (
                  <div
                    key={d.discipline}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '6px 12px',
                      gap: '10px',
                      borderBottom: isLast ? 'none' : BORDER,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        color: 'var(--color-dark-blue)',
                        width: '130px',
                        minWidth: '130px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {d.discipline}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: '4px',
                        backgroundColor: 'var(--color-gridline)',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        className="practice-bar"
                        style={{
                          height: '100%',
                          width: `${(d.entries / maxEntries) * 100}%`,
                          backgroundColor: 'var(--color-primary-blue)',
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: 'var(--color-primary-blue)',
                        width: '16px',
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                        flexShrink: 0,
                      }}
                    >
                      {d.entries}
                    </span>
                  </div>
                  );
                })}
                {rest.length > 0 && !showAllDisciplines && (
                  <div
                    onClick={() => setShowAllDisciplines(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '6px 12px',
                      gap: '10px',
                      cursor: 'pointer',
                      transition: 'background-color 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-cell-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        color: 'var(--color-primary-blue)',
                        opacity: 0.5,
                        width: '130px',
                        minWidth: '130px',
                      }}
                    >
                      Others ({rest.length})
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: 'var(--color-primary-blue)',
                        opacity: 0.35,
                        letterSpacing: '0.04em',
                      }}
                    >
                      +{othersCount} entries
                    </span>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* ─── RECENT WORK PANEL ─── */}
      <div
        className="panel-recent"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <PanelHeader title="Recent Work" cellRef="C8:D14" />
        <div style={{ flex: 1 }}>
          {recentWork.map((entry, i) => (
            <div
              key={entry.id}
              onClick={() => onNavigate?.(`detail/${entry.slug}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '7px 12px',
                gap: '10px',
                borderBottom: i < recentWork.length - 1 ? BORDER : 'none',
                cursor: 'pointer',
                transition: 'background-color 0.1s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  'var(--color-cell-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--color-primary-blue)',
                  opacity: 0.3,
                  width: '16px',
                  textAlign: 'right',
                  flexShrink: 0,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--color-dark-blue)',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {entry.title}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--color-primary-blue)',
                  opacity: 0.5,
                  fontVariantNumeric: 'tabular-nums',
                  flexShrink: 0,
                }}
              >
                {entry.year}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── ACTIVITY FEED PANEL ─── */}
      <div
        className="panel-activity"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <PanelHeader title="Activity" cellRef="E8:F14" />
        <div style={{ flex: 1 }}>
          {activityFeed.map((item, i) => {
            const date = new Date(item.date);
            const dateStr = date
              .toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
              })
              .toUpperCase();

            return (
              <div
                key={i}
                onClick={() => onNavigate?.(`detail/${item.entrySlug}`)}
                style={{
                  padding: '6px 12px',
                  borderBottom:
                    i < activityFeed.length - 1 ? BORDER : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.1s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'var(--color-cell-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* Date + badge + source */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '2px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      letterSpacing: '0.04em',
                      color: 'var(--color-primary-blue)',
                      opacity: 0.5,
                      fontVariantNumeric: 'tabular-nums',
                      flexShrink: 0,
                    }}
                  >
                    {dateStr}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9px',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color:
                        item.type === 'milestone'
                          ? 'var(--color-primary-blue)'
                          : 'var(--color-lighter-blue)',
                      border: `1px solid ${item.type === 'milestone' ? 'var(--color-gridline-heavy)' : 'var(--color-gridline)'}`,
                      padding: '0px 4px',
                      lineHeight: '1.4',
                      flexShrink: 0,
                    }}
                  >
                    {item.type.toUpperCase()}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9px',
                      color: 'var(--color-primary-blue)',
                      opacity: 0.35,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.entryTitle}
                  </span>
                </div>
                {/* Text */}
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--color-dark-blue)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontStyle:
                      item.type === 'thought' ? 'italic' : 'normal',
                    opacity: item.type === 'thought' ? 0.8 : 1,
                  }}
                >
                  {item.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          ROW 3 — CONTACT
          ═══════════════════════════════════════════════════════════════════════ */}

      {/* ─── CONTACT PANEL ─── */}
      <div
        className="panel-contact"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <PanelHeader title="Contact" cellRef="A16:B20" />
        <div style={{ flex: 1, padding: '4px 0' }}>
          {[
            {
              label: 'EMAIL',
              value: profile.email,
              href: `mailto:${profile.email}`,
            },
            {
              label: 'INSTAGRAM',
              value: profile.instagram,
              href: `https://instagram.com/${profile.instagram.replace('@', '')}`,
            },
            {
              label: 'X',
              value: '@kingfrh',
              href: 'https://x.com/kingfrh',
            },
            {
              label: 'WEBSITE',
              value: profile.website,
              href: `https://${profile.website}`,
              copyToClipboard: true,
            },
          ].map((link, i) => (
            <div
              key={link.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 12px',
                gap: '12px',
                borderBottom: i < 3 ? BORDER : 'none',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'var(--color-primary-blue)',
                  opacity: 0.5,
                  width: '80px',
                  minWidth: '80px',
                  flexShrink: 0,
                }}
              >
                {link.label}
              </span>
              {'copyToClipboard' in link && link.copyToClipboard ? (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(link.href).then(() => {
                      setWebsiteCopied(true);
                      setTimeout(() => setWebsiteCopied(false), 1500);
                    });
                  }}
                  style={{
                    all: 'unset',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: websiteCopied ? 'var(--color-light-blue)' : 'var(--color-primary-blue)',
                    cursor: 'pointer',
                    transition: 'color 0.15s ease',
                  }}
                >
                  {websiteCopied ? 'Website copied to clipboard' : link.value}
                </button>
              ) : (
                <a
                  href={link.href}
                  target={
                    link.href.startsWith('mailto') ? undefined : '_blank'
                  }
                  rel={
                    link.href.startsWith('mailto')
                      ? undefined
                      : 'noopener noreferrer'
                  }
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--color-primary-blue)',
                    textDecoration: 'none',
                  }}
                >
                  {link.value}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── INQUIRY PANEL ─── */}
      <div
        className="panel-inquiry profile-form"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <PanelHeader
          title={inquiryTitle}
          cellRef="C16:F20"
          style={
            inquiryColor
              ? { color: inquiryColor, transition: 'color 0.3s ease' }
              : { transition: 'color 0.3s ease' }
          }
        />
        <div style={{ flex: 1, padding: '4px 0' }}>
          {formFields.map((f) => (
            <div
              key={f.field}
              style={{
                display: 'flex',
                alignItems: f.multiline ? 'flex-start' : 'center',
                padding: f.multiline ? '6px 12px' : '0 12px',
                gap: '12px',
                borderBottom: BORDER,
                height: f.multiline ? 'auto' : '32px',
                borderLeft:
                  focusedField === f.field
                    ? '2px solid var(--color-primary-blue)'
                    : '2px solid transparent',
                backgroundColor:
                  focusedField === f.field
                    ? 'var(--color-cell-active)'
                    : 'transparent',
                transition:
                  'background-color 0.12s ease, border-left-color 0.12s ease',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'var(--color-primary-blue)',
                  opacity: 0.5,
                  width: '90px',
                  minWidth: '90px',
                  lineHeight: f.multiline ? '1.6' : '32px',
                  paddingTop: f.multiline ? '2px' : 0,
                  flexShrink: 0,
                }}
              >
                {f.label}
              </span>
              {f.multiline ? (
                <textarea
                  value={f.value}
                  onChange={(e) => f.setter(e.target.value)}
                  onFocus={() => setFocusedField(f.field)}
                  onBlur={() => setFocusedField(null)}
                  placeholder={f.placeholder}
                  disabled={formStatus === 'sending'}
                  rows={3}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    color: 'var(--color-dark-blue)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    resize: 'none',
                    lineHeight: '1.6',
                    padding: '4px 0',
                    margin: 0,
                  }}
                />
              ) : (
                <input
                  type={f.field === 'email' ? 'email' : 'text'}
                  value={f.value}
                  onChange={(e) => f.setter(e.target.value)}
                  onFocus={() => setFocusedField(f.field)}
                  onBlur={() => setFocusedField(null)}
                  placeholder={f.placeholder}
                  disabled={formStatus === 'sending'}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    color: 'var(--color-dark-blue)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    height: '32px',
                    padding: 0,
                    margin: 0,
                  }}
                />
              )}
            </div>
          ))}

          {/* Action row */}
          <div style={{ padding: '8px 12px', display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: canSubmit
                  ? '#f5f0e8'
                  : 'var(--color-primary-blue)',
                backgroundColor: canSubmit
                  ? 'var(--color-primary-blue)'
                  : 'transparent',
                border: BORDER_HEAVY,
                padding: '6px 16px',
                cursor: canSubmit ? 'pointer' : 'default',
                opacity: canSubmit ? 1 : 0.4,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (canSubmit)
                  e.currentTarget.style.backgroundColor =
                    'var(--color-dark-blue)';
              }}
              onMouseLeave={(e) => {
                if (canSubmit)
                  e.currentTarget.style.backgroundColor =
                    'var(--color-primary-blue)';
              }}
            >
              <span
                style={
                  formStatus === 'sending'
                    ? {
                        animation:
                          'sending-pulse 1s ease-in-out infinite',
                      }
                    : undefined
                }
              >
                {formStatus === 'sending' ? 'SENDING...' : 'SEND \u25B8'}
              </span>
            </button>
            <button
              onClick={handleClear}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-primary-blue)',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-gridline)',
                padding: '6px 16px',
                cursor: 'pointer',
                opacity: 0.6,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.borderColor =
                  'var(--color-gridline-heavy)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.6';
                e.currentTarget.style.borderColor =
                  'var(--color-gridline)';
              }}
            >
              CLEAR &times;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
