'use client';

import type { SortField, SortDirection } from '@/lib/types';

interface ColumnHeaderProps {
  label: string;
  field: SortField;
  currentSort: SortField;
  currentDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export default function ColumnHeader({
  label,
  field,
  currentSort,
  currentDirection,
  onSort,
}: ColumnHeaderProps) {
  const isActive = currentSort === field;

  const handleClick = () => {
    onSort(field);
  };

  let indicator: string;
  let indicatorOpacity: number;

  if (!isActive) {
    indicator = '\u21D5';
    indicatorOpacity = 0.3;
  } else if (currentDirection === 'asc') {
    indicator = '\u2191';
    indicatorOpacity = 1;
  } else {
    indicator = '\u2193';
    indicatorOpacity = 1;
  }

  return (
    <th
      onClick={handleClick}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        padding: '0 12px',
        height: 'var(--size-cell-height)',
        backgroundColor: '#ece7dc',
        color: 'var(--color-dark-blue)',
        borderBottom: '2px solid rgba(44, 95, 138, 0.4)',
        borderRight: '1px solid rgba(44, 95, 138, 0.2)',
        cursor: 'pointer',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        textAlign: 'left',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        {label}
        <span style={{ opacity: indicatorOpacity, fontSize: '12px' }}>
          {indicator}
        </span>
      </span>
    </th>
  );
}
