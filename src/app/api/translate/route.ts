import { NextRequest, NextResponse } from 'next/server';
import { translateWithGemini } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { text, context } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const translated = await translateWithGemini(text, context);
    return NextResponse.json({ translated });
  } catch (error) {
    console.error('API Translation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}