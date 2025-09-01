"use client";

import Link from "next/link";
import type { Route } from "next";
import { useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type UserProps = {
  name?: string;
  email?: string;
  avatarUrl?: string;
};

const SETTINGS_PATH = "/settings" as Route; // change if your settings route differs

export default function User(props: UserProps) {
  const { user } = useUser();

  const displayName = props.name ?? user?.fullName ?? user?.firstName ?? "User";

  const email = props.email ?? user?.primaryEmailAddress?.emailAddress ?? "";

  const avatarUrl = props.avatarUrl ?? user?.imageUrl ?? undefined;

  const initial = displayName?.charAt(0)?.toUpperCase() ?? "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={displayName} />
            ) : (
              <AvatarFallback>{initial}</AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            {email ? (
              <p className="text-xs leading-none text-muted-foreground">
                {email}
              </p>
            ) : null}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={SETTINGS_PATH}>Settings</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={"/logout" as Route}>Log out</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
