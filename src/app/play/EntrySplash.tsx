'use client';
import { useEffect, useState } from 'react';
export default function EntrySplash() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!visible) return;
    try { if (sessionStorage.getItem('farah-entered') === 'yes') { const frame = requestAnimationFrame(() => setVisible(false)); return () => cancelAnimationFrame(frame); } } catch {}
    const content = Array.from(document.querySelectorAll<HTMLElement>('.worldLanding nav,.worldLanding footer'));
    content.forEach(el => { el.inert = true; });
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => {
      try { sessionStorage.setItem('farah-entered', 'yes'); } catch {}
      setVisible(false);
    }, 1200);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = previous;
      content.forEach(el => { el.inert = false; });
    };
  }, [visible]);
  if (!visible) return null;
  return <div className="entrySplash" role="status" aria-label="Welcome to farahismail.com"><h1>farahismail.com</h1><style>{`.entrySplash{position:fixed;inset:0;z-index:10000;background:#efe4aa;display:grid;place-items:center;text-align:center;padding:28px;font-family:Helvetica,Arial,sans-serif}.entrySplash h1{font-weight:400;font-size:clamp(36px,7vw,100px);letter-spacing:-.05em;line-height:1;margin:0}`}</style></div>;
}
