import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Banner } from "/app/(main)/_components/banner.tsx";
import { Logo } from "@/app/(marketing)/_components/logo";
import Link from "next/link";

export default function AdminNavbar() {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  if (!isAdmin) return null;

  return (
    <div className="w-full sticky top-0 z-50 bg-background">
      <Banner />
      <div className="flex items-center justify-between px-4 py-2 shadow-sm">
        <div className="flex items-center gap-4">
          <Logo />
          <nav className="hidden md:flex gap-4 text-sm">
            <Link href="/admin/services" className="hover:underline">Manage Services</Link>
            <Link href="/admin/requests" className="hover:underline">Requests</Link>
            <Link href="/admin/organizations" className="hover:underline">Organizations</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
}
