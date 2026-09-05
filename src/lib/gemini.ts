import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// キャッシュファイルの保存先 (.cache/translations.json)
const CACHE_DIR = path.join(process.cwd(), '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'translations.json');

// メモリキャッシュ
const translationCache = new Map<string, string>();
let isCacheLoaded = false;

/**
 * ディスクからキャッシュを読み込む
 */
function loadDiskCache() {
  if (typeof window !== 'undefined' || isCacheLoaded) return;
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (typeof parsed === 'object' && parsed !== null) {
        Object.entries(parsed).forEach(([key, val]) => {
          if (typeof val === 'string') {
            translationCache.set(key, val);
          }
        });
      }
    }
  } catch (err) {
    console.warn('[Gemini Translation Cache] Failed to load disk cache:', err);
  } finally {
    isCacheLoaded = true;
  }
}

/**
 * キャッシュをディスクに書き込む
 */
function saveDiskCache() {
  if (typeof window !== 'undefined') return;
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    const obj = Object.fromEntries(translationCache);
    fs.writeFileSync(CACHE_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Gemini Translation Cache] Failed to save disk cache:', err);
  }
}

/**
 * 日本語テキストをGemini APIで英語に翻訳（メモリ・ファイル永続キャッシュ対応）
 */
export async function translateWithGemini(text: string, contextHint?: string): Promise<string> {
  const cleanText = (text || '').trim();
  if (!cleanText) return '';

  loadDiskCache();

  const cacheKey = `${contextHint || 'general'}:${cleanText}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  if (!ai) {
    // APIキーがない場合のフォールバック（そのまま返す）
    return cleanText;
  }

  try {
    const prompt = `
You are an expert translator specializing in performing arts, fringe festivals, and Osaka culture.
Translate the following Japanese text into natural, vibrant, and engaging English suitable for the Osaka Fringe Festival official website and Audience App.
Keep theater/arts nuances authentic. If there are Japanese location names (e.g. 中崎町 Nakazakicho, 心斎橋 Shinsaibashi), use standard Romaji.

Context: ${contextHint || 'Performing arts festival content'}
Japanese Text:
${cleanText}

Respond ONLY with the translated English text, without markdown formatting, quotes, or conversational filler.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const translated = response.text ? response.text.trim().replace(/^["']|["']$/g, '') : cleanText;
    translationCache.set(cacheKey, translated);
    saveDiskCache();
    return translated;
  } catch (error) {
    console.warn('[Gemini API Translation Warning]:', error);
    return cleanText;
  }
}

/**
 * 英語項目が空の場合に日本語から自動翻訳して補完するヘルパー
 */
export async function translateIfEmpty(
  jaText?: string,
  enText?: string,
  contextHint?: string
): Promise<string | undefined> {
  if (enText && enText.trim() !== '') {
    return enText.trim();
  }
  if (!jaText || jaText.trim() === '') {
    return undefined;
  }
  return await translateWithGemini(jaText, contextHint);
}