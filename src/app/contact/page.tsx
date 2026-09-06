import React from 'react';
import type { Metadata } from 'next';
import { getSiteInfo } from '@/lib/microcms';
import { createPageMetadata } from '@/lib/siteMetadata';
import ContactClient from './ContactClient';

export const metadata: Metadata = createPageMetadata({
  title: 'お問い合わせ',
  description: '大阪文化万博Osaka Fringe 2026 実行委員会へのお問い合わせ。',
  path: '/contact',
});

export default async function ContactPage() {
  const siteInfo = await getSiteInfo();
  return <ContactClient siteInfo={siteInfo} />;
}