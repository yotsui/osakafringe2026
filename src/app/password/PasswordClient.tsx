'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

interface PasswordClientProps {
  returnUrl: string;
  isLoggedOut?: boolean;
}

export default function PasswordClient({ returnUrl, isLoggedOut }: PasswordClientProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password.trim(),
          returnUrl,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        const dest = data.returnUrl || '/';
        window.location.assign(dest);
      } else {
        setErrorMessage(data.message || 'パスワードが正しくありません。管理者にお問い合わせください。');
        setIsLoading(false);
      }
    } catch {
      setErrorMessage('通信エラーが発生しました。ネットワーク環境をご確認の上、再度お試しください。');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50/60 via-white to-pink-50/30 flex items-center justify-center p-4 sm:p-6 selection:bg-[#E6007E] selection:text-white">
      <div className="w-full max-w-md">
        {/* Top Badge & Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-100/80 border border-pink-200 text-[#E6007E] text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preview Mode</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            大阪文化万博 Osaka Fringe 2026
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            関係者限定のテスト公開サイトです。<br className="hidden sm:inline" />
            閲覧にはパスワード認証が必要です。
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-pink-100 shadow-xl shadow-pink-500/5 p-6 sm:p-8 space-y-6">
          {isLoggedOut && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>ログアウトしました。再度アクセスするにはパスワードを入力してください。</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-bold text-slate-700">
                アクセスパスワード
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワードを入力"
                  autoComplete="current-password"
                  autoFocus
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-12 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 text-sm font-medium focus:outline-hidden focus:border-[#E6007E] focus:ring-4 focus:ring-pink-100 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#E6007E] hover:bg-[#c9006e] active:scale-[0.99] text-white text-sm font-black shadow-md shadow-pink-500/20 hover:shadow-lg hover:shadow-pink-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>認証中...</span>
              ) : (
                <>
                  <span>サイトへ入室する</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              ※ パスワードが不明な場合は、実行委員会または担当者までお問い合わせください。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-400 font-medium">
          &copy; 2026 Osaka Fringe Festival Executive Committee
        </div>
      </div>
    </main>
  );
}
