'use client';

import { useRef, useState } from 'react';
import { List, Map } from 'lucide-react';
import type { ViewMode } from '@/components/ArchiveTab';

export interface TabItem {
  id: string;
  label: string;
  closable: boolean;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabClick: (id: string) => void;
  onTabClose?: (id: string) => void;
  onTabDetach?: (id: string) => void;
  archiveViewMode?: ViewMode;
  onArchiveViewModeChange?: (mode: ViewMode) => void;
}

const VIEW_OPTIONS: { mode: ViewMode; label: string; icon: typeof List }[] = [
  { mode: 'list', label: 'LIST', icon: List },
  { mode: 'map', label: 'MAP', icon: Map },
];

export default function TabBar({
  tabs,
  activeTab,
  onTabClick,
  onTabClose,
  onTabDetach,
  archiveViewMode = 'list',
  onArchiveViewModeChange,
}: TabBarProps) {
  const navRef = useRef<HTMLElement>(null);
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const openDropdown = () => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
    setDropdownOpen(true);
  };

  const closeDropdown = () => {
    dropdownTimer.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 400);
  };

  const handleDragStart = (e: React.DragEvent, tab: TabItem) => {
    if (!tab.closable) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', tab.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (e: React.DragEvent, tab: TabItem) => {
    if (!tab.closable || !onTabDetach) return;

    const navRect = navRef.current?.getBoundingClientRect();
    if (!navRect) return;

    const { clientX, clientY } = e;
    const outside =
      clientX < navRect.left ||
      clientX > navRect.right ||
      clientY < navRect.top - 40 ||
      clientY > navRect.bottom + 40;

    if (outside) {
      onTabDetach(tab.id);
    }
  };

  // Fixed tabs (profile, archive) vs detail tabs
  const fixedTabs = tabs.filter((t) => !t.closable);
  const detailTabs = tabs.filter((t) => t.closable);

  return (
    <nav
      ref={navRef}
      className="tab-bar"
      style={{
        display: 'flex',
        width: '100%',
        height: 'var(--size-tab-height)',
        minHeight: 'var(--size-tab-height)',
        backgroundColor: 'var(--color-cell-hover)',
        borderBottom: '1px solid var(--color-gridline-heavy)',
        overflow: 'hidden',
      }}
    >
      {/* Fixed tabs — never shrink */}
      {fixedTabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const isArchive = tab.id === 'archive';

        return (
          <div
            key={tab.id}
            style={{ position: 'relative', flexShrink: 0 }}
            onMouseEnter={isArchive ? openDropdown : undefined}
            onMouseLeave={isArchive ? closeDropdown : undefined}
          >
            <button
              onClick={() => onTabClick(tab.id)}
              style={{
                all: 'unset',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: isActive ? 600 : 500,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                height: 'var(--size-tab-height)',
                backgroundColor: isActive
                  ? 'var(--color-cell-bg)'
                  : 'var(--color-cell-hover)',
                color: isActive
                  ? 'var(--color-dark-blue)'
                  : 'var(--color-primary-blue)',
                borderTop: isActive
                  ? '2px solid var(--color-primary-blue)'
                  : '2px solid transparent',
                borderRight: '1px solid var(--color-gridline)',
                borderBottom: isActive
                  ? '1px solid var(--color-cell-bg)'
                  : '1px solid var(--color-gridline-heavy)',
                whiteSpace: 'nowrap',
                boxSizing: 'border-box',
              }}
            >
              {tab.label}
            </button>

            {/* Archive view mode dropdown */}
            {isArchive && onArchiveViewModeChange && (
              <div
                className="archive-view-dropdown"
                onMouseEnter={openDropdown}
                onMouseLeave={closeDropdown}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  zIndex: 50,
                  overflow: 'hidden',
                  maxHeight: dropdownOpen ? '200px' : '0px',
                  opacity: dropdownOpen ? 1 : 0,
                  transition: 'max-height 0.2s ease, opacity 0.15s ease',
                  border: dropdownOpen
                    ? '1px solid var(--color-gridline-heavy)'
                    : '1px solid transparent',
                  borderTop: 'none',
                  backgroundColor: 'var(--color-cell-bg)',
                  minWidth: '120px',
                }}
              >
                {VIEW_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isActiveMode = archiveViewMode === opt.mode;
                  return (
                    <button
                      key={opt.mode}
                      onClick={() => {
                        onArchiveViewModeChange(opt.mode);
                        onTabClick('archive');
                        setDropdownOpen(false);
                      }}
                      style={{
                        all: 'unset',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 14px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: isActiveMode
                          ? '#f5f0e8'
                          : 'var(--color-dark-blue)',
                        backgroundColor: isActiveMode
                          ? 'var(--color-primary-blue)'
                          : 'transparent',
                        borderBottom: '1px solid var(--color-gridline)',
                        transition:
                          'background-color 0.12s ease, color 0.12s ease',
                        boxSizing: 'border-box',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActiveMode) {
                          e.currentTarget.style.backgroundColor =
                            'var(--color-cell-hover)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActiveMode) {
                          e.currentTarget.style.backgroundColor =
                            'transparent';
                        }
                      }}
                    >
                      <Icon size={12} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Detail tabs — dynamic, shrink to fit */}
      {detailTabs.length > 0 && (
        <div
          style={{
            display: 'flex',
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          {detailTabs.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                draggable
                onDragStart={(e) => handleDragStart(e, tab)}
                onDragEnd={(e) => handleDragEnd(e, tab)}
                onClick={() => onTabClick(tab.id)}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0 12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: isActive ? '11px' : '10px',
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  height: 'var(--size-tab-height)',
                  backgroundColor: isActive
                    ? 'var(--color-cell-bg)'
                    : 'var(--color-cell-hover)',
                  color: isActive
                    ? 'var(--color-dark-blue)'
                    : 'var(--color-primary-blue)',
                  borderTop: isActive
                    ? '2px solid var(--color-primary-blue)'
                    : '2px solid transparent',
                  borderRight: '1px solid var(--color-gridline)',
                  borderBottom: isActive
                    ? '1px solid var(--color-cell-bg)'
                    : '1px solid var(--color-gridline-heavy)',
                  // Active tab gets more space, inactive ones shrink
                  flex: isActive ? '0 1 auto' : '0 1 140px',
                  maxWidth: isActive ? '220px' : '140px',
                  minWidth: isActive ? '100px' : '60px',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                  transition: 'flex 0.08s linear, max-width 0.08s linear',
                }}
              >
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {tab.label}
                </span>
                {onTabClose && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTabClose(tab.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        onTabClose(tab.id);
                      }
                    }}
                    style={{
                      fontSize: '14px',
                      lineHeight: 1,
                      opacity: isActive ? 0.6 : 0.3,
                      flexShrink: 0,
                      transition: 'opacity 0.1s ease',
                    }}
                  >
                    &times;
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
