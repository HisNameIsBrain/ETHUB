import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

// client-only loader so it doesn’t run on SSR
const TopSiriLoader = dynamic(() => import("@/components/top-siri-loader"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "ETHUB",
  description: "Tech Hub app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <TopSiriLoader />
          <Suspense fallback={<TopSiriLoader />}>{children}</Suspense>
        </Providers>
      </body>
    </html>
  );
}