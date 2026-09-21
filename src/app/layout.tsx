import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Book Club',
  description: 'Book Club',
  openGraph: {
    title: 'Book Club',
    description: 'Book Club',
    siteName: 'Book Club',
  },
  twitter: {
    card: 'summary',
    title: 'Book Club',
    description: 'Book Club',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': 0,
      'max-image-preview': 'none',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="index, follow, max-snippet:0, max-image-preview:none" />
        <meta name="googlebot" content="index, follow, nosnippet, max-snippet:0, max-image-preview:none" />
      </head>
      <body>{children}</body>
    </html>
  );
}
