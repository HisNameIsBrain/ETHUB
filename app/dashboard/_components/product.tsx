// app/dashboard/_components/product.tsx
import { MoreHorizontal } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Product } from "@/lib/db"; // ← change this
import { deleteProduct } from "./actions";

export function ProductRow({ product }: { product: Product }) { // ← rename to avoid clash
  return (
    <TableRow>
      <TableCell>{product.name}</TableCell>
      <TableCell>{product.price ?? "—"}</TableCell>
      <TableCell className="text-right">
        <button
          aria-label="More"
          onClick={() => deleteProduct(product.id)}
          className="inline-flex h-8 w-8 items-center justify-center rounded"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </TableCell>
    </TableRow>
  );
}
