"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Eye,
  FileText,
  LayoutDashboard,
  ServerCog,
  Terminal,
  Shield,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Dashboard / Admin", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Dashboard / Docker", href: "/dashboard/docker", icon: ServerCog },
  { label: "Dashboard / SSH", href: "/dashboard/ssh", icon: Terminal },
  { label: "Dashboard / Terminal", href: "/dashboard/terminal", icon: Terminal },
  { label: "Services", href: "/services", icon: Sparkles },
  { label: "eRealms", href: "/erealms", icon: Shield },
];

export default function MainNavbar() {
  const pathname = usePathname();

  const activeItem =
    NAV_ITEMS.find((item) =>
      pathname === item.href || pathname.startsWith(item.href + "/")
    ) ?? NAV_ITEMS[0];

  return (
    <aside className="w-60 rounded-2xl border border-pink-200 bg-pink-100/60 backdrop-blur-md shadow-[0_0_28px_rgba(236,72,153,0.35)] overflow-hidden flex flex-col">
      {/* ...rest unchanged... */}
    </aside>
  );
}

