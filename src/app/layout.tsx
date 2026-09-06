import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const viewport: Viewport = {
  themeColor: '#E6007E',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: '大阪文化万博Osaka Fringe 2026 公式サイト',
  description: '大阪文化万博Osaka Fringe 2026（2026年10月8日〜11月8日開催）公式サイト。spill over 文化芸術が街にあふれだす。劇場、広場、歴史的建築、カフェなど大阪各地の会場とイベントをめぐるオープンアクセス型芸術祭。',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: '大阪文化万博Osaka Fringe 2026',
    description: 'spill over 文化芸術が街にあふれだす。2026年10月8日〜11月8日開催。大阪の街じゅうが舞台になるオープンアクセス型芸術祭。',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <LanguageProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}