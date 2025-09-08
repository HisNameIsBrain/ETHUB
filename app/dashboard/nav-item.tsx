"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Route } from "next";

type Props = {
  href: string | Route;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  children?: React.ReactNode;
};

export default function NavItem({ href, label, icon: Icon, className, children }: Props) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href as Route}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
        active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
      aria-current={active ? "page" : undefined}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      <span className="truncate">{label}</span>
      {children}
    </Link>
  );
}
