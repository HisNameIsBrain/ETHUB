"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Home,
  Search,
  Percent,
  ShoppingCart,
  User,
  Menu,
  Settings,
  LogOut,
  LayoutGrid,
  Terminal,
  Folder,
  MessageSquare,
  Shield,
} from "lucide-react";

/**
 * Goal:
 * - Mobile: pill-style bottom bar like the RIGHT image (active item expands w/ label)
 * - Left-side: smooth, dynamic “category rail” menu effect like the LEFT example (icons -> reveal panel)
 * - No extra packages: uses framer-motion + shadcn Sheet + lucide
 *
 * Drop into: components/dashboard/main-navbar.tsx
 */

type DockKey = "home" | "search" | "offers" | "cart" | "profile";

type DockItem = {
  key: DockKey;
  label: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const DOCK: DockItem[] = [
  { key: "home", label: "Home", href: "/dashboard", Icon: Home },
  { key: "search", label: "Search", href: "/dashboard/search", Icon: Search },
  { key: "offers", label: "Offers", href: "/dashboard/offers", Icon: Percent },
  { key: "cart", label: "Cart", href: "/dashboard/cart", Icon: ShoppingCart },
  { key: "profile", label: "Profile", href: "/dashboard/profile", Icon: User },
];

type RailSection = {
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  items: { label: string; href: string; Icon?: React.ComponentType<{ className?: string }> }[];
};

const RAIL: RailSection[] = [
  {
    id: "core",
    label: "Core",
    Icon: LayoutGrid,
    items: [
      { label: "Dashboard", href: "/dashboard", Icon: Home },
      { label: "Documents", href: "/dashboard/documents", Icon: Folder },
      { label: "Settings", href: "/dashboard/settings", Icon: Settings },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    Icon: Terminal,
    items: [
      { label: "Terminal", href: "/dashboard/terminal", Icon: Terminal },
      { label: "FTP", href: "/dashboard/ftp", Icon: Folder },
    ],
  },
  {
    id: "social",
    label: "Social",
    Icon: MessageSquare,
    items: [{ label: "Messages", href: "/dashboard/dm", Icon: MessageSquare }],
  },
  {
    id: "admin",
    label: "Admin",
    Icon: Shield,
    items: [{ label: "Admin", href: "/dashboard/admin", Icon: Shield }],
  },
];

function activeDockFromPath(pathname: string): DockKey {
  if (pathname.startsWith("/dashboard/search")) return "search";
  if (pathname.startsWith("/dashboard/offers")) return "offers";
  if (pathname.startsWith("/dashboard/cart")) return "cart";
  if (pathname.startsWith("/dashboard/profile")) return "profile";
  return "home";
}

export function MainNavbar() {
  const pathname = usePathname() || "/dashboard";
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {/* Top mini bar (optional) */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4">
          <div className="flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="p-0 w-[360px]">
                {/* Accessibility requirement */}
                <SheetTitle className="sr-only">Main navigation</SheetTitle>
                <SheetDescription className="sr-only">
                  Navigate ETHUB sections and pages
                </SheetDescription>

                <RailMenu pathname={pathname} onNavigate={() => setOpen(false)} />
                <div className="border-t p-3">
                  <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => setOpen(false)}>
                    <LogOut className="h-4 w-4" />
                    Close
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/dashboard" className="font-semibold tracking-wide">
              ETHUB
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile bottom dock (RIGHT image style) */}
      <MobileDock pathname={pathname} />

      {/* Spacer so bottom dock doesn’t overlap content */}
      <div className="h-[84px] md:h-0" />
    </>
  );
}

/* -----------------------------------------
   LEFT: “Rail + reveal panel” smooth menu
------------------------------------------ */

function RailMenu({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: () => void;
}) {
  const [active, setActive] = React.useState<string>(RAIL[0]?.id ?? "core");

  // Keep active section stable: if current route matches a section item, auto-select it.
  React.useEffect(() => {
    const match = RAIL.find((s) => s.items.some((it) => pathname === it.href || pathname.startsWith(it.href + "/")));
    if (match) setActive(match.id);
  }, [pathname]);

  const activeSection = RAIL.find((s) => s.id === active) ?? RAIL[0];

  return (
    <div className="h-full">
      <div className="px-4 pt-4 pb-2">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Menu</div>
      </div>

      <div className="grid grid-cols-[72px_1fr] gap-0 px-2 pb-3">
        {/* Icon rail */}
        <div className="flex flex-col items-center gap-2 py-2">
          {RAIL.map((s) => {
            const isOn = s.id === active;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={cn(
                  "relative flex h-12 w-12 items-center justify-center rounded-2xl border",
                  "transition-colors",
                  isOn ? "bg-primary/10 border-primary/20" : "bg-background hover:bg-accent"
                )}
                aria-label={s.label}
              >
                {isOn && (
                  <motion.div
                    layoutId="railActive"
                    className="absolute inset-0 rounded-2xl bg-primary/10"
                    transition={{ type: "spring", stiffness: 520, damping: 36 }}
                  />
                )}
                <s.Icon className={cn("relative h-5 w-5", isOn ? "text-primary" : "text-muted-foreground")} />
              </button>
            );
          })}
        </div>

        {/* Reveal panel */}
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-background to-accent/20">
          <div className="px-4 py-3">
            <div className="flex items-center gap-2">
              <activeSection.Icon className="h-4 w-4 text-primary" />
              <div className="font-semibold">{activeSection.label}</div>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Quick access
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeSection.id}
              initial={{ x: 26, opacity: 0, filter: "blur(6px)" }}
              animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ x: -26, opacity: 0, filter: "blur(6px)" }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className="px-2 pb-3"
            >
              <div className="space-y-1">
                {activeSection.items.map((it) => {
                  const on = pathname === it.href || pathname.startsWith(it.href + "/");
                  const ItIcon = it.Icon;
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
                        on ? "bg-primary/10 text-primary font-semibold" : "hover:bg-accent"
                      )}
                    >
                      {ItIcon ? <ItIcon className={cn("h-4 w-4", on ? "text-primary" : "text-muted-foreground")} /> : null}
                      <span>{it.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* soft dots like the sample */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.08]"
               style={{
                 backgroundImage:
                   "radial-gradient(currentColor 1px, transparent 1px)",
                 backgroundSize: "18px 18px",
               }}
          />
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------
   RIGHT: Pill bottom dock (expanding active)
------------------------------------------ */

function MobileDock({ pathname }: { pathname: string }) {
  const activeKey = activeDockFromPath(pathname);

  return (
    <div className="fixed bottom-3 left-0 right-0 z-50 md:hidden">
      <div className="mx-auto w-[min(560px,92vw)]">
        <div className="rounded-[28px] border bg-primary px-2 py-2 shadow-lg">
          <div className="flex items-center justify-between gap-2">
            {DOCK.map((it) => {
              const on = it.key === activeKey;
              const Icon = it.Icon;

              return (
                <Link
                  key={it.key}
                  href={it.href}
                  className={cn(
                    "relative flex items-center justify-center rounded-[22px] px-3 py-2",
                    "text-white/80 hover:text-white transition-colors",
                    on ? "flex-[1.3]" : "flex-1"
                  )}
                  aria-label={it.label}
                >
                  {/* active pill background (shared layout for smooth slide) */}
                  {on && (
                    <motion.div
                      layoutId="dockActive"
                      className="absolute inset-0 rounded-[22px] bg-white"
                      transition={{ type: "spring", stiffness: 520, damping: 38 }}
                    />
                  )}

                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <Icon className={cn("h-5 w-5", on ? "text-primary" : "text-white/80")} />
                    <AnimatePresence initial={false}>
                      {on ? (
                        <motion.span
                          key="label"
                          initial={{ width: 0, opacity: 0, x: -6 }}
                          animate={{ width: "auto", opacity: 1, x: 0 }}
                          exit={{ width: 0, opacity: 0, x: -6 }}
                          transition={{ type: "spring", stiffness: 520, damping: 40 }}
                          className="whitespace-nowrap text-sm font-semibold text-primary"
                        >
                          {it.label}
                        </motion.span>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* subtle “glow” like the reference */}
        <div className="pointer-events-none mx-auto mt-2 h-2 w-[88%] rounded-full blur-xl bg-primary/30" />
      </div>
    </div>
  );
}
