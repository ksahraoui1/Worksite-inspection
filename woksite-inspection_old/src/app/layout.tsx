import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StopButton } from "@/components/stop-danger/stop-button";
import { SyncIndicator } from "@/components/ui/sync-indicator";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WokSite Inspection",
  description:
    "Contrôle sécurité chantiers — OTConst/SUVA",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WokSite",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#dc2626",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-dvh`}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 safe-area-top">
          <div className="flex items-center justify-between px-4 h-14">
            <h1 className="text-lg font-bold text-red-600">WokSite</h1>
            <SyncIndicator />
          </div>
        </header>

        {/* Main content */}
        <main className="pb-20 px-4 py-4 max-w-5xl mx-auto">
          {children}
        </main>

        {/* Bouton STOP Danger — visible sur tous les écrans */}
        <StopButton />

        {/* Bottom navigation mobile */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-bottom sm:hidden">
          <div className="flex items-center justify-around h-16">
            <a
              href="/"
              className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-gray-600 hover:text-red-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs mt-1">Accueil</span>
            </a>
            <a
              href="/chantiers"
              className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-gray-600 hover:text-red-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-xs mt-1">Chantiers</span>
            </a>
          </div>
        </nav>
      </body>
    </html>
  );
}
