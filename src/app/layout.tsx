import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Providers } from "./providers";
import LocaleProvider from "@/components/LocaleProvider";
import Header from "@/components/Header";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

const DEFAULT_LOCALE = 'fr';
const SUPPORTED_LOCALES = ['fr', 'en'];

async function getMessages(locale: string) {
  try {
    return (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    // If the requested locale fails, try to fall back to the default locale
    if (locale !== DEFAULT_LOCALE) {
      try {
        return (await import(`@/messages/${DEFAULT_LOCALE}.json`)).default;
      } catch {
        // If even the default locale fails, we have a serious problem
        notFound();
      }
    } else {
      notFound();
    }
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);
  
  // Get locale from cookie or default to French
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get('NEXT_LOCALE')?.value;
  const locale = savedLocale && SUPPORTED_LOCALES.includes(savedLocale) 
    ? savedLocale 
    : DEFAULT_LOCALE;

  // Load messages with fallback handling
  const messages = await getMessages(locale);

  return (
    <html lang={locale}>
      <body className={`${inter.className} bg-white`}>
        <Providers>
          <LocaleProvider messages={messages} locale={locale}>
            <Header session={session} />
            {children}
          </LocaleProvider>
        </Providers>
      </body>
    </html>
  );
}
