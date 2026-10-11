'use client';
import { useEffect, useRef, useState } from 'react';
// Letterforms from Norwegian, Swedish and German.
const glyphs = 'æøåäöüß';
const palette = [[239,228,170], [255,203,207], [87,21,49]];
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
    const styles = Array.from({length: 50}, () => ({ rgb: palette[Math.floor(Math.random()*palette.length)], opacity: .5 + Math.random()*.4 }));
    function tint(letter: HTMLElement, index: number, settle = 0) {
      const style = styles[index % styles.length];
      letter.style.setProperty('color', `rgb(${style.rgb.map(c=>Math.round(c*(1-settle))).join(',')})`, 'important');
      letter.style.opacity = `${style.opacity + (1-style.opacity)*settle}`;
    }
    
    const destinations = links.map(el => el.getBoundingClientRect());
    const pieces = destinations.map((rect, i) => {
      const word = document.createElement('span');
      word.className = 'entryWord'; word.setAttribute('aria-hidden', 'true');
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
      const elapsed = (now - start) * 12.5;
      const step = Math.floor(elapsed / 650);
      if (elapsed < 1400) {
        if (step !== lastTick) {
          const fragment = document.createDocumentFragment();
          Array.from(title).forEach((c,i) => {
            const letter = document.createElement('span');
            letter.textContent = i < Math.max(0, 14 - elapsed / 95) ? c : glyphs[(step + i*3)%glyphs.length];
            tint(letter, i);
            fragment.append(letter);
          });
          logo.replaceChildren(fragment);
        }
      } else {
        logo.style.opacity = `${Math.max(0, 1 - (elapsed - 1400) / 650)}`;
        pieces.forEach(({word}, i) => {
          const progress = Math.min(1, Math.max(0, (elapsed - 1400 - i * 150) / 1600));
          const eased = progress * progress * (3 - 2 * progress);
          const dx = 0;
          const dy = 4;
          word.style.transform = `translate(${dx * (1-eased)}px,${dy * (1-eased)}px) scale(${.995 + .005 * eased})`;
          word.style.opacity = `${Math.min(1, progress * 2)}`;
          if (step !== lastTick) {
            const fragment = document.createDocumentFragment();
            Array.from(originals[i]).forEach((c,j) => {
              const letter = document.createElement('span');
              letter.style.unicodeBidi = 'isolate';
              const resolve = Math.max(0, Math.min(1, progress * (originals[i].length + 3) - j));
              letter.textContent = c === ' ' || resolve >= 1 ? c : glyphs[(step + j * 3 + i) % glyphs.length];
              tint(letter, 14 + i*10 + j, Math.max(0, (progress-.65)/.35));
              fragment.append(letter);
            });
            word.replaceChildren(fragment);
          }
        });
      }
      lastTick = step;
      if (elapsed >= 3750) { finish(); return; }
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
  return <div ref={splash} className="entrySplash" role="status" aria-label="Welcome to farahismail.com"><h1 aria-hidden="true">farahismail.com</h1><style>{`.entrySplash{position:fixed;inset:0;z-index:10000;background:#efe4aa;display:grid;place-items:center;text-align:center;padding:28px;font-family:Helvetica,Arial,sans-serif}.entrySplash h1{font-weight:400;font-size:clamp(36px,7vw,100px);letter-spacing:-.05em;line-height:1;margin:0;direction:ltr;unicode-bidi:isolate}.entryWord{position:absolute;font-weight:400;text-align:left;white-space:pre;direction:ltr;unicode-bidi:isolate;transform-origin:top left;pointer-events:none}.entryWord span{transition:opacity 40ms ease}`}</style></div>;
}
