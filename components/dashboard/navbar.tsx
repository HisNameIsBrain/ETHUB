"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Home, LayoutDashboard, Search, Settings } from "lucide-react";


// If you use Clerk, pass `user` and `signInUrl/signUpUrl` from your layout/page.
// Otherwise swap these for your auth system.

type NavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/", label: "Home", Icon: Home },
  { href: "/dashboard/search", label: "Search", Icon: Search },
  { href: "/dashboard/settings", label: "Settings", Icon: Settings },
];

export function MainNavbar({
  user,
  onMenuClick,
  signInHref = "/sign-in",
  signUpHref = "/sign-up",
}: {
  user?: {
    imageUrl?: string | null;
    name?: string | null;
  } | null;
  onMenuClick?: () => void;
  signInHref?: string;
  signUpHref?: string;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 md:px-6">
        {/* Left: dashboard icon + hamburger */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-foreground/80 shadow-sm transition hover:bg-white/10 hover:text-foreground"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link
            href="/dashboard"
            className="group relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-foreground/90 ring-1 ring-white/10 transition hover:bg-white/10"
            aria-label="ETHUB dashboard"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="pointer-events-none absolute -bottom-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-xs text-white group-hover:block">
              Dashboard
            </span>
          </Link>
        </div>

        {/* Middle: ETHUB text */}
        <Link
          href="/"
          className="relative select-none text-center text-sm font-semibold tracking-[0.25em] text-foreground/90 md:text-base"
        >
          ETHUB
          <span className="absolute -bottom-1 left-1/2 h-px w-10 -translate-x-1/2 bg-gradient-to-r from-transparent via-foreground/60 to-transparent" />
        </Link>

        {/* Right: auth area */}
        <div className="flex items-center gap-2">
          {!user ? (
            <div className="flex items-center gap-2">
              <Link
                href={signInHref}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-medium text-foreground/90 shadow-sm transition hover:bg-white/10"
              >
                Log in
              </Link>
              <Link
                href={signUpHref}
                className="inline-flex h-9 items-center justify-center rounded-xl bg-foreground px-3 text-sm font-semibold text-background shadow-sm transition hover:opacity-90"
              >
                Sign up
              </Link>
            </div>
          ) : (
            <ProfileBubble user={user} />
          )}
        </div>
      </div>

      {/* Optional: second-row nav for desktop */}
      <nav className="mx-auto hidden max-w-7xl items-center gap-1 px-3 pb-2 md:flex md:px-6">
        {navItems.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={
                "relative inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition " +
                (active
                  ? "bg-white/10 text-foreground ring-1 ring-white/15"
                  : "text-foreground/70 hover:bg-white/5 hover:text-foreground")
              }
            >
              <Icon className="h-4 w-4" />
              {label}
              {active && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="absolute inset-0 -z-10 rounded-xl bg-white/10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

function ProfileBubble({
  user,
}: {
  user: { imageUrl?: string | null; name?: string | null };
}) {
  const initials = (user?.name || "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="relative">
      {/* Siri-like glow rings */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <SiriRings />
      </div>

      <button
        type="button"
        className="relative z-10 h-9 w-9 overflow-hidden rounded-full border border-white/10 bg-white/5 ring-1 ring-white/15 shadow-sm"
        aria-label="Open profile menu"
      >
        {user.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.imageUrl}
            alt={user.name ?? "Profile"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs font-semibold text-foreground">
            {initials}
          </div>
        )}
      </button>
    </div>
  );
}

function SiriRings() {
  const ring =
    "absolute rounded-full blur-md opacity-70 mix-blend-screen";

  return (
    <div className="relative h-14 w-14">
      {/* Outer slow ring */}
      <motion.div
        className={
          ring +
          " h-14 w-14 bg-[conic-gradient(from_0deg,#7dd3fc,#a78bfa,#f472b6,#f59e0b,#7dd3fc)]"
        }
        animate={{ rotate: 360, scale: [1, 1.08, 1] }}
        transition={{ rotate: { duration: 9, ease: "linear", repeat: Infinity }, scale: { duration: 2.8, repeat: Infinity } }}
      />

      {/* Inner faster ring */}
      <motion.div
        className={
          ring +
          " left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_90deg,#22d3ee,#60a5fa,#a78bfa,#22d3ee)]"
        }
        animate={{ rotate: -360, scale: [0.9, 1.02, 0.9] }}
        transition={{ rotate: { duration: 5.5, ease: "linear", repeat: Infinity }, scale: { duration: 1.8, repeat: Infinity } }}
      />

      {/* Pulse halo */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-400/30 via-fuchsia-400/30 to-amber-400/30 blur-xl"
        animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
