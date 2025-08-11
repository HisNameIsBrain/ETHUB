"use client";

import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Logo } from "@/app/(marketing)/_components/logo";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";

export function ServicesNavbar() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const isAdmin = isLoaded && user?.publicMetadata?.role === "admin";

  return (
    <div className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-300 dark:border-gray-700 bg-background z-10">
      {/* Left side: Menu and Logo */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => router.push("/")}>
              Home
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/services")}>
              Services
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/order")}>
              Order
            </DropdownMenuItem>
            <SignedIn>
              <DropdownMenuItem onClick={() => router.push("/documents")}>
                Documents
              </DropdownMenuItem>
            </SignedIn>
          </DropdownMenuContent>
        </DropdownMenu>

        <Logo />
      </div>

      {/* Right side: Admin + Auth */}
      <div className="flex items-center gap-2">
        <SignedIn>
          {isAdmin && isLoaded && user && (
            <Button
              variant="destructive"
              onClick={() => router.push("/admin")}
            >
              Admin
            </Button>
          )}
          <UserButton afterSignOutUrl="/" />
        </SignedIn>

        <SignedOut>
          <Button variant="outline" onClick={() => router.push("/sign-in")}>
            Sign In
          </Button>
        </SignedOut>
      </div>
    </div>
  );
}