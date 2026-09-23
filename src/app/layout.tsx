import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const siteTitle = 'Book Index';
const siteDescription = 'Book Index is Farah Ismail’s small, growing archive of books, open to readers in Kuala Lumpur.';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.farahismail.com'),
  title: {
    default: siteTitle,
    template: '%s | Book Index',
  },
  description: siteDescription,
  applicationName: siteTitle,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    siteName: siteTitle,
    url: '/',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noarchive: true,
      'max-snippet': 160,
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
