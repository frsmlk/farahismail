'use client';

import { useState, useMemo } from 'react';
import type { ArchiveEntry, SortField, SortDirection } from '@/lib/types';
import { CATEGORIES } from '@/lib/design-system';
import ColumnHeader from '@/components/ColumnHeader';

interface SpreadsheetTableProps {
  entries: ArchiveEntry[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onRowClick: (slug: string) => void;
}

function getCategoryColor(categoryName: string): string {
  const cat = CATEGORIES.find((c) => c.name === categoryName);
  return cat ? cat.color : 'var(--color-primary-blue)';
}

const cellBorder = '1px solid rgba(44, 95, 138, 0.2)';

const nonSortableHeaderStyle: React.CSSProperties = {
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
  textAlign: 'left',
  position: 'sticky',
  top: 0,
  zIndex: 10,
};

const groupHeaderStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  padding: '0 12px',
  height: '32px',
  backgroundColor: 'rgba(44, 95, 138, 0.06)',
  color: 'var(--color-primary-blue)',
  borderBottom: '2px solid rgba(44, 95, 138, 0.4)',
};

function renderRows(
  entries: ArchiveEntry[],
  startIndex: number,
  selectedSlug: string | null,
  handleRowClick: (slug: string) => void,
) {
  return entries.map((entry, i) => {
    const globalIndex = startIndex + i;
    const isSelected = selectedSlug === entry.slug;
    const isEven = globalIndex % 2 === 0;
    const rowBg = isSelected
      ? '#eee9df'
      : isEven
        ? '#faf7f2'
        : '#f5f0e8';

    return (
      <tr
        key={entry.id}
        onClick={() => handleRowClick(entry.slug)}
        style={{
          cursor: 'pointer',
          backgroundColor: rowBg,
          borderLeft: isSelected ? '3px solid #2c5f8a' : '3px solid transparent',
          transition: 'background-color 0.1s',
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = 'rgba(44, 95, 138, 0.1)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = rowBg;
        }}
      >
        {/* Row number */}
        <td
          style={{
            width: '48px',
            textAlign: 'right',
            paddingRight: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--color-primary-blue)',
            opacity: 0.5,
            borderBottom: cellBorder,
            borderRight: cellBorder,
            height: 'var(--size-cell-height)',
          }}
        >
          {globalIndex + 1}
        </td>
        {/* Year */}
        <td
          style={{
            padding: '0 12px',
            borderBottom: cellBorder,
            borderRight: cellBorder,
            height: 'var(--size-cell-height)',
            color: 'var(--color-dark-blue)',
          }}
        >
          {entry.year}
          {entry.endYear ? `–${entry.endYear}` : ''}
        </td>
        {/* Title */}
        <td
          style={{
            padding: '0 12px',
            borderBottom: cellBorder,
            borderRight: cellBorder,
            height: 'var(--size-cell-height)',
            color: 'var(--color-dark-blue)',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {entry.title}
        </td>
        {/* Category */}
        <td
          style={{
            padding: '0 12px',
            borderBottom: cellBorder,
            borderRight: cellBorder,
            height: 'var(--size-cell-height)',
            color: getCategoryColor(entry.category),
            fontWeight: 500,
            fontSize: '12px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {entry.category}
        </td>
        {/* Typology */}
        <td
          style={{
            padding: '0 12px',
            borderBottom: cellBorder,
            borderRight: cellBorder,
            height: 'var(--size-cell-height)',
            color: 'var(--color-dark-blue)',
            fontSize: '12px',
            opacity: 0.8,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {entry.typology ?? '—'}
        </td>
        {/* Duration */}
        <td
          style={{
            padding: '0 12px',
            borderBottom: cellBorder,
            borderRight: cellBorder,
            height: 'var(--size-cell-height)',
            color: 'var(--color-dark-blue)',
            fontSize: '12px',
            opacity: 0.7,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {entry.duration ?? '—'}
        </td>
        {/* Tags */}
        <td
          style={{
            padding: '0 12px',
            borderBottom: cellBorder,
            borderRight: cellBorder,
            height: 'var(--size-cell-height)',
            color: 'var(--color-primary-blue)',
            fontSize: '11px',
            opacity: 0.7,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {entry.tags.join(', ')}
        </td>
        {/* Status */}
        <td
          style={{
            padding: '0 12px',
            borderBottom: cellBorder,
            height: 'var(--size-cell-height)',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color:
              entry.status === 'ongoing'
                ? 'var(--color-primary-blue)'
                : 'var(--color-dark-blue)',
            opacity: entry.status === 'ongoing' ? 1 : 0.4,
          }}
        >
          {entry.status}
        </td>
      </tr>
    );
  });
}

export default function SpreadsheetTable({
  entries,
  sortField,
  sortDirection,
  onSort,
  onRowClick,
}: SpreadsheetTableProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const handleRowClick = (slug: string) => {
    setSelectedSlug(slug);
    onRowClick(slug);
  };

  const ongoing = useMemo(() => entries.filter((e) => e.status === 'ongoing'), [entries]);
  const rest = useMemo(() => entries.filter((e) => e.status !== 'ongoing'), [entries]);

  return (
    <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1 }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          tableLayout: 'fixed',
          minWidth: '900px',
        }}
      >
        <colgroup>
          <col style={{ width: '48px' }} />
          <col style={{ width: '70px' }} />
          <col style={{ width: 'auto' }} />
          <col style={{ width: '160px' }} />
          <col style={{ width: '150px' }} />
          <col style={{ width: '100px' }} />
          <col style={{ width: '200px' }} />
          <col style={{ width: '90px' }} />
        </colgroup>
        <thead>
          <tr>
            <th
              style={{
                width: '48px',
                backgroundColor: '#ece7dc',
                borderBottom: '2px solid rgba(44, 95, 138, 0.4)',
                borderRight: '1px solid rgba(44, 95, 138, 0.2)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: 'var(--color-dark-blue)',
                textAlign: 'center',
                padding: '0 4px',
                height: 'var(--size-cell-height)',
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              #
            </th>
            <ColumnHeader label="Year" field="year" currentSort={sortField} currentDirection={sortDirection} onSort={onSort} />
            <ColumnHeader label="Title" field="title" currentSort={sortField} currentDirection={sortDirection} onSort={onSort} />
            <ColumnHeader label="Category" field="category" currentSort={sortField} currentDirection={sortDirection} onSort={onSort} />
            <th style={nonSortableHeaderStyle}>Typology</th>
            <th style={nonSortableHeaderStyle}>Duration</th>
            <th style={nonSortableHeaderStyle}>Tags</th>
            <th style={{ ...nonSortableHeaderStyle, borderRight: 'none' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {/* ONGOING group */}
          {ongoing.length > 0 && (
            <>
              <tr>
                <td
                  colSpan={8}
                  style={groupHeaderStyle}
                >
                  ONGOING — {ongoing.length} {ongoing.length === 1 ? 'ENTRY' : 'ENTRIES'}
                </td>
              </tr>
              {renderRows(ongoing, 0, selectedSlug, handleRowClick)}
            </>
          )}

          {/* REST group */}
          {rest.length > 0 && (
            <>
              <tr>
                <td
                  colSpan={8}
                  style={groupHeaderStyle}
                >
                  ARCHIVE — {rest.length} {rest.length === 1 ? 'ENTRY' : 'ENTRIES'}
                </td>
              </tr>
              {renderRows(rest, ongoing.length, selectedSlug, handleRowClick)}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
