"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useUser,
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
} from "@clerk/nextjs";

export default function User() {
  const { user } = useUser();
  const avatar = user?.imageUrl ?? "/placeholder-user.jpg";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
          <Image
            src={avatar}
            alt="Avatar"
            width={36}
            height={36}
            className="overflow-hidden rounded-full"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/support">Support</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <SignedIn>
          <DropdownMenuItem asChild>
            <SignOutButton signOutOptions={{ redirectUrl: "/sign-in" }}>
              <button type="button" className="w-full text-left">Sign Out</button>
            </SignOutButton>
          </DropdownMenuItem>
        </SignedIn>
        <SignedOut>
          <DropdownMenuItem asChild>
            <SignInButton mode="modal">
              <button type="button" className="w-full text-left">Sign In</button>
            </SignInButton>
          </DropdownMenuItem>
        </SignedOut>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}