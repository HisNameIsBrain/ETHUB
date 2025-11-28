// components/dashboard/main-navbar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  Menu,
  SunMedium,
  MoonStar,
  ChevronDown,
  LayoutDashboard,
  Home,
  Search,
  Server,
  Settings,
  LogIn,
  UserPlus,
  LogOut,
  FileCode2,
  TerminalSquare,
  FolderTree,
  Network,
  MonitorPlay,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";

type NavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

// DevOS tabs + Documents + a Home link
const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", Icon: LayoutDashboard },
  { href: "/dashboard/code", label: "Code Studio", Icon: FileCode2 },
  { href: "/dashboard/terminal", label: "Terminal", Icon: TerminalSquare },
  { href: "/dashboard/files", label: "File Manager", Icon: FolderTree },
  { href: "/dashboard/preview", label: "Live Preview", Icon: MonitorPlay },
  // use Server icon for Docker; it exists in all lucide versions
  { href: "/dashboard/docker", label: "Docker", Icon: Server },
  { href: "/dashboard/ssh", label: "SSH Sessions", Icon: Network },
  { href: "/documents", label: "Documents", Icon: FileText },
  { href: "/dashboard/settings", label: "Settings", Icon: Settings },
  { href: "/dashboard/admin", label: "Admin", Icon: ShieldCheck },
  { href: "/", label: "Home", Icon: Home },
];

export function MainNavbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();

  const [navOpen, setNavOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/70 backdrop-blur-xl">
      {/* main bar */}
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 md:px-6">
        {/* LEFT: mobile menu + dashboard icon */}
        <div className="flex items-center gap-2">
          {/* mobile menu for tabs */}
          <button
            type="button"
            onClick={() => setNavOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-foreground/80 shadow-sm transition hover:bg-white/10 hover:text-foreground md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* dashboard icon */}
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

        {/* CENTER: ETHUB text */}
        <Link
          href="/"
          className="relative select-none text-center text-sm font-semibold tracking-[0.3em] text-foreground/90 md:text-base"
        >
          ETHUB
          <span className="absolute -bottom-1 left-1/2 h-px w-12 -translate-x-1/2 bg-gradient-to-r from-transparent via-foreground/60 to-transparent" />
        </Link>

        {/* RIGHT: theme toggle + auth/profile */}
        <div className="flex items-center gap-2">
          <ThemeToggleButton />

          {/* auth / profile */}
          {!user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/sign-in"
                className="inline-flex h-9 items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-medium text-foreground/90 shadow-sm transition hover:bg-white/10"
              >
                <LogIn className="h-4 w-4" />
                Log in
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex h-9 items-center gap-1 rounded-xl bg-foreground px-3 text-sm font-semibold text-background shadow-sm transition hover:opacity-90"
              >
                <UserPlus className="h-4 w-4" />
                Sign up
              </Link>
            </div>
          ) : (
            <div className="relative">
              {/* Siri glow ring behind profile */}
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <SiriRings />
              </div>

              {/* profile bubble + dropdown */}
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                className="relative z-10 flex h-9 items-center gap-1 rounded-full border border-white/10 bg-white/5 pl-1 pr-2 text-xs"
              >
                <ProfileAvatar
                  name={user.fullName || user.username || "User"}
                  imageUrl={user.imageUrl}
                />
                <ChevronDown className="h-3 w-3 opacity-70" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-background/95 p-1 text-sm shadow-xl backdrop-blur">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-foreground/75 transition hover:bg-white/5 hover:text-foreground"
                    onClick={() => setProfileOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/documents"
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-foreground/75 transition hover:bg-white/5 hover:text-foreground"
                    onClick={() => setProfileOpen(false)}
                  >
                    <FileText className="h-4 w-4" />
                    Documents
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-foreground/75 transition hover:bg-white/5 hover:text-foreground"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>

                  <button
                    type="button"
                    onClick={() => signOut({ redirectUrl: "/" })}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-red-400 transition hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DESKTOP TABS ROW (DevOS tabs) */}
      <nav className="mx-auto hidden max-w-7xl items-center gap-1 px-3 pb-2 md:flex md:px-6">
        {navItems.map(({ href, label, Icon }) => {
          const active =
            pathname === href || pathname?.startsWith(href + "/");
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
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* MOBILE TABS DROPDOWN */}
      {navOpen && (
        <div className="border-t border-white/10 bg-background/95 px-3 pb-3.pt-2 shadow-lg backdrop-blur md:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map(({ href, label, Icon }) => {
              const active =
                pathname === href || pathname?.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition " +
                    (active
                      ? "bg-white/10 text-foreground"
                      : "text-foreground/75 hover:bg-white/5 hover:text-foreground")
                  }
                  onClick={() => setNavOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

/* Hydration-safe theme toggle */

function ThemeToggleButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-foreground/80 shadow-sm transition hover:bg-white/10 hover:text-foreground"
      aria-label="Toggle theme"
    >
      {mounted && isDark ? (
        <SunMedium className="h-4 w-4" />
      ) : (
        <MoonStar className="h-4 w-4" />
      )}
    </button>
  );
}

/* Avatar + Siri rings */

function ProfileAvatar({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl?: string | null;
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="h-7 w-7 overflow-hidden rounded-full border border-white/20 bg-white/10">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-full w-full.place-items-center text-xs font-semibold text-foreground">
          {initials}
        </div>
      )}
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
        transition={{
          rotate: { duration: 9, ease: "linear", repeat: Infinity },
          scale: { duration: 2.8, repeat: Infinity },
        }}
      />

      {/* Inner faster ring */}
      <motion.div
        className={
          ring +
          " left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_90deg,#22d3ee,#60a5fa,#a78bfa,#22d3ee)]"
        }
        animate={{ rotate: -360, scale: [0.9, 1.02, 0.9] }}
        transition={{
          rotate: { duration: 5.5, ease: "linear", repeat: Infinity },
          scale: { duration: 1.8, repeat: Infinity },
        }}
      />

      {/* Pulse halo */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-400/30 via-fuchsia-400/30 to-amber-400/30 blur-xl"
        animate={{
          scale: [0.9, 1.15, 0.9],
          opacity: [0.35, 0.6, 0.35],
        }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
