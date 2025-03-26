'use client';

import Link from "next/link";
import { useTranslations } from 'next-intl';
import LanguageSelector from "./LanguageSelector";
import SignOutButton from "./SignOutButton";
import { Session } from "next-auth";

interface HeaderProps {
  session: Session | null;
}

export default function Header({ session }: HeaderProps) {
  const t = useTranslations('navigation');

  return (
    <nav className="bg-white shadow-sm relative z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link 
                href="/" 
                className="text-2xl font-bold text-indigo-600 hover:text-indigo-500 transition-colors relative z-10"
              >
                LocaLink
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link
                href="/tours"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors relative z-10"
              >
                {t('browseTours')}
              </Link>
              {session?.user && (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors relative z-10"
                >
                  {t('dashboard')}
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex items-center space-x-6">
              <LanguageSelector />
              {session ? (
                <>
                  <span className="text-sm font-medium text-gray-700">
                    {t('welcome', { name: session.user.name || '' })}
                  </span>
                  <SignOutButton />
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors relative z-10"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors relative z-10"
                  >
                    {t('signup')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 