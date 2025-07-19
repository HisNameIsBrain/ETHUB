import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Banner } from "./banner";
import { Logo } from "@/app/(marketing)/_components/logo";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ServicesNavbar() {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";
  
  return (
    <div className="w-full sticky top-0 z-50 bg-background">
      <Banner />
      <div className="flex items-center justify-between px-4 py-2 shadow-sm">
        <div className="flex items-center gap-4">
          <Logo />
          <nav className="hidden md:flex gap-4 text-sm">
            <Link href="/services" className="hover:underline">Services</Link>
            {isAdmin && (
              <Link href="/admin" className="hover:underline text-orange-600">Admin</Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
      <Separator />
    </div>
  );
}