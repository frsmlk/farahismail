import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#efe4aa',
};

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
