"use client";
import type { Route } from "next";

import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function DocumentsPage() {
  const router = useRouter();
  const docs = useQuery(api.documents.getAll) ?? [];
  const create = useMutation(api.documents.create);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your notes</h1>
        <button
          className="border rounded px-3 py-2"
          onClick={async () => {
            const id = await create({});
            router.push(`/documents/${id}` as Route);
          }}
        >
          New note
        </button>
      </div>

      {docs.length === 0 ? (
        <p className="text-muted-foreground">No notes yet.</p>
      ) : (
        <ul className="space-y-2">
          {docs.map((d: any) => (
            <li key={d._id} className="border rounded p-3">
              <a href={`/documents/${d._id}`} className="underline">{d.title}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
