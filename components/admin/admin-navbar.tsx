'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { Menu, X, Moon, Sun, ChevronDown } from "lucide-react";
import { Disclosure } from "@headlessui/react";
import { Button } from "@/components/ui/button"; // shadcn button
import { cn } from "@/lib/utils"; // optional utility for class merging

const navItems = [
  { label: "Dashboard", href: "/services/admin" },
  { label: "All Services", href: "/services" },
];

const adminMenuItems = [
  { label: "Add Service", href: "/services/admin/add" },
  { label: "Users", href: "/services/admin/users" },
];

export function AdminNavbar() {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <Disclosure as="nav" className="bg-white dark:bg-[#1f1f1f] border-b border-neutral-200 dark:border-neutral-800 shadow-sm fixed top-0 w-full z-50">
      {({ open }: { open: boolean }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              {/* Brand */}
              <Link href="/" className="text-xl font-bold text-orange-500 hover:opacity-80">
                Tech Hub Admin
              </Link>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-orange-500",
                      pathname === item.href
                        ? "text-orange-500"
                        : "text-gray-600 dark:text-gray-300"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}

                {/* Dropdown */}
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

                {/* Theme toggle */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>

                <UserButton afterSignOutUrl="/" />
              </div>

              {/* Mobile Hamburger */}
              <div className="md:hidden flex items-center gap-2">
                <Button size="icon" variant="ghost" onClick={toggleTheme}>
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                {/* ...rest of your mobile menu code... */}
              </div>
            </div>
          </div>
        </>
      )}
    </Disclosure>
  );
}
