"use client";

import Link from "next/link";
import type { Route } from "next";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

export default function DocumentList() {
  const docs = useQuery(api.documents.getSidebar, {}) ?? [];
  return (
    <ul className="space-y-1">
      {docs.map((document: any) => (
        <li key={document._id}>
          <Link
            href={`/documents/${document._id}` as Route}
            className={cn(
              "block px-4 py-3 hover:bg-muted transition-colors",
              document.isPublished && "font-medium text-foreground"
            )}
          >
            {document.title || "Untitled"}
          </Link>
        </li>
      ))}
    </ul>
  );
}
