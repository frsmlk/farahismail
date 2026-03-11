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
        height: '28px',
        minHeight: '28px',
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
        <span>KONTEKS KL</span>
      </div>
    </footer>
  );
}
