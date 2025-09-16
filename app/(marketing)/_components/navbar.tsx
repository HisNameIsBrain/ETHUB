"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { SiriGlowInvert } from "@/components/siri-glow-invert";

function NavLink({
  href,
  label,
  exact = false,
}: {
  href: string;
  label: string;
  exact?: boolean;
}) {
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

export function ProfileButton() {
  return (
    <div className="relative h-10 w-10">
      <span className="absolute -inset-[10%] pointer-events-none">
        <SiriGlowInvert
          rotateSec={2.2}
          innerRotateSec={2.2}
          blurPx={5}
          insetPercent={-1}
          opacity={0.85}
          thicknessPx={5}
          inner
        />
      </span>
      <div className="relative h-full w-full overflow-hidden rounded-full border border-white/10">
        <UserButton appearance={{ elements: { userButtonAvatarBox: "rounded-full" } }} />
      </div>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname(); // if you need it later

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Left: logo */}
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo.svg"
            alt="ETHUB"
            className="hidden h-7 w-auto sm:block"
          />
          <span className="sm:hidden text-base font-semibold">ETECHHUB</span>
        </Link>

        {/* Middle: nav links */}
        <div className="flex items-center gap-1">
          <NavLink href="/services" label="Services" />
          <NavLink href="/dashboard" label="Dashboard" />
          <NavLink href="/documents" label="Documents" />
          <NavLink href="/settings" label="Settings" />
        </div>

        {/* Right: profile */}
        <ProfileButton />
      </div>
    </nav>
  );
}
