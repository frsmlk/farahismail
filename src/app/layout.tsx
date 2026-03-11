import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FARAH ISMAIL',
  description:
    'Portfolio archive of Farah Ismail — architect, fashion photographer, art director, and model based in Kuala Lumpur.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div
          id="app-shell"
          className="flex flex-col"
          style={{ height: '100vh', overflow: 'hidden' }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
