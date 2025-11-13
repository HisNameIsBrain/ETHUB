"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { SiriGlowInvert } from "@/components/siri-glow-invert";
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
  Server,
  Laptop,
  Users,
} from "lucide-react";
import * as React from "react";

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

function NavItem({
  href,
  label,
  Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  Icon: IconType;
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

  const [svcOpen, setSvcOpen] = React.useState(false);
  const [svcOpenMobile, setSvcOpenMobile] = React.useState(false);

  const [erealmsOpen, setErealmsOpen] = React.useState(false);
  const [journeyOpen, setJourneyOpen] = React.useState(false);
  const [serversOpen, setServersOpen] = React.useState(false);

  const [erealmsOpenMobile, setErealmsOpenMobile] = React.useState(false);
  const [journeyOpenMobile, setJourneyOpenMobile] = React.useState(false);
  const [serversOpenMobile, setServersOpenMobile] = React.useState(false);

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
                }}
                className="h-9 w-9 grid place-items-center rounded-lg border hover:bg-white/5 transition md:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>

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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
            >
              <NavItem
                href="/"
                label="Home"
                Icon={HomeIcon}
                active={isActive("/")}
              />
            </motion.div>

            <NavItem
              href="/dashboard"
              label="Dashboard"
              Icon={LayoutDashboard}
              active={isActive("/dashboard")}
            />

            {/* Services dropdown */}
            <div className="relative">
              <button
                onClick={() => setSvcOpen((v) => !v)}
                className={[
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition border",
                  pathname.startsWith("/dashboard/services")
                    ? "bg-primary text-primary-foreground border-transparent"
                    : "hover:bg-white/5 border-transparent",
                ].join(" ")}
              >
                <FolderCog className="h-4 w-4" />
                Services
                <ChevronDown
                  className={`h-4 w-4 transition ${svcOpen ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {svcOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    onMouseLeave={() => setSvcOpen(false)}
                    className="absolute left-0 mt-2 w-56 rounded-lg border bg-background shadow-lg p-2"
                  >
                    <Link
                      href="/dashboard/services"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-white/5"
                      onClick={() => setSvcOpen(false)}
                    >
                      <FolderCog className="h-4 w-4" /> All Services
                    </Link>
                    <Link
                      href="/dashboard/services/new"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-white/5"
                      onClick={() => setSvcOpen(false)}
                    >
                      <Sparkles className="h-4 w-4" /> New Service
                    </Link>
                    <Link
                      href="/dashboard/services/categories"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-white/5"
                      onClick={() => setSvcOpen(false)}
                    >
                      <PanelsTopLeft className="h-4 w-4" /> Categories
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* eRealms dropdown -> /mc/erealms/... */}
            <div className="relative">
              <button
                onClick={() => setErealmsOpen((v) => !v)}
                className={[
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition border",
                  pathname.startsWith("/mc/erealms")
                    ? "bg-primary text-primary-foreground border-transparent"
                    : "hover:bg-white/5 border-transparent",
                ].join(" ")}
              >
                <FolderCog className="h-4 w-4" />
                eRealms
                <ChevronDown
                  className={`h-4 w-4 transition ${
                    erealmsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {erealmsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    onMouseLeave={() => setErealmsOpen(false)}
                    className="absolute left-0 mt-2 w-56 rounded-lg border bg-background shadow-lg p-2"
                  >
                    <Link
                      href="/mc/erealms"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-white/5"
                      onClick={() => setErealmsOpen(false)}
                    >
                      <FolderCog className="h-4 w-4" /> eRealms Home
                    </Link>
                    <Link
                      href="/mc/erealms/games"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-white/5"
                      onClick={() => setErealmsOpen(false)}
                    >
                      <FolderCog className="h-4 w-4" /> Games
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Journey dropdown -> /mc/erealms/journey/... */}
            <div className="relative">
              <button
                onClick={() => setJourneyOpen((v) => !v)}
                className={[
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition border",
                  pathname.startsWith("/mc/erealms/journey")
                    ? "bg-primary text-primary-foreground border-transparent"
                    : "hover:bg-white/5 border-transparent",
                ].join(" ")}
              >
                <FolderCog className="h-4 w-4" />
                Journey
                <ChevronDown
                  className={`h-4 w-4 transition ${
                    journeyOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {journeyOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    onMouseLeave={() => setJourneyOpen(false)}
                    className="absolute left-0 mt-2 w-56 rounded-lg border bg-background shadow-lg p-2"
                  >
                    <Link
                      href="/mc/erealms/journey"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-white/5"
                      onClick={() => setJourneyOpen(false)}
                    >
                      <FolderCog className="h-4 w-4" /> Journal Index
                    </Link>
                    <Link
                      href="/mc/erealms/journey/origin-story"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-white/5"
                      onClick={() => setJourneyOpen(false)}
                    >
                      <FolderCog className="h-4 w-4" /> Origin Story
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Servers dropdown -> /mc/erealms/servers/... */}
            <div className="relative">
              <button
                onClick={() => setServersOpen((v) => !v)}
                className={[
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition border",
                  pathname.startsWith("/mc/erealms/servers") ||
                  pathname.startsWith("/servers")
                    ? "bg-primary text-primary-foreground border-transparent"
                    : "hover:bg-white/5 border-transparent",
                ].join(" ")}
              >
                <FolderCog className="h-4 w-4" />
                Servers
                <ChevronDown
                  className={`h-4 w-4 transition ${
                    serversOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {serversOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    onMouseLeave={() => setServersOpen(false)}
                    className="absolute left-0 mt-2 w-56 rounded-lg border bg-background shadow-lg p-2"
                  >
                    <Link
                      href="/mc/erealms/servers"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-white/5"
                      onClick={() => setServersOpen(false)}
                    >
                      <FolderCog className="h-4 w-4" /> eRealms Servers
                    </Link>
                    <Link
                      href="/servers"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-white/5"
                      onClick={() => setServersOpen(false)}
                    >
                      <FolderCog className="h-4 w-4" /> All Server Offers
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Core app tabs */}
            <NavItem
              href="/portal"
              label="Portal"
              Icon={PanelsTopLeft}
              active={isActive("/portal")}
            />
            <NavItem
              href="/repair"
              label="Repair"
              Icon={FolderCog}
              active={isActive("/repair")}
            />
            <NavItem
              href="/mc"
              label="MC"
              Icon={Server}
              active={isActive("/mc")}
            />
            <NavItem
              href="/pc"
              label="PC"
              Icon={Laptop}
              active={isActive("/pc")}
            />
            <NavItem
              href="/customers"
              label="Customers"
              Icon={Users}
              active={isActive("/customers")}
            />
            <NavItem
              href="/documents"
              label="Documents"
              Icon={FileText}
              active={isActive("/documents")}
            />
            <NavItem
              href="/admin"
              label="Admin"
              Icon={Cog}
              active={isActive("/admin")}
            />
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
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className={[
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                    isActive("/")
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-white/5",
                  ].join(" ")}
                >
                  <HomeIcon className="h-4 w-4" /> Home
                </Link>

                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className={[
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                    isActive("/dashboard")
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-white/5",
                  ].join(" ")}
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>

                {/* Services (mobile nested) */}
                <button
                  onClick={() => setSvcOpenMobile((v) => !v)}
                  className={[
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition",
                    pathname.startsWith("/dashboard/services")
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-white/5",
                  ].join(" ")}
                >
                  <span className="inline-flex items-center gap-3">
                    <FolderCog className="h-4 w-4" /> Services
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition ${
                      svcOpenMobile ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {svcOpenMobile && (
                  <div className="pl-10 space-y-1 text-sm">
                    <Link
                      href="/dashboard/services"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-1 hover:bg-white/5"
                    >
                      <FolderCog className="h-3 w-3" /> All Services
                    </Link>
                    <Link
                      href="/dashboard/services/new"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-1 hover:bg-white/5"
                    >
                      <Sparkles className="h-3 w-3" /> New Service
                    </Link>
                    <Link
                      href="/dashboard/services/categories"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-1 hover:bg-white/5"
                    >
                      <PanelsTopLeft className="h-3 w-3" /> Categories
                    </Link>
                  </div>
                )}

                {/* eRealms (mobile) */}
                <button
                  onClick={() => setErealmsOpenMobile((v) => !v)}
                  className={[
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition",
                    pathname.startsWith("/mc/erealms")
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-white/5",
                  ].join(" ")}
                >
                  <span className="inline-flex items-center gap-3">
                    <FolderCog className="h-4 w-4" /> eRealms
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition ${
                      erealmsOpenMobile ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {erealmsOpenMobile && (
                  <div className="pl-10 space-y-1 text-sm">
                    <Link
                      href="/mc/erealms"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-1 hover:bg-white/5"
                    >
                      <FolderCog className="h-3 w-3" /> eRealms Home
                    </Link>
                    <Link
                      href="/mc/erealms/games"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-1 hover:bg-white/5"
                    >
                      <FolderCog className="h-3 w-3" /> Games
                    </Link>
                  </div>
                )}

                {/* Journey (mobile) */}
                <button
                  onClick={() => setJourneyOpenMobile((v) => !v)}
                  className={[
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition",
                    pathname.startsWith("/mc/erealms/journey")
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-white/5",
                  ].join(" ")}
                >
                  <span className="inline-flex items-center gap-3">
                    <FolderCog className="h-4 w-4" /> Journey
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition ${
                      journeyOpenMobile ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {journeyOpenMobile && (
                  <div className="pl-10 space-y-1 text-sm">
                    <Link
                      href="/mc/erealms/journey"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-1 hover:bg-white/5"
                    >
                      <FolderCog className="h-3 w-3" /> Journal Index
                    </Link>
                    <Link
                      href="/mc/erealms/journey/origin-story"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-1 hover:bg-white/5"
                    >
                      <FolderCog className="h-3 w-3" /> Origin Story
                    </Link>
                  </div>
                )}

                {/* Servers (mobile) */}
                <button
                  onClick={() => setServersOpenMobile((v) => !v)}
                  className={[
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition",
                    pathname.startsWith("/mc/erealms/servers") ||
                    pathname.startsWith("/servers")
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-white/5",
                  ].join(" ")}
                >
                  <span className="inline-flex items-center gap-3">
                    <FolderCog className="h-4 w-4" /> Servers
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition ${
                      serversOpenMobile ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {serversOpenMobile && (
                  <div className="pl-10 space-y-1 text-sm">
                    <Link
                      href="/mc/erealms/servers"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-1 hover:bg-white/5"
                    >
                      <FolderCog className="h-3 w-3" /> eRealms Servers
                    </Link>
                    <Link
                      href="/servers"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-1 hover:bg-white/5"
                    >
                      <FolderCog className="h-3 w-3" /> All Server Offers
                    </Link>
                  </div>
                )}

                {/* Core app folders */}
                <Link
                  href="/portal"
                  onClick={() => setOpen(false)}
                  className={[
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                    isActive("/portal")
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-white/5",
                  ].join(" ")}
                >
                  <PanelsTopLeft className="h-4 w-4" /> Portal
                </Link>

                <Link
                  href="/repair"
                  onClick={() => setOpen(false)}
                  className={[
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                    isActive("/repair")
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-white/5",
                  ].join(" ")}
                >
                  <FolderCog className="h-4 w-4" /> Repair
                </Link>

                <Link
                  href="/mc"
                  onClick={() => setOpen(false)}
                  className={[
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                    isActive("/mc")
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-white/5",
                  ].join(" ")}
                >
                  <Server className="h-4 w-4" /> MC
                </Link>

                <Link
                  href="/pc"
                  onClick={() => setOpen(false)}
                  className={[
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                    isActive("/pc")
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-white/5",
                  ].join(" ")}
                >
                  <Laptop className="h-4 w-4" /> PC
                </Link>

                <Link
                  href="/customers"
                  onClick={() => setOpen(false)}
                  className={[
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                    isActive("/customers")
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-white/5",
                  ].join(" ")}
                >
                  <Users className="h-4 w-4" /> Customers
                </Link>

                <Link
                  href="/documents"
                  onClick={() => setOpen(false)}
                  className={[
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                    isActive("/documents")
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-white/5",
                  ].join(" ")}
                >
                  <FileText className="h-4 w-4" /> Documents
                </Link>

                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className={[
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                    isActive("/admin")
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-white/5",
                  ].join(" ")}
                >
                  <Cog className="h-4 w-4" /> Admin
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
