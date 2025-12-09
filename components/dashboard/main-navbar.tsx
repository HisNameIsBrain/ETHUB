// components/dashboard/main-navbar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  Braces,
  ChevronDown,
  Code2,
  FileCode2,
  FileText,
  FolderKanban,
  FolderTree,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MonitorPlay,
  MoonStar,
  Network,
  MessagesSquare,
  Search,
  Server,
  Settings,
  ShieldCheck,
  Sparkles,
  SunMedium,
  TerminalSquare,
  UserPlus,
  Wrench,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";

type NavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: string;
};

type NavSection = {
  title: string;
  accent: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: "Workspace",
    accent: "from-cyan-400/50 via-sky-500/50 to-blue-600/40",
    items: [
      { href: "/dashboard", label: "Overview", Icon: LayoutDashboard },
      { href: "/dashboard/voice-analytics", label: "Voice", Icon: Search },
      { href: "/dashboard/code", label: "Code", Icon: Braces },
      { href: "/dashboard/preview", label: "Preview", Icon: MonitorPlay },
    ],
  },
  {
    title: "Services",
    accent: "from-emerald-400/50 via-teal-400/50 to-cyan-500/40",
    items: [
      { href: "/dashboard/services", label: "All", Icon: Server, badge: "core" },
      { href: "/dashboard/services/new", label: "New", Icon: FolderKanban },
      { href: "/dashboard/services/categories", label: "Categories", Icon: FolderTree },
      { href: "/dashboard/services/admin/inventory", label: "Inventory", Icon: Wrench },
    ],
  },
  {
    title: "Build & Ops",
    accent: "from-fuchsia-400/60 via-purple-500/50 to-indigo-500/40",
    items: [
      { href: "/dashboard/docker", label: "Docker", Icon: Server },
      { href: "/dashboard/ssh", label: "SSH", Icon: Network },
      { href: "/dashboard/terminal", label: "Terminal", Icon: TerminalSquare },
      { href: "/dashboard/code", label: "Studio", Icon: FileCode2 },
    ],
  },
  {
    title: "Community",
    accent: "from-pink-400/60 via-violet-500/55 to-cyan-400/45",
    items: [
      { href: "/dashboard/social", label: "Social Feed", Icon: Sparkles, badge: "new" },
      { href: "/dashboard/social#dm", label: "Encrypted DM", Icon: MessagesSquare },
      { href: "/dashboard/social#moderation", label: "Moderation", Icon: ShieldCheck },
    ],
  },
  {
    title: "Portal",
    accent: "from-amber-400/60 via-orange-400/60 to-pink-400/50",
    items: [
      { href: "/portal", label: "Orders", Icon: FolderTree },
      { href: "/portal/repair", label: "Repair", Icon: Wrench },
    ],
  },
  {
    title: "Minecraft",
    accent: "from-lime-400/50 via-emerald-400/50 to-sky-400/40",
    items: [
      { href: "/mc", label: "Hub", Icon: MonitorPlay },
      { href: "/mc/servers", label: "Servers", Icon: Network },
      { href: "/mc/erealms", label: "eRealms", Icon: Code2 },
      { href: "/mc/erealms/games", label: "Games", Icon: MonitorPlay },
      { href: "/mc/erealms/journey", label: "Journey", Icon: FolderKanban },
      { href: "/mc/erealms/servers", label: "Realm Servers", Icon: Server },
    ],
  },
  {
    title: "Knowledge",
    accent: "from-sky-400/50 via-blue-500/50 to-fuchsia-500/40",
    items: [
      { href: "/documents", label: "Documents", Icon: FileText },
      { href: "/", label: "Home", Icon: Home },
    ],
  },
  {
    title: "Admin & Settings",
    accent: "from-rose-400/50 via-red-400/50 to-amber-400/50",
    items: [
      { href: "/dashboard/settings", label: "Settings", Icon: Settings },
      { href: "/dashboard/admin", label: "Admin", Icon: ShieldCheck },
    ],
  },
];

export function MainNavbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();

  const [navOpen, setNavOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);

  return (
    <header className="relative sticky top-0 z-50 w-full border-b border-white/10 bg-background/70 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[260px] bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.2),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.18),transparent_32%),radial-gradient(circle_at_50%_80%,rgba(236,72,153,0.16),transparent_34%)] blur-3xl" />
      </div>
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

      {/* DESKTOP – compact gradient cards */}
      <nav className="mx-auto hidden max-w-7xl flex-col gap-3 px-3 pb-3 md:flex md:px-6">
        <div className="flex w-full gap-3 overflow-x-auto pb-1">
          {navSections.map((section) => (
            <div key={section.title} className="min-w-[240px] flex-1">
              <GradientShell accent={section.accent}>
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-foreground/60">
                  <span>{section.title}</span>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-foreground/70">
                    {section.items.length}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {section.items.map((item) => {
                    const active =
                      pathname === item.href || pathname?.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setNavOpen(false)}
                        className={
                          "group relative inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition " +
                          (active
                            ? "border-white/30 bg-white/10 text-foreground"
                            : "border-white/10 bg-white/5 text-foreground/75 hover:border-white/20 hover:text-foreground")
                        }
                      >
                        <item.Icon className="h-4 w-4 opacity-80" />
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
      {navOpen && (
        <div className="border-t border-white/10 bg-gradient-to-b from-background/95 via-slate-950/90 to-background/95 px-3 pb-4 pt-3 shadow-xl backdrop-blur md:hidden">
          <div className="flex flex-col gap-3">
            {navSections.map((section) => (
              <GradientShell key={section.title} accent={section.accent}>
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-foreground/60">
                  <span>{section.title}</span>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-foreground/70">
                    {section.items.length}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-3">
                  {section.items.map((item) => {
                    const active =
                      pathname === item.href || pathname?.startsWith(item.href + "/");
                    return <BubbleLink key={item.href} item={item} active={active} onClick={() => setNavOpen(false)} />;
                  })}
                </div>
              </GradientShell>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

/* Hydration-safe theme toggle */

function BubbleLink({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className="group relative isolate flex min-w-[140px] flex-1 items-center gap-3 overflow-hidden rounded-full border border-white/5 bg-white/5 px-3 py-2 text-sm text-foreground/90 shadow-sm transition hover:border-white/20 hover:bg-white/10"
    >
      <span className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-white/10 via-white/5 to-transparent opacity-0 blur-xl transition duration-500 group-hover:opacity-100" />
      {active && (
        <motion.span
          layoutId={`bubble-active-${item.href}`}
          className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-white/10"
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
        />
      )}

      <span className="relative grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-white/10 via-white/5 to-transparent text-foreground/90 shadow-inner">
        <item.Icon className="h-4 w-4" />
      </span>
      <div className="relative flex flex-col">
        <span className="leading-tight">{item.label}</span>
        {item.badge && (
          <span className="text-[10px] uppercase tracking-wide text-foreground/60">{item.badge}</span>
        )}
      </div>
    </Link>
  );
}

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
