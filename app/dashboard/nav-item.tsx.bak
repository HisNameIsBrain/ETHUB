// app/dashboard/nav-item.tsx
"use client";

import Link from "next/link";
import type { Route } from "next";
import type { UrlObject } from "url";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
  href: Route | UrlObject;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  children?: React.ReactNode;
};

export default function NavItem({ href, label, icon: Icon, className, children }: Props) {
  const pathname = usePathname();
  const target = typeof href === &quot;string&quot; ? href : href.pathname ?? &quot;&quot;;
  const active = pathname === target;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
        active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
      aria-current={active ? "page" : undefined}
    >
      {children ?? (Icon ? <Icon className="h-4 w-4" /> : null)}
      <span className="truncate">{label}</span>
    </Link>
  );
}
