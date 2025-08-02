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

// Import your SiriGlowInvert component
import { SiriGlowInvert } from '@/components/siri-glow-invert'; // Adjust the path

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
        {/* The min-h-screen class is the crucial part here. */}
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
                <main className="flex-grow">
                  {children}
                </main>
                <SiriGlowInvert />
              </ThemeProvider>
            </EdgeStoreProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
