'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Minus, Maximize2 } from 'lucide-react';

interface FloatingWindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  initialX?: number;
  initialY?: number;
  onClose: () => void;
  onDock: () => void;
}

export default function FloatingWindow({
  id,
  title,
  children,
  initialX = 100,
  initialY = 100,
  onClose,
  onDock,
}: FloatingWindowProps) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ w: 700, h: 500 });
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  // Drag handling
  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: pos.x,
      startPosY: pos.y,
    };

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      setPos({
        x: dragRef.current.startPosX + dx,
        y: Math.max(0, dragRef.current.startPosY + dy),
      });
    };

    const onUp = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [pos]);

  // Resize handling
  const onResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: size.w,
      startH: size.h,
    };

    const onMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const dw = ev.clientX - resizeRef.current.startX;
      const dh = ev.clientY - resizeRef.current.startY;
      setSize({
        w: Math.max(400, resizeRef.current.startW + dw),
        h: Math.max(300, resizeRef.current.startH + dh),
      });
    };

    const onUp = () => {
      resizeRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [size]);

  // Bring to front on click
  const [zIndex, setZIndex] = useState(1000);
  useEffect(() => {
    const handleClick = () => {
      setZIndex(1000 + Date.now() % 1000);
    };
    const el = windowRef.current;
    el?.addEventListener('mousedown', handleClick);
    return () => el?.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div
      ref={windowRef}
      data-floating-window={id}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: size.w,
        height: size.h,
        zIndex,
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--color-gridline-heavy)',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 24px rgba(19, 39, 68, 0.15)',
      }}
    >
      {/* Title bar */}
      <div
        onMouseDown={onDragStart}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
          height: '30px',
          backgroundColor: 'var(--color-primary-blue)',
          color: '#f5f0e8',
          cursor: 'grab',
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </span>
        <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
          {/* Dock back */}
          <button
            onClick={onDock}
            title="Dock to tab bar"
            style={{
              all: 'unset',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '22px',
              height: '22px',
              opacity: 0.7,
            }}
          >
            <Minus size={12} />
          </button>
          {/* Close */}
          <button
            onClick={onClose}
            title="Close"
            style={{
              all: 'unset',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '22px',
              height: '22px',
              opacity: 0.7,
            }}
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={onResizeStart}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '16px',
          height: '16px',
          cursor: 'nwse-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Maximize2
          size={8}
          style={{
            color: 'var(--color-primary-blue)',
            opacity: 0.4,
            transform: 'rotate(90deg)',
          }}
        />
      </div>
    </div>
  );
}
