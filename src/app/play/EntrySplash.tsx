'use client';
import { useEffect, useRef, useState } from 'react';
export default function EntrySplash() {
  const [visible, setVisible] = useState(true);
  const splash = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!visible) return;
    try { if (sessionStorage.getItem('farah-entered') === 'yes') { const frame = requestAnimationFrame(() => setVisible(false)); return () => cancelAnimationFrame(frame); } } catch {}
    const content = Array.from(document.querySelectorAll<HTMLElement>('.worldLanding nav,.worldLanding footer'));
    content.forEach(el => { el.inert = true; });
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    let fade: Animation | undefined;
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && splash.current) {
        fade = splash.current.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, easing: 'ease-in-out', fill: 'forwards' });
        try { await fade.finished; } catch { return; }
      }
      if (cancelled) return;
      try { sessionStorage.setItem('farah-entered', 'yes'); } catch {}
      setVisible(false);
    }, 1200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      fade?.cancel();
      document.body.style.overflow = previous;
      content.forEach(el => { el.inert = false; });
    };
  }, [visible]);
  if (!visible) return null;
  return <div ref={splash} className="entrySplash" role="status" aria-label="Welcome to farahismail.com"><h1>farahismail.com</h1><style>{`.entrySplash{position:fixed;inset:0;z-index:10000;background:#efe4aa;display:grid;place-items:center;text-align:center;padding:28px;font-family:Helvetica,Arial,sans-serif}.entrySplash h1{font-weight:400;font-size:clamp(36px,7vw,100px);letter-spacing:-.05em;line-height:1;margin:0}`}</style></div>;
}
