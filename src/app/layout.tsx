import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#efe4aa',
};

const siteTitle = 'Farah Ismail';
const siteDescription = 'An archive and playground by Farah Ismail.';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.farahismail.com'),
  title: {
    default: siteTitle,
    template: '%s | Farah Ismail',
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
      <head>
        <style>{`html,body { background-color:#efe4aa; } body,body * { color:#000000!important; } input::placeholder,textarea::placeholder { color:#000000!important; opacity:1; } html:has(.playSite),body:has(.playSite) { background-color:#efe4aa; }`}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
