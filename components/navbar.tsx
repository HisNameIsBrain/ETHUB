"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from "@/components/ui/tooltip";
import { SiriGlowInvert } from "@/components/siri-glow-invert";
import { AssistantLauncher  } from "@/components/assistant-launcher";
function NavLink({
  href,
  label,
  exact = false,
}: { href: string; label: string; exact?: boolean }) {
  const pathname = usePathname() ?? "";
  const isActive = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={[
        "rounded-md px-3 py-2 text-sm transition",
        isActive ? "bg-foreground/10" : "hover:bg-foreground/5",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between gap-3 px-4">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="ETHUB" width={96} height={24} priority className="h-6 w-auto" />
          <span className="hidden sm:inline text-sm font-semibold tracking-tight">ETHUB</span>
        </Link>

        {/* Center: Primary links (replace NavItem with plain links) */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink href="/services" label="Services" />
          <NavLink href="/dashboard" label="Dashboard" />
          <NavLink href="/documents" label="Documents" />
          <NavLink href="/settings" label="Settings" />
        </nav>

        {/* Right: Profile bubble with glow + tooltips for actions */}
        <TooltipProvider delayDuration={200}>
          <div className="relative flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/search" className="rounded-md px-2 py-1 text-sm hover:bg-foreground/5">
                  Search
                </Link>
              </TooltipTrigger>
              <TooltipContent>Search</TooltipContent>
            </Tooltip>

            <div className="relative h-10 w-10">
              <span className="absolute -inset-[12%] pointer-events-none">
                <SiriGlowInvert />
              </span>
              <div className="relative h-full w-full overflow-hidden rounded-full border border-white/10">
                <UserButton appearance={{ elements: { userButtonAvatarBox: "rounded-full" } }} />
              </div>
            </div>
          </div>
        </TooltipProvider>
      </div>
    </header>
  );
}
