"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";

import { Logo } from "@/(marketing)/_components/logo";

export function ServicesNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = user?.publicMetadata?.role === "admin";

  const handleNavClick = (route: string) => {
    setMenuOpen(false);
    router.push(route);
  };

  return (
    <header className="w-full bg-white dark:bg-black shadow-md px-4 py-2 flex items-center justify-between">
      {/* LEFT */}
      <div className="flex items-center gap-2">
        {/* Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-sm font-medium border rounded px-3 py-1 dark:text-white"
          >
            ☰ Menu
          </button>
          {menuOpen && (
            <div className="absolute mt-2 w-40 bg-white dark:bg-zinc-900 border dark:border-zinc-700 shadow-lg rounded z-50">
              <ul className="flex flex-col text-sm">
                <li
                  onClick={() =>
                    handleNavClick(!isSignedIn ? "/" : "/documents")
                  }
                  className="cursor-pointer px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Home
                </li>
                <li
                  onClick={() => handleNavClick("/documents")}
                  className="cursor-pointer px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Documents
                </li>
                <li
                  onClick={() => handleNavClick("/services")}
                  className="cursor-pointer px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Services
                </li>
                <li
                  onClick={() => handleNavClick("/order")}
                  className="cursor-pointer px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Order
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Logo (always visible) */}
        <Logo />
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {isSignedIn && isAdmin && (
          <Link
            href="/admin"
            className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700"
          >
            Admin
          </Link>
        )}
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}