"use client";

import Link from "next/link";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import { ModeToggle } from "@/components/mode-toggle";
import { useScrollTop } from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Logo } from "./logo";

export const Navbar = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const scrolled = useScrollTop();

  const navLinks = [
    { href: "/documents", label: "Documents" },
    { href: "/trash", label: "Trash" },
    { href: "/search", label: "Search" },
  ];

  return (
    <>
      {/* 🌈 Full Bright Rainbow Wave Background */}
      <div className="fixed top-0 left-0 w-full h-20 z-[-1] overflow-hidden pointer-events-none">
        {/* Back layer (slower) */}
        <div className="absolute inset-0 animate-rainbowWaveSlow blur-xl">
          <div
            className="w-[400%] h-full"
            style={{
              background: `
                repeating-linear-gradient(
                  120deg,
                  rgba(255, 0, 150, 0.8) 0%,
                  rgba(255, 140, 0, 0.8) 20%,
                  rgba(0, 255, 150, 0.8) 40%,
                  rgba(0, 180, 255, 0.8) 60%,
                  rgba(180, 0, 255, 0.8) 80%,
                  rgba(255, 0, 150, 0) 100%
                )
              `,
              backgroundSize: "200% 100%",
              maskImage: "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0))",
              WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0))",
            }}
          />
        </div>

        {/* Front layer (faster) */}
        <div className="absolute inset-0 animate-rainbowWaveFast blur-2xl">
          <div
            className="w-[400%] h-full"
            style={{
              background: `
                repeating-linear-gradient(
                  120deg,
                  rgba(255, 0, 150, 1) 0%,
                  rgba(255, 140, 0, 1) 20%,
                  rgba(0, 255, 150, 1) 40%,
                  rgba(0, 180, 255, 1) 60%,
                  rgba(180, 0, 255, 1) 80%,
                  rgba(255, 0, 150, 0) 100%
                )
              `,
              backgroundSize: "200% 100%",
              maskImage: "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0))",
              WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0))",
            }}
          />
        </div>
      </div>

      {/* 🌐 Navbar */}
      <nav
        className={cn(
          "sticky top-0 inset-x-0 z-50 flex w-full items-center justify-between px-6 py-4",
          "bg-white/70 dark:bg-[#1F1F1F]/80 backdrop-blur-md transition",
          scrolled && "border-b border-border shadow-sm"
        )}
      >
        {/* Logo & Navigation Tabs */}
        <div className="flex flex-col md:flex-row items-start md:items-center w-full gap-2 md:gap-8">
          <Logo className="opacity-60 hover:opacity-100 transition"/>
          <div className="flex flex-wrap gap-2 ml-8">
            {navLinks.map((tab) => (
              <Link key={tab.href} href={tab.href}>
                <Button
                  size="sm"
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold",
                    "bg-gradient-to-r from-cyan-300 to-blue-400",
                    "bg-opacity-60 backdrop-blur-lg",
                    "text-white shadow-md",
                    "hover:from-cyan-400 hover:to-blue-500",
                    "hover:shadow-2xl hover:scale-105",
                    "transition-all duration-200 ease-in-out",
                    "border border-white/10"
                  )}
                >
                  {tab.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Auth & Settings */}
        <div className="flex items-center gap-x-2">
          {!isLoaded && <Spinner />}

          {isLoaded && !isSignedIn && (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  <i className="fa fa-sign-in" aria-hidden="true"></i>
                </Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button size="sm">Account</Button>
              </SignInButton>
            </>
          )}

          {isLoaded && isSignedIn && (
            <>
              <span className="text-white text-sm">{user?.fullName}</span>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/sign-out">
                  <i className="fa fa-sign-out" aria-hidden="true"></i>
                </Link>
              </Button>
              <UserButton afterSignOutUrl="/" />
            </>
          )}

          <ModeToggle />
        </div>
      </nav>

      {/* 🔁 Animation Keyframes */}
      <style jsx global>{`
        @keyframes rainbowWaveFast {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes rainbowWaveSlow {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-25%);
          }
        }

        .animate-rainbowWaveFast > div {
          animation: rainbowWaveFast 20s linear infinite;
        }

        .animate-rainbowWaveSlow > div {
          animation: rainbowWaveSlow 60s linear infinite;
        }
      `}</style>
    </>
  );
};
