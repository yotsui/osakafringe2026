import React from 'react';
import type { Metadata } from 'next';
import PasswordClient from './PasswordClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'パスワード認証 | 大阪文化万博 Osaka Fringe 2026',
  description: '関係者限定テスト公開サイト',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

interface Props {
  searchParams: Promise<{ returnUrl?: string; loggedOut?: string }>;
}

export default async function PasswordPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const returnUrl = resolvedParams.returnUrl || '/';
  const isLoggedOut = resolvedParams.loggedOut === '1';

  return <PasswordClient returnUrl={returnUrl} isLoggedOut={isLoggedOut} />;
}
