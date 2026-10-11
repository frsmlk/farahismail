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
        <style>{`html,body { background-color:#efe4aa; } .homeCursorIcon {display:block;} a:hover .homeCursorIcon path,a:focus-visible .homeCursorIcon path {fill:#ff69b4;} :root {--page-heading-top:calc(clamp(28px,4.6vw,88px) + clamp(40px,8vw,154px));} @media(max-width:600px){:root{--page-heading-top:calc(clamp(28px,4.6vw,88px) + 12vh);}} body .bcHero,body .playSite,#maps .previewPage,body .worldAbout {padding-top:var(--page-heading-top)!important;} @media(pointer:fine){html,body,body * { cursor:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M2%202%20L2%2020%20L7%2015%20L11%2023%20L15%2021%20L11%2013%20L19%2013%20Z%22%20fill%3D%22%23571531%22%20stroke%3D%22%23000000%22%20stroke-width%3D%221.4%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E") 2 2, auto!important; }} body,body * { color:#000000!important; } @media(hover:hover){body :is(a,button,[role="button"],summary):hover,body :is(a,button,[role="button"],summary):hover * {color:#ff69b4!important;}} body :is(a,button,[role="button"],summary):focus-visible,body :is(a,button,[role="button"],summary):focus-visible * {color:#ff69b4!important;} input::placeholder,textarea::placeholder { color:#000000!important; opacity:1; } html:has(.playSite),body:has(.playSite) { background-color:#efe4aa; }`}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
