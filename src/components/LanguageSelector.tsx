'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';

const languages = [
  {
    code: 'en',
    name: 'English',
    flag: '/flags/gb.svg'
  },
  {
    code: 'fr',
    name: 'Français',
    flag: '/flags/fr.svg'
  }
] as const;

export default function LanguageSelector() {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = async (newLocale: string) => {
    setIsOpen(false);
    localStorage.setItem('locale', newLocale);
    
    // Load new messages
    const messages = (await import(`@/messages/${newLocale}.json`)).default;
    
    // Update the messages in the NextIntlClientProvider
    const event = new CustomEvent('localechange', { detail: { locale: newLocale, messages } });
    window.dispatchEvent(event);
  };

  const currentLanguage = languages.find(lang => lang.code === locale);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-6 h-4 relative">
          <Image
            src={currentLanguage?.flag || ''}
            alt={currentLanguage?.name || ''}
            fill
            className="object-cover rounded-sm"
            sizes="24px"
          />
        </div>
        <span className="text-gray-900 font-medium">{currentLanguage?.name}</span>
        <svg 
          className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors
                  ${locale === language.code ? 'bg-gray-50' : ''}
                `}
              >
                <div className="w-6 h-4 relative">
                  <Image
                    src={language.flag}
                    alt={language.name}
                    fill
                    className="object-cover rounded-sm"
                    sizes="24px"
                  />
                </div>
                <span className={`
                  font-medium
                  ${locale === language.code ? 'text-indigo-600' : 'text-gray-900'}
                `}>
                  {language.name}
                </span>
                {locale === language.code && (
                  <svg className="ml-auto h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 