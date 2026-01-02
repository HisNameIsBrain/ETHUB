"use client";

import type { Route } from "next";
import {
  ChevronLeft,
  MenuIcon,
  Plus,
  PlusCircle,
  Search,
  Settings,
  Trash,
} from "lucide-react";
import React, {
  ElementRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserItem } from "@/app/(app)/_components/user-item";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Item } from "@/app/(app)/_components/item";
import { toast } from "sonner";
import DocumentList from "@/app/(app)/_components/document-list";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TrashBox } from "@/app/(app)/_components/trash-box";
import { useSearch } from "@/hooks/use-search";
import { useSettings } from "@/hooks/use-settings";
import { Navbar } from "@/app/(app)/_components/navbar";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

export const Navigation = () => {
  const router = useRouter();
  const search = useSearch();
  const settings = useSettings();
  const params = useParams();
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const create = useMutation(api.documents.create);

  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current) return;
    let newWidth = event.clientX;

    if (newWidth < 220) newWidth = 220;
    if (newWidth > 420) newWidth = 420;

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.setProperty("left", `${newWidth}px`);
      navbarRef.current.style.setProperty(
        "width",
        `calc(100% - ${newWidth}px)`
      );
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const resetWidth = useCallback(() => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);

      sidebarRef.current.style.width = isMobile ? "100%" : "240px";
      navbarRef.current.style.setProperty("left", isMobile ? "100%" : "240px");
      navbarRef.current.style.setProperty(
        "width",
        isMobile ? "0" : "calc(100% - 240px)"
      );

      setTimeout(() => setIsResetting(false), 300);
    }
  }, [isMobile]);

  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);

      sidebarRef.current.style.width = "0";
      navbarRef.current.style.setProperty("left", "0");
      navbarRef.current.style.setProperty("width", "100%");

      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const handleCreate = () => {
    const promise = create({ title: "Untitled" }).then((documentId) =>
      router.push(`/documents/${documentId}` as Route),
    );

    toast.promise(promise, {
      loading: "Creating a new note...",
      success: "New note created",
      error: "Failed to create new note",
    });
  };

  useEffect(() => {
    isMobile ? collapse() : resetWidth();
  }, [isMobile, resetWidth]);

  useEffect(() => {
    if (isMobile) collapse();
  }, [pathname, isMobile]);

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          // match dashboard theme: token surfaces, not hardcoded dark/light
          "group/sidebar h-full overflow-y-auto relative flex flex-col",
          "bg-background text-foreground border-r border-border",
          "w-60 md:w-60 z-[99999]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "w-0",
        )}
      >
        {/* collapse button */}
        <div
          role="button"
          onClick={collapse}
          className={cn(
            "h-7 w-7 grid place-items-center rounded-md",
            "text-muted-foreground hover:bg-primary/10 transition",
            "absolute top-2 right-2 opacity-0 group-hover/sidebar:opacity-100",
            isMobile && "opacity-100",
          )}
        >
          <ChevronLeft className="h-5 w-5" />
        </div>

        {/* top actions */}
        <div className="pt-1">
          <UserItem />
          <Item onClick={search.onOpen} label="Search" icon={Search} isSearch />
          <Item onClick={settings.onOpen} label="Settings" icon={Settings} />
          <Item onClick={handleCreate} label="New Page" icon={PlusCircle} />
        </div>

        {/* docs list */}
        <div className="mt-2">
          <DocumentList />
          <Item onClick={handleCreate} label="Add a Page" icon={Plus} />

          <Popover>
            <PopoverTrigger className="w-full mt-2">
              <Item label="Trash" icon={Trash} />
            </PopoverTrigger>
            <PopoverContent
              className="p-0 w-72"
              side={isMobile ? "bottom" : "right"}
            >
              <TrashBox />
            </PopoverContent>
          </Popover>
        </div>

        {/* resize handle */}
        <div
          onMouseDown={handleMouseDown}
          onClick={resetWidth}
          className="
            opacity-0 group-hover/sidebar:opacity-100 transition
            cursor-ew-resize absolute h-full w-1
            bg-primary/10 right-0 top-0
          "
        />
      </aside>

      {/* top document navbar area */}
      <div
        ref={navbarRef}
        className={cn(
          "absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "left-0 w-full",
        )}
      >
        {params.documentId ? (
          <Navbar isCollapsed={isCollapsed} onResetWidth={resetWidth} />
        ) : (
          <nav
            className="
              sticky top-0 z-[90] w-full border-b border-border
              bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50
            "
          >
            <div className="flex h-12 items-center px-3">
              {isCollapsed && (
                <MenuIcon
                  onClick={resetWidth}
                  role="button"
                  className="h-5 w-5 text-muted-foreground hover:text-foreground transition"
                />
              )}
            </div>
          </nav>
        )}
      </div>
    </>
  );
};
