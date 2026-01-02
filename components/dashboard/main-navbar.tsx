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
  BarChart3,
  BookOpen,
  Boxes,
  Compass,
  FileBox,
  Folder,
  Gamepad2,
  Home,
  Layers,
  ListChecks,
  LogOut,
  Menu,
  MonitorCog,
  Network,
  Route,
  Shield,
  Sparkles,
  Terminal,
  Wrench,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  Icon?: React.ComponentType<{ className?: string }>;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

type NavGroup = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  sections: NavSection[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Marketing",
    icon: Sparkles,
    sections: [
      {
        title: "Landing",
        items: [
          { label: "Home", href: "/", Icon: Home },
          { label: "Services", href: "/services", Icon: Boxes },
          { label: "Manufacturer Catalog", href: "/services/example-maker", Icon: Route },
          { label: "Service Detail", href: "/services/example-maker/example-service", Icon: ListChecks },
          { label: "Erealms", href: "/erealms", Icon: Compass },
          { label: "Siri Preview", href: "/siri-preview", Icon: Sparkles },
        ],
      },
    ],
  },
  {
    label: "Dashboard",
    icon: BarChart3,
    sections: [
      {
        title: "Overview",
        items: [
          { label: "Main Dashboard", href: "/dashboard", Icon: Home },
          { label: "Files", href: "/dashboard/files", Icon: FileBox },
          { label: "Preview", href: "/dashboard/preview", Icon: MonitorCog },
          { label: "Social", href: "/dashboard/social", Icon: Compass },
          { label: "SSH", href: "/dashboard/ssh", Icon: Network },
          { label: "Customers", href: "/dashboard/customers", Icon: UsersIcon },
          { label: "Settings", href: "/dashboard/settings", Icon: Shield },
          { label: "Code", href: "/dashboard/code", Icon: Terminal },
        ],
      },
      {
        title: "Services",
        items: [
          { label: "Catalog", href: "/dashboard/services", Icon: Boxes },
          { label: "New Service", href: "/dashboard/services/new", Icon: Sparkles },
          { label: "Categories", href: "/dashboard/services/categories", Icon: Layers },
          { label: "Service Details", href: "/dashboard/services/sample-service", Icon: ListChecks },
          { label: "Admin Inventory", href: "/dashboard/services/admin/inventory", Icon: Wrench },
        ],
      },
      {
        title: "Data & Tools",
        items: [
          { label: "Voice Clone", href: "/dashboard/voice-clone", Icon: BarChart3 },
          { label: "Dashboard Terminal", href: "/dashboard/terminal", Icon: Terminal },
        ],
      },
    ],
  },
  {
    label: "Workspace",
    icon: Folder,
    sections: [
      {
        title: "Docs & Files",
        items: [
          { label: "Documents", href: "/documents", Icon: BookOpen },
          { label: "Document Detail", href: "/documents/sample-doc", Icon: FileBox },
          { label: "FTP", href: "/ftp", Icon: Network },
          { label: "Terminal", href: "/terminal", Icon: Terminal },
        ],
      },
      {
        title: "Hardware & Repairs",
        items: [
          { label: "PC", href: "/pc", Icon: MonitorCog },
          { label: "Repair", href: "/repair", Icon: Wrench },
          { label: "Portal", href: "/portal", Icon: Compass },
          { label: "Portal Order", href: "/portal/example-order", Icon: ListChecks },
          { label: "Portal Repair", href: "/portal/repair", Icon: Wrench },
        ],
      },
    ],
  },
  {
    label: "MC & Realms",
    icon: Gamepad2,
    sections: [
      {
        title: "Servers & Journeys",
        items: [
          { label: "Minecraft", href: "/mc", Icon: Gamepad2 },
          { label: "Servers", href: "/mc/servers", Icon: Network },
          { label: "Server Detail", href: "/mc/servers/sample", Icon: Route },
          { label: "Journeys", href: "/mc/journey", Icon: Compass },
          { label: "Journey Detail", href: "/mc/journey/sample", Icon: Route },
        ],
      },
      {
        title: "Erealms",
        items: [
          { label: "Erealms", href: "/mc/erealms", Icon: Compass },
          { label: "Erealms Servers", href: "/mc/erealms/servers", Icon: Network },
          { label: "Server Detail", href: "/mc/erealms/servers/sample", Icon: Route },
          { label: "Erealms Journey", href: "/mc/erealms/journey", Icon: Compass },
          { label: "Journey Detail", href: "/mc/erealms/journey/sample", Icon: Route },
          { label: "Games", href: "/mc/erealms/games", Icon: Gamepad2 },
        ],
      },
    ],
  },
  {
    label: "Accounts",
    icon: Shield,
    sections: [
      {
        title: "Access",
        items: [
          { label: "Sign In", href: "/sign-in", Icon: Shield },
          { label: "Sign Up", href: "/sign-up", Icon: Shield },
          { label: "SSO Callback", href: "/sso-callback", Icon: Network },
          { label: "Unauthorized", href: "/unauthorized", Icon: Shield },
        ],
      },
      {
        title: "Organization",
        items: [
          { label: "Create Organization", href: "/create-organization", Icon: Layers },
          { label: "Customers", href: "/customers", Icon: UsersIcon },
          { label: "Admin Import", href: "/admin/dashboard/services/import", Icon: Wrench },
        ],
      },
    ],
  },
  {
    label: "Other Tabs",
    icon: ListChecks,
    sections: [
      {
        title: "Account & Access",
        items: [
          { label: "Create Organization", href: "/create-organization", Icon: Layers },
          { label: "Customers", href: "/customers", Icon: UsersIcon },
          { label: "Unauthorized", href: "/unauthorized", Icon: Shield },
        ],
      },
      {
        title: "Previews & Misc",
        items: [
          { label: "Siri Preview", href: "/siri-preview", Icon: Sparkles },
        ],
      },
    ],
  },
];

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function MainNavbar() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/70 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[360px] overflow-y-auto p-0">
              <SheetTitle className="sr-only">Main navigation</SheetTitle>
              <SheetDescription className="sr-only">
                Navigate ETHUB sections and pages
              </SheetDescription>

              <div className="space-y-6 p-4">
                {NAV_GROUPS.map((group) => (
                  <div key={group.label} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <group.icon className="h-4 w-4" />
                      <span>{group.label}</span>
                    </div>
                    <div className="space-y-2">
                      {group.sections.map((section) => (
                        <div key={section.title} className="space-y-1">
                          <div className="text-xs uppercase tracking-wide text-muted-foreground">
                            {section.title}
                          </div>
                          <div className="space-y-1">
                            {section.items.map((item) => (
                              <NavLink
                                key={item.href}
                                href={item.href}
                                label={item.label}
                                Icon={item.Icon}
                                isActive={isActive(pathname, item.href)}
                                onNavigate={() => setOpen(false)}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t p-4">
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => setOpen(false)}>
                  <LogOut className="h-4 w-4" />
                  Close menu
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="font-semibold tracking-wide">
            ETHUB
          </Link>
        </div>

        <nav className="hidden items-center gap-4 md:flex">
          {NAV_GROUPS.map((group) => (
            <NavDropdown key={group.label} group={group} pathname={pathname} />
          ))}
        </nav>
      </div>
    </header>
  );
}

function NavDropdown({ group, pathname }: { group: NavGroup; pathname: string }) {
  const [open, setOpen] = React.useState(false);
  const isGroupActive = group.sections.some((section) =>
    section.items.some((item) => isActive(pathname, item.href))
  );

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition",
          "hover:text-primary",
          isGroupActive ? "text-primary" : "text-foreground"
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <group.icon className={cn("h-4 w-4 transition-transform", open ? "scale-110" : "scale-100")} />
        <span>{group.label}</span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="absolute left-0 top-full mt-3 w-[380px]"
          >
            <div className="rounded-2xl border border-primary/15 bg-transparent backdrop-blur-xl shadow-xl">
              <div className="grid gap-4 p-4">
                {group.sections.map((section) => (
                  <div key={section.title} className="space-y-2">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                      {section.title}
                    </div>
                    <div className="grid gap-1">
                      {section.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition",
                            isActive(pathname, item.href)
                              ? "text-primary"
                              : "text-foreground hover:text-primary"
                          )}
                        >
                          {item.Icon ? (
                            <item.Icon className="h-4 w-4" />
                          ) : null}
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function NavLink({
  href,
  label,
  Icon,
  isActive,
  onNavigate,
}: NavItem & { isActive: boolean; onNavigate?: () => void }) {
  const IconComponent = Icon;
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
        isActive ? "text-primary" : "hover:text-primary"
      )}
    >
      {IconComponent ? <IconComponent className="h-4 w-4" /> : null}
      <span>{label}</span>
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
