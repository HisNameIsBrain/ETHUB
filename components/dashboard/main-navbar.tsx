// components/dashboard/main-navbar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import {
  Braces,
  ChevronDown,
  LayoutDashboard,
  Server,
  Settings,
  LogIn,
  LogOut,
  FileCode2,
  TerminalSquare,
  FolderTree,
  MonitorPlay,
  FileText,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";

type NavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  group?: string;
};

// Compact DevOS navigation
const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", Icon: LayoutDashboard, group: "Workspace" },
  { href: "/dashboard/code", label: "Code Studio", Icon: FileCode2, group: "Workspace" },
  { href: "/dashboard/terminal", label: "Terminal", Icon: TerminalSquare, group: "Workspace" },
  { href: "/dashboard/files", label: "File Manager", Icon: FolderTree, group: "Workspace" },
  { href: "/dashboard/preview", label: "Live Preview", Icon: MonitorPlay, group: "Workspace" },
  // use Server icon for Docker; it exists in all lucide versions
  { href: "/dashboard/docker", label: "Docker", Icon: Server, group: "Workspace" },
  { href: "/documents", label: "Documents", Icon: FileText, group: "Resources" },
  { href: "/dashboard/settings", label: "Settings", Icon: Settings, group: "System" },
];

export function MainNavbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();

  const [navOpen, setNavOpen] = React.useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);

  const activeNavItem =
    navItems.find(
      ({ href }) => pathname === href || pathname?.startsWith(href + "/")
    ) ?? navItems[0];

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
            aria-expanded={navOpen}
            aria-label="Toggle navigation"
          >
            <div className="relative flex h-4 w-4 flex-col justify-between">
              {[0, 1, 2].map((index) => (
                <motion.span
                  key={index}
                  className="h-0.5 w-full rounded-full bg-current"
                  animate={{
                    rotate: navOpen && index === 1 ? 45 : 0,
                    y: navOpen ? (index === 0 ? 6 : index === 2 ? -6 : 0) : 0,
                    opacity: navOpen && index === 1 ? 0 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 240, damping: 22 }}
                />
              ))}
            </div>
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

      {/* DESKTOP DROPDOWN NAV */}
      <nav className="mx-auto hidden max-w-7xl items-center px-3 pb-2 md:flex md:px-6">
        <div className="relative">
          <button
            type="button"
            onClick={() => setDesktopMenuOpen((v) => !v)}
            className="i

nline-flex min-w-[12rem] items-center justify-between gap-3 rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-foreground ring-1 ring-white/15 transition hover:bg-white/15"
          >
            <span className="flex items-center gap-2 text-left">
              <activeNavItem.Icon className="h-4 w-4" />
              {activeNavItem.label}
            </span>
            <ChevronDown
              className={
                "h-4 w-4 transition " +
                (desktopMenuOpen ? "rotate-180 opacity-80" : "opacity-60")
              }
            />
          </button>

          {desktopMenuOpen && (
            <div className="absolute left-0 mt-2 w-72 overflow-hidden rounded-xl border border-white/10 bg-background/95 p-1 text-sm shadow-xl backdrop-blur">
              {Object.entries(
                navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
                  const key = item.group || "Other";
                  acc[key] = acc[key] ? [...acc[key], item] : [item];
                  return acc;
                }, {})
              ).map(([group, items]) => (
                <div key={group} className="mb-1 last:mb-0">
                  <div className="px-2 py-1 text-xs uppercase tracking-wide text-foreground/50">
                    {group}
                  </div>
                  {items.map(({ href, label, Icon }) => {
                    const active =
                      pathname === href || pathname?.startsWith(href + "/");
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={
                          "flex items-center gap-2 rounded-lg px-2 py-1.5 transition " +
                          (active
                            ? "bg-white/10 text-foreground"
                            : "text-foreground/75 hover:bg-white/5 hover:text-foreground")
                        }
                        onClick={() => setDesktopMenuOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {section.items.map((item) => {
                    const active =
                      pathname === item.href || pathname?.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setNavOpen(false)}
                        className={
                          "group relative inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[13px] transition " +
                          (active
                            ? "border-white/30 bg-white/10 text-foreground shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
                            : "border-white/10 bg-white/5 text-foreground/75 hover:border-white/20 hover:text-foreground")
                        }
                      >
                        <item.Icon className="h-3.5 w-3.5 opacity-80" />
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="rounded-full bg-gradient-to-r from-white/20 to-white/5 px-2 text-[10px] font-semibold uppercase tracking-wide text-foreground/70">
                            {item.badge}
                          </span>
                        )}
                        {active && (
                          <motion.span
                            layoutId={`nav-active-${section.title}`}
                            className="absolute inset-0 -z-10 rounded-full bg-white/10"
                            transition={{ type: "spring", stiffness: 320, damping: 28 }}
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </GradientShell>
            </div>
          ))}
        </div>
      </nav>

      {/* MOBILE – stacked rainbow cards */}
      <AnimatePresence>
        {navOpen && (
          <>
            <motion.button
              aria-label="Close navigation"
              type="button"
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
              onClick={() => setNavOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative z-50 border-t border-white/10 bg-background/95 px-3 pb-4 pt-3 shadow-xl backdrop-blur md:hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col gap-3">
                {navSections.map((section) => (
                  <GradientShell key={section.title} accent={section.accent}>
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-foreground/60">
                      <span>{section.title}</span>
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-foreground/70">
                        {section.items.length}
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {section.items.map((item) => {
                        const active =
                          pathname === item.href || pathname?.startsWith(item.href + "/");
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setNavOpen(false)}
                            className={
                              "relative flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] shadow-sm transition " +
                              (active
                                ? "bg-white/10 text-foreground ring-1 ring-white/20"
                                : "bg-white/5 text-foreground/80 hover:bg-white/10")
                            }
                          >
                            <span className="grid h-7 w-7 place-items-center rounded-full bg-white/5 text-foreground/80 shadow-inner">
                              <item.Icon className="h-4 w-4" />
                            </span>
                            <div className="flex flex-col">
                              <span className="leading-tight">{item.label}</span>
                              {item.badge && (
                                <span className="text-[10px] uppercase tracking-wide text-foreground/60">{item.badge}</span>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </GradientShell>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
        <div className="grid h-full w-full place-items-center text-xs font-semibold text-foreground">
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

function GradientShell({
  accent,
  children,
}: {
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative rounded-3xl p-[1.5px]">
      <div
        className={`absolute inset-[-18%] -z-10 rounded-[50%] blur-3xl opacity-40 bg-[conic-gradient(at_50%_50%,#22d3ee,#a855f7,#f472b6,#22d3ee)]`}
        aria-hidden
      />
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${accent} p-[1px] shadow-[0_12px_40px_-24px_rgba(0,0,0,0.65)]`}
      >
        <div className="relative h-full rounded-[calc(1rem+2px)] bg-background/80 px-3 py-3 shadow-inner">
          <div className="pointer-events-none absolute inset-0 rounded-[calc(1rem+2px)] border border-white/5" />
          <div className="relative z-10 space-y-1 text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
