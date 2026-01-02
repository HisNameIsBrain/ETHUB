import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { SiriGlowInvert } from "@/components/siri-glow-invert";
import { ThemeToggle } from "@/components/theme-toggle";
import TopSiriLoader from "@/components/top-siri-loader";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  Home as HomeIcon,
  LayoutDashboard,
  FolderCog,
  ChevronDown,
  FileText,
  PanelsTopLeft,
  Sparkles,
  Settings as Cog,
  User as UserIcon,
  Search,
  Code2,
  HardDrive,
  Terminal,
} from "lucide-react";
import * as React from "react";

function NavItem({
  href,
  label,
  Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.div whileHover={{ y: -1, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Link
        href={href}
        onClick={onClick}
        className={[
          "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition border",
          active
            ? "bg-primary text-primary-foreground border-transparent"
            : "hover:bg-white/5 border-transparent",
        ].join(" ")}
      >
        <Icon className="h-4 w-4" />
        {label}
      </Link>
    </motion.div>
  );
}

type NavNode = {
  key: string;
  label: string;
  href?: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children?: NavNode[];
};

const NAV_ITEMS: NavNode[] = [
  { key: "home", label: "Home", href: "/", Icon: HomeIcon },
  { key: "dashboard", label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
  {
    key: "services",
    label: "Services",
    Icon: FolderCog,
    children: [
      { key: "svc-all", label: "All Services", href: "/dashboard/services", Icon: FolderCog },
      { key: "svc-new", label: "New Service", href: "/dashboard/services/new", Icon: Sparkles },
      { key: "svc-categories", label: "Categories", href: "/dashboard/services/categories", Icon: PanelsTopLeft },
    ],
  },
  {
    key: "erealms",
    label: "eRealms",
    Icon: FolderCog,
    children: [
      { key: "erealms-home", label: "eRealms Home", href: "/mc/erealms", Icon: FolderCog },
      { key: "erealms-games", label: "Games", href: "/mc/erealms/games", Icon: FolderCog },
    ],
  },
  {
    key: "journey",
    label: "Journey",
    Icon: FolderCog,
    children: [
      { key: "journey-index", label: "Journal Index", href: "/mc/erealms/journey", Icon: FolderCog },
      { key: "journey-origin", label: "Origin Story", href: "/mc/erealms/journey/origin-story", Icon: FolderCog },
    ],
  },
  {
    key: "servers",
    label: "Servers",
    Icon: FolderCog,
    children: [
      { key: "servers-erealms", label: "eRealms Servers", href: "/mc/erealms/servers", Icon: FolderCog },
      { key: "servers-all", label: "All Server Offers", href: "/servers", Icon: FolderCog },
    ],
  },
  { key: "documents", label: "Documents", href: "/documents", Icon: FileText },
  { key: "portal", label: "Portal", href: "/portal", Icon: PanelsTopLeft },
  { key: "code", label: "Code", href: "/dashboard/code", Icon: Code2 },
  { key: "ftp", label: "FTP", href: "/ftp", Icon: HardDrive },
  { key: "terminal", label: "Terminal", href: "/terminal", Icon: Terminal },
];

function ProfileButtonLg() {
  return (
    <div className="relative h-12 w-12">
      <span className="absolute -inset-[12%] pointer-events-none">
        <SiriGlowInvert
          rotateSec={3.6}
          innerRotateSec={4.6}
          blurPx={10}
          insetPercent={0}
          opacity={0.85}
          thicknessPx={9}
          inner
        />
      </span>
      <div className="relative h-full w-full overflow-hidden rounded-full border border-white/10 bg-black/40 backdrop-blur">
        <UserButton
          appearance={{ elements: { userButtonAvatarBox: "rounded-full" } }}
        />
      </div>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [desktopOpen, setDesktopOpen] = React.useState<Record<string, boolean>>({});
  const [mobileOpen, setMobileOpen] = React.useState<Record<string, boolean>>({});

  const [query, setQuery] = React.useState("");
  const [drawerQuery, setDrawerQuery] = React.useState("");

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const submitSearch = (q: string) => {
    const v = q.trim();
    if (!v) return;
    router.push(`/search?q=${encodeURIComponent(v)}`);
  };

  return (
    <>
      <TopSiriLoader />

      <nav className="sticky top-0 z-[90] w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="mx-auto max-w-7xl px-4 py-1">
          {/* Row 1: brand / profile */}
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                aria-label="Open menu"
                onClick={() => {
                  setOpen(true);
                  setTimeout(() => {}, 220);
                }}
                className="h-9 w-9 grid place-items-center rounded-lg border hover:bg-white/5 transition md:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
	       <ThemeToggle/>
              <Link href="/" className="flex items-center gap-2" aria-label="Home">
                <motion.span
                  className="hidden sm:inline-flex items-center gap-2"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35 }}
                >
                  <Sparkles className="h-5 w-5" />
                  <img src="/logo.svg" alt="ETHUB" className="h-7 w-auto" />
                </motion.span>
                <span className="sm:hidden text-base font-semibold">
                  ETECHHUB
                </span>
              </Link>
            </div>

            <div className="hidden md:flex items-center">
              <div className="relative h-10 w-10">
                <span className="absolute -inset-[10%] pointer-events-none">
                  <SiriGlowInvert
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
                  <UserButton
                    appearance={{ elements: { userButtonAvatarBox: "rounded-full" } }}
                  />
                </div>
              </div>
            </div>

            <div className="md:hidden w-9 h-9" />
          </div>

          {/* Row 2: search */}
          <div className="hidden md:block">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch(query);
              }}
              className="relative w-full sm:w-96"
            >
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="h-8 pl-8 pr-3 w-full text-sm rounded-md border border-transparent bg-muted/60 focus:bg-muted/70 outline-none"
              />
            </form>
          </div>

          {/* Row 3: desktop nav */}
          <div className="hidden md:flex items-center gap-1 mt-2">
            {NAV_ITEMS.map((item) => {
              if (!item.children?.length) {
                return (
                  <NavItem
                    key={item.key}
                    href={item.href ?? "#"}
                    label={item.label}
                    Icon={item.Icon}
                    active={item.href ? isActive(item.href) : false}
                  />
                );
              }

              const open = desktopOpen[item.key];

              return (
                <div className="relative" key={item.key}>
                  <button
                    onClick={() =>
                      setDesktopOpen((prev) => ({
                        ...prev,
                        [item.key]: !prev[item.key],
                      }))
                    }
                    className={[
                      "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition border",
                      item.href && pathname.startsWith(item.href)
                        ? "bg-primary text-primary-foreground border-transparent"
                        : "hover:bg-white/5 border-transparent",
                    ].join(" ")}
                  >
                    <item.Icon className="h-4 w-4" />
                    {item.label}
                    <ChevronDown
                      className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        onMouseLeave={() =>
                          setDesktopOpen((prev) => ({
                            ...prev,
                            [item.key]: false,
                          }))
                        }
                        className="absolute left-0 mt-2 w-56 rounded-lg border bg-background shadow-lg p-2"
                      >
                        {item.children.map((child) => (
                          <div key={child.key} className="space-y-1">
                            <Link
                              href={child.href ?? "#"}
                              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-white/5"
                              onClick={() =>
                                setDesktopOpen((prev) => ({
                                  ...prev,
                                  [item.key]: false,
                                }))
                              }
                            >
                              <child.Icon className="h-4 w-4" /> {child.label}
                            </Link>

                            {child.children?.length ? (
                              <div className="ml-6 space-y-1">
                                {child.children.map((grand) => (
                                  <Link
                                    key={grand.key}
                                    href={grand.href ?? "#"}
                                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-white/5"
                                    onClick={() =>
                                      setDesktopOpen((prev) => ({
                                        ...prev,
                                        [item.key]: false,
                                      }))
                                    }
                                  >
                                    <grand.Icon className="h-4 w-4" /> {grand.label}
                                  </Link>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[95] bg-black/50 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="absolute left-0 top-0 h-full w-[25%] min-w-[260px] max-w-xs border-r bg-background shadow-xl flex flex-col"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-3 border-b">
                <span className="inline-flex items-center gap-2 font-medium">
                  <Sparkles className="h-4 w-4" /> Menu
                </span>
                <button
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 grid place-items-center rounded-md border hover:bg-white/5 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Search inside drawer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitSearch(drawerQuery);
                  setOpen(false);
                }}
                className="p-3"
              >
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                  <input
                    value={drawerQuery}
                    onChange={(e) => setDrawerQuery(e.target.value)}
                    placeholder="Search…"
                    className="h-9 pl-8 pr-3 w-full text-sm rounded-md border border-transparent bg-muted/60 focus:bg-muted/70 outline-none"
                  />
                </div>
              </form>

              {/* Account */}
              <div className="p-3 border-y">
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ rotate: 2, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  >
                    <ProfileButtonLg />
                  </motion.div>
                  <div className="flex flex-col">
                    <div className="inline-flex items-center gap-2 font-medium">
                      <UserIcon className="h-4 w-4" />
                      Account
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Profile &amp; settings
                    </span>
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="p-2 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => (
                  <MobileNavNode
                    key={item.key}
                    item={item}
                    isActive={isActive}
                    closeDrawer={() => setOpen(false)}
                    mobileOpen={mobileOpen}
                    setMobileOpen={setMobileOpen}
                  />
                ))}
              </div>

              {/* Settings pinned bottom */}
              <div className="mt-auto p-2 border-t">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setOpen(false)}
                  className={[
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                    isActive("/dashboard/settings")
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-white/5",
                  ].join(" ")}
                >
                  <Cog className="h-4 w-4" /> Settings
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MobileNavNode({
  item,
  depth = 0,
  isActive,
  closeDrawer,
  mobileOpen,
  setMobileOpen,
}: {
  item: NavNode;
  depth?: number;
  isActive: (href: string) => boolean;
  closeDrawer: () => void;
  mobileOpen: Record<string, boolean>;
  setMobileOpen: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) {
  const hasChildren = !!item.children?.length;
  const open = mobileOpen[item.key];
  const leftPad = depth * 12;

  if (!hasChildren) {
    return (
      <Link
        href={item.href ?? "#"}
        onClick={closeDrawer}
        className={[
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
          isActive(item.href ?? "")
            ? "bg-primary text-primary-foreground"
            : "hover:bg-white/5",
        ].join(" ")}
        style={{ marginLeft: leftPad }}
      >
        <item.Icon className="h-4 w-4" /> {item.label}
      </Link>
    );
  }

  return (
    <div className="space-y-1" style={{ marginLeft: leftPad }}>
      <button
        onClick={() =>
          setMobileOpen((prev) => ({
            ...prev,
            [item.key]: !prev[item.key],
          }))
        }
        className="w-full flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-white/5"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-3">
          <item.Icon className="h-4 w-4" /> {item.label}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col"
          >
            {item.children?.map((child) => (
              <MobileNavNode
                key={child.key}
                item={child}
                depth={depth + 1}
                isActive={isActive}
                closeDrawer={closeDrawer}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

