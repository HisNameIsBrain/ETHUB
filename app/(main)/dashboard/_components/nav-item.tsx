"use client";

import * as React from "react";
import Link from "next/link";
import type { UrlObject } from "url";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  href: string | UrlObject;
  label: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  exact?: boolean;
  className?: string;
};

export function NavItem({
  href,
  label,
  children,
  icon,
  exact = false,
  className,
}: Props) {
  const pathname = usePathname() ?? "";

  const hrefPath =
    typeof href === "string"
      ? href
      : typeof (href as UrlObject).pathname === "string"
        ? String((href as UrlObject).pathname)
        : "";

  const isActive =
    hrefPath &&
    hrefPath !== "#" &&
    (exact ? pathname === hrefPath : pathname.startsWith(hrefPath));

  if (hrefPath === "#") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={label}
            className={clsx(
              "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
              className,
            )}
          >
            {children ?? icon}
            <span className="sr-only">{label}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href as UrlObject}
          aria-label={label}
          className={clsx(
            "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
            isActive && "bg-accent text-accent-foreground",
            className,
          )}
        >
          {children ?? icon}
          <span className="sr-only">{label}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
