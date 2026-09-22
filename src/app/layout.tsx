import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const siteDescription = 'Book Index is a small, growing archive of books of various titles, open to readers in Kuala Lumpur.';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.farahismail.com'),
  title: 'Book Index',
  description: siteDescription,
  applicationName: 'Book Index',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Book Index',
    description: siteDescription,
    siteName: 'Book Index',
    url: '/',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Book Index',
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
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
      <head />
      <body>{children}</body>
    </html>
  );
}
