import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// メモリキャッシュ
const translationCache = new Map<string, string>();

/**
 * 日本語テキストをGemini APIで英語に翻訳
 */
export async function translateWithGemini(text: string, contextHint?: string): Promise<string> {
  if (!text || text.trim() === '') return '';

  const cacheKey = `${contextHint || ''}:${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  if (!ai) {
    // APIキーがない場合のフォールバック（そのまま返すか簡易翻訳）
    return text;
  }

  try {
    const prompt = `
You are an expert translator specializing in performing arts, fringe festivals, and Osaka culture.
Translate the following Japanese text into natural, vibrant, and engaging English suitable for the Osaka Fringe Festival official website and Audience App.
Keep theater/arts nuances authentic. If there are Japanese location names (e.g. 中崎町 Nakazakicho, 心斎橋 Shinsaibashi), use standard Romaji.

Context: ${contextHint || 'Performing arts festival content'}
Japanese Text:
${text}

Respond ONLY with the translated English text, without markdown formatting or conversational filler.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const translated = response.text ? response.text.trim() : text;
    translationCache.set(cacheKey, translated);
    return translated;
  } catch (error) {
    console.error('[Gemini API Translation Error]:', error);
    return text;
  }
}