import type { ReactNode } from 'react';

interface GridContainerProps {
  children: ReactNode;
  showRowNumbers?: boolean;
  rowCount?: number;
}

export default function GridContainer({
  children,
  showRowNumbers = false,
  rowCount = 0,
}: GridContainerProps) {
  return (
    <div className="flex flex-1 overflow-auto">
      {/* Row number gutter */}
      {showRowNumbers && (
        <div
          className="shrink-0"
          style={{
            width: 'var(--size-row-number-width)',
            backgroundColor: 'rgba(44, 95, 138, 0.05)',
            borderRight: '1px solid var(--color-gridline-heavy)',
          }}
        >
          {Array.from({ length: rowCount }, (_, i) => (
            <div
              key={i}
              className="flex items-center justify-center text-primary-blue"
              style={{
                height: 'var(--size-cell-height)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                opacity: 0.5,
                borderBottom: '1px solid var(--color-gridline)',
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
