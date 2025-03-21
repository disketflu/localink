import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Providers } from "./providers";
import SignOutButton from "@/components/SignOutButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LocaLink - Connect with Local Guides",
  description: "Discover authentic travel experiences with local guides",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
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
                      Browse Tours
                    </Link>
                    {session?.user.role === "GUIDE" && (
                      <Link
                        href="/dashboard"
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors relative z-10"
                      >
                        Dashboard
                      </Link>
                    )}
                  </div>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:items-center">
                  {session ? (
                    <div className="flex items-center space-x-6">
                      <span className="text-sm font-medium text-gray-700">
                        Welcome, {session.user.name}
                      </span>
                      <SignOutButton />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-6">
                      <Link
                        href="/auth/login"
                        className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors relative z-10"
                      >
                        Log in
                      </Link>
                      <Link
                        href="/auth/register"
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors relative z-10"
                      >
                        Sign up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </nav>
          {children}
        </Providers>
      </body>
    </html>
  );
}
