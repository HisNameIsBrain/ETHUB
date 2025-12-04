"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Route } from "next";

export function SearchCommand() {
  const [term, setTerm] = useState("");
  const results = useQuery(api.documents.getSearch, term ? { term } : "skip") ?? [];
  return (
    <div className="p-4">
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Search documents..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      <ul className="mt-3 space-y-1">
        {results.map((d: any) => (
          <li key={d._id}>
            <a href={`/documents/${d._id}` as Route} className="underline">{d.title || "Untitled"}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
