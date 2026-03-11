import { Instagram } from 'lucide-react';

interface FooterProps {
  activeTab: string;
  rowCount: number;
  filterStatus?: string;
}

export default function Footer({
  activeTab,
  rowCount,
  filterStatus,
}: FooterProps) {
  return (
    <footer
      className="flex w-full items-center justify-between px-4 bg-cell-bg text-primary-blue"
      style={{
        height: 'calc(28px + env(safe-area-inset-bottom, 0px))',
        minHeight: 'calc(28px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        borderTop: '1px solid var(--color-gridline-heavy)',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        letterSpacing: '0.04em',
      }}
    >
      <div className="flex items-center gap-4">
        <span
          style={{
            fontVariantCaps: 'all-small-caps',
          }}
        >
          {activeTab.toUpperCase()}
        </span>
        <span style={{ opacity: 0.4 }}>|</span>
        <span>
          {rowCount} {rowCount === 1 ? 'ENTRY' : 'ENTRIES'}
        </span>
      </div>
      <div className="flex items-center gap-4">
        {filterStatus && (
          <>
            <span style={{ opacity: 0.4 }}>|</span>
            <span>{filterStatus}</span>
          </>
        )}
        <span style={{ opacity: 0.4 }}>|</span>
        <a href="https://instagram.com/kingfrh" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Instagram size={12} />
          @kingfrh
        </a>
        <span style={{ opacity: 0.4 }}>·</span>
        <a href="https://x.com/kingfrh" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          @kingfrh
        </a>
      </div>
    </footer>
  );
}
