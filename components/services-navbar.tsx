"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter, usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ORDER_PATH = "/order" as Route;
const SERVICES_PATH = "/services" as Route;
const DASHBOARD_PATH = "/dashboard" as Route;
const ADMIN_PATH = "/admin" as Route;
const SIGN_IN_PATH = "/sign-in" as Route;
const SIGN_UP_PATH = "/sign-up" as Route;

export default function ServicesNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href={"/" as Route}
          className="text-base font-semibold tracking-tight"
        >
          Tech Hub
        </Link>

        <nav className="hidden gap-6 md:flex">
          <Link
            href={SERVICES_PATH}
            className={cn(
              "text-sm font-medium hover:text-orange-500",
              pathname === SERVICES_PATH && "text-orange-500"
            )}
          >
            Services
          </Link>
          <Link
            href={ORDER_PATH}
            className={cn(
              "text-sm font-medium hover:text-orange-500",
              pathname === ORDER_PATH && "text-orange-500"
            )}
          >
            Order
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => router.push(SERVICES_PATH)}>
                Services
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(ORDER_PATH)}>
                Order
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <SignedIn>
                <DropdownMenuItem onClick={() => router.push(DASHBOARD_PATH)}>
                  Dashboard
                </DropdownMenuItem>
              </SignedIn>
              <SignedOut>
                <DropdownMenuItem asChild>
                  <Link href={SIGN_IN_PATH}>Sign in</Link>
                </DropdownMenuItem>
              </SignedOut>
            </DropdownMenuContent>
          </DropdownMenu>

          <SignedIn>
            <UserButton afterSignOutUrl={"/" as Route} />
            <Button
              variant="destructive"
              onClick={() => router.push(ADMIN_PATH)}
            >
              Admin
            </Button>
          </SignedIn>

          <SignedOut>
            <Button variant="default" onClick={() => router.push(SIGN_IN_PATH)}>
              Sign In
            </Button>
            <Button variant="default" onClick={() => router.push(SIGN_UP_PATH)}>
              Get Started
            </Button>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
