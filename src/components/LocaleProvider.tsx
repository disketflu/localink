'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode, useEffect, useState } from 'react';

// Define a more specific type for messages
type DeepRecord = {
  [key: string]: string | number | DeepRecord | Array<string | number | DeepRecord>;
};

type Props = {
  children: ReactNode;
  messages: DeepRecord;
  locale: string;
};

interface LocaleChangeEvent extends CustomEvent {
  detail: {
    messages: DeepRecord;
    locale: string;
  };
}

export default function LocaleProvider({ children, messages: initialMessages, locale: initialLocale }: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [locale, setLocale] = useState(initialLocale);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for saved locale on initial load
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale && savedLocale !== initialLocale) {
      // Load messages for the saved locale
      import(`@/messages/${savedLocale}.json`)
        .then((module) => {
          setMessages(module.default);
          setLocale(savedLocale);
        })
        .catch((error) => {
          console.error('Error loading saved locale:', error);
        });
    }

    // Set loading to false after initial render
    setIsLoading(false);

    const handleLocaleChange = (event: Event) => {
      setIsLoading(true);
      try {
        const customEvent = event as LocaleChangeEvent;
        setMessages(customEvent.detail.messages);
        setLocale(customEvent.detail.locale);
      } catch (error) {
        console.error('Error changing locale:', error);
      } finally {
        setIsLoading(false);
      }
    };

    window.addEventListener('localechange', handleLocaleChange);
    return () => window.removeEventListener('localechange', handleLocaleChange);
  }, [initialLocale]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <NextIntlClientProvider 
      messages={messages} 
      locale={locale}
      // Add error handling and fallback options
      onError={(error) => {
        console.error('Translation error:', error);
        return error.message;
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
} 