'use client';
import { useEffect, useRef } from 'react';

export default function BookCoverWall({ photos }: { photos: Record<string, string> }) {
  const wall = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = wall.current;
    if (!element) return;
    let active = true;
    const covers = Object.values(photos);
    const titles = Object.fromEntries(Object.entries(photos).map(([title, src]) => [src, title]));
    const rotate = () => {
      if (document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const slots = Array.from(element.querySelectorAll('img')).filter(img => img.parentElement && getComputedStyle(img.parentElement).display !== 'none');
      const visible = new Set(slots.map(img => img.getAttribute('src')));
      slots.forEach((slot, index) => {
        const choices = covers.filter(src => !visible.has(src));
        const next = choices[Math.floor(Math.random()*choices.length)];
        if (!next) return;
        visible.add(next);
        const preload = new Image();
        preload.onload = async () => {
          await new Promise(resolve => setTimeout(resolve, index*180));
          if (!active || !slot.isConnected) return;
          try {
            slot.getAnimations().forEach(animation => animation.cancel());
            await slot.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' }).finished;
            if (!active || !slot.isConnected) return;
            slot.src = next;
            slot.alt = titles[next];
            slot.parentElement?.setAttribute('aria-label', 'View '+titles[next]);
            slot.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, fill: 'forwards' });
          } catch { /* Unmount can cancel a pending animation. */ }
        };
        preload.src = next;
      });
    };
    // Start the first swap promptly; keep the established four-second rhythm.
    const firstSwap = window.setTimeout(rotate, 250);
    const timer = window.setInterval(rotate, 4000);
    return () => { active = false; window.clearTimeout(firstSwap); window.clearInterval(timer); element.querySelectorAll('img').forEach(img => img.getAnimations().forEach(animation => animation.cancel())); };
  }, [photos]);
  return <aside ref={wall} className="bcCoverWall" aria-label="Explore book covers" onClick={event => {
    const button = (event.target as Element).closest('button');
    const title = button?.querySelector('img')?.alt;
    const row = Array.from(document.querySelectorAll<HTMLElement>('[data-book-title]')).find(row => row.dataset.bookTitle === title);
    if (row) { row.scrollIntoView({ block: 'center', behavior: 'instant' }); row.querySelector<HTMLAnchorElement>('.bcListItemLink')?.click(); }
  }}>
    {Object.entries(photos).slice(0, 6).map(([title, src]) => <button type="button" className="bcCoverSquare" key={src} aria-label={`View ${title}`}><img src={src} alt={title} /></button>)}
  </aside>;
}
