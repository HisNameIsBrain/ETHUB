// app/(main)/(routes)/documents/[documentId]/page.tsx
"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Toolbar } from "@/components/toolbar";
import { Cover } from "@/components/cover";
import { Skeleton } from "@/components/ui/skeleton";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

export default function DocumentIdPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const id = documentId as Id<"documents">;

  const document = useQuery(api.documents.getById, { id });
  const update = useMutation(api.documents.update);

  const onChange = (content: string) => {
    void update({ id, content });
  };

  if (document === undefined) {
    // 🔁 Replace Cover.Skeleton with a simple cover placeholder
    return (
      <div>
        <div className="h-48 w-full bg-muted/20" />
        <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
          <div className="space-y-4 pl-8 pt-4">
            <Skeleton className="h-14 w-[50%]" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        </div>
      </div>
    );
  }

  if (document === null) {
    return <div>Not found</div>;
  }

  return (
    <div className="pb-40">
      <Cover url={document.coverImage} />
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <Toolbar initialData={document} />
        <Editor initialContent={document.content} onChange={onChange} />
      </div>
    </div>
  );
}
