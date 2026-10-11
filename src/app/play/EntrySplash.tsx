'use client';
import { useEffect, useRef, useState } from 'react';
function scrambleGlyph(source: string, destination: string, progress: number, index: number, step: number) {
  const blend = progress*progress*(3-2*progress);
  const threshold = Math.random();
  const pool = threshold < blend ? destination : source;
  const letter = pool[(index+step+Math.floor(Math.random()*pool.length))%pool.length];
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
      try { sessionStorage.setItem('farah-entered-flight-v15', 'yes'); } catch {}
      setVisible(false);
    }
    let skip = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    try { skip ||= sessionStorage.getItem('farah-entered-flight-v15') === 'yes'; } catch {}
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
    function restrainedGlyph(original: string) {
      context.font = `${sourceSize}px Helvetica, Arial, sans-serif`;
      const width = context.measureText(original).width;
      const pool = Array.from(new Set('farahismailcom')).filter(c => c !== original && Math.abs(context.measureText(c).width-width) < sourceSize*.12);
      return pool.length ? pool[Math.floor(Math.random()*pool.length)] : original;
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
    const palette = ['#EBDD94', '#FFCBCF', '#571531'];
    const tintSteps = new WeakMap<HTMLElement, number>();
    function tint(letter: HTMLElement, step: number, settle = false) {
      if (settle) { letter.style.setProperty('color', '#000', 'important'); letter.style.opacity = '1'; return; }
      if (tintSteps.get(letter) === step) return;
      tintSteps.set(letter, step);
      letter.style.transition = 'color 100ms ease, opacity 100ms ease';
      letter.style.setProperty('color', palette[Math.floor(Math.random()*palette.length)], 'important');
      letter.style.opacity = String(.65+Math.random()*.3);
    }
    const glyphSteps = new WeakMap<HTMLElement, number>();
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
          if (!started) return;
          const step = Math.floor(local/90);
          if (glyphSteps.get(letter) !== step) {
            glyphSteps.set(letter, step);
            letter.textContent = restrainedGlyph(source[i].c);
          }
          tint(letter, step);
        });
      } else {
        // Continuous glyph travel: no fading the source out and the targets in.
        logo.style.visibility = 'hidden';
        flights.forEach(({verticalOffset,letter,origin,sourceIndex,target,delay},i) => {
          const progress = Math.min(1,Math.max(0,(elapsed-1000-delay)/800));
          const eased = progress*progress*(3-2*progress);
          letter.style.visibility = 'visible';
          const horizontal = 1-Math.pow(1-progress,3);
          const spread = 1-Math.pow(1-Math.min(1,progress/.4),3);
          const rowOffset = target.rect.top-targets[0].rect.top;
          const y = (targets[0].rect.top-origin.rect.top)*eased+rowOffset*spread;
          letter.style.transform = `translate(${(target.rect.left-origin.rect.left)*horizontal}px,${y}px)`;
          // Separate the rows before growing their glyphs to the final heading size.
          const growth = Math.max(0,(progress-.2)/.8);
          const size = sourceSize+(target.size-sourceSize)*growth*growth*(3-2*growth);
          letter.style.fontSize = `${size}px`;
          letter.style.top = `${origin.rect.top-verticalOffset*size}px`;
          letter.style.letterSpacing = target.tracking;
          const step = Math.floor((elapsed-500)/90);
          // Carry the source tint into flight without a blank or frozen handoff.
          if (progress === 0) {
            letter.style.setProperty('color', logoLetters[sourceIndex].style.color, 'important');
            letter.style.opacity = logoLetters[sourceIndex].style.opacity;
          } else { tint(letter, step, progress > .8); }
          const lock = .32 + (target.column/target.count)*.12;
          if (progress === 0) { letter.textContent = logoLetters[sourceIndex].textContent; }
          else if (progress >= lock) { letter.textContent = target.c; }
          else if (glyphSteps.get(letter) !== step) {
            glyphSteps.set(letter, step);
            letter.textContent = scrambleGlyph('farahismailcom', target.pool, progress, i, step);
          }
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
