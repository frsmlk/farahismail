'use client';

import { useRef, useState } from 'react';
import clsx from 'clsx';
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

  return (
    <nav
      ref={navRef}
      className="flex w-full bg-cell-hover"
      style={{
        height: 'var(--size-tab-height)',
        borderBottom: '1px solid var(--color-gridline-heavy)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const isArchive = tab.id === 'archive';

        return (
          <div
            key={tab.id}
            style={{ position: 'relative' }}
            onMouseEnter={isArchive ? openDropdown : undefined}
            onMouseLeave={isArchive ? closeDropdown : undefined}
          >
            <button
              draggable={tab.closable}
              onDragStart={(e) => handleDragStart(e, tab)}
              onDragEnd={(e) => handleDragEnd(e, tab)}
              onClick={() => onTabClick(tab.id)}
              className={clsx(
                'relative flex items-center gap-1.5 px-4',
                'cursor-pointer select-none',
                'transition-colors duration-100'
              )}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 500,
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
                borderLeft: 'none',
                borderRadius: 0,
                outline: 'none',
              }}
            >
              <span>{tab.label}</span>
              {tab.closable && onTabClose && (
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
                  className="ml-1 hover:text-dark-blue"
                  style={{
                    fontSize: '14px',
                    lineHeight: 1,
                    opacity: 0.6,
                  }}
                >
                  &times;
                </span>
              )}
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
    </nav>
  );
}
