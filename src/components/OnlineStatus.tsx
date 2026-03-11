'use client';

import { useState } from 'react';
import { status, archiveEntries } from '@/lib/seed-data';

interface OnlineStatusProps {
  isOnline: boolean;
  lastSeen?: string;
  onNavigate?: (tabId: string) => void;
}

export default function OnlineStatus({ isOnline, lastSeen, onNavigate }: OnlineStatusProps) {
  const [showCard, setShowCard] = useState(false);

  const label = isOnline
    ? 'ACTIVE WORK'
    : lastSeen
      ? `LAST SEEN ${formatLastSeen(lastSeen)}`
      : 'OFFLINE';

  // Find the ongoing project to feature
  const ongoingProject = archiveEntries.find((e) => e.status === 'ongoing');

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowCard(true)}
      onMouseLeave={() => setShowCard(false)}
    >
      {/* Status indicator */}
      <div className="flex items-center gap-2" style={{ cursor: 'default' }}>
        <span className="relative flex h-[8px] w-[8px]">
          {isOnline && (
            <span
              className="absolute inline-flex h-full w-full"
              style={{
                backgroundColor: 'var(--color-light-blue)',
                animation: 'pulse-dot 2s ease-in-out infinite',
              }}
            />
          )}
          <span
            className="relative inline-flex h-[8px] w-[8px]"
            style={{
              backgroundColor: isOnline ? 'var(--color-light-blue)' : '#9ca3af',
            }}
          />
        </span>
        <span
          className="text-primary-blue"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontVariantCaps: 'all-small-caps',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </span>
      </div>

      {/* Hover card */}
      {showCard && isOnline && ongoingProject && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            width: '280px',
            backgroundColor: 'var(--color-cell-bg)',
            border: '1px solid var(--color-gridline-heavy)',
            fontFamily: 'var(--font-mono)',
            zIndex: 100,
            cursor: onNavigate ? 'pointer' : 'default',
          }}
          onClick={() => {
            if (onNavigate) {
              onNavigate(`detail/${ongoingProject.slug}`);
              setShowCard(false);
            }
          }}
        >
          {/* Activity label */}
          <div
            style={{
              padding: '8px 12px 4px',
              fontSize: '10px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-primary-blue)',
              opacity: 0.6,
            }}
          >
            CURRENTLY WORKING ON
          </div>

          {/* Project info */}
          <div style={{ padding: '0 12px 10px' }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--color-dark-blue)',
                marginBottom: '4px',
              }}
            >
              {ongoingProject.title}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--color-primary-blue)',
                opacity: 0.7,
                display: 'flex',
                gap: '8px',
              }}
            >
              <span>{ongoingProject.category}</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>{ongoingProject.location ?? ongoingProject.typology}</span>
            </div>
          </div>

          {/* Status bar */}
          <div
            style={{
              borderTop: '1px solid var(--color-gridline)',
              padding: '6px 12px',
              fontSize: '10px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--color-primary-blue)',
              opacity: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {status.currentActivity}
          </div>
        </div>
      )}
    </div>
  );
}

function formatLastSeen(dateString: string): string {
  const now = new Date();
  const then = new Date(dateString);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) return `${diffMins}M AGO`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}H AGO`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}D AGO`;
}
