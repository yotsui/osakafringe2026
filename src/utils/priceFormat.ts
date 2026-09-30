/**
 * 料金表示ヘルパー
 * - 表示言語の値を優先し、未設定・空文字・空白のみの場合は他言語へフォールバック。
 * - 両方とも未設定・空文字・空白のみなら空文字（""）を返す。
 * - 「無料」「Free」「0円」「投げ銭」「要問合せ」などの明示的な登録値がある場合はその値をそのまま表示。
 */
export function formatTicketPrice(
  priceJa?: string,
  priceEn?: string,
  lang: 'ja' | 'en' = 'ja'
): string {
  const trimmedJa = priceJa ? priceJa.trim() : '';
  const trimmedEn = priceEn ? priceEn.trim() : '';

  if (lang === 'en') {
    return trimmedEn || trimmedJa;
  }
  return trimmedJa || trimmedEn;
}

