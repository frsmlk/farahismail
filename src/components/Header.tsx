'use client';

import OnlineStatus from '@/components/OnlineStatus';
import type { ArchiveEntry } from '@/lib/types';

interface HeaderProps {
  onNavigate?: (tabId: string) => void;
  isOnline: boolean;
  lastSeen: string;
  currentActivity?: string;
  archiveEntries?: ArchiveEntry[];
  fullName?: string;
  roles?: string[];
}

export default function Header({ onNavigate, isOnline, lastSeen, currentActivity, archiveEntries, fullName, roles }: HeaderProps) {
  return (
    <header
      className="w-full bg-cell-bg"
      style={{
        borderBottom: '2px solid var(--color-gridline-heavy)',
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side — Name and roles */}
        <div className="flex flex-col">
          <h1
            className="text-dark-blue"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '28px',
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            {fullName
              ? fullName.split(' ').map((w) => w[0]).join('.').toUpperCase() + '.'
              : 'F.A.'}
          </h1>
          <span
            className="text-primary-blue"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontVariantCaps: 'all-small-caps',
              letterSpacing: '0.08em',
              marginTop: '4px',
            }}
          >
            {roles && roles.length > 0
              ? roles.map((r) => r.toUpperCase()).join(' \u00B7 ')
              : ''}
          </span>
        </div>

        {/* Right side — Online status */}
        <OnlineStatus
          isOnline={isOnline}
          lastSeen={lastSeen}
          currentActivity={currentActivity}
          archiveEntries={archiveEntries}
          onNavigate={onNavigate}
        />
      </div>
    </header>
  );
}
