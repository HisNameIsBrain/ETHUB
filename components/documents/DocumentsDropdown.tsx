"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  SunMedium,
  MoonStar,
  ChevronDown,
  LayoutDashboard,
  FileText,
  Star,
  Users,
  LogOut,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { NewDocFromTemplate } from "@/components/documents/NewDocFromTemplate";

type DocNavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

// Document-related pages only.
const docNavItems: DocNavItem[] = [
  { href: "/documents", label: "All docs", Icon: FileText },
  { href: "/documents/favorites", label: "Favorites", Icon: Star },
  { href: "/documents/shared", label: "Shared", Icon: Users },
];

export function DocumentsNavbar({ parentId }: { parentId?: string }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user } = useUser();
  const { signOut } = useClerk();

  const [profileOpen, setProfileOpen] = React.useState(false);

  const toggleTheme = () =>
    setTheme(theme === "light" ? "dark" : "light");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-3 md:px-6">
        {/* LEFT: ETHUB + quick link back to dashboard */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center rounded-xl bg-white/5 px-3 text-xs font-semibold tracking-[0.25em] text-foreground/80 ring-1 ring-white/10 transition hover:bg-white/10 md:text-sm"
          >
            ETHUB
          </Link>
        </div>

        {/* CENTER: document bar (templates, filters, etc.) */}
        <div className="hidden flex-1 items-center justify-center gap-3 md:flex">
          {/* New document from template (Convex) */}
          <NewDocFromTemplate parentId={parentId} />

          {/* Here you can mount other documents _components that match Convex schema:
             - <DocumentsSearchInput />
             - <DocumentsPropertiesFilter />
             - <DocumentsSortControl />
             Just import them from your routes _components. */}
        </div>

        {/* RIGHT: docs links + theme + profile dropdown */}
        <div className="flex items-center gap-3">
          {/* documents links on the right (reversed from dashboard) */}
          <nav className="hidden items-center gap-1 md:flex">
            {docNavItems.map(({ href, label, Icon }) => {
              const active =
                pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={
                    "relative inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs md:text-sm transition " +
                    (active
                      ? "bg-white/10 text-foreground ring-1 ring-white/15"
                      : "text-foreground/70 hover:bg-white/5 hover:text-foreground")
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {active && (
                    <motion.span
                      layoutId="docs-nav-pill"
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

          {/* theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-foreground/80 shadow-sm transition hover:bg-white/10 hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <MoonStar className="h-4 w-4" />
            ) : (
              <SunMedium className="h-4 w-4" />
            )}
          </button>

          {user && (
            <div className="relative">
              {/* Siri ring around profile bubble */}
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <SiriRings />
              </div>

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

      {/* mobile: docs links + create bar below */}
      <div className="border-t border-white/10 bg-background/95 px-3 pb-2 pt-1 text-xs shadow-sm backdrop-blur md:hidden">
        <div className="flex flex-wrap gap-1">
          {docNavItems.map(({ href, label, Icon }) => {
            const active =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={
                  "inline-flex items-center gap-1 rounded-lg px-2 py-1 transition " +
                  (active
                    ? "bg-white/10 text-foreground"
                    : "text-foreground/70 hover:bg-white/5 hover:text-foreground")
                }
              >
                <Icon className="h-3 w-3" />
                {label}
              </Link>
            );
          })}
        </div>

        <div className="mt-2">
          <NewDocFromTemplate parentId={parentId} />
        </div>
      </div>
    </header>
  );
}

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
        animate={{
          scale: [0.9, 1.15, 0.9],
          opacity: [0.35, 0.6, 0.35],
        }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
