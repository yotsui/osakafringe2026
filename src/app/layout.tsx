import type { Metadata } from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { LanguageProvider } from '@/context/LanguageContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'OSAKA FRINGE FESTIVAL 2026 | 大阪フリンジフェスティバル 公式サイト',
  description: '大阪フリンジフェスティバル（Osaka Fringe Festival）公式ウェブサイト＆Audience App。世界中のパフォーミングアーツが大阪の街に集結。WHAT / WHERE / WHEN で公演を簡単検索・会場ナビ！',
  openGraph: {
    title: 'OSAKA FRINGE FESTIVAL 2026',
    description: '熱気と驚きが交差する、大阪の街角ステージ。Audience Appで公演・会場を検索！',
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