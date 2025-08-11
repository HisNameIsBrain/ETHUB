import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers";
import { Suspense } from "react";
import TopSiriLoader from "@/components/top-siri-loader";

const inter = Inter({ subsets: ["latin"] });

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
          <Suspense fallback={<TopSiriLoader />}>
            {children}
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}