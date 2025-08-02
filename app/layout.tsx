// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sonner';

import ConvexClientProvider from '@/components/providers/convex-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ModalProvider } from '@/components/providers/modal-provider';
import { EdgeStoreProvider } from '@/lib/edgestore';

// Import your footer component here
import { SiriGlowInvert } from '@/components/SiriGlowInvert'; // Adjust the import path as needed

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ETECHHUB',
  description: 'Every, Electronics, for Everyone. This is ETECHHUB',
  icons: {
    icon: [
      {
        media: '(prefers-color-scheme: light)',
        url: '/logo.svg',
        href: '/logo.svg',
      },
      {
        media: '(prefers-color-scheme: dark)',
        url: '/logo-dark.svg',
        href: '/logo-dark.svg',
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        {/*
          Key changes are here:
          - We'll wrap all content in a div with min-h-screen, flex, and flex-col classes.
          - We'll move the footer outside of the main content area.
          - We'll apply flex-grow to the main content div to push the footer down.
        */}
        <body suppressHydrationWarning className={`${inter.className} min-h-screen flex flex-col`}>
          <ConvexClientProvider>
            <EdgeStoreProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
                storageKey="eth-theme-1"
              >
                <Toaster position="bottom-center" />
                <ModalProvider />
                <div className="flex-grow">
                  {children}
                </div>
                <SiriGlowInvert />
              </ThemeProvider>
            </EdgeStoreProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
