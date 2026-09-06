/**
 * 料金表示ヘルパー
 * 空欄時は「要問合せ / Inquire」に統一。
 * 「無料」「Free」「0円」等の明示的な登録値がある場合はその値をそのまま表示。
 */
export function formatTicketPrice(
  priceJa?: string,
  priceEn?: string,
  lang: 'ja' | 'en' = 'ja'
): string {
  const customPrice = lang === 'en' ? (priceEn || priceJa) : (priceJa || priceEn);
  if (customPrice && customPrice.trim() !== '') {
    return customPrice.trim();
  }
  return lang === 'en' ? 'Inquire' : '要問合せ';
}
