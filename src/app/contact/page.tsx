import React from 'react';
import { getSiteInfo } from '@/lib/microcms';
import ContactClient from './ContactClient';

export const metadata = {
  title: 'お問い合わせ | 大阪文化万博Osaka Fringe 2026',
  description: '大阪文化万博Osaka Fringe 2026 実行委員会へのお問い合わせ。',
};

export default async function ContactPage() {
  const siteInfo = await getSiteInfo();
  return <ContactClient siteInfo={siteInfo} />;
}