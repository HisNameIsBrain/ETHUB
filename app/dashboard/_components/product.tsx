"use client";
// app/dashboard/_components/product.tsx
"use client";

import { MoreHorizontal } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Id } from "@/convex/_generated/dataModel";
import { deleteServiceById } from "./actions";

type Service = {
  _id: Id<"services">;
  name?: string;
  price?: number;
};

export function ServiceRow({ service }: { service: Service }) {
  return (
    <TableRow>
      <TableCell>{service.name ?? "Untitled"}</TableCell>
      <TableCell>{service.price ?? "—"}</TableCell>
      <TableCell className="text-right">
        <button
          aria-label="Delete service"
          onClick={() =>
            deleteServiceById(service._id, { revalidate: "/dashboard/services" })
          }
          className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </TableCell>
    </TableRow>
  );
}
