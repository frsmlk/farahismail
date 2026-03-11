'use client';

import OnlineStatus from '@/components/OnlineStatus';
import { status } from '@/lib/seed-data';

interface HeaderProps {
  onNavigate?: (tabId: string) => void;
}

export default function Header({ onNavigate }: HeaderProps) {
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
            FARAH
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
            ARCHITECT &middot; PHOTOGRAPHER &middot; ART DIRECTOR
          </span>
        </div>

        {/* Right side — Online status */}
        <OnlineStatus
          isOnline={status.isOnline}
          lastSeen={status.lastSeen}
          onNavigate={onNavigate}
        />
      </div>
    </header>
  );
}
