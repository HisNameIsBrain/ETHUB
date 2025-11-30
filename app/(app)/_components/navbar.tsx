"use client";

import { Title, TitleSkeleton } from "@/app/(app)/_components/title";
import { PublishToggle as Publish } from "@/app/(app)/_components/publish";
import MenuSkeleton from "@/app/(app)/_components/menu-skeleton";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MenuIcon } from "lucide-react";
import { Banner } from "@/app/(app)/_components/banner";
import { Menu } from "@/app/(app)/_components/menu";

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
}

export const Navbar = ({ isCollapsed, onResetWidth }: NavbarProps) => {
  const params = useParams();

  const document = useQuery(
    api.documents.getById,
    params.documentId
      ? { id: params.documentId as Id<"documents"> }
      : "skip"
  );

  // Loading skeleton
  if (document === undefined) {
    return (
      <nav className="sticky top-0 z-[90] w-full border-b border-border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="flex h-14 items-center justify-between px-3">
          <TitleSkeleton />
          <div className="flex items-center gap-1.5">
            <MenuSkeleton />
          </div>
        </div>
      </nav>
    );
  }

  if (document === null) return null;

  return (
    <>
      <nav className="sticky top-0 z-[90] w-full border-b border-border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="flex h-14 items-center gap-2 px-3">
          {isCollapsed && (
            <MenuIcon
              role="button"
              onClick={onResetWidth}
              className="h-5 w-5 text-muted-foreground hover:text-foreground transition"
            />
          )}

          <div className="flex items-center justify-between w-full min-w-0">
            <Title initialData={document} />

            <div className="flex items-center gap-1.5">
              <Publish initialData={document} />
              <Menu documentId={document._id} />
            </div>
          </div>
        </div>
      </nav>

      {document.isArchived && <Banner documentId={document._id} />}
    </>
  );
};
