// app/(marketing)/layout.tsx
import type { ReactNode } from "react";
import "../globals.css"; // adjust if your globals are elsewhere

// These can be client components; importing them here is fine.
import { Navbar } from "./_components/navbar";        // <-- ensure this path exists
import { Footer } from "./_components/footer";        // <-- or remove if you don't use a footer

export const metadata = {
  title: "ETHUB — Services & Info",
  description: "Learn about our services, pricing, and company info.",
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {/* No ClerkProvider here — it already wraps at app/layout.tsx */}
        <Navbar />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
