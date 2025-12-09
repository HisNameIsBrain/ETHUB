"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  FileCode2,
  TerminalSquare,
  FolderTree,
  MonitorPlay,
  Server,
  FileText,
  Settings,
  LogIn,
  LogOut,
  ChevronDown,
  SunMedium,
  MoonStar,
  UserPlus,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";

// -------------------- Types --------------------
type NavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  group?: string;
};

// -------------------- Data --------------------
const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", Icon: LayoutDashboard, group: "Workspace" },
  { href: "/dashboard/code", label: "Code Studio", Icon: FileCode2, group: "Workspace" },
  { href: "/dashboard/terminal", label: "Terminal", Icon: TerminalSquare, group: "Workspace" },
  { href: "/dashboard/files", label: "File Manager", Icon: FolderTree, group: "Workspace" },
  { href: "/dashboard/preview", label: "Live Preview", Icon: MonitorPlay, group: "Workspace" },
  { href: "/dashboard/docker", label: "Docker", Icon: Server, group: "Workspace" },
  { href: "/documents", label: "Documents", Icon: FileText, group: "Resources" },
  { href: "/dashboard/settings", label: "Settings", Icon: Settings, group: "System" },
];

// -------------------- Main Component --------------------
export function MainNavbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [navOpen, setNavOpen] = React.useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);

  const activeNavItem =
    navItems.find(({ href }) => pathname === href || pathname?.startsWith(href + "/")) ??
    navItems[0];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/70 backdrop-blur-xl">
      {/* --- Main top bar --- */}
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 md:px-6">
        {/* Left: Hamburger + dashboard icon */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNavOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-foreground/80 hover:bg-white/10 hover:text-foreground md:hidden"
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

          <Link
            href="/dashboard"
            className="group relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-foreground/90 ring-1 ring-white/10 hover:bg-white/10"
            aria-label="Dashboard"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="pointer-events-none absolute -bottom-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-xs text-white group-hover:block">
              Dashboard
            </span>
          </Link>
        </div>

        {/* Center: Logo text */}
        <Link
          href="/"
          className="relative select-none text-center text-sm font-semibold tracking-[0.3em] text-foreground/90 md:text-base"
        >
          ETHUB
          <span className="absolute -bottom-1 left-1/2 h-px w-12 -translate-x-1/2 bg-gradient-to-r from-transparent via-foreground/60 to-transparent" />
        </Link>

        {/* Right: theme + auth */}
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          {!user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/sign-in"
                className="inline-flex h-9 items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-foreground/90 hover:bg-white/10"
              >
                <LogIn className="h-4 w-4" /> Log in
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex h-9 items-center gap-1 rounded-xl bg-foreground px-3 text-sm font-semibold text-background hover:opacity-90"
              >
                <UserPlus className="h-4 w-4" /> Sign up
              </Link>
            </div>
          ) : (
            <div className="relative">
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <SiriRings />
              </div>
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="relative z-10 flex h-9 items-center gap-1 rounded-full border border-white/10 bg-white/5 pl-1 pr-2 text-xs"
              >
                <ProfileAvatar name={user.fullName || user.username || "User"} imageUrl={user.imageUrl} />
                <ChevronDown className="h-3 w-3 opacity-70" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-background/95 p-1 text-sm shadow-xl backdrop-blur"
                  >
                    {[
                      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
                      { href: "/documents", label: "Documents", icon: FileText },
                      { href: "/dashboard/settings", label: "Settings", icon: Settings },
                    ].map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-foreground/75 hover:bg-white/5 hover:text-foreground"
                        onClick={() => setProfileOpen(false)}
                      >
                        <Icon className="h-4 w-4" /> {label}
                      </Link>
                    ))}
                    <button
                      onClick={() => signOut({ redirectUrl: "/" })}
                      className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-red-400 hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Desktop dropdown */}
      <nav className="mx-auto hidden max-w-7xl items-center px-3 pb-2 md:flex md:px-6">
        <div className="relative">
          <button
            onClick={() => setDesktopMenuOpen((v) => !v)}
            className="inline-flex min-w-[12rem] items-center justify-between gap-3 rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-foreground ring-1 ring-white/15 hover:bg-white/15"
          >
            <span className="flex items-center gap-2 text-left">
              <activeNavItem.Icon className="h-4 w-4" />
              {activeNavItem.label}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition ${desktopMenuOpen ? "rotate-180 opacity-80" : "opacity-60"}`}
            />
          </button>

          <AnimatePresence>
            {desktopMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute left-0 mt-2 w-72 overflow-hidden rounded-xl border border-white/10 bg-background/95 p-1 text-sm shadow-xl backdrop-blur"
              >
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
                      const active = pathname === href || pathname?.startsWith(href + "/");
                      return (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setDesktopMenuOpen(false)}
                          className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition ${
                            active
                              ? "bg-white/10 text-foreground"
                              : "text-foreground/75 hover:bg-white/5 hover:text-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4" /> {label}
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {navOpen && (
          <>
            <motion.button
              onClick={() => setNavOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
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
              <div className="flex flex-col gap-2">
                {navItems.map(({ href, label, Icon }) => {
                  const active = pathname === href || pathname?.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setNavOpen(false)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                        active
                          ? "bg-white/10 text-foreground ring-1 ring-white/20"
                          : "bg-white/5 text-foreground/80 hover:bg-white/10"
                      }`}
                    >
                      <Icon className="h-4 w-4" /> {label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

// -------------------- Subcomponents --------------------
function ThemeToggleButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isDark = resolvedTheme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-foreground/80 hover:bg-white/10"
      aria-label="Toggle theme"
    >
      {mounted && isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
    </button>
  );
}

function ProfileAvatar({ name, imageUrl }: { name: string; imageUrl?: string | null }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <div className="h-7 w-7 overflow-hidden rounded-full border border-white/20 bg-white/10">
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full w-full place-items-center text-xs font-semibold text-foreground">
          {initials}
        </div>
      )}
    </div>
  );
}

function SiriRings() {
  const ring = "absolute rounded-full blur-md opacity-70 mix-blend-screen";
  return (
    <div className="relative h-14 w-14">
      <motion.div
        className={`${ring} h-14 w-14 bg-[conic-gradient(from_0deg,#7dd3fc,#a78bfa,#f472b6,#f59e0b,#7dd3fc)]`}
        animate={{ rotate: 360, scale: [1, 1.08, 1] }}
        transition={{ rotate: { duration: 9, repeat: Infinity }, scale: { duration: 2.8, repeat: Infinity } }}
      />
      <motion.div
        className={`${ring} left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_90deg,#22d3ee,#60a5fa,#a78bfa,#22d3ee)]`}
        animate={{ rotate: -360, scale: [0.9, 1.02, 0.9] }}
        transition={{ rotate: { duration: 5.5, repeat: Infinity }, scale: { duration: 1.8, repeat: Infinity } }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-400/30 via-fuchsia-400/30 to-amber-400/30 blur-xl"
        animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
