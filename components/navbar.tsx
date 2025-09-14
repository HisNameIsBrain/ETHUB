"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, FileText, Settings as Cog, Sparkles,
  Menu, X, Sun, Moon
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { SiriGlowRingInvert } from "@/components/siri-glow-invert";

const NAV = [
  { href: "/services",  label: "Services",  icon: Sparkles },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/settings",  label: "Settings",  icon: Cog },
];

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isDark = (theme ?? resolvedTheme) === "dark";
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative h-9 w-9 grid place-items-center rounded-lg border hover:bg-white/5 transition"
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={isDark ? "sun" : "moon"}
          initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
          className="absolute"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold" aria-label="Home">
      {/* text for very small/older screens */}
      <span className="sm:hidden">ETECHHUB</span>

      {/* logo for >= sm screens (OnePlus Nord N20 & desktops) */}
      <span className="relative hidden sm:inline-block">
        <span className="absolute -inset-[14%] opacity-90">
          <SiriGlowRingInvert
            rotateSec={4.2}
            innerRotateSec={5.2}
            blurPx={9}
            insetPercent={-12}
            opacity={0.8}
            thicknessPx={8}
            inner
          />
        </span>
        <span className="relative block overflow-hidden rounded-md border border-white/10 bg-neutral-950/80">
          <img
            src="/logo.svg"
            alt="ETHUB logo"
            className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8"
          />
        </span>
      </span>
    </Link>
  );
}

function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav className="hidden md:flex items-center gap-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname?.startsWith(href + "/");
        return (
          <motion.div key={href} whileHover={{ y: -1, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href={href}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition border
                ${active ? "bg-primary text-primary-foreground border-transparent"
                         : "hover:bg-white/5 border-transparent"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}

function ProfileButton() {
  return (
    <div className="relative h-10 w-10">
      <span className="absolute -inset-[10%] pointer-events-none">
        <SiriGlowRingInvert
          rotateSec={3.6}
          innerRotateSec={4.6}
          blurPx={10}
          insetPercent={-8}
          opacity={0.85}
          thicknessPx={9}
          inner
        />
      </span>
      <div className="relative h-full w-full overflow-hidden rounded-full border border-white/10 bg-black/40 backdrop-blur">
        <UserButton appearance={{ elements: { userButtonAvatarBox: "rounded-full" } }} />
      </div>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-[90] backdrop-blur border-b bg-background/70">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-3 md:px-4">
        <Brand />
        <DesktopNav />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ProfileButton />
          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="md:hidden h-9 w-9 grid place-items-center rounded-lg border hover:bg-white/5 transition"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* mobile: left drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[95] bg-black/50 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute left-0 top-0 h-full w-[82%] max-w-xs border-r bg-background shadow-xl"
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
            >
              <div className="flex items-center justify-between p-3 border-b">
                <span className="font-medium">Menu</span>
                <button
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 grid place-items-center rounded-md border hover:bg-white/5 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-2">
                {NAV.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || pathname?.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition
                        ${active ? "bg-primary text-primary-foreground" : "hover:bg-white/5"}`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
