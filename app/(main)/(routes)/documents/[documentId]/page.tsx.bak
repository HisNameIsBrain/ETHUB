"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

export default function DocumentIdPage() {
  const params = useParams<{ documentId: string }>();
  const id = params.documentId as Id<"documents">;

  const document = useQuery(api.documents.getById, { id });
  const update = useMutation(api.documents.update);

  if (document === undefined) {
    return <div className="p-6">Loading...</div>;
  }
  if (document === null) {
    return <div className="p-6">Not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <input
        className="w-full text-2xl font-semibold bg-transparent outline-none border-b pb-2"
        defaultValue={document.title}
        onBlur={(e) => update({ id, title: e.currentTarget.value || &quot;Untitled&quot; })}
      />
      <textarea
        className="mt-4 w-full min-h-[40vh] bg-transparent outline-none"
        defaultValue={document.content ?? ""}
        onBlur={(e) => update({ id, content: e.currentTarget.value })}
      />
    </div>
  );
}
