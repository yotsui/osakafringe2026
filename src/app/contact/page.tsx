import React from 'react';
import { getSiteInfo } from '@/lib/microcms';
import ContactClient from './ContactClient';

export const metadata = {
  title: 'お問い合わせ | OSAKA FRINGE FESTIVAL 2026',
  description: '大阪フリンジフェスティバル実行委員会へのお問い合わせ。Google Forms連携。',
};

export default async function ContactPage() {
  const siteInfo = await getSiteInfo();
  return <ContactClient siteInfo={siteInfo} />;
}