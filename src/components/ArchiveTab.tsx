'use client';

import { useReducer, useMemo, useEffect } from 'react';
import type { FilterState, CategoryName, SortField, ArchiveEntry } from '@/lib/types';
import FilterBar from '@/components/FilterBar';
import SpreadsheetTable from '@/components/SpreadsheetTable';
import MapView from '@/components/MapView';

export type ViewMode = 'list' | 'map';

type FilterAction =
  | { type: 'SET_CATEGORIES'; categories: CategoryName[] }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'SET_YEAR_RANGE'; yearFrom: number | null; yearTo: number | null }
  | { type: 'SET_SORT'; field: SortField }
  | { type: 'SET_FILTER_STATE'; state: FilterState }
  | { type: 'CLEAR_FILTERS' };

const initialState: FilterState = {
  categories: [],
  searchQuery: '',
  yearFrom: null,
  yearTo: null,
  sortField: 'year',
  sortDirection: 'desc',
};

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'SET_CATEGORIES':
      return { ...state, categories: action.categories };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query };
    case 'SET_YEAR_RANGE':
      return { ...state, yearFrom: action.yearFrom, yearTo: action.yearTo };
    case 'SET_SORT': {
      if (state.sortField === action.field) {
        if (state.sortDirection === 'asc') {
          return { ...state, sortDirection: 'desc' };
        }
        return { ...state, sortField: 'year', sortDirection: 'desc' };
      }
      return { ...state, sortField: action.field, sortDirection: 'asc' };
    }
    case 'SET_FILTER_STATE':
      return action.state;
    case 'CLEAR_FILTERS':
      return initialState;
    default:
      return state;
  }
}

function filterEntries(entries: ArchiveEntry[], state: FilterState): ArchiveEntry[] {
  let filtered = entries;

  if (state.categories.length > 0) {
    filtered = filtered.filter((e) => state.categories.includes(e.category));
  }

  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.tags.join(' ').toLowerCase().includes(q)
    );
  }

  if (state.yearFrom !== null) {
    filtered = filtered.filter((e) => e.year >= state.yearFrom!);
  }
  if (state.yearTo !== null) {
    filtered = filtered.filter((e) => e.year <= state.yearTo!);
  }

  return filtered;
}

function sortEntries(entries: ArchiveEntry[], state: FilterState): ArchiveEntry[] {
  const sorted = [...entries];
  const dir = state.sortDirection === 'asc' ? 1 : -1;

  sorted.sort((a, b) => {
    switch (state.sortField) {
      case 'year':
        return (a.year - b.year) * dir;
      case 'title':
        return a.title.localeCompare(b.title) * dir;
      case 'category':
        return a.category.localeCompare(b.category) * dir;
      default:
        return 0;
    }
  });

  return sorted;
}

interface ArchiveTabProps {
  onRowClick: (slug: string) => void;
  onOpenFloating?: (slug: string) => void;
  viewMode: ViewMode;
  onFilterStatusChange?: (status: string) => void;
  archiveEntries: ArchiveEntry[];
}

export default function ArchiveTab({ onRowClick, onOpenFloating, viewMode, onFilterStatusChange, archiveEntries }: ArchiveTabProps) {
  const [filterState, dispatch] = useReducer(filterReducer, initialState);

  const filtered = useMemo(
    () => filterEntries(archiveEntries, filterState),
    [filterState]
  );

  const sorted = useMemo(
    () => sortEntries(filtered, filterState),
    [filtered, filterState]
  );

  // Report filter status to parent
  const hasFilter = filterState.categories.length > 0 || filterState.searchQuery.trim() !== '' || filterState.yearFrom !== null || filterState.yearTo !== null;
  const filterLabel = hasFilter
    ? `FILTERED: ${sorted.length} OF ${archiveEntries.length}`
    : 'NO FILTER';

  useEffect(() => {
    onFilterStatusChange?.(filterLabel);
  }, [filterLabel, onFilterStatusChange]);

  const handleFilterChange = (state: FilterState) => {
    dispatch({ type: 'SET_FILTER_STATE', state });
  };

  const handleSort = (field: SortField) => {
    dispatch({ type: 'SET_SORT', field });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <FilterBar
        filterState={filterState}
        totalCount={archiveEntries.length}
        filteredCount={sorted.length}
        onFilterChange={handleFilterChange}
      />

      {viewMode === 'list' ? (
        <SpreadsheetTable
          entries={sorted}
          sortField={filterState.sortField}
          sortDirection={filterState.sortDirection}
          onSort={handleSort}
          onRowClick={onRowClick}
        />
      ) : (
        <MapView entries={sorted} onEntryClick={onRowClick} onOpenFloating={onOpenFloating} />
      )}
    </div>
  );
}
