"use client";

import { cn } from "@/lib/utils";
import { useScrollTop } from "@/hooks/use-scroll-top";
import Link from "next/link";

const Navbar = () => {
  const scrolled = useScrollTop();
  
  return (
    <nav
      className={cn(
        "sticky inset-x-0 top-0 z-50 mx-auto flex w-full items-center bg-background p-6 transition-all dark:bg-[#1F1F1F]",
        scrolled && "border-b shadow-sm"
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <Link href="/">
          <span className="text-xl font-semibold">ETHUB</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/services" className="text-sm font-medium hover:underline">
            Services
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:underline">
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;