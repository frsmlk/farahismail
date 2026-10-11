'use client';
import { useEffect, useRef, useState } from 'react';
function scrambleGlyph(source: string, destination: string, progress: number, index: number, step: number) {
  const blend = progress*progress*(3-2*progress);
  const threshold = ((index*37+step*17)%100)/100;
  const pool = threshold < blend ? destination : source;
  const letter = pool[(index*3+step)%pool.length];
  return letter;
}
export default function EntrySplash() {
  const [visible, setVisible] = useState(true);
  const splash = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!visible || !splash.current) return;
    const overlay = splash.current;
    const logo = overlay.querySelector('h1')!;
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.worldLanding nav a'));
    const originals = links.map(el => el.textContent || '');
    const content = Array.from(document.querySelectorAll<HTMLElement>('.worldLanding nav,.worldLanding footer'));
    let frame = 0;
    let cancelled = false;
    function restore() {
      links.forEach((el,i) => { el.textContent = originals[i]; el.style.removeProperty('visibility'); el.removeAttribute('aria-label'); });
      content.forEach(el => { el.inert = false; });
    }
    function finish() {
      restore();
      try { sessionStorage.setItem('farah-entered-flight-v13', 'yes'); } catch {}
      setVisible(false);
    }
    let skip = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    try { skip ||= sessionStorage.getItem('farah-entered-flight-v13') === 'yes'; } catch {}
    if (skip) { frame = requestAnimationFrame(finish); return () => cancelAnimationFrame(frame); }
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    content.forEach(el => { el.inert = true; });
    // Measure each glyph in the actual text flow, including Helvetica kerning.
    function measure(el: HTMLElement, text: string) {
      const node = document.createTextNode(text);
      el.replaceChildren(node);
      return Array.from(text).map((c,i) => {
        const range = document.createRange(); range.setStart(node,i); range.setEnd(node,i+1);
        return { c, rect: range.getBoundingClientRect() };
      });
    }
    const source = measure(logo, 'farahismail.com');
    const logoStyle = getComputedStyle(logo);
    const sourceSize = parseFloat(logoStyle.fontSize);
    const sourceTracking = logoStyle.letterSpacing;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    function restrainedGlyph(original: string, index: number) {
      context.font = `${sourceSize}px Helvetica, Arial, sans-serif`;
      const width = context.measureText(original).width;
      const pool = Array.from(new Set('farahismailcom')).filter(c => c !== original && Math.abs(context.measureText(c).width-width) < sourceSize*.12);
      return pool.length ? pool[index%pool.length] : original;
    }
    const targets = links.flatMap((el,i) => {
      const computed = getComputedStyle(el);
      const size = parseFloat(computed.fontSize);
      const tracking = computed.letterSpacing;
      const letters = measure(el, originals[i]).filter(letter => letter.c !== ' ');
      el.style.visibility = 'hidden'; el.setAttribute('aria-label', originals[i]);
      return letters.map((letter, column) => ({ ...letter, group: i, column, count: letters.length, size, tracking, pool: originals[i].replace(/\s/g,'').toLowerCase() }));
    });
    const flights = targets.map((target,i) => {
      // Monotonic origins avoid wrapping back across the logo and crossing paths.
      const sourceIndex = Math.round(i*(source.length-1)/(targets.length-1));
      const origin = source[sourceIndex];
      const letter = document.createElement('span');
      letter.className = 'entryLetter'; letter.setAttribute('aria-hidden','true');
      letter.style.left = `${origin.rect.left}px`; letter.style.top = `${origin.rect.top}px`;
      letter.style.fontSize = `${sourceSize}px`; letter.style.letterSpacing = sourceTracking;
      // Extra destination letters split from existing logo letters when motion starts.
      letter.textContent = origin.c;
      letter.style.visibility = 'hidden';
      overlay.append(letter);
      const range = document.createRange(); range.selectNodeContents(letter);
      const verticalOffset = (range.getBoundingClientRect().top-origin.rect.top)/sourceSize;
      return { verticalOffset, letter, origin, sourceIndex, target, delay: target.group*24 };
    });
    const logoLetters = source.map(({c,rect}) => {
      const letter = document.createElement('span');
      letter.textContent = c; letter.style.display = 'inline-block'; letter.style.width = `${rect.width}px`;
      return letter;
    });
    logo.replaceChildren(...logoLetters);
    const start = performance.now();
    function tick(now: number) {
      if (cancelled) return;
      const elapsed = now - start;
      if (elapsed < 500) {
        // Keep the complete logo legible before any scrambling.
      } else if (elapsed < 1000) {
        logoLetters.forEach((letter,i) => {
          const local = elapsed-500-i*30;
          const started = local >= 0;
          const replacement = restrainedGlyph(source[i].c, i);
          // One quiet substitution per letter instead of repeated flickering.
          letter.textContent = !started ? source[i].c : replacement;
        });
      } else {
        // Continuous glyph travel: no fading the source out and the targets in.
        logo.style.visibility = 'hidden';
        flights.forEach(({verticalOffset,letter,origin,sourceIndex,target,delay},i) => {
          const progress = Math.min(1,Math.max(0,(elapsed-1000-delay)/800));
          const eased = progress*progress*(3-2*progress);
          letter.style.visibility = 'visible';
          const horizontal = 1-Math.pow(1-progress,3);
          letter.style.transform = `translate(${(target.rect.left-origin.rect.left)*horizontal}px,${(target.rect.top-origin.rect.top)*eased}px)`;
          const size = sourceSize+(target.size-sourceSize)*eased;
          letter.style.fontSize = `${size}px`;
          letter.style.top = `${origin.rect.top-verticalOffset*size}px`;
          letter.style.letterSpacing = target.tracking;
          const step = Math.floor((elapsed-1000)/180);
          const lock = .32 + (target.column/target.count)*.12;
          letter.textContent = progress < .12 ? logoLetters[sourceIndex].textContent : progress < lock ? scrambleGlyph('farahismail', target.pool, progress, i, step) : target.c;
        });
      }
      if (elapsed >= 1900) { finish(); return; }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => {
      cancelled = true; cancelAnimationFrame(frame);
      document.body.style.overflow = previous;
      restore(); flights.forEach(({letter})=>letter.remove());
    };
  }, [visible]);
  if (!visible) return null;
  return <div ref={splash} className="entrySplash" role="status" aria-label="Welcome to farahismail.com"><h1 aria-hidden="true">farahismail.com</h1><style>{`.entrySplash{position:fixed;inset:0;z-index:10000;background:#efe4aa;display:grid;place-items:center;text-align:center;padding:28px;font-family:Helvetica,Arial,sans-serif}.entrySplash h1{font-weight:400;font-size:clamp(36px,7vw,100px);letter-spacing:-.05em;line-height:1;margin:0;direction:ltr;unicode-bidi:isolate}.entryLetter{position:absolute;font-weight:400;line-height:1;text-align:left;direction:ltr;unicode-bidi:isolate;pointer-events:none;will-change:transform}`}</style></div>;
}
