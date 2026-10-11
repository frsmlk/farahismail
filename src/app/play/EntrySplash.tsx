'use client';
import { useEffect, useRef, useState } from 'react';
const glyphs = 'abcdefghijklmnopqrstuvwxyz./_';
export default function EntrySplash() {
  const [visible, setVisible] = useState(true);
  const splash = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!visible) return;
    const overlay = splash.current;
    if (!overlay) return;
    let frame = 0;
    let cancelled = false;
    const content = Array.from(document.querySelectorAll<HTMLElement>('.worldLanding nav,.worldLanding footer'));
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.worldLanding nav a'));
    const originals = links.map(el => el.textContent || '');
    function finish() {
      links.forEach((el, i) => { el.textContent = originals[i]; el.style.removeProperty('visibility'); el.removeAttribute('aria-label'); });
      content.forEach(el => { el.inert = false; });
      try { sessionStorage.setItem('farah-entered', 'yes'); } catch {}
      setVisible(false);
    }
    let skip = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    try { skip ||= sessionStorage.getItem('farah-entered') === 'yes'; } catch {}
    if (skip) { frame = requestAnimationFrame(finish); return () => cancelAnimationFrame(frame); }
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    content.forEach(el => { el.inert = true; });
    links.forEach((el, i) => { el.style.visibility = 'hidden'; el.setAttribute('aria-label', originals[i]); });
    const logo = overlay.querySelector('h1')!;
    const title = 'farahismail.com';
    const source = logo.getBoundingClientRect();
    const destinations = links.map(el => el.getBoundingClientRect());
    const pieces = destinations.map((rect, i) => {
      const word = document.createElement('span');
      word.className = 'entryWord';
      word.style.left = `${rect.left}px`; word.style.top = `${rect.top}px`;
      const computed = getComputedStyle(links[i]);
      word.style.fontSize = computed.fontSize; word.style.lineHeight = computed.lineHeight; word.style.letterSpacing = computed.letterSpacing;
      overlay.append(word);
      return { word, rect };
    });
    const start = performance.now();
    let lastTick = -1;
    function tick(now: number) {
      if (cancelled) return;
      const elapsed = now - start;
      const step = Math.floor(elapsed / 65);
      if (elapsed < 800) {
        if (step !== lastTick) logo.textContent = Array.from(title).map((c, i) => i < Math.max(0, 14 - elapsed / 45) ? c : glyphs[Math.floor(Math.random() * glyphs.length)]).join('');
      } else {
        logo.style.visibility = 'hidden';
        pieces.forEach(({word,rect}, i) => {
          const progress = Math.min(1, Math.max(0, (elapsed - 800 - i * 90) / 900));
          const eased = 1 - Math.pow(1 - progress, 3);
          const dx = source.left - rect.left;
          const dy = source.top - rect.top;
          word.style.transform = `translate(${dx * (1-eased)}px,${dy * (1-eased)}px) scale(${.65 + .35 * eased})`;
          word.style.opacity = `${Math.min(1, progress * 5)}`;
          if (step !== lastTick) word.textContent = Array.from(originals[i]).map((c,j) => c === ' ' || j < progress * (originals[i].length + 3) - 3 ? c : glyphs[Math.floor(Math.random()*glyphs.length)]).join('');
        });
      }
      lastTick = step;
      if (elapsed >= 2050) { finish(); return; }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => {
      cancelled = true; cancelAnimationFrame(frame);
      document.body.style.overflow = previous;
      links.forEach((el,i) => { el.textContent = originals[i]; el.style.removeProperty('visibility'); el.removeAttribute('aria-label'); });
      content.forEach(el => { el.inert = false; });
      pieces.forEach(({word}) => word.remove());
    };
  }, [visible]);
  if (!visible) return null;
  return <div ref={splash} className="entrySplash" role="status" aria-label="Welcome to farahismail.com"><h1 aria-hidden="true">farahismail.com</h1><style>{`.entrySplash{position:fixed;inset:0;z-index:10000;background:#efe4aa;display:grid;place-items:center;text-align:center;padding:28px;font-family:Helvetica,Arial,sans-serif}.entrySplash h1{font-weight:400;font-size:clamp(36px,7vw,100px);letter-spacing:-.05em;line-height:1;margin:0}.entryWord{position:absolute;font-weight:400;text-align:left;white-space:pre;transform-origin:top left;pointer-events:none}`}</style></div>;
}
