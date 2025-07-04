"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import { ModeToggle } from "@/components/mode-toggle";
import { useScrollTop } from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Logo } from "./logo";

export const Navbar = () => {
  const { resolvedTheme } = useTheme();
  const { isLoaded, isSignedIn, user } = useUser();
  const scrolled = useScrollTop();

  const navLinks = [
    { href: "/documents", label: "Documents" },
    { href: "/trash", label: "Trash" },
    { href: "/search", label: "Search" },
  ];

  const glowColors =
    resolvedTheme === "dark"
      ? "radial-gradient(circle at 20% 40%, #7f00ff, transparent 50%), radial-gradient(circle at 80% 60%, #00e0ff, transparent 50%), radial-gradient(circle at 50% 80%, #ff00a1, transparent 50%)"
      : "radial-gradient(circle at 20% 40%, #ff00cc, transparent 50%), radial-gradient(circle at 80% 60%, #00ccff, transparent 50%), radial-gradient(circle at 50% 80%, #ffcc00, transparent 50%)";

  return (
    <>
      {/* 🌈 Siri-like Fluid Background with Theme-Aware Colors */}
      <div className="fixed top-0 left-0 w-full h-20 z-[-1] pointer-events-none overflow-hidden">
        <div className="absolute inset-0 animate-fluidGradient opacity-70 blur-3xl will-change-transform">
          <div
            className="w-full h-full"
            style={{
              background: glowColors,
              backgroundBlendMode: "screen",
              maskImage:
                "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0))",
              WebkitMaskImage:
                "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0))",
            }}
          />
        </div>
      </div>

      {/* Navbar Content */}
      <nav
        className={cn(
          "sticky top-0 inset-x-0 z-50 flex w-full items-center justify-between px-6 py-4",
          "bg-white/70 dark:bg-[#1F1F1F]/80 backdrop-blur-md transition",
          scrolled && "border-b border-border shadow-sm"
        )}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center w-full gap-2 md:gap-8">
          <Logo className="opacity-60 hover:opacity-100 transition" />
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

      {/* 🎞️ Animation Styles */}
      <style jsx global>{`
        @keyframes fluidGradient {
          0% {
            transform: translate(0%, 0%) scale(1);
          }
          50% {
            transform: translate(-10%, 10%) scale(1.05);
          }
          100% {
            transform: translate(0%, 0%) scale(1);
          }
        }

        .animate-fluidGradient > div {
          animation: fluidGradient 20s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};
