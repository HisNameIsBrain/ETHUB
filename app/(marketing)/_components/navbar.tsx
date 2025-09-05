"use client";
// app/(marketing)/_components/navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Route } from "next";
import { UserButton, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { SiriGlow } from "@/components/siri-glow";

const links = [
  { href: "/" as Route, label: "Home" },
  { href: "/services" as Route, label: "Services" },
  { href: "/documents" as Route, label: "Documents" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-md">
      {/* Siri glow bar */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5">
          <div className="mx-auto h-full w-[96%] overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-full blur-[2px] opacity-90">
              <SiriGlow />
            </div>
          </div>
        </div>
      </div>

      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 text-white">
        {/* Left: brand + links */}
        <div className="flex items-center gap-3">
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            className="md:hidden rounded-md p-2 hover:bg-white/10"
            onClick={() => setOpen((s) => !s)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>

          <Link href={"/" as Route} className="text-sm font-semibold tracking-wide">
            ETECHHUB
          </Link>

          <div className="ml-4 hidden gap-2 md:flex">
            {links.map((l) => {
              const active = pathname === l.href || pathname?.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-md px-3 py-1.5 text-sm transition ${
                    active ? "bg-white/15" : "hover:bg-white/10"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: theme + auth */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </Button>

          <SignOutButton signOutOptions={{ redirectUrl: "/" }}>
            <Button variant="ghost" size="sm" className="h-8">
              Sign out
            </Button>
          </SignOutButton>

          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-white/10 bg-black/70 px-4 py-2 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => {
              const active = pathname === l.href || pathname?.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-md px-3 py-2 text-sm transition ${
                    active ? "bg-white/15" : "hover:bg-white/10"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
