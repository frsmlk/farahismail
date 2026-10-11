'use client';
import { useEffect, useRef, useState } from 'react';
export default function EntrySplash() {
  const [visible, setVisible] = useState(true);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!visible) return;
    try { if (sessionStorage.getItem('farah-entered') === 'yes') { const frame = requestAnimationFrame(() => setVisible(false)); return () => cancelAnimationFrame(frame); } } catch {}
    const content = Array.from(document.querySelectorAll<HTMLElement>('.worldLanding nav,.worldLanding footer'));
    content.forEach(el => { el.inert = true; });
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    button.current?.focus();
    return () => { document.body.style.overflow = previous; content.forEach(el => { el.inert = false; }); };
  }, [visible]);
  function enter() {
    try { sessionStorage.setItem('farah-entered', 'yes'); } catch {}
    setVisible(false);
    requestAnimationFrame(() => document.querySelector<HTMLAnchorElement>('.worldLanding nav a')?.focus());
  }
  if (!visible) return null;
  return <div className="entrySplash" role="dialog" aria-modal="true" aria-label="Welcome to farahismail.com"><div><h1>farahismail.com</h1><button ref={button} onClick={enter}>Enter ↗</button></div><style>{`.entrySplash{position:fixed;inset:0;z-index:10000;background:#efe4aa;display:grid;place-items:center;text-align:center;padding:28px;font-family:Helvetica,Arial,sans-serif}.entrySplash h1{font-weight:400;font-size:clamp(36px,7vw,100px);letter-spacing:-.05em;line-height:1;margin:0 0 36px}.entrySplash button{background:none;border:0;padding:12px 24px;font:400 24px Helvetica,Arial,sans-serif;cursor:pointer}.entrySplash button:focus-visible{outline:1px solid currentColor;outline-offset:4px}`}</style></div>;
}
