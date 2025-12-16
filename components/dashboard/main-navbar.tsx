"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  Braces,
  ChevronDown,
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
  Eye,
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
      { href: "/dashboard/voice-analytics", label: "Voice AI", Icon: Search },
      { href: "/dashboard/code", label: "Studio", Icon: Braces, badge: "dev" },
      { href: "/dashboard/preview", label: "Preview", Icon: MonitorPlay },
    ],
  },
  {
    title: "Services & Ops",
    accent: "from-emerald-400/50 via-teal-400/50 to-cyan-500/40",
    items: [
      { href: "/dashboard/services", label: "Services Hub", Icon: Server, badge: "subdirs" },
      { href: "/dashboard/services/categories", label: "Categories", Icon: FolderTree },
      { href: "/dashboard/ssh", label: "Remote", Icon: Network },
      { href: "/dashboard/terminal", label: "Terminal", Icon: TerminalSquare },
    ],
  },
  {
    title: "Community",
    accent: "from-pink-400/60 via-violet-500/55 to-cyan-400/45",
    items: [
      { href: "/dashboard/social", label: "Social", Icon: Sparkles, badge: "new" },
      { href: "/dashboard/social#dm", label: "DM", Icon: MessagesSquare },
      { href: "/dashboard/social#moderation", label: "Moderation", Icon: ShieldCheck },
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
    title: "Play & Support",
    accent: "from-lime-400/50 via-emerald-400/50 to-amber-400/50",
    items: [
      { href: "/portal", label: "Orders", Icon: FolderKanban },
      { href: "/portal/repair", label: "Repair", Icon: Wrench },
      { href: "/mc", label: "MC Hub", Icon: MonitorPlay },
      { href: "/mc/servers", label: "Servers", Icon: Server },
    ],
  },
  {
    title: "Admin",
    accent: "from-rose-400/50 via-red-400/50 to-amber-400/50",
    items: [
      { href: "/dashboard/settings", label: "Settings", Icon: Settings },
      { href: "/dashboard/admin", label: "Admin", Icon: ShieldCheck },
    ],
  },
];

// --- Motion presets (fluid + snappy)
const springy = { type: "spring", stiffness: 520, damping: 38, mass: 0.9 };
const goo = { type: "spring", stiffness: 260, damping: 22, mass: 1.2 };

export function MainNavbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();

  const [navOpen, setNavOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);

  // accordion: only one section expands at a time (mobile)
  const [openSection, setOpenSection] = React.useState<string | null>(null);
  const toggleSection = (title: string) => setOpenSection((cur) => (cur === title ? null : title));

  React.useEffect(() => {
    if (!navOpen) setOpenSection(null);
  }, [navOpen]);

  // close menus on navigation
  React.useEffect(() => {
    setNavOpen(false);
    setProfileOpen(false);
    setOpenSection(null);
  }, [pathname]);

  // active route: longest match wins, avoid "/" catching everything
  const activeNavItem = React.useMemo(() => {
    const allItems = navSections.flatMap((section) =>
      section.items.map((item) => ({ ...item, sectionTitle: section.title })),
    );

    const candidates = allItems
      .filter((item) => {
        if (!pathname) return false;
        if (item.href === "/") return pathname === "/";
        return pathname === item.href || pathname.startsWith(item.href + "/");
      })
      .sort((a, b) => b.href.length - a.href.length);

    return candidates[0];
  }, [pathname]);

  return (
    <header className="relative sticky top-0 z-50 w-full border-b border-white/10 bg-background/70 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[260px] bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.2),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.18),transparent_32%),radial-gradient(circle_at_50%_80%,rgba(236,72,153,0.16),transparent_34%)] blur-3xl" />
      </div>

      {/* main bar */}
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 md:px-6">
        {/* LEFT */}
        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            onClick={() => setNavOpen((v) => !v)}
            whileTap={{ scale: 0.96 }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-foreground/80 shadow-sm transition hover:bg-white/10 hover:text-foreground md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </motion.button>

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

        {/* CENTER */}
        <Link
          href="/"
          className="relative select-none text-center text-sm font-semibold tracking-[0.3em] text-foreground/90 md:text-base"
        >
          ETHUB
          <span className="absolute -bottom-1 left-1/2 h-px w-12 -translate-x-1/2 bg-gradient-to-r from-transparent via-foreground/60 to-transparent" />
        </Link>

        {/* RIGHT */}
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <ProfileMenu
            isOpen={profileOpen}
            onToggle={() => setProfileOpen((v) => !v)}
            onClose={() => setProfileOpen(false)}
            userName={user?.fullName || user?.username || "Guest"}
            imageUrl={user?.imageUrl}
            isAuthed={Boolean(user)}
            signOut={() => signOut({ redirectUrl: "/" })}
          />
        </div>
      </div>

      {/* Active tab ribbon (keep OG, add subtle fluid shimmer) */}
      <div className="mx-auto max-w-7xl px-3 pb-2 md:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-transparent shadow-[0_20px_60px_-35px_rgba(236,72,153,0.7)]">
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-50"
            animate={{ x: ["-30%", "130%"] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: "linear" }}
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
              filter: "blur(8px)",
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(244,114,182,0.2),transparent_30%),radial-gradient(circle_at_70%_0%,rgba(59,130,246,0.15),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(16,185,129,0.18),transparent_32%)] blur-2xl" />

          <div className="relative flex items-center gap-3 px-4 py-3 text-sm text-foreground/90">
            <motion.div
              className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500/30 via-pink-500/20 to-amber-400/25 text-foreground shadow-[0_0_30px_-12px_rgba(236,72,153,0.8)]"
              animate={{ scale: [1, 1.06, 1], rotate: [0, -2, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            >
              {activeNavItem ? <activeNavItem.Icon className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </motion.div>

            <div className="flex flex-col leading-tight">
              <span className="text-[11px] uppercase tracking-[0.2em] text-foreground/60">
                Active
              </span>
              <div className="flex items-center gap-2 text-base font-semibold">
                <span>{activeNavItem?.sectionTitle || "Explore"}</span>

                {/* fluid "pill" morph */}
                <motion.span
                  key={activeNavItem?.href || "default"}
                  layoutId="navbar-active-title"
                  className="relative rounded-full bg-foreground/90 px-2 py-0.5 text-xs text-background"
                  transition={springy}
                >
                  {activeNavItem?.label || "Pick a tab"}
                  <motion.span
                    className="pointer-events-none absolute inset-0 -z-10 rounded-full"
                    layoutId="navbar-active-glow"
                    transition={goo}
                    style={{
                      background:
                        "radial-gradient(circle at 30% 30%, rgba(244,114,182,0.35), transparent 55%)",
                      filter: "blur(10px)",
                    }}
                  />
                </motion.span>
              </div>
            </div>

            <div className="ml-auto hidden items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-foreground/50 sm:flex">
              <span className="h-px w-10 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              Smooth transitions & glow navigation
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP – compact gradient cards (OG) + micro hover fluid */}
      <nav className="mx-auto hidden max-w-7xl flex-col gap-3 px-3 pb-3 md:flex md:px-6">
        <div className="flex w-full gap-3 overflow-x-auto pb-1">
          {navSections.map((section) => (
            <div key={section.title} className="min-w-[200px] flex-1">
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
                      <motion.div key={item.href} whileHover={{ y: -1 }} transition={springy}>
                        <Link
                          href={item.href}
                          className={
                            "group relative isolate inline-flex items-center gap-2 overflow-hidden rounded-full border px-3 py-1.5 text-sm transition " +
                            (active
                              ? "border-fuchsia-400/60 bg-gradient-to-r from-fuchsia-500/20 via-pink-400/15 to-amber-300/10 text-foreground shadow-[0_10px_35px_-20px_rgba(236,72,153,0.8)]"
                              : "border-white/10 bg-white/5 text-foreground/75 hover:border-white/20 hover:text-foreground")
                          }
                        >
                          {/* fluid hover wash */}
                          <motion.span
                            className="pointer-events-none absolute inset-0 -z-10 opacity-0"
                            initial={false}
                            whileHover={{ opacity: 1 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            style={{
                              background:
                                "radial-gradient(circle at 30% 50%, rgba(34,211,238,0.10), transparent 55%)",
                              filter: "blur(10px)",
                            }}
                          />

                          <span className="relative grid h-8 w-8 place-items-center rounded-full bg-white/5 text-foreground">
                            <item.Icon className="h-4 w-4" />
                            {active && (
                              <motion.span
                                layoutId={`nav-icon-${section.title}`}
                                className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-fuchsia-500/40 via-pink-400/30 to-amber-400/25 blur-xl"
                                transition={springy}
                              />
                            )}
                          </span>

                          <span>{item.label}</span>

                          {item.badge && (
                            <span className="rounded-full bg-gradient-to-r from-white/20 to-white/5 px-2 text-[10px] font-semibold uppercase tracking-wide text-foreground/70">
                              {item.badge}
                            </span>
                          )}

                          {active && (
                            <motion.span
                              layoutId={`nav-active-${section.title}`}
                              className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-fuchsia-500/20 via-pink-400/15 to-amber-300/15"
                              transition={springy}
                            />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </GradientShell>
            </div>
          ))}
        </div>
      </nav>

      {/* MOBILE – accordion dropdown: fluid open/close + staggered items */}
      <AnimatePresence initial={false}>
        {navOpen && (
          <motion.div
            key="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeInOut" }}
            className="overflow-hidden border-t border-white/10 bg-gradient-to-b from-background/95 via-slate-950/90 to-background/95 px-3 shadow-xl backdrop-blur md:hidden"
          >
            <motion.div
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -6, opacity: 0 }}
              transition={goo}
              className="pb-4 pt-3"
            >
              <div className="flex flex-col gap-3">
                {navSections.map((section) => {
                  const isOpen = openSection === section.title;

                  return (
                    <GradientShell key={section.title} accent={section.accent}>
                      <button
                        type="button"
                        onClick={() => toggleSection(section.title)}
                        className="flex w-full items-center justify-between text-left"
                        aria-expanded={isOpen}
                      >
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-foreground/60">
                          <span>{section.title}</span>
                          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-foreground/70">
                            {section.items.length}
                          </span>
                        </div>

                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-foreground/80"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </motion.span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key={`${section.title}-panel`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.24, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <motion.div
                              className="mt-3 flex flex-wrap gap-3"
                              initial="hidden"
                              animate="show"
                              exit="hidden"
                              variants={{
                                hidden: { opacity: 0 },
                                show: {
                                  opacity: 1,
                                  transition: { staggerChildren: 0.035, delayChildren: 0.02 },
                                },
                              }}
                            >
                              {section.items.map((item) => {
                                const active =
                                  pathname === item.href ||
                                  pathname?.startsWith(item.href + "/");

                                return (
                                  <motion.div
                                    key={item.href}
                                    variants={{
                                      hidden: { y: 8, opacity: 0, scale: 0.98 },
                                      show: { y: 0, opacity: 1, scale: 1 },
                                    }}
                                    transition={springy}
                                  >
                                    <BubbleLink
                                      item={item}
                                      active={active}
                                      onClick={() => {
                                        setNavOpen(false);
                                        setOpenSection(null);
                                      }}
                                    />
                                  </motion.div>
                                );
                              })}
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </GradientShell>
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

/* Links */

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
      <motion.span
        className="pointer-events-none absolute inset-0 -z-10 opacity-0"
        initial={false}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{
          background:
            "radial-gradient(circle at 30% 50%, rgba(244,114,182,0.12), transparent 60%)",
          filter: "blur(12px)",
        }}
      />

      {active && (
        <motion.span
          layoutId={`bubble-active-${item.href}`}
          className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-white/10"
          transition={springy}
        />
      )}

      <motion.span
        className="relative grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-white/10 via-white/5 to-transparent text-foreground/90 shadow-inner"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.98 }}
        transition={springy}
      >
        <item.Icon className="h-4 w-4" />
      </motion.span>

      <div className="relative flex flex-col">
        <span className="leading-tight">{item.label}</span>
        {item.badge && (
          <span className="text-[10px] uppercase tracking-wide text-foreground/60">
            {item.badge}
          </span>
        )}
      </div>
    </Link>
  );
}

/* Hydration-safe theme toggle */

function ThemeToggleButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";
  const handleToggle = () => setTheme(isDark ? "light" : "dark");

  return (
    <motion.button
      type="button"
      onClick={handleToggle}
      whileTap={{ scale: 0.96 }}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-foreground/80 shadow-sm transition hover:bg-white/10 hover:text-foreground"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={mounted ? (isDark ? "sun" : "moon") : "moon"}
          initial={{ y: 6, opacity: 0, rotate: -10 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -6, opacity: 0, rotate: 10 }}
          transition={springy}
          className="grid place-items-center"
        >
          {mounted && isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

type ProfileMenuProps = {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  userName: string;
  imageUrl?: string | null;
  isAuthed: boolean;
  signOut: () => void;
};

function ProfileMenu({
  isOpen,
  onToggle,
  onClose,
  userName,
  imageUrl,
  isAuthed,
  signOut,
}: ProfileMenuProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) onClose();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  const authedLinks: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { href: "/documents", label: "Documents", Icon: FileText },
    { href: "/dashboard/settings", label: "Profile & Settings", Icon: Settings },
    { href: "/dashboard/admin", label: "Admin Access", Icon: ShieldCheck },
  ];

  const guestLinks: NavItem[] = [
    { href: "/sign-in", label: "Log in", Icon: LogIn },
    { href: "/sign-up", label: "Create account", Icon: UserPlus },
  ];

  const links = isAuthed ? authedLinks : guestLinks;

  return (
    <div ref={rootRef} className="relative">
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <SiriRings />
      </div>

      <motion.button
        type="button"
        onClick={onToggle}
        whileTap={{ scale: 0.985 }}
        className="relative z-10 flex h-9 items-center gap-2 overflow-hidden rounded-full border border-white/15 bg-gradient-to-r from-white/10 via-white/5 to-transparent px-2 text-xs text-foreground shadow-[0_10px_40px_-18px_rgba(0,0,0,0.6)] backdrop-blur"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <motion.span
          className="absolute inset-[-2px] -z-10 rounded-full blur-xl opacity-70"
          animate={{ opacity: [0.55, 0.8, 0.55] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background:
              "linear-gradient(90deg, rgba(34,211,238,0.25), rgba(168,85,247,0.25), rgba(245,158,11,0.20))",
          }}
        />
        <ProfileAvatar name={userName} imageUrl={imageUrl} />
        <span className="hidden text-foreground/80 sm:inline">{userName}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.18, ease: "easeOut" }}>
          <ChevronDown className="h-3 w-3 opacity-70" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="profile-menu"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={goo}
            className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-background/95 p-1 text-sm shadow-2xl ring-1 ring-white/10 backdrop-blur"
          >
            {/* “fluid” glow that follows content */}
            <motion.div
              className="pointer-events-none absolute -inset-10 opacity-60"
              animate={{ rotate: [0, 8, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background:
                  "radial-gradient(circle at 35% 20%, rgba(244,114,182,0.16), transparent 55%), radial-gradient(circle at 75% 70%, rgba(34,211,238,0.14), transparent 60%)",
                filter: "blur(18px)",
              }}
            />

            <div className="relative">
              <div className="flex items-center gap-2 rounded-xl bg-white/5 px-2 py-2">
                <ProfileAvatar name={userName} imageUrl={imageUrl} />
                <div className="leading-tight">
                  <p className="text-xs text-foreground/60">{isAuthed ? "Signed in" : "Guest"}</p>
                  <p className="text-sm font-semibold text-foreground">{userName}</p>
                </div>
              </div>

              <motion.div
                className="mt-1 space-y-1"
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
                }}
              >
                {links.map((item) => (
                  <motion.div
                    key={item.href}
                    variants={{
                      hidden: { y: 8, opacity: 0 },
                      show: { y: 0, opacity: 1 },
                    }}
                    transition={springy}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-foreground/80 transition hover:bg-white/5 hover:text-foreground"
                    >
                      <item.Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              {isAuthed && (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.985 }}
                  onClick={() => {
                    signOut();
                    onClose();
                  }}
                  className="mt-2 flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-red-400 transition hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Avatar + Siri rings */

function ProfileAvatar({ name, imageUrl }: { name: string; imageUrl?: string | null }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="h-7 w-7 overflow-hidden rounded-full border border-white/20 bg-white/10">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
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

      <motion.div
        className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-400/30 via-fuchsia-400/30 to-amber-400/30 blur-xl"
        animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function GradientShell({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div className="relative rounded-3xl p-[1.5px]">
      <div
        className="absolute inset-[-18%] -z-10 rounded-[50%] blur-3xl opacity-40 bg-[conic-gradient(at_50%_50%,#22d3ee,#a855f7,#f472b6,#22d3ee)]"
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
