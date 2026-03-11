'use client';

import { Search } from 'lucide-react';
import type { FilterState, CategoryName } from '@/lib/types';

const ALL_CATEGORIES: CategoryName[] = [
  'Residential',
  'Urban Planning',
  'Interior Design',
  'Art Direction',
  'Modelling',
  'Artworks',
  'Hospitality',
  'Set Design',
  'Furniture',
  'Landscape',
];

interface FilterBarProps {
  filterState: FilterState;
  totalCount: number;
  filteredCount: number;
  onFilterChange: (state: FilterState) => void;
}

export default function FilterBar({
  filterState,
  totalCount,
  filteredCount,
  onFilterChange,
}: FilterBarProps) {
  const { categories, searchQuery, yearFrom, yearTo } = filterState;

  const toggleCategory = (cat: CategoryName) => {
    let next: CategoryName[];
    if (categories.includes(cat)) {
      next = categories.filter((c) => c !== cat);
    } else {
      next = [...categories, cat];
    }
    onFilterChange({ ...filterState, categories: next });
  };

  const selectAll = () => {
    onFilterChange({ ...filterState, categories: [] });
  };

  const isAllActive = categories.length === 0;

  const chipStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    padding: '4px 10px',
    border: '1px solid var(--color-primary-blue)',
    borderRadius: 0,
    backgroundColor: active ? 'var(--color-primary-blue)' : 'transparent',
    color: active ? '#f5f0e8' : 'var(--color-primary-blue)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background-color 0.1s, color 0.1s',
  });

  const cellInputStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    padding: '4px 8px',
    border: '1px solid rgba(44, 95, 138, 0.2)',
    borderRadius: 0,
    backgroundColor: 'var(--color-cell-bg)',
    color: 'var(--color-dark-blue)',
    outline: 'none',
    height: '28px',
  };

  return (
    <div
      style={{
        borderBottom: '1px solid rgba(44, 95, 138, 0.2)',
        backgroundColor: 'var(--color-background)',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* Row 1: Category chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
        <button onClick={selectAll} style={chipStyle(isAllActive)}>
          ALL
        </button>
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => toggleCategory(cat)}
            style={chipStyle(categories.includes(cat))}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Row 2: Search + Year range */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid rgba(44, 95, 138, 0.2)',
            backgroundColor: 'var(--color-cell-bg)',
            padding: '0 8px',
            height: '28px',
            flex: '1 1 200px',
            maxWidth: '360px',
          }}
        >
          <Search
            size={13}
            style={{ color: 'var(--color-primary-blue)', opacity: 0.5, flexShrink: 0 }}
          />
          <input
            type="text"
            placeholder="SEARCH TITLE / TAGS..."
            value={searchQuery}
            onChange={(e) =>
              onFilterChange({ ...filterState, searchQuery: e.target.value })
            }
            style={{
              ...cellInputStyle,
              border: 'none',
              backgroundColor: 'transparent',
              flex: 1,
              height: '100%',
              marginLeft: '6px',
            }}
          />
        </div>

        {/* Year range */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--color-primary-blue)',
          }}
        >
          <span style={{ opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            YEAR
          </span>
          <input
            type="number"
            placeholder="FROM"
            value={yearFrom ?? ''}
            onChange={(e) =>
              onFilterChange({
                ...filterState,
                yearFrom: e.target.value ? parseInt(e.target.value, 10) : null,
              })
            }
            style={{ ...cellInputStyle, width: '72px', textAlign: 'center' }}
          />
          <span style={{ opacity: 0.4 }}>&mdash;</span>
          <input
            type="number"
            placeholder="TO"
            value={yearTo ?? ''}
            onChange={(e) =>
              onFilterChange({
                ...filterState,
                yearTo: e.target.value ? parseInt(e.target.value, 10) : null,
              })
            }
            style={{ ...cellInputStyle, width: '72px', textAlign: 'center' }}
          />
        </div>
      </div>

      {/* Status bar */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--color-primary-blue)',
          opacity: 0.6,
          letterSpacing: '0.06em',
        }}
      >
        SHOWING {filteredCount} OF {totalCount} ENTRIES
      </div>
    </div>
  );
}
