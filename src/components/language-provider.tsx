'use client';

import { createContext, useContext, useLayoutEffect, useSyncExternalStore } from 'react';
import { translate, type Language, type MessageKey } from '@/lib/i18n';

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: MessageKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = 'windham-language';
let currentLanguage: Language = 'en';
const listeners = new Set<() => void>();

function updateLanguage(language: Language) {
  currentLanguage = language;
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      updateLanguage(event.newValue === 'es' ? 'es' : 'en');
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onStorage);
  };
}

function getLanguageSnapshot(): Language {
  return currentLanguage;
}

function getServerLanguageSnapshot(): Language {
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(subscribe, getLanguageSnapshot, getServerLanguageSnapshot);

  useLayoutEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    updateLanguage(saved === 'es' ? 'es' : 'en');
  }, []);

  useLayoutEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  function setLanguage(next: Language) {
    window.localStorage.setItem(STORAGE_KEY, next);
    updateLanguage(next);
    document.documentElement.lang = next;
  }

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t: (key) => translate(language, key) }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider.');
  return context;
}
