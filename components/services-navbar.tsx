"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ServicesNavbar() {
  const router = useRouter();

  return (
    <nav className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => router.push("/services")}>
              Services
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <SignedOut>
          <Button variant="default" onClick={() => router.push("/sign-in")}>
            Sign In
          </Button>
        </SignedOut>
        <SignedIn>
          <Button
            variant="destructive"
            onClick={() => router.push("/admin")}
          >
            Admin
          </Button>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </nav>
  );
}
