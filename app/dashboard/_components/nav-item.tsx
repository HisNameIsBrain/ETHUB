'use client';

import * as React from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type NavItemProps = {
  href: Route; // <-- key change: use Next's typed Route
  label: string;
  children: React.ReactNode;
};

export function NavItem({ href, label, children }: NavItemProps) {
  const pathname = usePathname(); // can be null on first render

  const isActive =
    typeof pathname === 'string' &&
    (pathname === href || pathname.startsWith(href));

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={clsx(
            'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
            isActive && 'bg-accent text-accent-foreground'
          )}
        >
          {children}
          <span className="sr-only">{label}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
