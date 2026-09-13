'use client';

import React, { createContext, useContext, useSyncExternalStore, useCallback } from 'react';
import { Language } from '@/types';

import { translations, Dictionary } from '@/constants/translations';

export { translations };
export type { Dictionary };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  getText: (jaText?: string, enText?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getSavedLanguageSnapshot = (): Language => {
  if (typeof window === 'undefined') return 'ja';
  try {
    const saved = localStorage.getItem('osaka_fringe_lang');
    if (saved === 'ja' || saved === 'en') return saved;
  } catch {
    // ignore
  }
  return 'ja';
};

const getServerLanguageSnapshot = (): Language => 'ja';

const subscribeLanguage = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('osaka_fringe_lang_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('osaka_fringe_lang_change', callback);
  };
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(
    subscribeLanguage,
    getSavedLanguageSnapshot,
    getServerLanguageSnapshot
  );

  const handleSetLanguage = useCallback((lang: Language) => {
    try {
      localStorage.setItem('osaka_fringe_lang', lang);
      window.dispatchEvent(new Event('osaka_fringe_lang_change'));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const t = useCallback((key: string): string => {
    if (!translations[key]) return key;
    return translations[key][language] || translations[key].ja;
  }, [language]);

  const getText = useCallback((jaText?: string, enText?: string): string => {
    if (language === 'en' && enText) return enText;
    return jaText || enText || '';
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, getText }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}