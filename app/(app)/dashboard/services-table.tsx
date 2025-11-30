"use client";

import { useRouter, usePathname } from "next/navigation";
import type { Route } from "next";
import { useState } from "react";

type Service = {
  _id: string;
  name: string;
  price?: number;
  description?: string;
  createdAt: number;
  updatedAt: number;
  isPublic: boolean;
  archived: boolean;
  slug: string;
};

type Props = {
  data: Service[];
  pageSize?: number;
};

export function ServicesTable({ data, pageSize = 10 }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [offset, setOffset] = useState(0);

  const buildPath = (o: number): Route =>
    `${pathname}?offset=${o}` as Route;

  function prevPage() {
    const prev = Math.max(0, offset - pageSize);
    setOffset(prev);
    router.push(buildPath(prev), { scroll: false });
  }

  function nextPage() {
    const next = offset + pageSize;
    setOffset(next);
    router.push(buildPath(next), { scroll: false });
  }

  const pageData = data.slice(offset, offset + pageSize);

  return (
    <div>
      <table className="min-w-full border text-sm">
        <thead>
          <tr>
            <th className="border px-4 py-2 text-left">Name</th>
            <th className="border px-4 py-2 text-left">Price</th>
            <th className="border px-4 py-2 text-left">Description</th>
          </tr>
        </thead>
        <tbody>
          {pageData.map((s) => (
            <tr key={s._id}>
              <td className="border px-4 py-2">{s.name}</td>
              <td className="border px-4 py-2">{s.price ?? "-"}</td>
              <td className="border px-4 py-2">{s.description ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={prevPage}
          disabled={offset === 0}
          className="rounded border px-3 py-1 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={nextPage}
          disabled={offset + pageSize >= data.length}
          className="rounded border px-3 py-1 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
