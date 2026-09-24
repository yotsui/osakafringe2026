import React from 'react';
import Link from 'next/link';

interface PreviewErrorViewProps {
  title: string;
  message: string;
  suggestion?: string;
}

export default function PreviewErrorView({ title, message, suggestion }: PreviewErrorViewProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center shadow-xl">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center mb-4">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 mb-2">
          プレビュー表示エラー
        </span>

        <h1 className="text-xl font-bold text-white mb-2">{title}</h1>
        <p className="text-sm text-slate-300 mb-4 whitespace-pre-line leading-relaxed">{message}</p>

        {suggestion && (
          <div className="bg-slate-950/60 rounded-lg p-3 mb-6 text-xs text-slate-400 border border-slate-800/80 text-left">
            <span className="font-semibold text-slate-300 block mb-1">【対処方法】</span>
            {suggestion}
          </div>
        )}

        <div className="space-y-2">
          <Link
            href="/"
            className="block w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
          >
            トップページへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
