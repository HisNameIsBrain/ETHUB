"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { Moon, Sun, ChevronDown } from "lucide-react";
import { Disclosure } from "@headlessui/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SiriGlow } from "@/components/siri-glow";

const navItems: { label: string; href: Route }[] = [
  { label: "Dashboard", href: "/services/admin" as Route },
  { label: "All Services", href: "/services" as Route },
];

const adminMenuItems: { label: string; href: Route }[] = [
  { label: "Add Service", href: "/services/admin/add" as Route },
  { label: "Users", href: "/services/admin/users" as Route },
];

export function AdminNavbar() {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <Disclosure
      as="nav"
      className="bg-white dark:bg-[#1f1f1f] border-b border-neutral-200 dark:border-neutral-800 shadow-sm fixed top-0 w-full z-50"
    >
      {() => (
        <>
          <SiriGlow />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link href={"/" as Route} className="text-xl font-bold text-orange-500 hover:opacity-80">
                Tech Hub Admin
              </Link>

              <div className="hidden md:flex items-center space-x-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-orange-500",
                      pathname === item.href ? "text-orange-500" : "text-gray-600 dark:text-gray-300"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="relative group">
                  <button className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500">
                    Admin Tools <ChevronDown className="ml-1 w-4 h-4" />
                  </button>
                  <div className="absolute hidden group-hover:block mt-2 bg-white dark:bg-[#2a2a2a] rounded-md shadow-lg border dark:border-neutral-700 p-2 z-10">
                    {adminMenuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-800 rounded"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <Button size="icon" variant="ghost" onClick={toggleTheme} aria-label="Toggle theme">
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>

                <UserButton afterSignOutUrl={"/" as Route} />
              </div>

              <div className="md:hidden flex items-center gap-2">
                <Button size="icon" variant="ghost" onClick={toggleTheme} aria-label="Toggle theme">
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </Disclosure>
  );
}
