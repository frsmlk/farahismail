'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const pages = new Set(['/', '/about', '/bookindex', '/book-club', '/play', '/maps', '/mood']);
const timing = { duration: 300, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards' as const };

export default function NavigationMotion() {
  const router = useRouter();
  const pathname = usePathname();
  const moving = useRef(false);
  const animations = useRef<Animation[]>([]);

  useEffect(() => {
    animations.current.forEach(animation => animation.cancel());
    animations.current = [];
    moving.current = false;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const surface = document.querySelector('.worldLanding,.worldAbout,.bcSite,#maps,.playSite');
    if (surface) surface.animate([{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 240, easing: timing.easing });
  }, [pathname]);

  useEffect(() => {
    function navigate(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element)?.closest<HTMLAnchorElement>('a[href]');
      if (!link || link.target && link.target !== '_self' || link.hasAttribute('download')) return;
      const destination = new URL(link.href, location.href);
      if (destination.origin !== location.origin || !pages.has(destination.pathname) || destination.pathname === location.pathname) return;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      event.preventDefault();
      if (moving.current) return;
      moving.current = true;
      const items = Array.from(document.querySelectorAll<HTMLAnchorElement>('.worldLanding nav a'));
      if (items.includes(link)) {
        const target = items[0].getBoundingClientRect();
        animations.current = items.map(item => {
          const bounds = item.getBoundingClientRect();
          return item.animate([
            { transform: 'translate(0,0)', opacity: 1 },
            { transform: `translate(${target.x - bounds.x}px,${target.y - bounds.y}px)`, opacity: item === link ? 1 : 0 },
          ], timing);
        });
        const footer = document.querySelector('.worldLanding footer');
        if (footer) animations.current.push(footer.animate([{ opacity: 1 }, { opacity: 0 }], timing));
      } else {
        const surface = document.querySelector('.worldLanding,.worldAbout,.bcSite,#maps,.playSite');
        if (surface) animations.current = [surface.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-5px)' }], timing)];
      }
      const href = destination.pathname + destination.search + destination.hash;
      Promise.all(animations.current.map(animation => animation.finished.catch(() => undefined))).then(() => router.push(href));
    }
    document.addEventListener('click', navigate, true);
    return () => document.removeEventListener('click', navigate, true);
  }, [router]);

  return null;
}
